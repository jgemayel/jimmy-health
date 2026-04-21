export type Diagnostic = {
  desc: string;
  why: string;
  highMeans: string;
  lowMeans: string;
  context: string;
  actions: {
    high: string[];
    low: string[];
    maintain: string[];
  };
};

const GEN = (): Diagnostic => ({
  desc: "No summary available for this marker.",
  why: "General clinical tracking.",
  highMeans: "Values above the reference range may warrant follow-up.",
  lowMeans: "Values below the reference range may warrant follow-up.",
  context: "Discuss persistent abnormalities with your physician.",
  actions: {
    high: ["Retest to confirm before acting", "Discuss with your physician"],
    low: ["Retest to confirm before acting", "Discuss with your physician"],
    maintain: ["Continue current lifestyle", "Re-check with next annual panel"],
  },
});

export const DIAGNOSTICS: Record<string, Diagnostic> = {};

export function getDiagnostic(name: string): Diagnostic {
  return DIAGNOSTICS[name] || GEN();
}

export async function loadDiagnostics() {
  const res = await fetch("data/diagnostics.json", { cache: "no-cache" });
  const j = await res.json();
  for (const k of Object.keys(DIAGNOSTICS)) delete DIAGNOSTICS[k];
  Object.assign(DIAGNOSTICS, j);
}
