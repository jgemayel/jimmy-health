export type BloodMarker = {
  cat: string;
  name: string;
  unit: string;
  ref: string;
  low: number | null;
  high: number | null;
  values: (number | null)[];
  notes: string;
};

export const BLOOD_MARKERS: BloodMarker[] = [];
export const CATEGORIES: string[] = [];

export async function loadMarkers() {
  const res = await fetch("data/markers.json", { cache: "no-cache" });
  const j: BloodMarker[] = await res.json();
  BLOOD_MARKERS.splice(0, BLOOD_MARKERS.length, ...j);
  const seen = new Set<string>();
  const cats: string[] = [];
  for (const m of BLOOD_MARKERS) {
    if (!seen.has(m.cat)) { seen.add(m.cat); cats.push(m.cat); }
  }
  CATEGORIES.splice(0, CATEGORIES.length, ...cats);
}
