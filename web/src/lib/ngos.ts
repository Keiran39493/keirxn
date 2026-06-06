import ngosData from "@/data/ngos.json";
import type { NGO } from "./types";

export function getAllNgos(): NGO[] {
  const ngos = (ngosData as { ngos: NGO[] }).ngos;
  return [...ngos].sort((a, b) => a.name.localeCompare(b.name, "de"));
}
