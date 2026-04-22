export interface WhoopCycle {
  date: string;
  recovery: number | null;
  rhr: number | null;
  hrv: number | null;
  skinTemp: number | null;
  spo2: number | null;
  strain: number | null;
  calories: number | null;
  maxHR: number | null;
  avgHR: number | null;
  sleepPerf: number | null;
  respRate: number | null;
  asleepMin: number | null;
  inBedMin: number | null;
  lightMin: number | null;
  deepMin: number | null;
  remMin: number | null;
  awakeMin: number | null;
  sleepNeed: number | null;
  sleepDebt: number | null;
  sleepEff: number | null;
  sleepConsist: number | null;
}

export interface WhoopWorkout {
  date: string;
  activity: string;
  duration: number | null;
  strain: number | null;
  calories: number | null;
  avgHR: number | null;
  maxHR: number | null;
}

export interface WhoopBehavior {
  question: string;
  totalDays: number;
  yesDays: number;
  yesRate: number;
}

export interface WhoopSummary {
  totalDays: number;
  firstDate: string;
  lastDate: string;
  totalWorkouts: number;
  topActivities: { name: string; count: number }[];
  last7: { recovery: number | null; rhr: number | null; hrv: number | null; strain: number | null; sleepHours: number | null; sleepPerf: number | null };
  last30: { recovery: number | null; rhr: number | null; hrv: number | null; strain: number | null; sleepHours: number | null; sleepPerf: number | null };
  last90: { recovery: number | null; rhr: number | null; hrv: number | null; strain: number | null };
  allTime: { recovery: number | null; rhr: number | null; hrv: number | null };
}

export const WHOOP: {
  summary: WhoopSummary | null;
  cycles: WhoopCycle[];
  workouts: WhoopWorkout[];
  behaviors: WhoopBehavior[];
} = {
  summary: null,
  cycles: [],
  workouts: [],
  behaviors: [],
};

export async function loadWhoop() {
  const res = await fetch("data/whoop.json", { cache: "no-cache" });
  const j = await res.json();
  WHOOP.summary = j.summary;
  WHOOP.cycles.splice(0, WHOOP.cycles.length, ...j.cycles);
  WHOOP.workouts.splice(0, WHOOP.workouts.length, ...j.workouts);
  WHOOP.behaviors.splice(0, WHOOP.behaviors.length, ...j.behaviors);
}
