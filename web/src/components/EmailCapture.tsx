"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";

type EmailCaptureVariant = "funder" | "ngo";

interface EmailCaptureProps {
  variant: EmailCaptureVariant;
  /** When true, renders with bottom margin for placement above results. */
  atTop?: boolean;
}

export function EmailCapture({ variant, atTop = false }: EmailCaptureProps) {
  const { tr } = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEYS.userEmail)) {
      setSubmitted(true);
    }
  }, []);

  const submit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    sessionStorage.setItem(STORAGE_KEYS.userEmail, trimmed);
    setSubmitted(true);
  };

  const isNgo = variant === "ngo";
  const accentBtn = isNgo
    ? "bg-amber-600 hover:bg-amber-700"
    : "bg-gm-600 hover:bg-gm-700";
  const accentRing = isNgo
    ? "focus-within:border-amber-400 focus-within:ring-amber-400/25"
    : "focus-within:border-gm-400 focus-within:ring-gm-400/25";
  const panelBg = isNgo ? "border-amber-200 bg-white" : "border-gm-200 bg-white";
  const spacing = atTop ? "mb-10" : "mt-12";

  if (submitted) {
    return (
      <div
        className={`${spacing} rounded-2xl border px-6 py-8 text-center shadow-sm ${panelBg}`}
      >
        <p className="text-sm font-medium text-gm-800">{tr("email_thanks")}</p>
      </div>
    );
  }

  return (
    <div
      className={`${spacing} rounded-2xl border px-6 py-8 shadow-sm sm:px-8 ${panelBg}`}
    >
      <h2 className="mb-1 text-lg font-bold text-gm-800">{tr("email_title")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        {tr("email_desc")}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          className={`flex flex-1 flex-col overflow-hidden rounded-xl border-2 border-slate-100 bg-slate-50/50 transition-all focus-within:ring-4 ${accentRing}`}
        >
          <label className="px-4 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {tr("email_label")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={tr("email_placeholder")}
            className="w-full bg-transparent px-4 pb-3 text-base text-slate-900 outline-none placeholder:text-slate-300"
            autoComplete="email"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!email.trim()}
          className={`rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${accentBtn}`}
        >
          {tr("email_submit")}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">{tr("email_note")}</p>
    </div>
  );
}
