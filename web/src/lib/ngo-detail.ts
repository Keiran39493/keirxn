import overridesData from "@/data/ngo-detail-overrides.json";
import ngosData from "@/data/ngos.json";
import { CATEGORY_LABELS } from "./constants";
import { getNgoLogoSrc } from "./ngo-logos";
import type { NGO, NgoDetail, NgoProject } from "./types";

const ngos = (ngosData as { ngos: NGO[] }).ngos;
const overrides = overridesData as Record<
  string,
  Partial<NgoDetail> & { projects?: NgoProject[] }
>;

function defaultProject(ngo: NGO): NgoProject {
  const total = 75000;
  const secured = Math.round(total * 0.55);
  return {
    id: `${ngo.id}-programme`,
    title: `${ngo.name} — Programmförderung`,
    summary: ngo.description.slice(0, 160) + (ngo.description.length > 160 ? "…" : ""),
    problem: "Betriebs- und Programmkosten übersteigen die gesicherten öffentlichen und eigenen Einnahmen.",
    intervention:
      "Erbringung der Kernleistungen in Liechtenstein im Einklang mit dem Satzungszweck der Organisation.",
    outcome: "Stabile Leistungserbringung und Kapazität zur Unterstützung der Zielgruppen.",
    budget_total_chf: total,
    budget_secured_chf: secured,
    budget_gap_chf: total - secured,
    timeline_months: 12,
    budget_lines: [
      { category: "Programmdurchführung", amount_chf: Math.round(total * 0.5) },
      { category: "Personal & Koordination", amount_chf: Math.round(total * 0.35) },
      { category: "Materialien & Öffentlichkeitsarbeit", amount_chf: Math.round(total * 0.15) },
    ],
    impact_metrics: [
      { label: "Geografischer Fokus", value: "Liechtenstein" },
      { label: "Rechtsform", value: ngo.legal_form === "foundation" ? "Stiftung" : "Verein" },
      { label: "Themenbereich", value: CATEGORY_LABELS[ngo.category] ?? ngo.category },
    ],
    highlights_for_matchers: [
      `Tätig im Bereich ${CATEGORY_LABELS[ngo.category] ?? ngo.category}`,
      "Projektbudget mit Teilfinanzierung möglich",
      "Governance-Details auf Anfrage erhältlich",
    ],
    track_record: [
      {
        title: "Laufende Tätigkeit",
        result: "Im gemeinnuetzig.li-Verzeichnis eingetragen – aktuelle Wirkungsdaten bitte direkt bei der Organisation erfragen.",
      },
    ],
  };
}

function buildDetail(ngo: NGO): NgoDetail {
  const override = overrides[ngo.id];
  const projects =
    override?.projects && override.projects.length > 0
      ? override.projects
      : [defaultProject(ngo)];
  const featuredId = override?.featured_project_id ?? projects[0].id;

  return {
    ...ngo,
    ...override,
    founded_year: override?.founded_year ?? ngo.founded_year,
    website: override?.website ?? ngo.website,
    board_president: override?.board_president ?? ngo.board_president,
    address: override?.address ?? ngo.address,
    logo_src: getNgoLogoSrc(ngo.id),
    long_description: override?.long_description ?? ngo.description,
    field_of_activity:
      override?.field_of_activity ?? CATEGORY_LABELS[ngo.category] ?? ngo.category,
    phone: override?.phone ?? null,
    commercial_register: override?.commercial_register ?? null,
    tax_exempt: override?.tax_exempt ?? true,
    association_memberships: override?.association_memberships ?? [],
    governance_badges: override?.governance_badges ?? ["bank_details_on_request"],
    contact_email: override?.contact_email ?? null,
    featured_project_id: featuredId,
    projects,
  };
}

export function getNgoBySlug(slug: string): NgoDetail | null {
  const ngo = ngos.find((n) => n.slug === slug);
  if (!ngo) return null;
  return buildDetail(ngo);
}

export function getAllNgoSlugs(): string[] {
  return ngos.map((n) => n.slug);
}

export function getFeaturedProject(detail: NgoDetail): NgoProject {
  return (
    detail.projects.find((p) => p.id === detail.featured_project_id) ??
    detail.projects[0]
  );
}
