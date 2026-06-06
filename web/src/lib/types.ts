export type Category =
  | "children_youth_families"
  | "senior_citizens"
  | "education"
  | "social_health"
  | "arts_culture"
  | "environment_climate"
  | "sport_leisure"
  | "development";

export type LegalForm = "association" | "foundation";
export type GeographicScope = "liechtenstein" | "dach" | "international";

export interface NGO {
  id: string;
  name: string;
  slug: string;
  category: Category;
  description: string;
  legal_form: LegalForm;
  geographic_scope: GeographicScope;
  sdgs: number[];
  founded_year: number | null;
  website: string | null;
  profile_url: string;
  board_president: string | null;
  address: string | null;
}

export interface ImpactMetric {
  label: string;
  value: string;
}

export interface BudgetLine {
  category: string;
  amount_chf: number;
}

export interface NgoProject {
  id: string;
  title: string;
  summary: string;
  problem: string;
  intervention: string;
  outcome: string;
  budget_total_chf: number;
  budget_secured_chf: number;
  budget_gap_chf: number;
  deadline?: string;
  timeline_months?: number;
  budget_lines: BudgetLine[];
  impact_metrics: ImpactMetric[];
  highlights_for_matchers: string[];
  track_record?: { title: string; result: string }[];
}

export interface NgoDetail extends NGO {
  logo_src: string | null;
  long_description: string;
  field_of_activity: string;
  phone: string | null;
  commercial_register: string | null;
  tax_exempt: boolean | null;
  association_memberships: string[];
  governance_badges: ("audited" | "annual_report" | "bank_details_on_request")[];
  featured_project_id: string;
  projects: NgoProject[];
  contact_email: string | null;
}

export interface QuizAnswers {
  supporter_type: string;
  sectors: string[];
  engagement: string[];
  support_scale: string;
  geographic_focus: string;
  sdg_priorities: number[];
  legal_form_preference: string;
}

export interface MatchResult {
  ngo: NGO;
  score: number;
  match_percentage: number;
  match_reasons: string[];
}

export type QuizOptionValue = string | number;

export interface QuizOption {
  value: QuizOptionValue;
  icon: string;
  label: string;
  label_de?: string;
  desc: string;
}

export interface QuizStep {
  id: string;
  question: string;
  question_de?: string;
  subtitle: string;
  subtitle_de?: string;
  type: "single" | "multi";
  minSelect?: number;
  maxSelect?: number;
  options: QuizOption[];
}

export type FundType =
  | "family_foundation"
  | "private_foundation"
  | "corporate_foundation"
  | "trust";

export type MandateScope = "open" | "discretionary" | "fixed";

export type FundingType = "project" | "operating" | "capacity" | "emergency";

export interface Fund {
  id: string;
  name: string;
  slug: string;
  fund_type: FundType;
  description: string;
  sectors: Category[];
  geographic_scope: GeographicScope;
  funding_types: FundingType[];
  grant_min_chf: number;
  grant_max_chf: number;
  sdgs: number[];
  mandate_scope: MandateScope;
  accepts_applications: boolean;
  contact_email: string | null;
  website: string | null;
}

export interface FundQuizAnswers {
  org_role: string;
  sectors: string[];
  funding_need: string[];
  amount_sought: string;
  geographic_focus: string;
  sdg_priorities: number[];
}

export interface FundMatchResult {
  fund: Fund;
  score: number;
  match_percentage: number;
  match_reasons: string[];
  mismatch_warnings: string[];
}
