import requests
import pdfplumber
from bs4 import BeautifulSoup
from io import BytesIO
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import urllib3
import os
import re
from collections import defaultdict


# FIX SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


# DB SETUP
conn = sqlite3.connect("nirf_placements.db")
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS placements")

cursor.execute("""
CREATE TABLE IF NOT EXISTS placements (
    id           TEXT,
    nirf_year    INTEGER,
    domain       TEXT,
    program_type TEXT,
    academic_year TEXT,

    grad_students   REAL,
    placed_students REAL,
    median_salary   REAL,
    higher_studies  REAL,

    PRIMARY KEY (id, nirf_year, domain, program_type, academic_year)
)
""")
conn.commit()


# CONFIG
session  = requests.Session()
headers  = {"User-Agent": "Mozilla/5.0"}
domains  = ["Overall", "Engineering", "Management"]
year     = 2025
HTML_DIR = "scraped_html"
pdf_cache = {}


# LOAD PDF
def load_pdf(pdf_url):
    if pdf_url in pdf_cache:
        return pdf_cache[pdf_url]
    response = session.get(pdf_url, headers=headers, verify=False, timeout=30)
    pdf = pdfplumber.open(BytesIO(response.content))
    pdf_cache[pdf_url] = pdf
    return pdf


# HELPERS
def is_valid_year(val):
    """Academic year format: '2021-22'"""
    if not isinstance(val, str):
        return False
    val = val.strip()
    return (
        len(val) == 7
        and val[:4].isdigit()
        and val[4] == "-"
        and val[5:].isdigit()
    )

def clean_numeric(val):
    """'1700000(Seventeen Lakhs)' → 1700000.0 | '0(Zero)' → 0.0"""
    if val is None:
        return None
    val = str(val).split("(")[0].replace(",", "").strip()
    try:
        return float(val)
    except ValueError:
        return None

def detect_program_type(text):
    """
    'UG [4 Years Program(s)]...'          → 'UG_4'
    'PG [2 Years Program(s)]...'          → 'PG_2'
    'PG-Integrated [5 Years Program(s)]'  → 'PG_Integrated_5'
    Returns None if not a program header.
    """
    t = str(text).lower()
    m = re.search(r'pg[\s-]*integrated\s*\[(\d+)\s*year', t)
    if m:
        return f"PG_Integrated_{m.group(1)}"
    m = re.search(r'\bug\s*\[(\d+)\s*year', t)
    if m:
        return f"UG_{m.group(1)}"
    m = re.search(r'\bpg\s*\[(\d+)\s*year', t)
    if m:
        return f"PG_{m.group(1)}"
    return None

HEADER_KEYWORDS = [
    "academic year", "median salary", "no. of", "higher studies",
    "students placed", "graduating", "stipulated",
    "lateral entry", "intake", "admitted", "placement",
]


# GET PROGRAM HEADERS WITH Y-POSITIONS
def get_program_headers_on_page(page):
    """
    Reconstruct text lines from pdfplumber word coordinates,
    find every program-type header, and return:
        [(y_top_of_line, program_type), ...]  sorted top→bottom
    """
    try:
        words = page.extract_words(keep_blank_chars=False, use_text_flow=False)
    except Exception:
        return []

    # Group words into lines by their vertical (top) position.
    # Round to nearest 3 pts so words on the same visual line cluster together.
    lines = defaultdict(list)
    for w in words:
        y_bucket = round(w["top"] / 3) * 3
        lines[y_bucket].append((w["x0"], w["text"]))

    headers = []
    for y_bucket, word_list in sorted(lines.items()):
        word_list.sort(key=lambda x: x[0])          # left → right
        line_text = " ".join(w[1] for w in word_list)
        prog = detect_program_type(line_text)
        if prog:
            headers.append((y_bucket, prog))

    return sorted(headers, key=lambda x: x[0])


# EXTRACT PLACEMENTS
def extract_placements(pdf):
    """
    Returns list of:
        [program_type, academic_year, grad_students,
         placed_students, median_salary, higher_studies]

    Uses coordinate-based header matching:
    - Program headers ('UG [4 Years]', 'PG [2 Years]', ...) are standalone
      text lines that appear BETWEEN tables in the PDF.
    - We detect every header on a page along with its y-coordinate.
    - Each table is assigned to the header immediately ABOVE it.
    - This correctly handles multiple program tables on the same page.
    """
    data = []
    in_placement_section = False
    stop_after_page       = False
    current_program       = "Unknown"   # carries over across pages

    for page in pdf.pages:
        if stop_after_page:
            break

        text       = page.extract_text() or ""
        text_lower = text.lower()

        if "placement & higher studies" in text_lower:
            in_placement_section = True

        if not in_placement_section:
            continue

        if "ph.d student details" in text_lower:
            stop_after_page = True          # finish this page, then stop

        # Coordinate-based program header detection
        prog_headers = get_program_headers_on_page(page)
        # prog_headers: [(y, program_type), ...] sorted top→bottom

        # Process each table individually 
        try:
            found_tables = page.find_tables()
        except Exception:
            found_tables = []

        for found_table in found_tables:
            table_top = found_table.bbox[1]     # y of table's top edge

            # The correct program type for this table is the last header
            # whose y-position is at or above the table's top edge.
            prog_for_table = current_program
            for h_y, h_prog in prog_headers:
                if h_y <= table_top:
                    prog_for_table = h_prog
                # Headers are sorted top→bottom; once we pass the table,
                # we already have the last valid header in prog_for_table.

            try:
                table_data = found_table.extract()
            except Exception:
                continue

            if not table_data:
                continue

            for row in table_data:
                if not row or len(row) < 5:
                    continue

                cells = [
                    str(c).replace("\n", " ").strip() if c is not None else ""
                    for c in row
                ]
                joined_lower = " ".join(cells).lower()

                # Skip column header rows
                if any(kw in joined_lower for kw in HEADER_KEYWORDS):
                    continue

                # Always take the last 5 columns
                # Works for both 10-col (UG with lateral) and
                # 8-col (PG without lateral) tables:
                # row[-5:] = [grad_year, graduating, placed, salary, higher]
                last5 = cells[-5:]

                grad_year = last5[0].strip()
                if not is_valid_year(grad_year):
                    continue

                nums = [clean_numeric(v) for v in last5[1:]]
                if all(v is None for v in nums):
                    continue

                data.append([prog_for_table, grad_year] + nums)

        # Carry forward the last program header seen on this page
        if prog_headers:
            current_program = prog_headers[-1][1]

    return data


# GET TOP 100 INSTITUTES
def get_top_institutes(domain, year):
    """
    Reads HTML files cached by the rankings scraper.
    Falls back to a live fetch if the cached file is missing.
    """
    html_path = os.path.join(HTML_DIR, f"nirf_{year}_{domain}.html")

    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
    else:
        print(f"  WARNING: No cached HTML — fetching live for {domain} {year}")
        url = f"https://www.nirfindia.org/Rankings/{year}/{domain}Ranking.html"
        res = session.get(url, headers=headers, verify=False, timeout=30)
        html = res.text
        os.makedirs(HTML_DIR, exist_ok=True)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)

    soup  = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="tbl_overall")
    if not table:
        print(f"  WARNING: ranking table not found for {domain}")
        return []

    tbody = table.find("tbody")
    if not tbody:
        return []

    institutes = []
    for row in tbody.find_all("tr", recursive=False)[:100]:
        cols = row.find_all("td")
        if not cols:
            continue

        insti_id = cols[0].text.strip()
        pdf_url  = None
        for a in row.find_all("a", href=True):
            if ".pdf" in a["href"].lower():
                pdf_url = a["href"]
                break

        if insti_id and pdf_url:
            institutes.append((insti_id, pdf_url))

    return institutes

# PROCESS ONE INSTITUTE
def process_institute(insti_id, pdf_url, domain):
    try:
        pdf       = load_pdf(pdf_url)
        placements = extract_placements(pdf)

        results = [
            (
                insti_id, year, domain,
                row[0],   # program_type   e.g. 'UG_4', 'PG_2'
                row[1],   # academic_year  e.g. '2021-22'
                row[2],   # grad_students
                row[3],   # placed_students
                row[4],   # median_salary
                row[5],   # higher_studies
            )
            for row in placements
        ]

        print(f"  OK {insti_id}  ->  {len(results)} rows")
        return results

    except Exception as e:
        print(f"  ERR {insti_id}: {e}")
        return []


# MAIN
all_data = []

for domain in domains:
    print(f"\n{'='*40}")
    print(f"Processing domain: {domain}")
    print(f"{'='*40}")

    institutes = get_top_institutes(domain, year)
    print(f"Found {len(institutes)} institutes\n")

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(process_institute, insti_id, pdf_url, domain)
            for insti_id, pdf_url in institutes
        ]
        for future in futures:
            all_data.extend(future.result())

# INSERT INTO DB
cursor.executemany(
    "INSERT OR IGNORE INTO placements VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    all_data,
)
conn.commit()

print(f"\nDone!  Total rows inserted: {len(all_data)}")
conn.close()