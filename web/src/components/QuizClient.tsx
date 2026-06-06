"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { STORAGE_KEYS } from "@/lib/constants";
import { QUIZ_STEPS } from "@/lib/quiz-steps";
import type { QuizAnswers, QuizOptionValue } from "@/lib/types";
import { QuizProgress } from "./QuizProgress";

type AnswersState = Partial<Record<string, QuizOptionValue | QuizOptionValue[]>>;

function valuesEqual(a: QuizOptionValue, b: QuizOptionValue) {
  return a === b;
}

export function QuizClient() {
  const router = useRouter();
  const { tr, locale } = useLocale();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [submitting, setSubmitting] = useState(false);

  const current = QUIZ_STEPS[step];
  const total = QUIZ_STEPS.length;

  const selectedFor = useCallback(
    (stepId: string): QuizOptionValue | QuizOptionValue[] | undefined => {
      const val = answers[stepId];
      if (val !== undefined) return val;
      const def = QUIZ_STEPS.find((s) => s.id === stepId);
      return def?.type === "multi" ? [] : undefined;
    },
    [answers],
  );

  const select = (stepId: string, value: QuizOptionValue) => {
    const stepDef = QUIZ_STEPS.find((s) => s.id === stepId);
    if (!stepDef) return;

    if (stepDef.type === "single") {
      setAnswers((prev) => ({ ...prev, [stepId]: value }));
      return;
    }

    const arr = Array.isArray(answers[stepId])
      ? [...(answers[stepId] as QuizOptionValue[])]
      : [];
    const idx = arr.findIndex((v) => valuesEqual(v, value));
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      if (stepDef.maxSelect && arr.length >= stepDef.maxSelect) return;
      arr.push(value);
    }
    setAnswers((prev) => ({ ...prev, [stepId]: arr }));
  };

  const isValid = () => {
    const val = selectedFor(current.id);
    if (current.type === "single") return val !== undefined;
    const min = current.minSelect ?? 0;
    return Array.isArray(val) && val.length >= min;
  };

  const buildPayload = (): QuizAnswers => ({
    supporter_type: String(answers.supporter_type ?? "individual_trustee"),
    sectors: (answers.sectors as string[]) ?? [],
    engagement: (answers.engagement as string[]) ?? [],
    support_scale: String(answers.support_scale ?? "under_10k"),
    geographic_focus: String(answers.geographic_focus ?? "liechtenstein"),
    sdg_priorities: ((answers.sdg_priorities as number[]) ?? []).map(Number),
    legal_form_preference: String(answers.legal_form_preference ?? "both"),
  });

  const submit = async () => {
    setSubmitting(true);
    try {
      const resp = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!resp.ok) throw new Error("Matching failed");
      const results = await resp.json();
      sessionStorage.setItem(STORAGE_KEYS.matchResults, JSON.stringify(results));
      router.push("/results");
    } catch {
      alert("Matching failed. Please try again.");
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!isValid()) return;
    if (step < total - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  };

  const back = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const de = locale === "de";
  const question = de && current.question_de ? current.question_de : current.question;
  const subtitle = de && current.subtitle_de ? current.subtitle_de : current.subtitle;

  const raw = selectedFor(current.id);
  const selectedArr: QuizOptionValue[] = Array.isArray(raw)
    ? raw
    : raw !== undefined
      ? [raw]
      : [];
  const atMax = Boolean(
    current.maxSelect && selectedArr.length >= current.maxSelect,
  );
  const useTile = current.options.length >= 5;

  return (
    <>
      <QuizProgress step={step} total={total} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="step-enter">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gm-500">
              {de ? `Schritt ${step + 1} von ${total}` : `Step ${step + 1} of ${total}`}
            </p>
            <h2 className="mb-2 text-2xl font-bold leading-snug text-gm-800 sm:text-3xl">
              {question}
            </h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>

          <div
            className={
              useTile
                ? `grid gap-3 ${
                    current.options.length <= 6
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-4"
                  }`
                : "grid grid-cols-1 gap-3 sm:grid-cols-2"
            }
          >
            {current.options.map((opt) => {
              const isSelected = selectedArr.some((v) => valuesEqual(v, opt.value));
              const disabled = atMax && !isSelected;
              const CardTag = useTile ? "tile-card" : "list-card";
              const label = de && opt.label_de ? opt.label_de : opt.label;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(current.id, opt.value)}
                  className={`${CardTag} rounded-2xl bg-white p-5 text-left ${
                    isSelected ? "selected" : ""
                  } ${disabled ? "disabled-max" : ""}`}
                >
                  {useTile ? (
                    <>
                      <span className="tile-check" aria-hidden>
                        <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="mb-3 mt-2 block text-4xl leading-none">{opt.icon}</span>
                      <span className="tile-label block text-sm font-semibold leading-tight text-gm-800">
                        {label}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="flex-shrink-0 text-3xl leading-none">{opt.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold leading-tight text-gm-800">{label}</span>
                          <span className="list-check flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gm-600">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {current.maxSelect ? (
            <p className="mt-4 text-xs text-gray-400">
              {de ? `Bis zu ${current.maxSelect} auswählen · ${selectedArr.length} ausgewählt` : `Select up to ${current.maxSelect} · ${selectedArr.length} selected`}
            </p>
          ) : current.type === "multi" ? (
            <p className="mt-4 text-xs text-gray-400">{de ? `${selectedArr.length} ausgewählt` : `${selectedArr.length} selected`}</p>
          ) : null}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gm-100 hover:text-gm-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {tr("back")}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={!isValid() || submitting}
            className="ml-auto flex items-center gap-2 rounded-xl bg-gm-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gm-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          >
            {submitting ? (
              <>
                <svg className="btn-spinner h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {tr("finding")}
              </>
            ) : (
              <>
                {step === total - 1 ? tr("find_matches") : tr("continue")}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </main>
    </>
  );
}