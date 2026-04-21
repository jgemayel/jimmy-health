import type { BloodMarker } from "@/data/blood";
import { BLOOD_MARKERS } from "@/data/blood";
import { DATES, SHORT_DATES } from "@/data/dates";

export type Status = "low" | "high" | "normal" | "unknown";
export type Trajectory = "improving" | "worsening" | "maintaining" | "new-concern" | "insufficient-data";

export function statusOf(m: BloodMarker, v: number | null): Status {
 if (v === null || v === undefined || isNaN(v)) return "unknown";
 if (m.low !== null && v < m.low) return "low";
 if (m.high !== null && v > m.high) return "high";
 if (m.low === null && m.high === null) return "unknown";
 return "normal";
}

export function latestValue(m: BloodMarker): { value: number | null; dateIdx: number } {
 for (let i = m.values.length - 1; i >= 0; i--) {
 const v = m.values[i];
 if (v !== null && v !== undefined && !isNaN(v)) {
 return { value: v, dateIdx: i };
 }
 }
 return { value: null, dateIdx: -1 };
}

export function previousValue(m: BloodMarker, beforeIdx: number): { value: number | null; dateIdx: number } {
 for (let i = beforeIdx - 1; i >= 0; i--) {
 const v = m.values[i];
 if (v !== null && v !== undefined && !isNaN(v)) {
 return { value: v, dateIdx: i };
 }
 }
 return { value: null, dateIdx: -1 };
}

export function latestDateIdx(): number {
 for (let i = DATES.length - 1; i >= 0; i--) {
 for (const m of BLOOD_MARKERS) {
 if (m.values[i] !== null && m.values[i] !== undefined) return i;
 }
 }
 return DATES.length - 1;
}

export function chartData(m: BloodMarker) {
 return DATES.map((d, i) => ({
 date: SHORT_DATES[i],
 fullDate: d,
 value: m.values[i] ?? null,
 })).filter((p) => p.value !== null);
}

export function severity(m: BloodMarker, v: number | null): number {
 if (v === null) return 0;
 const s = statusOf(m, v);
 if (s === "high" && m.high !== null) {
 return (v - m.high) / (m.high || 1);
 }
 if (s === "low" && m.low !== null) {
 return (m.low - v) / (m.low || 1);
 }
 return 0;
}

export function formatValue(v: number | null, unit: string): string {
 if (v === null || v === undefined) return ",";
 const s = formatNumber(v);
 return unit ? `${s} ${unit}` : s;
}

// Magnitude-aware number formatting: clean numbers without excessive decimals.
export function formatNumber(v: number): string {
 if (!Number.isFinite(v)) return String(v);
 if (Number.isInteger(v)) return v.toString();
 const abs = Math.abs(v);
 let decimals = 2;
 if (abs >= 100) decimals = 0;
 else if (abs >= 10) decimals = 1;
 else if (abs >= 1) decimals = 2;
 else if (abs >= 0.1) decimals = 2;
 else if (abs >= 0.01) decimals = 3;
 else decimals = 4;
 return v.toFixed(decimals).replace(/\.?0+$/, "");
}

// Choose a "nice" step for axis ticks so labels are round numbers.
export function niceStep(range: number, targetTicks = 5): number {
 if (!Number.isFinite(range) || range <= 0) return 1;
 const rough = range / targetTicks;
 const pow = Math.pow(10, Math.floor(Math.log10(rough)));
 const norm = rough / pow;
 const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
 return nice * pow;
}

export function floorTo(v: number, step: number): number {
 return Math.floor(v / step) * step;
}

export function ceilTo(v: number, step: number): number {
 return Math.ceil(v / step) * step;
}

// Compute a tidy y-axis domain + ticks for a given set of values and optional reference band.
export function niceDomain(values: number[], low: number | null, high: number | null): { domain: [number, number]; ticks: number[] } {
 const vs = values.filter((v) => Number.isFinite(v));
 const refs: number[] = [];
 if (low !== null && low !== undefined && Number.isFinite(low)) refs.push(low);
 if (high !== null && high !== undefined && Number.isFinite(high)) refs.push(high);
 const all = [...vs, ...refs];
 if (all.length === 0) return { domain: [0, 1], ticks: [0, 1] };
 const rawMin = Math.min(...all);
 const rawMax = Math.max(...all);
 let range = rawMax - rawMin;
 if (range === 0) {
  const bump = Math.abs(rawMax) * 0.1 || 1;
  return { domain: [rawMin - bump, rawMax + bump], ticks: [rawMin - bump, rawMin, rawMax + bump] };
 }
 const step = niceStep(range * 1.2, 5);
 const min = floorTo(rawMin - range * 0.08, step);
 const max = ceilTo(rawMax + range * 0.08, step);
 const ticks: number[] = [];
 for (let t = min; t <= max + step / 2; t += step) {
  // Normalize floating point drift
  ticks.push(Number(t.toFixed(10)));
 }
 return { domain: [min, max], ticks };
}

export function countAbnormal(): { high: number; low: number; total: number } {
 let high = 0, low = 0, total = 0;
 const idx = latestDateIdx();
 for (const m of BLOOD_MARKERS) {
 const v = m.values[idx];
 if (v === null || v === undefined) continue;
 total++;
 const s = statusOf(m, v);
 if (s === "high") high++;
 if (s === "low") low++;
 }
 return { high, low, total };
}

export function markersByStatus(status: Status): BloodMarker[] {
 return BLOOD_MARKERS.filter((m) => {
 const lv = latestValue(m);
 return statusOf(m, lv.value) === status;
 });
}

export function attentionList() {
 return BLOOD_MARKERS
 .map((m) => {
 const lv = latestValue(m);
 return { m, value: lv.value, idx: lv.dateIdx, status: statusOf(m, lv.value), sev: Math.abs(severity(m, lv.value)) };
 })
 .filter((x) => x.status === "high" || x.status === "low")
 .sort((a, b) => b.sev - a.sev);
}

// Trajectory: is this marker getting better, worse, or holding steady?
export function trajectory(m: BloodMarker): {
 verdict: Trajectory;
 label: string;
 reason: string;
 delta: number | null;
 deltaPct: number | null;
} {
 const lv = latestValue(m);
 if (lv.value === null) {
 return { verdict: "insufficient-data", label: "No data", reason: "No recent value on record.", delta: null, deltaPct: null };
 }
 const pv = previousValue(m, lv.dateIdx);
 if (pv.value === null) {
 const s = statusOf(m, lv.value);
 if (s === "high" || s === "low") {
 return { verdict: "new-concern", label: "New reading", reason: "First out-of-range value, no prior data to compare.", delta: null, deltaPct: null };
 }
 return { verdict: "insufficient-data", label: "First reading", reason: "Only one data point on record.", delta: null, deltaPct: null };
 }
 const delta = lv.value - pv.value;
 const deltaPct = pv.value !== 0 ? (delta / pv.value) * 100 : null;
 const curStatus = statusOf(m, lv.value);
 const prevStatus = statusOf(m, pv.value);

 if (curStatus === "normal" && prevStatus !== "normal") {
 return { verdict: "improving", label: "Back in range", reason: `Moved into the normal range from ${prevStatus}.`, delta, deltaPct };
 }
 if (curStatus !== "normal" && prevStatus === "normal") {
 return { verdict: "new-concern", label: "Newly out of range", reason: `Was normal, now ${curStatus}.`, delta, deltaPct };
 }
 if (curStatus === "high") {
 if (delta < 0) return { verdict: "improving", label: "Trending down", reason: "Still high but moving toward the range.", delta, deltaPct };
 if (delta > 0) return { verdict: "worsening", label: "Trending up", reason: "High and moving further above range.", delta, deltaPct };
 return { verdict: "maintaining", label: "Holding", reason: "High and stable.", delta, deltaPct };
 }
 if (curStatus === "low") {
 if (delta > 0) return { verdict: "improving", label: "Trending up", reason: "Still low but moving toward the range.", delta, deltaPct };
 if (delta < 0) return { verdict: "worsening", label: "Trending down", reason: "Low and moving further below range.", delta, deltaPct };
 return { verdict: "maintaining", label: "Holding", reason: "Low and stable.", delta, deltaPct };
 }
 // normal -> normal
 return { verdict: "maintaining", label: "In range", reason: "Stable within normal range.", delta, deltaPct };
}
