"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export function RetakeLink({ href }: { href: string }) {
  const { tr } = useLocale();
  return (
    <Link href={href} className="text-sm font-medium text-gm-600 hover:text-gm-700">
      {tr("retake_quiz")}
    </Link>
  );
}
