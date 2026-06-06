import { Suspense } from "react";
import { HomeFooterNote } from "@/components/HomeFooterNote";
import { HomeHero } from "@/components/HomeHero";
import { HomeMarquee } from "@/components/HomeMarquee";
import { HomeValueProp } from "@/components/HomeValueProp";
import { Navbar } from "@/components/Navbar";
import { NgoDirectoryGrid } from "@/components/NgoDirectoryGrid";

export default function HomePage() {
  return (
    <>
      <Navbar showLang logoHref="https://www.gemeinnuetzig.li" />
      <HomeHero />
      <HomeMarquee />
      <HomeValueProp />
      <Suspense>
        <NgoDirectoryGrid />
      </Suspense>
      <footer className="bg-white px-6 py-8 text-center text-sm text-black/60">
        <p>
          Charity Navigator · Powered by{" "}
          <a
            href="https://www.gemeinnuetzig.li"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gm-600 hover:text-gm-700"
          >
            gemeinnuetzig.li
          </a>
        </p>
        <HomeFooterNote />
      </footer>
    </>
  );
}