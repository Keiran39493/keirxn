"use client";

import { useLocale } from "@/context/LocaleContext";

export function HomeFooterNote() {
  const { tr } = useLocale();
  return (
    <p className="mt-1 text-xs text-black/30">{tr("footer_source")}</p>
  );
}
