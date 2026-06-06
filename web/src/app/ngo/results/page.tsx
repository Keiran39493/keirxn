import Link from "next/link";
import { FundResultsClient } from "@/components/FundResultsClient";
import { FundResultsHeader } from "@/components/FundResultsHeader";
import { GemeinnuetzigLogo } from "@/components/GemeinnuetzigLogo";

export default function NgoResultsPage() {
  return (
    <div className="min-h-screen bg-amber-50/40">
      <nav className="flex items-center justify-between border-b border-amber-100 bg-white px-6 py-4">
        <GemeinnuetzigLogo href="/" />
        <Link
          href="/ngo/quiz"
          className="text-sm font-medium text-amber-800 hover:text-amber-900"
        >
          Retake questionnaire
        </Link>
      </nav>
      <FundResultsHeader />
      <FundResultsClient />
      <footer className="bg-gm-900 px-6 py-6 text-center text-xs text-white/50">
        NGO Match Tool · Sample fund data ·{" "}
        <a
          href="https://www.gemeinnuetzig.li"
          className="text-gm-200 hover:text-white"
        >
          gemeinnuetzig.li
        </a>
      </footer>
    </div>
  );
}
