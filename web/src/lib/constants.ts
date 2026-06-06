import type {
  Category,
  FundType,
  GeographicScope,
  LegalForm,
  MandateScope,
} from "./types";

export const SDG_LABELS: Record<number, string> = {
  1: "Keine Armut",
  2: "Kein Hunger",
  3: "Gesundheit und Wohlergehen",
  4: "Hochwertige Bildung",
  5: "Geschlechtergleichstellung",
  6: "Sauberes Wasser und Sanitärversorgung",
  7: "Bezahlbare und saubere Energie",
  8: "Menschenwürdige Arbeit und Wirtschaftswachstum",
  9: "Industrie, Innovation und Infrastruktur",
  10: "Weniger Ungleichheiten",
  11: "Nachhaltige Städte und Gemeinden",
  13: "Massnahmen zum Klimaschutz",
  14: "Leben unter Wasser",
  15: "Leben an Land",
  16: "Frieden, Gerechtigkeit und starke Institutionen",
  17: "Partnerschaften zur Erreichung der Ziele",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  children_youth_families: "Kinder, Jugend & Familien",
  senior_citizens: "Seniorinnen & Senioren",
  education: "Bildung",
  social_health: "Soziales & Gesundheit",
  arts_culture: "Kunst & Kultur",
  environment_climate: "Umwelt & Klima",
  sport_leisure: "Sport & Freizeit",
  development: "Internationale Entwicklung",
};

export const CATEGORY_COLOURS: Record<Category, string> = {
  children_youth_families: "bg-blue-100 text-blue-700",
  senior_citizens: "bg-purple-100 text-purple-700",
  education: "bg-indigo-100 text-indigo-700",
  social_health: "bg-rose-100 text-rose-700",
  arts_culture: "bg-orange-100 text-orange-700",
  environment_climate: "bg-green-100 text-green-700",
  sport_leisure: "bg-yellow-100 text-yellow-700",
  development: "bg-teal-100 text-teal-700",
};

export const LEGAL_LABELS: Record<LegalForm, string> = {
  association: "Verein",
  foundation: "Stiftung",
};

export const GEO_LABELS: Record<GeographicScope, string> = {
  liechtenstein: "🇱🇮 Liechtenstein",
  dach: "🌐 DACH Region",
  international: "🌍 International",
};

export const GEO_LABELS_EXTENDED: Record<string, string> = {
  liechtenstein: "🇱🇮 Liechtenstein",
  dach: "🌐 DACH-Region",
  europe: "🇪🇺 Europa",
  africa: "🌍 Afrika",
  asia: "🌏 Asien",
  americas: "🌎 Amerika",
  oceania: "🌏 Ozeanien",
  international: "🌐 Global / International",
};

export const FUND_TYPE_LABELS: Record<FundType, string> = {
  family_foundation: "Family Foundation",
  private_foundation: "Private Foundation",
  corporate_foundation: "Corporate Foundation",
  trust: "Trust / Treuhand",
};

export const MANDATE_LABELS: Record<MandateScope, string> = {
  open: "Open mandate",
  discretionary: "Discretionary",
  fixed: "Fixed beneficiaries",
};

export const AMOUNT_BANDS: Record<
  string,
  { min: number; max: number; label: string }
> = {
  under_25k: { min: 0, max: 25000, label: "Under CHF 25,000" },
  "25k_100k": { min: 25000, max: 100000, label: "CHF 25,000 – 100,000" },
  "100k_500k": { min: 100000, max: 500000, label: "CHF 100,000 – 500,000" },
  over_500k: { min: 500000, max: Infinity, label: "Over CHF 500,000" },
};

export const STORAGE_KEYS = {
  userName: "userName",
  userPath: "userPath",
  userEmail: "userEmail",
  matchResults: "matchResults",
  fundMatchResults: "fundMatchResults",
  locale: "locale",
} as const;
