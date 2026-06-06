"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import {
  CATEGORY_COLOURS,
  CATEGORY_LABELS,
  GEO_LABELS,
  LEGAL_LABELS,
} from "@/lib/constants";
import { getFeaturedProject } from "@/lib/ngo-detail";
import type { NgoDetail, NgoProject } from "@/lib/types";

function chf(n: number) {
  return `CHF ${n.toLocaleString("de-CH")}`;
}

function pct(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

interface NgoDetailViewProps {
  detail: NgoDetail;
}

export function NgoDetailView({ detail }: NgoDetailViewProps) {
  const { tr } = useLocale();
  const featured = getFeaturedProject(detail);
  const catLabel = CATEGORY_LABELS[detail.category] ?? detail.category;
  const catColour = CATEGORY_COLOURS[detail.category] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="border-b border-gm-100 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {detail.logo_src && (
              <div className="flex h-24 w-40 flex-shrink-0 items-center justify-center rounded-2xl border border-gm-100 bg-white p-4 shadow-sm">
                <Image
                  src={detail.logo_src}
                  alt=""
                  width={160}
                  height={64}
                  className="max-h-16 w-auto object-contain"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <Link
                  href={`/?category=${detail.category}#directory`}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-75 ${catColour}`}
                  title={`Browse all ${catLabel} organisations`}
                >
                  {catLabel}
                </Link>
                <Link
                  href={`/?geo=${detail.geographic_scope}#directory`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-opacity hover:opacity-75"
                  title={`Browse organisations by geographic scope`}
                >
                  {GEO_LABELS[detail.geographic_scope]}
                </Link>
                <Link
                  href={`/?legal=${detail.legal_form}#directory`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-opacity hover:opacity-75"
                  title={`Browse all ${LEGAL_LABELS[detail.legal_form]} organisations`}
                >
                  {LEGAL_LABELS[detail.legal_form]}
                </Link>
                {detail.sdgs.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-gm-50 px-2.5 py-1 text-xs text-gm-700"
                  >
                    SDG {s}
                  </span>
                ))}
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gm-900 md:text-4xl">
                {featured.title}
              </h1>
              <p className="text-sm font-medium text-gm-600">{detail.name}</p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {featured.summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funding ask — above the fold */}
      <FundingBar project={featured} tr={tr} />

      <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
        {/* Narrative */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_summary")}</h2>
          <p className="mb-8 leading-relaxed text-slate-600">{detail.long_description}</p>
          <div className="grid gap-4 md:grid-cols-3">
            <NarrativeCard label={tr("detail_problem")} text={featured.problem} />
            <NarrativeCard label={tr("detail_intervention")} text={featured.intervention} />
            <NarrativeCard label={tr("detail_outcome")} text={featured.outcome} />
          </div>
        </section>

        {/* Budget */}
        <section className="rounded-2xl border border-gm-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_budget")}</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gm-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {featured.budget_lines.map((line) => (
                <tr key={line.category} className="border-b border-gm-50">
                  <td className="py-3 text-slate-700">{line.category}</td>
                  <td className="py-3 text-right font-medium text-gm-800">
                    {chf(line.amount_chf)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold text-gm-800">
                <td className="pt-4">Total</td>
                <td className="pt-4 text-right">{chf(featured.budget_total_chf)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-slate-500">{tr("detail_partial")}</p>
        </section>

        {/* Impact */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_impact")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {featured.impact_metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-gm-100 bg-gm-50/50 p-5 text-center"
              >
                <p className="text-2xl font-bold text-gm-700">{m.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Matcher hooks */}
        {featured.highlights_for_matchers.length > 0 && (
          <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-6">
            <h2 className="mb-4 text-lg font-bold text-gm-800">
              {tr("detail_matcher_hooks")}
            </h2>
            <ul className="space-y-2">
              {featured.highlights_for_matchers.map((h) => (
                <li key={h} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-amber-600" aria-hidden>
                    •
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Other fundable projects */}
        {detail.projects.length > 1 && (
          <section>
            <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_fundable")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {detail.projects
                .filter((p) => p.id !== featured.id)
                .map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
            </div>
          </section>
        )}

        {/* Track record */}
        {featured.track_record && featured.track_record.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_track_record")}</h2>
            <div className="space-y-3">
              {featured.track_record.map((t) => (
                <div
                  key={t.title}
                  className="rounded-xl border border-gm-100 bg-white p-4"
                >
                  <p className="font-semibold text-gm-800">{t.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{t.result}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Organisation block — mirrors gemeinnuetzig.li */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 md:p-8">
          <h2 className="mb-6 text-xl font-bold text-gm-800">{tr("detail_organisation")}</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <AdminRow label={tr("detail_field_activity")} value={detail.field_of_activity} />
            <AdminRow label={tr("detail_geography")} value="FL / Liechtenstein" />
            <AdminRow label={tr("detail_legal_form")} value={LEGAL_LABELS[detail.legal_form]} />
            {detail.founded_year && (
              <AdminRow label={tr("detail_founded")} value={String(detail.founded_year)} />
            )}
            {detail.board_president && (
              <AdminRow label={tr("detail_board")} value={detail.board_president} />
            )}
            {detail.address && (
              <AdminRow label={tr("detail_address")} value={detail.address} className="sm:col-span-2" />
            )}
            {detail.phone && <AdminRow label={tr("detail_phone")} value={detail.phone} />}
            {detail.commercial_register && (
              <AdminRow label={tr("detail_register")} value={detail.commercial_register} />
            )}
            <AdminRow
              label={tr("detail_tax_exempt")}
              value={detail.tax_exempt ? tr("detail_yes") : "—"}
            />
            {detail.association_memberships.length > 0 && (
              <AdminRow
                label={tr("detail_memberships")}
                value={detail.association_memberships.join(", ")}
                className="sm:col-span-2"
              />
            )}
          </dl>
          <a
            href={detail.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-gm-600 hover:text-gm-700"
          >
            {tr("detail_official")} →
          </a>
        </section>

        {/* Governance */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-gm-800">{tr("detail_governance")}</h2>
          <div className="flex flex-wrap gap-2">
            {detail.governance_badges.map((b) => (
              <span
                key={b}
                className="rounded-full bg-gm-100 px-3 py-1.5 text-xs font-semibold text-gm-800"
              >
                {b === "audited"
                  ? tr("badge_audited")
                  : b === "annual_report"
                    ? tr("badge_annual_report")
                    : tr("badge_bank")}
              </span>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section>
          <h2 className="mb-2 text-xl font-bold text-gm-800">{tr("detail_documents")}</h2>
          <p className="mb-4 text-sm text-slate-500">{tr("detail_documents_note")}</p>
          <div className="flex flex-wrap gap-3">
            <span className="cursor-not-allowed rounded-lg border border-dashed border-slate-200 px-4 py-2 text-sm text-slate-400">
              Annual report (PDF)
            </span>
            <span className="cursor-not-allowed rounded-lg border border-dashed border-slate-200 px-4 py-2 text-sm text-slate-400">
              Project brief (PDF)
            </span>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gm-800 px-6 py-8 text-center text-white md:px-10">
          <h2 className="text-xl font-bold">{tr("detail_express_interest")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gm-100">{tr("detail_cta_note")}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {detail.contact_email && (
              <a
                href={`mailto:${detail.contact_email}?subject=Interest in ${encodeURIComponent(featured.title)}`}
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gm-800 hover:bg-gm-50"
              >
                {tr("detail_express_interest")}
              </a>
            )}
            {detail.website && (
              <a
                href={detail.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                {tr("website")}
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function FundingBar({
  project,
  tr,
}: {
  project: NgoProject;
  tr: (key: import("@/lib/i18n").TranslationKey) => string;
}) {
  const securedPct = pct(project.budget_secured_chf, project.budget_total_chf);

  return (
    <section className="sticky top-[65px] z-20 border-b border-gm-200 bg-gm-50/95 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-6 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gm-600">
          {tr("detail_funding_ask")}
        </p>
        <div className="grid grid-cols-3 gap-4 text-center sm:gap-8">
          <div>
            <p className="text-xs text-slate-500">{tr("detail_target")}</p>
            <p className="text-lg font-bold text-gm-900 md:text-xl">
              {chf(project.budget_total_chf)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tr("detail_secured")}</p>
            <p className="text-lg font-bold text-gm-700 md:text-xl">
              {chf(project.budget_secured_chf)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tr("detail_gap")}</p>
            <p className="text-lg font-bold text-amber-700 md:text-xl">
              {chf(project.budget_gap_chf)}
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gm-100">
          <div
            className="h-full rounded-full bg-gm-500 transition-all"
            style={{ width: `${securedPct}%` }}
          />
        </div>
        {project.deadline && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Deadline: {project.deadline}
          </p>
        )}
      </div>
    </section>
  );
}

function NarrativeCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-gm-100 bg-white p-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gm-600">{label}</p>
      <p className="text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function AdminRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function ProjectCard({ project }: { project: NgoProject }) {
  return (
    <div className="rounded-xl border border-gm-100 bg-white p-5">
      <h3 className="font-bold text-gm-800">{project.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{project.summary}</p>
      <p className="mt-3 text-sm font-semibold text-amber-700">
        Gap: {chf(project.budget_gap_chf)}
      </p>
    </div>
  );
}
