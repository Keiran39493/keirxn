"use client";

import { useLocale } from "@/context/LocaleContext";
import { MarqueeSection } from "./MarqueeSection";

export function HomeMarquee() {
  const { tr } = useLocale();
  return <MarqueeSection title={tr("marquee_title")} />;
}
