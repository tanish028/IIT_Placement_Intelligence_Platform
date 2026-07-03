# IIT Placement Intelligence Platform

A full-stack analytics and ML platform that centralizes IIT placement data — allowing students to compare institutes, explore branch and sector trends, and get data-driven package predictions.

**Live:** https://iit-placement-intelligence-platform.vercel.app  
**API:** https://iit-placement-intelligence-platform.onrender.com/docs

---

## Problem

Placement data across IITs is scattered across PDFs, annual reports, and RTI responses. There is no single place where a student can compare packages, placement percentages, or sector hiring across institutes and years in one view.

This platform aggregates placement data from 13 IITs across 5 years into a structured database and builds analytics and ML predictions on top of it.

---

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | Overview of institutes covered, average packages, placement percentages, and top insights |
| **IIT Comparison** | Side-by-side comparison of any set of IITs for a selected year |
| **Branch Analytics** | Branch-wise package rankings and "best IIT for branch" ranker |
| **Sector Analytics** | Hiring split across IT, Core, Finance, and Consulting with pie chart and table |
| **Trend Analysis** | Year-over-year salary and placement trends; growth rate comparison across IITs |
| **Prediction Center** | Package and placement % predictions with SHAP explanations and confidence intervals |

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18, Tailwind CSS, Recharts | Component-based UI, utility CSS, lightweight charting |
| Backend | FastAPI (Python 3.11) | Auto-generated OpenAPI docs, Pydantic validation, async support |
| Database | MySQL | Relational model fits structured placement data |
| ML | scikit-learn, SHAP | RandomForest for non-linear relationships, SHAP for explainability |
| Deployment | Vercel (frontend), Render (backend) | Git-based auto-deploy, free tier |

---

## Machine Learning

Two `RandomForestRegressor` models trained on placement data (2021–2025):

| Model | Target | CV R² (5-fold) | Test MAE | vs Linear Baseline |
|-------|--------|---------------|----------|--------------------|
| Package Model | Avg Package (LPA) | 0.87 ± 0.04 | 1.92 LPA | −38% MAE |
| Placement Model | Placement % | 0.79 ± 0.06 | 5.81% | −29% MAE |

Features: `Institute`, `Branch`, `Program`, `Year` (label-encoded).

**Cross-validation** — Evaluated with 5-fold CV instead of a single train/test split, giving more reliable performance estimates across different data subsets.

**Baseline comparison** — A `LinearRegression` model is trained on the same features. RandomForest outperforms it by ~35% MAE, which justifies using the more complex model.

**SHAP explanations** — Each prediction includes a SHAP breakdown per feature. SHAP (SHapley Additive exPlanations) decomposes the prediction into per-feature contributions: `base_value + sum(SHAP values) = predicted value`. This makes each prediction auditable rather than a black box.

**Confidence intervals** — The 95% CI is derived from the standard deviation of individual tree predictions within the forest (`mean ± 1.96 × std`). It reflects how much the trees in the ensemble agree with each other on that specific input.

---

## System Design

```
Browser
    │
    ▼
React SPA (Vercel)          ← SPA routing via vercel.json rewrites
    │  Axios API calls
    ▼
FastAPI (Render)
    ├── /stats/*             ← Analytics: SQL aggregations
    └── /predict/            ← ML inference: SHAP + CI + model metrics
         │
         ├── RandomForest models (loaded once at startup via joblib)
         ├── SHAP TreeExplainer (cached at startup)
         └── model_metrics.json (CV scores, baseline comparison)
    │
    ▼
MySQL
    ├── placement_stats      ← Package, placement %, per institute/branch/year
    └── sector_stats         ← Sector-wise hiring distribution
```

**Design decisions:**
- Models and SHAP explainers are loaded once at FastAPI startup and kept in memory, so inference has no cold-load cost per request.
- Dark/light mode uses CSS custom properties (`--bg`, `--surface`, `--text-1`) toggled by a `.light` class on `<html>`. A single ThemeContext manages this; no per-component logic needed.
- `vercel.json` rewrites resolve all paths to `index.html` so React Router works on hard refresh.

---

## Project Structure

```
IIT_Placement_Intelligence_Platform/
│
├── backend/
│   ├── main.py                  # FastAPI app, CORS config
│   ├── database.py              # MySQL connection (psycopg2)
│   ├── schemas.py               # Pydantic request/response models
│   ├── routes/
│   │   ├── stats.py             # Analytics endpoints
│   │   └── predict.py           # ML prediction endpoint
│   ├── services/
│   │   ├── stats_service.py     # SQL query logic
│   │   └── predict_service.py   # Encoding, inference, SHAP, CI, metrics
│   ├── ml/
│   │   ├── train.py             # RF + LR baseline + 5-fold CV + saves metrics JSON
│   │   ├── package_model.pkl
│   │   ├── placement_model.pkl
│   │   ├── *_encoder.pkl
│   │   └── model_metrics.json
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/               # Home, Compare, Branches, Sectors, Trends, Predict
        ├── components/          # Sidebar (collapsible), PageHeader, StatCard
        ├── context/
        │   └── ThemeContext.jsx # Dark/light mode via CSS variables
        └── api/api.js           # Axios API calls
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/summary` | Dashboard totals |
| GET | `/stats/filters` | Dropdown options (institutes, branches, years, programs) |
| GET | `/stats/compare` | Multi-IIT comparison for a given year |
| GET | `/stats/branches` | Branch-wise stats for an institute and year |
| GET | `/stats/best-iits` | Ranked IITs for a given branch |
| GET | `/stats/sectors` | Sector distribution for an institute and year |
| GET | `/stats/trends` | Year-over-year trends for an institute |
| GET | `/stats/growth` | Package growth % across IITs between two years |
| POST | `/predict/` | ML prediction with SHAP, CI, and model metrics |

Full interactive docs at `/docs`.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
python ml/train.py          # Trains models, saves .pkl files and model_metrics.json
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Data Coverage

- 13 IITs across India
- 2021–2025 placement cycles
- 350+ data points across branches, programs, and sectors

---

## Author

**Tanish**  
B.Tech Student  
GitHub: [@tanishiitg28](https://github.com/tanishiitg28)

---

## License

MIT
