"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";
import type { FundMatchResult } from "@/lib/types";
import { EmailCapture } from "./EmailCapture";
import { FundMatchCard } from "./FundMatchCard";

export function FundResultsClient() {
  const router = useRouter();
  const { tr } = useLocale();
  const [results, setResults] = useState<FundMatchResult[] | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEYS.fundMatchResults);
    if (!raw) {
      router.replace("/ngo/quiz");
      return;
    }
    try {
      setResults(JSON.parse(raw) as FundMatchResult[]);
    } catch {
      router.replace("/ngo/quiz");
    }
  }, [router]);

  if (results === null) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 text-center text-gray-500">
        Loading results…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <EmailCapture variant="ngo" atTop />

      {results.length === 0 ? (
        <p className="py-12 text-center text-gray-500">{tr("fund_no_matches")}</p>
      ) : (
        results.map((result, index) => (
          <FundMatchCard
            key={result.fund.id}
            result={result}
            index={index}
            matchLabel={tr("fund_match_label")}
            grantRangeLabel={tr("fund_grant_range")}
            contactLabel={tr("fund_contact")}
            websiteLabel={tr("fund_website")}
            warningsTitle={tr("fund_warnings_title")}
          />
        ))
      )}

      <div className="mt-12 rounded-2xl bg-amber-50 p-8 text-center">
        <p className="mb-5 text-sm text-gray-600">{tr("fund_disclaimer")}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/ngo/quiz"
            className="rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            {tr("fund_retake_quiz")}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-amber-300 px-6 py-3 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100"
          >
            {tr("fund_back_home")}
          </Link>
        </div>
      </div>
    </main>
  );
}
