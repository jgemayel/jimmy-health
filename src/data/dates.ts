export const DATES: string[] = [];
export const LABS: string[] = [];
export const SHORT_DATES: string[] = [];

export async function loadDates() {
  const res = await fetch("data/dates.json", { cache: "no-cache" });
  const j = await res.json();
  DATES.splice(0, DATES.length, ...j.DATES);
  LABS.splice(0, LABS.length, ...j.LABS);
  SHORT_DATES.splice(0, SHORT_DATES.length, ...j.SHORT_DATES);
}
