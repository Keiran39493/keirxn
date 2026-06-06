"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { GemeinnuetzigLogo } from "./GemeinnuetzigLogo";

export function OrgDetailNav() {
  const { tr } = useLocale();

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gm-100 bg-white px-6 py-4">
      <GemeinnuetzigLogo href="/" />
      <Link
        href="/"
        className="text-sm font-medium text-gm-600 hover:text-gm-700"
      >
        ← {tr("fund_back_home")}
      </Link>
    </nav>
  );
}
