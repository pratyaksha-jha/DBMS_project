# NIRF Analysis Portal - DBMS Project



## Overview
India's National Institutional Ranking Framework (NIRF) publishes ranking data every year across multiple domains, yet this data lives scattered across PDF documents and web pages. Anyone who wants to ask straightforward questions about the colleges such as “How good is the research and teaching of this college?”, “Why is this college ranked below another one?” is forced to hunt through multiple tables manually. Many times forming an unbiased opinion about a college is not easy as the sources on the internet have their own interpretations.

This project set out to fix that problem. The core objective was to build a single, interactive web platform where a student, researcher, or analyst can explore NIRF data over the years, rankings, parameter scores, placement outcomes, and institutional budgets, through intuitive charts and maps and gain insights about the institute.

## Project Structure

*   **/backend/api/**: Contains `main.py`, the core FastAPI application serving the data endpoints.
*   **/backend/data/**: Houses the cleaned database (`clean_nirf.db`), cleanup SQL scripts, and metric JSON files.
*   **/backend/database/**: Scripts for transforming raw CSVs (`nirf_all.csv`) and raw python data (`raw_para25.py`) into the final SQLite DB. Includes specific transformation logic for budgets and placements.
*   **/backend/scraper/**: Web scraping scripts to pull fresh data directly from the NIRF portal. Includes specific modules like `budget.py`, `placements.py`, and comparison scripts (`ghy_vs_hyd_10yrs.py`). Scraped HTML is cached in `/scraped_html/`.
*   **/frontend/**: The React-based user interface.

## Tech Stack

*   **Backend Framework**: FastAPI 
*   **Database**: SQLite
*   **Web Scraping**: BeautifulSoup4, , pdfplumber, Tesseract
*   **Charts & Visualization**: Recharts, Chart.js 
*   **Deployment**: Frontend on Vercel, Backend on Render

## Local Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    Ensure you are using the updated `requirements.txt`. Version numbers for heavy packages (like OpenCV and Pandas) have been relaxed to allow package managers to resolve dependencies without conflicts.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the FastAPI server**:
    ```bash
    uvicorn main:app --reload
    ```
    The API docs and testing interface will be available at `http://localhost:8000/docs`.
    

4.  **Open a new terminal window** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

5.  **Install Node dependencies**:
    Make sure you have Node.js installed, then run:
    ```bash
    npm install
    ```

6.  **Start the Vite development server**:
    ```bash
    npm run dev
    ```
    The frontend will typically be accessible at `http://localhost:5173`. Make sure the backend is running simultaneously so the frontend can fetch data.

> **Note** The project is already deployed. We can access it here: **[https://nirfanalysis.vercel.app/](https://nirfanalysis.vercel.app/)**


