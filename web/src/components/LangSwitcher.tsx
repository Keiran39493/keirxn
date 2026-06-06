"use client";

import { useLocale } from "@/context/LocaleContext";
import type { Locale } from "@/lib/i18n";

export function LangSwitcher() {
  const { locale, setLocale } = useLocale();

  const btn = (lang: Locale) => (
    <button
      type="button"
      onClick={() => setLocale(lang)}
      className={`px-1.5 py-0.5 rounded transition-colors ${
        locale === lang ? "font-semibold text-gm-700" : "hover:text-gm-700"
      }`}
    >
      {lang.toUpperCase()}
    </button>
  );

  return (
    <div className="flex items-center gap-1 text-sm">
      {btn("de")}
      <span className="text-gray-300">|</span>
      {btn("en")}
    </div>
  );
}
