# IIT Placement Intelligence Platform

A full-stack data analytics and machine learning platform that centralizes IIT placement statistics — letting students compare institutes, explore branch and sector trends, and get ML-powered predictions with explainability.

**Live:** https://iit-placement-intelligence-platform.vercel.app  
**API Docs:** https://iit-placement-intelligence-platform.onrender.com/docs

---

## The Problem

Placement data across IITs lives in scattered PDFs, annual reports, and RTI responses. A student asking "Should I target IIT Bombay or IIT Delhi for CSE?" has no single source to compare packages, placement percentages, or sector trends across institutes and years.

This platform solves that by aggregating placement data from 13 IITs across 5 years into a structured PostgreSQL database, then building analytics and ML predictions on top of it.

---

## Features

| Page | What it does |
|------|-------------|
| **Dashboard** | Overview: institutes covered, avg package, placement %, top insights |
| **IIT Comparison** | Side-by-side bar charts and table for any set of IITs and year |
| **Branch Analytics** | Branch-wise package rankings; "Which IIT is best for my branch?" ranker |
| **Sector Analytics** | Hiring split across IT, Core, Finance, Consulting with pie chart + table |
| **Trend Analysis** | Year-over-year package and placement % trends; growth rate comparison across IITs |
| **Prediction Center** | RandomForest prediction with SHAP explanations, 95% confidence intervals, and model accuracy metrics |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18, Tailwind CSS, Recharts | Component model, utility-first CSS, lightweight charting |
| Backend | FastAPI (Python 3.11) | Auto-generated OpenAPI docs, async support, Pydantic validation |
| Database | PostgreSQL on Neon | Relational model fits structured placement data; Neon gives free serverless Postgres |
| ML | scikit-learn RandomForestRegressor, SHAP | Ensemble beats linear baseline; SHAP adds explainability |
| Deployment | Vercel (frontend), Render (backend) | Free tier, Git-based auto-deploy |

---

## Machine Learning

### Models

Two `RandomForestRegressor` models trained on placement data (2021-2025):

| Model | Target | CV R² (5-fold) | Test MAE | vs Linear Baseline |
|-------|--------|---------------|----------|--------------------|
| Package Model | Avg Package (LPA) | 0.87 ± 0.04 | 1.92 LPA | -38% MAE |
| Placement Model | Placement % | 0.79 ± 0.06 | 5.81% | -29% MAE |

Features: `Institute`, `Branch`, `Program`, `Year` (label-encoded).

### What makes the ML section interview-ready

**Cross-validation** — Models are evaluated with 5-fold CV, not just a single train/test split. This gives honest performance estimates: R² of 0.87 ± 0.04 means the model is consistently good, not just lucky on one split.

**Baseline comparison** — A `LinearRegression` baseline is trained on the same features. RandomForest beats it by ~35% MAE, which directly answers the interview question: *"Why RandomForest?"*

**SHAP explanations** — Each prediction shows a horizontal bar chart of SHAP values per feature. SHAP (SHapley Additive exPlanations) decomposes the prediction into per-feature contributions: `base_value + sum(SHAP values) = predicted value`. A CSE student at IIT Bombay sees exactly how much the institute brand, branch, and year trend each contributed to their predicted package.

**Tree-based confidence intervals** — The 95% CI is computed from the standard deviation of individual tree predictions within the forest (`mean ± 1.96 * std`). This reflects the model's own uncertainty — it narrows when all 100 trees agree and widens when they disagree. More statistically meaningful than a hardcoded historical range.

---

## System Design

```
User (Browser)
    │
    ▼
React SPA (Vercel)          ← SPA routing via vercel.json rewrites
    │  Axios API calls
    ▼
FastAPI (Render)
    ├── /stats/*             ← Analytics queries (SQL aggregations)
    └── /predict/            ← ML inference (SHAP + CI + metrics)
         │
         ├── RandomForest models (loaded once at startup via joblib)
         ├── SHAP TreeExplainer (cached at startup, ~0ms per prediction)
         └── model_metrics.json (CV scores, baseline comparison)
    │
    ▼
PostgreSQL (Neon)
    ├── placements           ← Core stats: package, placement %, per institute/branch/year
    └── branch_sector        ← Sector-wise hiring distribution
```

**Key design decisions:**
- Models and SHAP explainers are loaded once at FastAPI startup (`joblib.load`) and stay in memory, so inference is fast with no cold-load cost per request.
- The frontend uses CSS custom properties (`--bg`, `--surface`, `--text-1`) toggled by a `.light` class on `<html>`, making dark/light mode a single React context rather than per-component logic.
- `vercel.json` rewrites handle SPA routing: all paths resolve to `index.html` so React Router works on hard refresh.

---

## Project Structure

```
IIT_Placement_Intelligence_Platform/
│
├── backend/
│   ├── main.py                  # FastAPI app, CORS config, global error handler
│   ├── database.py              # PostgreSQL connection (psycopg2)
│   ├── schemas.py               # Pydantic request/response models
│   ├── routes/
│   │   ├── stats.py             # Analytics endpoints
│   │   └── predict.py           # ML prediction endpoint
│   ├── services/
│   │   ├── stats_service.py     # SQL query logic (aggregations, growth rates)
│   │   └── predict_service.py   # Encoding, inference, SHAP, CI, metrics
│   ├── ml/
│   │   ├── train.py             # Training: RF + LR baseline + 5-fold CV + metrics JSON
│   │   ├── package_model.pkl
│   │   ├── placement_model.pkl
│   │   ├── *_encoder.pkl        # LabelEncoders (must match training)
│   │   └── model_metrics.json   # CV scores, MAE, baseline comparison
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/               # Home, Compare, Branches, Sectors, Trends, Predict
        ├── components/          # Sidebar (collapsible), PageHeader, StatCard, icons
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
- PostgreSQL (or a free [Neon](https://neon.tech) account)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # Fill in DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
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

- **13 IITs** across India
- **2021–2025** placement cycles
- **350+ data points** across branches, programs, and sectors

---

## Author

**Tanish**  
B.Tech Student — building this for SDE and ML internship applications  
GitHub: [@tanishiitg28](https://github.com/tanishiitg28)

---

## License

MIT
