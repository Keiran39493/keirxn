from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .matcher import find_matches
from .models import MatchResult, QuizAnswers

STATIC_DIR  = Path(__file__).parent.parent / "static"
IMAGES_DIR  = Path(__file__).parent.parent / "images"

app = FastAPI(title="NGO Match Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/match", response_model=list[MatchResult])
async def match(answers: QuizAnswers):
    if not answers.sectors:
        raise HTTPException(status_code=422, detail="At least one sector must be selected")
    return find_matches(answers, top_n=5)


# Serve HTML pages at clean URLs
@app.get("/quiz")
async def quiz_page():
    return FileResponse(STATIC_DIR / "quiz.html")


@app.get("/results")
async def results_page():
    return FileResponse(STATIC_DIR / "results.html")


# Serve NGO logo images
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

# Static files catch-all (must be mounted last)
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
