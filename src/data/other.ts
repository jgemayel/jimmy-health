export type UrinalysisRow = {
  parameter: string;
  unit: string;
  ref: string;
  values: (string | number | null)[];
};
export type ImagingStudy = {
  date: string;
  type: string;
  study: string;
  indication: string;
  findings: string;
  impression: string;
  radiologist?: string;
  lab: string;
};
export type PathologyReport = {
  date: string;
  specimen: string;
  clinicalDetails: string;
  finding: string;
  impression: string;
  lab: string;
};
export type SemenRow = {
  parameter: string;
  unit: string;
  ref: string;
  value: string | number;
};
export type SourceReport = {
  date: string;
  lab: string;
  type: string;
};

export const URINALYSIS_DATES: string[] = [];
export const URINALYSIS_LABS: string[] = [];
export const URINALYSIS: UrinalysisRow[] = [];
export const IMAGING: ImagingStudy[] = [];
export const PATHOLOGY: PathologyReport[] = [];
export const SEMEN: SemenRow[] = [];
export const SOURCES: SourceReport[] = [];
export const META = { semenDate: "", semenLab: "", semenInterpretation: "" };
// Proxy getters so existing imports of SEMEN_DATE etc. keep working after load.
export const SEMEN_DATE = new String() as unknown as string;
export const SEMEN_LAB = new String() as unknown as string;
export const SEMEN_INTERPRETATION = new String() as unknown as string;

function refSet<T>(arr: T[], next: T[]) { arr.splice(0, arr.length, ...next); }

export async function loadOther() {
  const res = await fetch("data/other.json", { cache: "no-cache" });
  const j = await res.json();
  refSet(URINALYSIS_DATES, j.URINALYSIS_DATES || []);
  refSet(URINALYSIS_LABS, j.URINALYSIS_LABS || []);
  refSet(URINALYSIS, j.URINALYSIS || []);
  refSet(IMAGING, j.IMAGING || []);
  refSet(PATHOLOGY, j.PATHOLOGY || []);
  refSet(SEMEN, j.SEMEN || []);
  refSet(SOURCES, j.SOURCES || []);
  META.semenDate = j.SEMEN_DATE || "";
  META.semenLab = j.SEMEN_LAB || "";
  META.semenInterpretation = j.SEMEN_INTERPRETATION || "";
}
