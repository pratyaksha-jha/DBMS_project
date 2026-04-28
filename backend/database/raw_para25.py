import requests
import re
import pandas as pd
from io import BytesIO
import os

from img2table.document import Image as Img2TableImage
from img2table.ocr import TesseractOCR


# -----------------------------
# CONFIG
# -----------------------------
YEAR = 2025
DOMAINS = ["Engineering", "Overall"]

HEADERS = {"User-Agent": "Mozilla/5.0"}

IMG_URL = "https://www.nirfindia.org/nirfpdfcdn/{year}/graph/{domain}/{iid}.{ext}"


# -----------------------------
# SAVE PATH (IMPORTANT FIX)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "nirf_all.csv")


# -----------------------------
# LABEL MAP
# -----------------------------
LABEL_MAP = {
    "ss": "SS", "fsr": "FSR", "fqe": "FQE", "fru": "FRU",
    "pu": "PU", "qp": "QP", "ipr": "IPR", "fppp": "FPPP",
    "gph": "GPH", "gue": "GUE", "gphd": "GPHD", "ms": "MS",
    "rd": "RD", "wd": "WD", "escs": "ESCS", "pcs": "PCS",
    "pr": "PR",
    "oe": "OE+MIR", "mir": "OE+MIR", "oe+mir": "OE+MIR"
}

EXACT = set(LABEL_MAP.values())


def match_label(text):
    t = str(text).strip()

    if t.upper() in EXACT:
        return t.upper()

    tl = t.lower()

    if "oe" in tl and "mir" in tl:
        return "OE+MIR"

    if "qp" in tl or "q p" in tl or "0p" in tl or "op" in tl:
        return "QP"

    for k, v in LABEL_MAP.items():
        if k in tl:
            return v

    return None


def clean_num(text):
    m = re.search(r"\d+(\.\d+)?", str(text))
    return float(m.group()) if m else None


# -----------------------------
# GET INSTITUTES
# -----------------------------
def get_institutes(domain):
    url = f"https://www.nirfindia.org/Rankings/{YEAR}/{domain}Ranking.html"
    r = requests.get(url, headers=HEADERS, timeout=15)

    if r.status_code != 200:
        print(f"[ERROR] HTTP {r.status_code}")
        return []

    html = r.text
    ids = re.findall(r"IR-[A-Z]-[A-Z]-\d{2,5}", html)

    seen = set()
    unique_ids = []

    for i in ids:
        if i not in seen:
            seen.add(i)
            unique_ids.append(i)

    return [(i + 1, iid) for i, iid in enumerate(unique_ids)]


# -----------------------------
# FETCH IMAGE
# -----------------------------
def fetch_image(iid, domain):
    for ext in ["png", "jpg"]:
        url = IMG_URL.format(year=YEAR, domain=domain, iid=iid, ext=ext)
        r = requests.get(url, headers=HEADERS, timeout=10)

        if r.status_code == 200 and len(r.content) > 1000:
            return r.content

    return None


# -----------------------------
# OCR PARSER
# -----------------------------
ocr = TesseractOCR()


def parse_image(content):
    scores = {}

    doc = Img2TableImage(BytesIO(content))
    tables = doc.extract_tables(
        ocr=ocr,
        implicit_rows=True,
        borderless_tables=True
    )

    for table in tables:
        df = table.df

        if df.shape[0] < 3:
            continue

        score_idx = None
        for i in range(len(df)):
            if "score" in str(df.iloc[i, 0]).lower():
                score_idx = i
                break

        if score_idx is None or score_idx == 0:
            continue

        labels = df.iloc[score_idx - 1]
        values = df.iloc[score_idx]

        for l, v in zip(labels, values):
            col = match_label(l)
            val = clean_num(v)

            if col and val is not None:
                scores[col] = val

    return scores


# -----------------------------
# MAIN
# -----------------------------
def main():
    results = []

    for domain in DOMAINS:
        print(f"\n===== {domain} =====")

        institutes = get_institutes(domain)
        print(f"Total institutes: {len(institutes)}")

        for rank, iid in institutes:
            print(f"Processing {iid} ({domain})")
            try:
                img = fetch_image(iid, domain)

                if img is None:
                    continue

                scores = parse_image(img)

                scores["insti_id"] = iid
                scores["rank"] = rank
                scores["domain"] = domain

                results.append(scores)

            except Exception as e:
                print(f"Error: {iid} → {e}")

    df = pd.DataFrame(results)
    df.to_csv(CSV_PATH, index=False)

    print(f"\n CSV saved at: {CSV_PATH}")
    print(df.head())


if __name__ == "__main__":
    main()