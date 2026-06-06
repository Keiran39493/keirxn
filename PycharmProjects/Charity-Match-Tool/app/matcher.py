import json
from pathlib import Path
from typing import List

from .models import NGO, QuizAnswers, MatchResult

_DATA_PATH = Path(__file__).parent / "data" / "ngos.json"

SDG_LABELS = {
    1: "No Poverty", 2: "Zero Hunger", 3: "Good Health & Well-being",
    4: "Quality Education", 5: "Gender Equality", 6: "Clean Water & Sanitation",
    7: "Affordable Clean Energy", 8: "Decent Work & Economic Growth",
    9: "Industry, Innovation & Infrastructure", 10: "Reduced Inequalities",
    11: "Sustainable Cities & Communities", 13: "Climate Action",
    14: "Life Below Water", 15: "Life on Land",
    16: "Peace, Justice & Strong Institutions", 17: "Partnerships for the Goals",
}

CATEGORY_LABELS = {
    "children_youth_families": "Children, Youth & Families",
    "senior_citizens": "Senior Citizens",
    "education": "Education",
    "social_health": "Social Affairs & Health",
    "arts_culture": "Arts & Culture",
    "environment_climate": "Environment & Climate",
    "sport_leisure": "Sports & Leisure",
    "development": "Global Development",
}

GEO_SCORE_TABLE = {
    ("liechtenstein", "liechtenstein"): 20,
    ("liechtenstein", "dach"): 14,
    ("liechtenstein", "international"): 5,
    ("dach", "liechtenstein"): 20,
    ("dach", "dach"): 20,
    ("dach", "international"): 12,
    ("international", "liechtenstein"): 15,
    ("international", "dach"): 18,
    ("international", "international"): 20,
}


def load_ngos() -> List[NGO]:
    with open(_DATA_PATH, encoding="utf-8") as f:
        data = json.load(f)
    return [NGO(**item) for item in data["ngos"]]


def _score(ngo: NGO, answers: QuizAnswers) -> tuple[float, list[str]]:
    score = 0.0
    reasons: list[str] = []

    # Sector match — 35 pts
    if ngo.category.value in answers.sectors:
        score += 35
        label = CATEGORY_LABELS.get(ngo.category.value, ngo.category.value)
        reasons.append(f"Operates in your selected sector: {label}")

    # Geographic alignment — 20 pts
    geo_key = (answers.geographic_focus, ngo.geographic_scope.value)
    geo_pts = GEO_SCORE_TABLE.get(geo_key, 0)
    score += geo_pts
    if geo_pts == 20:
        reasons.append("Geographic focus is a strong match")
    elif geo_pts >= 14:
        reasons.append("Geographic focus broadly aligns")

    # SDG alignment — 25 pts (5 per matching SDG, capped at 5 matches)
    if answers.sdg_priorities:
        matched_sdgs = set(ngo.sdgs) & set(answers.sdg_priorities)
        sdg_pts = min(len(matched_sdgs) * 5, 25)
        score += sdg_pts
        if matched_sdgs:
            labels = [SDG_LABELS.get(s, f"SDG {s}") for s in sorted(matched_sdgs)]
            reasons.append(f"Aligns with: {', '.join(labels)}")

    # Organisation maturity — 10 pts
    if answers.org_maturity == "no_preference":
        score += 5
    elif ngo.founded_year is not None:
        age = 2026 - ngo.founded_year
        hit = (
            (answers.org_maturity == "new" and age < 5)
            or (answers.org_maturity == "established" and 5 <= age <= 20)
            or (answers.org_maturity == "long_standing" and age > 20)
        )
        if hit:
            score += 10
            reasons.append("Organisation maturity matches your preference")
    else:
        score += 3  # small neutral credit when year is unknown

    # Legal form — 10 pts
    if answers.legal_form_preference == "both":
        score += 5
    elif answers.legal_form_preference == str(ngo.legal_form):
        score += 10
        form_label = "Foundation (Stiftung)" if ngo.legal_form == "foundation" else "Association (Verein)"
        reasons.append(f"Preferred structure matches: {form_label}")

    return score, reasons


def find_matches(answers: QuizAnswers, top_n: int = 5) -> List[MatchResult]:
    ngos = load_ngos()

    # Hard-filter by legal form only when a strict preference is set
    if answers.legal_form_preference != "both":
        pool = [n for n in ngos if str(n.legal_form) == answers.legal_form_preference]
        # Fall back to full pool if the filtered set is too small
        if len(pool) < top_n:
            pool = ngos
    else:
        pool = ngos

    scored = [(_score(n, answers), n) for n in pool]
    scored.sort(key=lambda x: x[0][0], reverse=True)

    max_score = 90.0  # theoretical max with all criteria met
    results: list[MatchResult] = []
    for (s, reasons), ngo in scored[:top_n]:
        pct = min(round((s / max_score) * 100), 99)
        results.append(
            MatchResult(
                ngo=ngo,
                score=round(s, 1),
                match_percentage=pct,
                match_reasons=reasons or ["Aligns with your overall philanthropic profile"],
            )
        )
    return results
