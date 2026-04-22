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

export interface WhoopJournal {
  date: string;
  q: string;
  y: boolean;
}

export interface WhoopAllTime {
  totalDays: number;
  firstDate: string;
  lastDate: string;
  totalWorkouts: number;
  recovery: number | null;
  rhr: number | null;
  hrv: number | null;
  strain: number | null;
  sleepHours: number | null;
  sleepPerf: number | null;
}

export const WHOOP: {
  allTime: WhoopAllTime | null;
  cycles: WhoopCycle[];
  workouts: WhoopWorkout[];
  journal: WhoopJournal[];
} = {
  allTime: null,
  cycles: [],
  workouts: [],
  journal: [],
};

export async function loadWhoop() {
  const res = await fetch("data/whoop.json", { cache: "no-cache" });
  const j = await res.json();
  WHOOP.allTime = j.allTime;
  WHOOP.cycles.splice(0, WHOOP.cycles.length, ...j.cycles);
  WHOOP.workouts.splice(0, WHOOP.workouts.length, ...j.workouts);
  WHOOP.journal.splice(0, WHOOP.journal.length, ...j.journal);
}
