import fundsData from "@/data/funds.json";
import {
  AMOUNT_BANDS,
  CATEGORY_LABELS,
  SDG_LABELS,
} from "./constants";
import type { Fund, FundMatchResult, FundQuizAnswers } from "./types";

const GEO_SCORE_TABLE: Record<string, number> = {
  "liechtenstein|liechtenstein": 20,
  "liechtenstein|dach": 14,
  "liechtenstein|international": 5,
  "dach|liechtenstein": 18,
  "dach|dach": 20,
  "dach|international": 12,
  "international|liechtenstein": 10,
  "international|dach": 15,
  "international|international": 20,
};

function loadFunds(): Fund[] {
  return (fundsData as { funds: Fund[] }).funds;
}

function grantSizeFits(fund: Fund, amountSought: string): boolean {
  const band = AMOUNT_BANDS[amountSought];
  if (!band) return true;
  const targetMid = band.max === Infinity ? band.min * 2 : (band.min + band.max) / 2;
  return targetMid >= fund.grant_min_chf && targetMid <= fund.grant_max_chf * 1.5;
}

function scoreFund(
  fund: Fund,
  answers: FundQuizAnswers,
): { score: number; reasons: string[]; warnings: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const sectorOverlap = fund.sectors.filter((s) => answers.sectors.includes(s));
  if (sectorOverlap.length > 0) {
    score += 35;
    const labels = sectorOverlap.map((s) => CATEGORY_LABELS[s] ?? s);
    reasons.push(`Thematic fit with your sector(s): ${labels.join(", ")}`);
  }

  const geoKey = `${answers.geographic_focus}|${fund.geographic_scope}`;
  const geoPts = GEO_SCORE_TABLE[geoKey] ?? 0;
  score += geoPts;
  if (geoPts >= 18) {
    reasons.push("Geographic mandate aligns with where your organisation works");
  } else if (geoPts >= 12) {
    reasons.push("Geographic scope is broadly compatible");
  } else if (geoPts > 0) {
    warnings.push(
      "Geographic focus may be outside this fund's primary mandate — verify before applying",
    );
  }

  if (answers.sdg_priorities.length > 0) {
    const matchedSdgs = fund.sdgs.filter((s) => answers.sdg_priorities.includes(s));
    const sdgPts = Math.min(matchedSdgs.length * 5, 25);
    score += sdgPts;
    if (matchedSdgs.length > 0) {
      const labels = matchedSdgs
        .sort((a, b) => a - b)
        .map((s) => SDG_LABELS[s] ?? `SDG ${s}`);
      reasons.push(`Shared SDG priorities: ${labels.join(", ")}`);
    }
  }

  const fundingOverlap = fund.funding_types.filter((t) =>
    answers.funding_need.includes(t),
  );
  if (fundingOverlap.length > 0) {
    score += 15;
    reasons.push(
      `Supports your funding need (${fundingOverlap.join(", ").replace(/_/g, " ")})`,
    );
  }

  if (grantSizeFits(fund, answers.amount_sought)) {
    score += 10;
    const band = AMOUNT_BANDS[answers.amount_sought];
    reasons.push(
      `Typical grant range (CHF ${fund.grant_min_chf.toLocaleString("de-CH")}–${fund.grant_max_chf.toLocaleString("de-CH")}) fits your ask (${band?.label ?? answers.amount_sought})`,
    );
  } else {
    warnings.push(
      `Your requested amount may be outside this fund's usual range (CHF ${fund.grant_min_chf.toLocaleString("de-CH")}–${fund.grant_max_chf.toLocaleString("de-CH")})`,
    );
  }

  if (fund.mandate_scope === "open") {
    score += 5;
    reasons.push("Open mandate — actively considers new LI projects");
  } else if (fund.mandate_scope === "discretionary") {
    score += 3;
  } else {
    warnings.push(
      "Fixed or narrow mandate — unsolicited proposals may not be accepted",
    );
  }

  if (!fund.accepts_applications) {
    warnings.push(
      "Does not accept unsolicited applications — use for discovery or warm introduction only",
    );
  }

  return { score, reasons, warnings };
}

export function findFundMatches(
  answers: FundQuizAnswers,
  topN = 5,
): FundMatchResult[] {
  const funds = loadFunds();
  const maxScore = 100;

  const scored = funds
    .map((fund) => {
      const { score, reasons, warnings } = scoreFund(fund, answers);
      return { fund, score, reasons, warnings };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map(({ fund, score, reasons, warnings }) => ({
    fund,
    score: Math.round(score * 10) / 10,
    match_percentage: Math.min(Math.round((score / maxScore) * 100), 99),
    match_reasons:
      reasons.length > 0
        ? reasons
        : ["May be worth exploring based on your overall profile"],
    mismatch_warnings: warnings,
  }));
}
