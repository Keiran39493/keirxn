"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";

export function ResultsHeader() {
  const { tr } = useLocale();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(sessionStorage.getItem(STORAGE_KEYS.userName));
  }, []);

  return (
    <div className="border-b border-gm-100 bg-white px-6 py-10 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gm-600">
        {name ? `${tr("results_greeting")} ${name}` : tr("results_greeting_default")}
      </p>
      <h1 className="mb-2 text-3xl font-bold text-gm-800">{tr("results_title")}</h1>
      <p className="mx-auto max-w-lg text-sm text-gray-500">{tr("results_subtitle")}</p>
    </div>
  );
}
