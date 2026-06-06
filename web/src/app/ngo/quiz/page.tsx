import Link from "next/link";
import { FundQuizClient } from "@/components/FundQuizClient";
import { GemeinnuetzigLogo } from "@/components/GemeinnuetzigLogo";

export default function NgoQuizPage() {
  return (
    <div className="min-h-screen bg-amber-50/40">
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-amber-100 bg-white px-6 py-3.5 shadow-sm">
        <GemeinnuetzigLogo href="/" />
        <Link
          href="/"
          className="text-sm font-semibold text-amber-800 hover:text-amber-900"
        >
          NGO funding
        </Link>
      </nav>
      <FundQuizClient />
    </div>
  );
}
