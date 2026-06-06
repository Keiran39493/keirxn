"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";

export function FundResultsHeader() {
  const { tr } = useLocale();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(sessionStorage.getItem(STORAGE_KEYS.userName));
  }, []);

  return (
    <div className="border-b border-amber-100 bg-white px-6 py-10 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-700">
        {name ? `${tr("results_greeting")} ${name}` : tr("results_greeting_default")}
      </p>
      <h1 className="mb-2 text-3xl font-bold text-gm-800">{tr("fund_results_title")}</h1>
      <p className="mx-auto max-w-lg text-sm text-gray-500">
        {tr("fund_results_subtitle")}
      </p>
      <p className="mx-auto mt-4 max-w-md text-xs text-slate-400">
        {tr("fund_disclaimer")}
      </p>
    </div>
  );
}
