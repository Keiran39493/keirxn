import { ResultsClient } from "@/components/ResultsClient";
import { ResultsHeader } from "@/components/ResultsHeader";
import { GemeinnuetzigLogo } from "@/components/GemeinnuetzigLogo";
import { RetakeLink } from "@/components/RetakeLink";

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gm-50">
      <nav className="flex items-center justify-between border-b border-gm-100 bg-white px-6 py-4">
        <GemeinnuetzigLogo href="/" />
        <RetakeLink href="/quiz" />
      </nav>
      <ResultsHeader />
      <ResultsClient />
      <footer className="bg-gm-900 px-6 py-6 text-center text-xs text-white/50">
        Charity Navigator ·{" "}
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
