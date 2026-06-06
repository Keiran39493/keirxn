"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";
import type { MatchResult } from "@/lib/types";
import { EmailCapture } from "./EmailCapture";
import { MatchCard } from "./MatchCard";

export function ResultsClient() {
  const router = useRouter();
  const { tr } = useLocale();
  const [results, setResults] = useState<MatchResult[] | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEYS.matchResults);
    if (!raw) {
      router.replace("/quiz");
      return;
    }
    try {
      setResults(JSON.parse(raw) as MatchResult[]);
    } catch {
      router.replace("/quiz");
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
      <EmailCapture variant="funder" atTop />

      {results.length === 0 ? (
        <p className="py-12 text-center text-gray-500">{tr("no_matches")}</p>
      ) : (
        results.map((result, index) => (
          <MatchCard
            key={result.ngo.id}
            result={result}
            index={index}
            viewProfileLabel={tr("view_profile")}
            viewProjectLabel={tr("view_project")}
            websiteLabel={tr("website")}
            matchLabel={tr("match_label")}
          />
        ))
      )}

      <div className="mt-12 rounded-2xl bg-gm-100 p-8 text-center">
        <p className="mb-2 font-semibold text-gm-800">{tr("retake_cta_title")}</p>
        <p className="mb-5 text-sm text-gray-600">{tr("retake_cta_desc")}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/quiz"
            className="rounded-xl bg-gm-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gm-700"
          >
            {tr("retake_quiz")}
          </Link>
          <a
            href="https://www.gemeinnuetzig.li/en/directory/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gm-300 px-6 py-3 text-sm font-medium text-gm-700 transition-colors hover:bg-gm-100"
          >
            {tr("browse_directory")}
          </a>
        </div>
      </div>
    </main>
  );
}
