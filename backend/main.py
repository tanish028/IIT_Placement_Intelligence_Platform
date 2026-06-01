from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.stats import router as stats_router
from routes.predict import router as predict_router

app = FastAPI(
    title="IIT Placement Intelligence API",
    description="Analytics and ML predictions for IIT placement data",
    version="1.0.0"
)

# ── CORS ─────────────────────────────────────────────────────────
# Allows the React frontend (running on a different port) to call this API.
# In production, replace "*" with your deployed Vercel URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(stats_router)
app.include_router(predict_router)


@app.get("/")
def root():
    return {"message": "IIT Placement Intelligence API is running."}
