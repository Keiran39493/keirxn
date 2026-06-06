"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { PathChooser } from "./PathChooser";

export function HomeHero() {
  const { tr } = useLocale();
  const [name, setName] = useState("");

  return (
    <section className="relative overflow-hidden border-b-[3px] border-[#333333] bg-white">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:py-28">
        <div className="space-y-8">
          <div className="space-y-5 text-center md:text-left">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-600">
              {tr("hero_badge")}
            </span>
            <h1 className="text-5xl font-black uppercase leading-none tracking-tighter text-accent md:text-6xl">
              CHARITY
              <br />
              NAVIGATOR
            </h1>
            <p className="mx-auto max-w-lg text-lg leading-relaxed text-slate-600 md:mx-0 md:text-xl">
              {tr("hero_desc")}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500">{tr("name_prompt")}</p>
            <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-slate-100 bg-white shadow-lg transition-all focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/20">
              <div className="flex flex-grow flex-col px-5 pb-2 pt-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {tr("name_label")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tr("name_placeholder")}
                  className="w-full bg-transparent py-1 text-lg text-slate-900 outline-none placeholder:text-slate-300"
                  autoComplete="given-name"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <PathChooser name={name} />
          </div>
        </div>
      </div>
    </section>
  );
}
