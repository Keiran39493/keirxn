import ngosData from "@/data/ngos.json";
import { MARQUEE_LOGOS } from "./marquee-logos";

const ngos = (ngosData as { ngos: { id: string }[] }).ngos;

/** Marquee logo order matches `ngos.json` directory order (57 entries). */
const LOGO_BY_ID = new Map(
  ngos.map((ngo, index) => [ngo.id, MARQUEE_LOGOS[index]?.src ?? null]),
);

export function getNgoLogoSrc(ngoId: string): string | null {
  return LOGO_BY_ID.get(ngoId) ?? null;
}
