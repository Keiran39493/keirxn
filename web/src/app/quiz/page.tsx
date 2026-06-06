import { QuizClient } from "@/components/QuizClient";
import { GemeinnuetzigLogo } from "@/components/GemeinnuetzigLogo";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gm-50">
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gm-100 bg-white px-6 py-3.5 shadow-sm">
        <GemeinnuetzigLogo href="/" />
        <span className="text-sm font-semibold text-gm-600">Charity Navigator</span>
      </nav>
      <QuizClient />
    </div>
  );
}
