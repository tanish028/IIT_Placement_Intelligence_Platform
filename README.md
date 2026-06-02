# IIT Placement Intelligence Platform

A full-stack data analytics and machine learning platform that centralizes IIT placement statistics, enabling students to compare institutes, analyze trends, and predict future placement outcomes.

---

## Live Demo

> Frontend: https://iit-placement-intelligence-platform.vercel.app
> Backend API: https://iit-placement-intelligence-platform.onrender.com/docs

---

## Problem Statement

Placement data across IITs is scattered across annual reports, RTI responses, and placement brochures. Students struggle to compare institutes, branches, salary trends, and recruitment sectors in one place.

This platform solves that by centralizing placement data and providing analytics, comparisons, trend analysis, and ML-powered predictions.

---

## Features

- **Dashboard** — Summary stats: institutes covered, avg package, avg placement %
- **IIT Comparison** — Side-by-side comparison of packages and placement % across institutes
- **Branch Analytics** — Branch-wise package rankings + "Which IIT is best for my branch?"
- **Sector Analytics** — Hiring distribution across IT, Core, Finance, Consulting sectors
- **Trend Analysis** — Year-over-year package and placement trends + growth rate comparison
- **Prediction Center** — ML-powered predictions for avg package and placement % with historical range

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, Tailwind CSS, Recharts     |
| Backend    | FastAPI (Python)                  |
| Database   | PostgreSQL (Neon)                 |
| ML Models  | scikit-learn RandomForestRegressor |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
IIT_Placement_Intelligence_Platform/
│
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── database.py           # PostgreSQL connection (psycopg2)
│   ├── schemas.py            # Pydantic request/response models
│   ├── routes/
│   │   ├── stats.py          # Analytics endpoints
│   │   └── predict.py        # ML prediction endpoint
│   ├── services/
│   │   ├── stats_service.py  # SQL query logic
│   │   └── predict_service.py # Feature encoding + model inference
│   ├── ml/
│   │   └── train.py          # Model training script
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/            # Home, Compare, Branches, Sectors, Trends, Predict
        ├── components/       # Sidebar, StatCard, Spinner
        └── api/api.js        # Axios API calls
```

---

## ML Models

Two `RandomForestRegressor` models trained on historical IIT placement data:

| Model | Target | Features | MAE | R² |
|-------|--------|----------|-----|----|
| Package Model | Avg Package (LPA) | Institute, Branch, Program, Year | 2.43 | 0.67 |
| Placement Model | Placement % | Institute, Branch, Program, Year | 7.35 | 0.55 |

Prediction response includes:
- Point prediction from the model
- Historical range (avg of yearly min/max for the branch) for context

---

## Database Schema

**`placements`** — Core placement stats per institute, branch, and year
```
id, Institute, Program, Year, Branch,
AvgPackage_LPA, MedianPackage_LPA,
Highest_Domestic_LPA, Highest_International_LPA,
Placement_Percentage, Sector
```

**`branch_sector`** — Sector-wise hiring distribution
```
id, Institute, program, Year, Branch,
Sector, Students_Placed, Placement_Percentage
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/summary` | Dashboard totals |
| GET | `/stats/compare` | Multi-IIT comparison |
| GET | `/stats/branches` | Branch-wise stats |
| GET | `/stats/sectors` | Sector distribution |
| GET | `/stats/trends` | Year-over-year trends |
| GET | `/stats/best-iits` | Best IIT for a branch |
| GET | `/stats/growth` | Package growth rates |
| GET | `/stats/filters` | Dropdown options |
| POST | `/predict/` | ML prediction |

Full interactive docs available at `/docs` when running locally.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or a free Neon account)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # Add your DB credentials
python ml/train.py          # Train and save ML models
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
- **2021 – 2025** placement cycles
- **350+ data points** across branches, programs, and sectors

---

## Author

**Tanish**
B.Tech Student | IIT Placement Intelligence Platform

---

## License

MIT
