"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";

interface PathChooserProps {
  name: string;
}

export function PathChooser({ name }: PathChooserProps) {
  const router = useRouter();
  const { tr } = useLocale();
  const ready = name.trim().length > 0;

  const start = (path: "funder" | "ngo") => {
    if (!ready) return;
    sessionStorage.setItem(STORAGE_KEYS.userName, name.trim());
    sessionStorage.setItem(STORAGE_KEYS.userPath, path);
    router.push(path === "funder" ? "/quiz" : "/ngo/quiz");
  };

  return (
    <div className="space-y-4">
      <p
        className={`text-sm font-medium transition-colors ${
          ready ? "text-slate-600" : "text-slate-400"
        }`}
      >
        {ready ? tr("path_choose_hint") : tr("path_name_required")}
      </p>
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => start("funder")}
          className={`group relative flex min-h-[220px] flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
            ready
              ? "cursor-pointer border-gm-200 bg-gradient-to-br from-gm-50 to-white shadow-sm hover:-translate-y-0.5 hover:border-gm-400 hover:shadow-md"
              : "cursor-not-allowed border-slate-100 bg-slate-50/80 opacity-60"
          }`}
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gm-600 text-2xl text-white shadow-sm">
            🏛️
          </span>
          <h2 className="mb-2 text-lg font-bold text-gm-800">
            {tr("path_funder_title")}
          </h2>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
            {tr("path_funder_desc")}
          </p>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              ready
                ? "bg-gm-600 text-white group-hover:bg-gm-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {tr("path_cta_funder")}
            <span
              className={`transition-transform ${ready ? "group-hover:translate-x-0.5" : ""}`}
              aria-hidden
            >
              →
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={!ready}
          onClick={() => start("ngo")}
          className={`group relative flex min-h-[220px] flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 ${
            ready
              ? "cursor-pointer border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white shadow-sm hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
              : "cursor-not-allowed border-slate-100 bg-slate-50/80 opacity-60"
          }`}
        >
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-2xl text-white shadow-sm">
            🔍
          </span>
          <h2 className="mb-2 text-lg font-bold text-gm-800">
            {tr("path_ngo_title")}
          </h2>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">
            {tr("path_ngo_desc")}
          </p>
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              ready
                ? "bg-amber-500 text-white group-hover:bg-amber-600"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {tr("path_cta_ngo")}
            <span
              className={`transition-transform ${ready ? "group-hover:translate-x-0.5" : ""}`}
              aria-hidden
            >
              →
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
