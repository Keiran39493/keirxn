import { GemeinnuetzigLogo } from "./GemeinnuetzigLogo";
import { LangSwitcher } from "./LangSwitcher";

interface NavbarProps {
  showLang?: boolean;
  rightSlot?: React.ReactNode;
  logoHref?: string;
}

export function Navbar({
  showLang = false,
  rightSlot,
  logoHref = "https://www.gemeinnuetzig.li",
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gm-100 bg-white px-6 py-4">
      <GemeinnuetzigLogo href={logoHref} />
      <div className="flex items-center gap-4">
        {rightSlot}
        {showLang && <LangSwitcher />}
      </div>
    </nav>
  );
}
