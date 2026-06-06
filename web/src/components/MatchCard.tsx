import Link from "next/link";
import type { MatchResult } from "@/lib/types";
import {
  CATEGORY_COLOURS,
  CATEGORY_LABELS,
  GEO_LABELS,
  LEGAL_LABELS,
} from "@/lib/constants";

const RANK_BADGES = [
  { label: "#1 Match", cls: "badge-1 text-white" },
  { label: "#2 Match", cls: "badge-2 text-white" },
  { label: "#3 Match", cls: "badge-3 text-white" },
  { label: "#4 Match", cls: "bg-gray-100 text-gray-600" },
  { label: "#5 Match", cls: "bg-gray-100 text-gray-600" },
];

function circleOffset(pct: number) {
  const circumference = 2 * Math.PI * 40;
  return circumference * (1 - pct / 100);
}

interface MatchCardProps {
  result: MatchResult;
  index: number;
  viewProfileLabel: string;
  viewProjectLabel: string;
  websiteLabel: string;
  matchLabel: string;
}

export function MatchCard({
  result,
  index,
  viewProfileLabel,
  viewProjectLabel,
  websiteLabel,
  matchLabel,
}: MatchCardProps) {
  const { ngo, match_percentage, match_reasons } = result;
  const badge = RANK_BADGES[index] ?? RANK_BADGES[4];
  const catLabel = CATEGORY_LABELS[ngo.category] ?? ngo.category;
  const catColour = CATEGORY_COLOURS[ngo.category] ?? "bg-gray-100 text-gray-600";
  const offset = circleOffset(match_percentage);
  const circumference = 2 * Math.PI * 40;
  const isTop = index === 0;
  const strokeColor = isTop ? "#c9983a" : "#2d6a4f";
  const textColor = isTop ? "#c9983a" : "#1e5239";

  return (
    <article
      className={`match-card mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isTop ? "border-gold" : "border-gm-100"
      }`}
      style={{ animationDelay: `${0.05 + index * 0.1}s` }}
    >
      {isTop && (
        <div className="h-1 bg-gradient-to-r from-gold to-amber-400" />
      )}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-shrink-0 flex-col items-center">
            <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#d8f0e3"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={strokeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                className="ring-animate"
              />
              <text
                x="50"
                y="46"
                textAnchor="middle"
                fontSize="18"
                fontWeight="700"
                fill={textColor}
                fontFamily="Inter, sans-serif"
              >
                {match_percentage}%
              </text>
              <text
                x="50"
                y="60"
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontFamily="Inter, sans-serif"
              >
                {matchLabel}
              </text>
            </svg>
            <span
              className={`mt-2 rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColour}`}
              >
                {catLabel}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {LEGAL_LABELS[ngo.legal_form]}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {GEO_LABELS[ngo.geographic_scope]}
              </span>
            </div>

            <h3 className="mb-2 text-xl font-bold text-gm-800">{ngo.name}</h3>
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
              {ngo.description}
            </p>

            <ul className="mb-5 space-y-1.5">
              {match_reasons.slice(0, 4).map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-gm-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/orgs/${ngo.slug}`}
                className="flex items-center gap-1.5 rounded-xl bg-gm-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gm-700"
              >
                {viewProjectLabel}
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <a
                href={ngo.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-gm-300 px-5 py-2.5 text-sm font-medium text-gm-700 transition-colors hover:bg-gm-50"
              >
                {viewProfileLabel}
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              {ngo.website && (
                <a
                  href={ngo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-gm-600 hover:text-gm-700"
                >
                  {websiteLabel}
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
