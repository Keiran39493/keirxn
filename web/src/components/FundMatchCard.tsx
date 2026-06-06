import type { FundMatchResult } from "@/lib/types";
import {
  FUND_TYPE_LABELS,
  GEO_LABELS,
  MANDATE_LABELS,
} from "@/lib/constants";

const RANK_BADGES = [
  { label: "#1 Fit", cls: "badge-1 text-white" },
  { label: "#2 Fit", cls: "badge-2 text-white" },
  { label: "#3 Fit", cls: "badge-3 text-white" },
  { label: "#4 Fit", cls: "bg-gray-100 text-gray-600" },
  { label: "#5 Fit", cls: "bg-gray-100 text-gray-600" },
];

function circleOffset(pct: number) {
  const circumference = 2 * Math.PI * 40;
  return circumference * (1 - pct / 100);
}

function formatChf(n: number) {
  return n.toLocaleString("de-CH");
}

interface FundMatchCardProps {
  result: FundMatchResult;
  index: number;
  matchLabel: string;
  grantRangeLabel: string;
  contactLabel: string;
  websiteLabel: string;
  warningsTitle: string;
}

export function FundMatchCard({
  result,
  index,
  matchLabel,
  grantRangeLabel,
  contactLabel,
  websiteLabel,
  warningsTitle,
}: FundMatchCardProps) {
  const { fund, match_percentage, match_reasons, mismatch_warnings } = result;
  const badge = RANK_BADGES[index] ?? RANK_BADGES[4];
  const offset = circleOffset(match_percentage);
  const circumference = 2 * Math.PI * 40;
  const isTop = index === 0;
  const strokeColor = isTop ? "#c9983a" : "#d97706";
  const textColor = isTop ? "#c9983a" : "#b45309";

  return (
    <article
      className={`match-card mb-6 overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isTop ? "border-gold" : "border-amber-100"
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
                stroke="#fef3c7"
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
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                {FUND_TYPE_LABELS[fund.fund_type]}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {MANDATE_LABELS[fund.mandate_scope]}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                {GEO_LABELS[fund.geographic_scope]}
              </span>
            </div>

            <h3 className="mb-2 text-xl font-bold text-gm-800">{fund.name}</h3>
            <p className="mb-3 text-sm font-medium text-amber-800">
              {grantRangeLabel}: CHF {formatChf(fund.grant_min_chf)} –{" "}
              {formatChf(fund.grant_max_chf)}
            </p>
            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
              {fund.description}
            </p>

            <ul className="mb-4 space-y-1.5">
              {match_reasons.slice(0, 4).map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
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

            {mismatch_warnings.length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
                  {warningsTitle}
                </p>
                <ul className="space-y-1">
                  {mismatch_warnings.map((w) => (
                    <li key={w} className="text-sm text-amber-950/80">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {fund.contact_email && (
                <a
                  href={`mailto:${fund.contact_email}`}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  {contactLabel}
                </a>
              )}
              {fund.website && (
                <a
                  href={fund.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
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
