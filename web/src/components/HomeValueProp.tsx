"use client";

import { useLocale } from "@/context/LocaleContext";

export function HomeValueProp() {
  const { tr } = useLocale();

  return (
    <section className="border-t border-slate-200 bg-white px-6 py-14 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-2xl font-bold text-gm-900 md:text-3xl">
          {tr("value_prop_title")}
        </h2>
        <p className="mb-6 text-base leading-relaxed text-slate-600">
          {tr("value_prop_intro")}
        </p>
        <ul className="space-y-3">
          {(
            [
              "value_prop_1",
              "value_prop_2",
              "value_prop_3",
              "value_prop_4",
            ] as const
          ).map((key) => (
            <li key={key} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gm-100 text-gm-700">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm leading-relaxed text-slate-700">{tr(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}