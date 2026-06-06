import ngosData from "@/data/ngos.json";
import {
  CATEGORY_LABELS,
  SDG_LABELS,
} from "./constants";
import type { MatchResult, NGO, QuizAnswers } from "./types";

const GEO_SCORE_TABLE: Record<string, number> = {
  "liechtenstein|liechtenstein": 20,
  "liechtenstein|dach": 14,
  "liechtenstein|international": 5,
  "dach|liechtenstein": 20,
  "dach|dach": 20,
  "dach|international": 12,
  "europe|liechtenstein": 15,
  "europe|dach": 20,
  "europe|international": 15,
  "international|liechtenstein": 15,
  "international|dach": 18,
  "international|international": 20,
  "africa|liechtenstein": 0,
  "africa|dach": 0,
  "africa|international": 20,
  "asia|liechtenstein": 0,
  "asia|dach": 0,
  "asia|international": 20,
  "americas|liechtenstein": 0,
  "americas|dach": 0,
  "americas|international": 20,
  "oceania|liechtenstein": 0,
  "oceania|dach": 0,
  "oceania|international": 20,
};

function loadNgos(): NGO[] {
  return (ngosData as { ngos: NGO[] }).ngos;
}

function scoreNgo(ngo: NGO, answers: QuizAnswers): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (answers.sectors.includes(ngo.category)) {
    score += 35;
    const label = CATEGORY_LABELS[ngo.category] ?? ngo.category;
    reasons.push(`Tätig in Ihrem Bereich: ${label}`);
  }

  const geoKey = `${answers.geographic_focus}|${ngo.geographic_scope}`;
  const geoPts = GEO_SCORE_TABLE[geoKey] ?? 0;
  score += geoPts;
  if (geoPts === 20) {
    reasons.push("Geografischer Fokus passt sehr gut");
  } else if (geoPts >= 14) {
    reasons.push("Geografischer Fokus passt weitgehend");
  }

  if (answers.sdg_priorities.length > 0) {
    const matchedSdgs = ngo.sdgs.filter((s) => answers.sdg_priorities.includes(s));
    const sdgPts = Math.min(matchedSdgs.length * 5, 25);
    score += sdgPts;
    if (matchedSdgs.length > 0) {
      const labels = matchedSdgs
        .sort((a, b) => a - b)
        .map((s) => SDG_LABELS[s] ?? `SDG ${s}`);
      reasons.push(`Entspricht: ${labels.join(", ")}`);
    }
  }

  score += 5;

  if (answers.legal_form_preference === "both") {
    score += 5;
  } else if (answers.legal_form_preference === ngo.legal_form) {
    score += 10;
    const formLabel =
      ngo.legal_form === "foundation" ? "Stiftung" : "Verein";
    reasons.push(`Bevorzugte Rechtsform: ${formLabel}`);
  }

  return { score, reasons };
}

export function findMatches(answers: QuizAnswers, topN = 5): MatchResult[] {
  const ngos = loadNgos();
  const maxScore = 90;

  let pool: NGO[];
  if (answers.legal_form_preference !== "both") {
    pool = ngos.filter((n) => n.legal_form === answers.legal_form_preference);
    if (pool.length < topN) pool = ngos;
  } else {
    pool = ngos;
  }

  const scored = pool
    .map((ngo) => {
      const { score, reasons } = scoreNgo(ngo, answers);
      return { ngo, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map(({ ngo, score, reasons }) => ({
    ngo,
    score: Math.round(score * 10) / 10,
    match_percentage: Math.min(Math.round((score / maxScore) * 100), 99),
    match_reasons:
      reasons.length > 0
        ? reasons
        : ["Entspricht Ihrem philanthropischen Gesamtprofil"],
  }));
}