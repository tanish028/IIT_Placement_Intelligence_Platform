from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
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

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": traceback.format_exc()})

# ── Routers ───────────────────────────────────────────────────────
app.include_router(stats_router)
app.include_router(predict_router)


@app.get("/")
def root():
    return {"message": "IIT Placement Intelligence API is running."}
