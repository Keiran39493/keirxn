"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import {
  CATEGORY_COLOURS,
  CATEGORY_LABELS,
  GEO_LABELS,
  LEGAL_LABELS,
} from "@/lib/constants";
import { getAllNgos } from "@/lib/ngos";
import { getNgoLogoSrc } from "@/lib/ngo-logos";
import type { Category, GeographicScope, LegalForm } from "@/lib/types";

const ALL = "all" as const;

export function NgoDirectoryGrid() {
  const { tr } = useLocale();
  const searchParams = useSearchParams();
  const ngos = useMemo(() => getAllNgos(), []);

  const [category, setCategory] = useState<Category | typeof ALL>(
    (searchParams.get("category") as Category | null) ?? ALL,
  );
  const [geo, setGeo] = useState<GeographicScope | typeof ALL>(
    (searchParams.get("geo") as GeographicScope | null) ?? ALL,
  );
  const [legal, setLegal] = useState<LegalForm | typeof ALL>(
    (searchParams.get("legal") as LegalForm | null) ?? ALL,
  );
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(ngos.map((n) => n.category));
    return Array.from(set).sort((a, b) =>
      (CATEGORY_LABELS[a] ?? a).localeCompare(CATEGORY_LABELS[b] ?? b, "de"),
    );
  }, [ngos]);

  const geoScopes = useMemo(() => {
    const set = new Set(ngos.map((n) => n.geographic_scope));
    return Array.from(set) as GeographicScope[];
  }, [ngos]);

  const legalForms = useMemo(() => {
    const set = new Set(ngos.map((n) => n.legal_form));
    return Array.from(set) as LegalForm[];
  }, [ngos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ngos.filter((ngo) => {
      if (category !== ALL && ngo.category !== category) return false;
      if (geo !== ALL && ngo.geographic_scope !== geo) return false;
      if (legal !== ALL && ngo.legal_form !== legal) return false;
      if (!q) return true;
      return (
        ngo.name.toLowerCase().includes(q) ||
        ngo.description.toLowerCase().includes(q)
      );
    });
  }, [ngos, category, geo, legal, query]);

  return (
    <section id="directory" className="border-t border-slate-200 bg-slate-50/80 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gm-900 md:text-4xl">
            {tr("directory_grid_title")}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
            {tr("directory_grid_desc")}
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("directory_search_placeholder")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-shadow focus:border-gm-400 focus:ring-4 focus:ring-gm-400/15 sm:max-w-xs"
          />
          <p className="text-sm text-slate-500">
            {tr("directory_count").replace("{count}", String(filtered.length))}
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-3 flex flex-wrap gap-2">
          <FilterChip active={category === ALL} onClick={() => setCategory(ALL)} label={tr("directory_filter_all")} />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              label={CATEGORY_LABELS[cat] ?? cat}
            />
          ))}
        </div>

        {/* Geo filter */}
        <div className="mb-3 flex flex-wrap gap-2">
          <FilterChip active={geo === ALL} onClick={() => setGeo(ALL)} label="All regions" />
          {geoScopes.map((g) => (
            <FilterChip
              key={g}
              active={geo === g}
              onClick={() => setGeo(g)}
              label={GEO_LABELS[g] ?? g}
            />
          ))}
        </div>

        {/* Legal form filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterChip active={legal === ALL} onClick={() => setLegal(ALL)} label="All structures" />
          {legalForms.map((l) => (
            <FilterChip
              key={l}
              active={legal === l}
              onClick={() => setLegal(l)}
              label={LEGAL_LABELS[l] ?? l}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-slate-500">{tr("directory_empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ngo) => {
              const logo = getNgoLogoSrc(ngo.id);
              const catLabel = CATEGORY_LABELS[ngo.category] ?? ngo.category;
              const catColour =
                CATEGORY_COLOURS[ngo.category] ?? "bg-gray-100 text-gray-600";

              return (
                <li key={ngo.id}>
                  <Link
                    href={`/orgs/${ngo.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gm-300 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-16 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 px-4">
                      {logo ? (
                        <Image
                          src={logo}
                          alt=""
                          width={140}
                          height={48}
                          className="max-h-12 w-auto max-w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {ngo.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-base font-bold leading-snug text-gm-900 group-hover:text-gm-700">
                      {ngo.name}
                    </h3>
                    <span
                      className={`mb-3 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColour}`}
                    >
                      {catLabel}
                    </span>
                    <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
                      {ngo.description}
                    </p>
                    <span className="mt-4 text-sm font-semibold text-gm-600 group-hover:text-gm-700">
                      {tr("directory_view_detail")} →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-gm-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-gm-50"
      }`}
    >
      {label}
    </button>
  );
}