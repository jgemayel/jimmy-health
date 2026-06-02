// Training plan v2 — 4 lifting days (2 intense full-body + 2 lighter upper/lower),
// 1 long run, 1 interval session, 1 rest day. Mobility is built into each session
// as a warm-up + cool-down rather than a standalone day. Self-progress the loads.

import { EXERCISES } from "./exercises";
import type { Exercise } from "./exercises";

export { EXERCISES };
export type { Exercise };

export type DayType = "strength" | "cardio" | "rest";

/** One prescribed movement within a strength day, warm-up, or cardio session. */
export interface SetScheme {
  ref: string;          // key into EXERCISES
  label?: string;       // display name override
  alt?: string;         // optional alternative exercise (EXERCISES key)
  sets: string;
  reps: string;
  rest: string;
  note?: string;
  superset?: boolean;   // visually grouped with the preceding movement
}

export interface CardioSpec {
  zone: string;
  zoneKey: "z2" | "z4z5";
  structure: string[];
  cue: string;
}

export interface DayPlan {
  day: number;
  dow: string;
  title: string;
  subtitle: string;
  type: DayType;
  intensity?: "Intense" | "Light";
  icon: "Dumbbell" | "Footprints" | "Zap" | "Moon";
  duration: string;
  warmup?: SetScheme[];   // mobility / activation prep
  exercises?: SetScheme[];
  cooldown?: string;
  finisher?: string;
  cardio?: CardioSpec;
  note?: string;
}

export interface ZoneDef {
  key: string;
  name: string;
  pctLow: number;
  pctHigh: number;
  feel: string;
  color: string;
}

export const PLAN = {
  title: "Strength + Conditioning — Months 1–3",
  subtitle: "4 lifting days · long run · intervals · 1 rest day",
  principles: [
    "4 lifting days: two heavy full-body sessions + two lighter upper/lower days — everything trained 2–3×/week.",
    "Mobility is built into every session as a warm-up and cool-down — no wasted standalone day.",
    "One long Zone-2 run and one short interval session keep conditioning in without draining the lifts.",
    "Fixed for 3 months — you drive the loads. Still a cut: keep protein high; if recovery dips, pull back on the lighter days first.",
  ],
  note:
    "Built for an 83 kg / 181 cm returning lifter (~13% BF, was ~8%) on a 1,800–2,000 kcal cut. " +
    "The long run and intervals are spaced apart, each between lifting days, so cardio doubles as active recovery. " +
    "Intervals land the day after Strength B — keep them on the bike/rower so your legs aren't double-hit. Days are swappable.",
};

// %HRR bands (Karvonen). targetHR = (HRmax − HRrest) × pct + HRrest, HRmax ≈ 220 − age.
export const ZONES: ZoneDef[] = [
  { key: "z1", name: "Zone 1 · Recovery", pctLow: 50, pctHigh: 60, feel: "Very easy, can sing", color: "sky" },
  { key: "z2", name: "Zone 2 · Aerobic base", pctLow: 60, pctHigh: 70, feel: "Easy, full conversation (RPE 3–4)", color: "emerald" },
  { key: "z3", name: "Zone 3 · Tempo", pctLow: 70, pctHigh: 80, feel: "Moderate, broken sentences", color: "amber" },
  { key: "z4", name: "Zone 4 · Threshold", pctLow: 80, pctHigh: 90, feel: "Hard, only a few words (RPE 7–8)", color: "orange" },
  { key: "z5", name: "Zone 5 · VO₂ max", pctLow: 90, pctHigh: 100, feel: "All-out, can't talk (RPE 9–10)", color: "rose" },
];

export function karvonen(pct: number, age: number, restHR: number, maxHR?: number): number {
  const hrMax = maxHR && maxHR > 0 ? maxHR : 220 - age;
  return Math.round(((hrMax - restHR) * pct) / 100 + restHR);
}

// Shared warm-up blocks (mobility built into each session).
const HIP_WARMUP: SetScheme[] = [
  { ref: "Groiners", label: "Groiners (dynamic hips)", sets: "1", reps: "8–10 reps", rest: "—" },
  { ref: "Kneeling_Hip_Flexor", sets: "1", reps: "30 s / side", rest: "—" },
  { ref: "Cat_Stretch", label: "Cat–Cow", sets: "1", reps: "10 reps", rest: "—" },
];
const UPPER_WARMUP: SetScheme[] = [
  { ref: "Shoulder_Stretch", sets: "1", reps: "20–30 s / side", rest: "—" },
  { ref: "Spinal_Stretch", label: "Spinal Twist", sets: "1", reps: "20 s / side", rest: "—" },
  { ref: "Cat_Stretch", label: "Cat–Cow", sets: "1", reps: "10 reps", rest: "—" },
];
const RUN_WARMUP: SetScheme[] = [
  { ref: "Groiners", label: "Groiners (dynamic hips)", sets: "1", reps: "8–10 reps", rest: "—" },
  { ref: "Standing_Toe_Touches", label: "Toe-touch swings", sets: "1", reps: "10 reps", rest: "—" },
  { ref: "Kneeling_Hip_Flexor", sets: "1", reps: "30 s / side", rest: "—" },
];

export const WEEK: DayPlan[] = [
  {
    day: 1, dow: "Mon",
    title: "Full-Body Strength A", subtitle: "Squat / push focus",
    type: "strength", intensity: "Intense", icon: "Dumbbell", duration: "~65 min",
    warmup: HIP_WARMUP,
    exercises: [
      { ref: "Barbell_Squat", sets: "4", reps: "5–8", rest: "2–3 min",
        note: "Heavy main lift. Brace hard, depth to ~parallel. Leave ~1–2 reps in the tank; add load when you hit 8 across all sets." },
      { ref: "Barbell_Bench_Press_-_Medium_Grip", label: "Barbell Bench Press", sets: "4", reps: "5–8", rest: "2–3 min",
        note: "Heavy free-weight press. Slight arch, control down, drive over the chest." },
      { ref: "Wide-Grip_Lat_Pulldown", label: "Lat Pulldown (or Pull-ups)", alt: "Pullups", sets: "3", reps: "8–10", rest: "90 s",
        note: "Pull to the upper chest, elbows down and back." },
      { ref: "Side_Lateral_Raise", label: "Dumbbell Lateral Raise", sets: "3", reps: "12–15", rest: "60 s",
        note: "Lead with the elbows, no swing." },
      { ref: "Plank", sets: "3", reps: "30–60 s", rest: "45 s", note: "Squeeze glutes, ribs down, straight line." },
    ],
    cooldown: "Cool-down: stretch quads, hamstrings and chest ~30 s each.",
    finisher: "10-min Zone 2 walk to finish.",
  },
  {
    day: 3, dow: "Wed",
    title: "Upper Body", subtitle: "Lighter — volume & pump",
    type: "strength", intensity: "Light", icon: "Dumbbell", duration: "~45 min",
    warmup: UPPER_WARMUP,
    exercises: [
      { ref: "Incline_Dumbbell_Press", sets: "3", reps: "10–12", rest: "75 s", note: "Upper-chest bias, controlled tempo." },
      { ref: "Seated_Cable_Rows", sets: "3", reps: "10–12", rest: "75 s", note: "Drive elbows back, squeeze the blades." },
      { ref: "Dumbbell_Shoulder_Press", sets: "3", reps: "10–12", rest: "75 s", note: "Seated or standing, lighter than Day 4's heavy press." },
      { ref: "Cable_Crossover", label: "Cable Crossover (fly)", sets: "3", reps: "12–15", rest: "60 s", note: "Slight forward lean, hug the reps together, big stretch." },
      { ref: "Hammer_Curls", sets: "3", reps: "12–15", rest: "45 s", note: "Arm superset — hammer curls then straight into pushdowns ↓" },
      { ref: "Triceps_Pushdown", sets: "3", reps: "12–15", rest: "45 s", superset: true, note: "Lock elbows by your sides, full extension." },
      { ref: "Face_Pull", sets: "3", reps: "15–20", rest: "45 s", note: "Rear delts & upper back — rope to forehead, elbows high." },
    ],
    cooldown: "Cool-down: chest, shoulder and lat stretches ~30 s each.",
  },
  {
    day: 2, dow: "Tue",
    title: "Long Run", subtitle: "Zone 2 aerobic base",
    type: "cardio", icon: "Footprints", duration: "45–60 min",
    warmup: RUN_WARMUP,
    cardio: {
      zone: "Zone 2", zoneKey: "z2",
      structure: [
        "45–60 min continuous at an easy pace.",
        "Outdoors, treadmill, bike or row — whatever's handy.",
        "If pace creeps up and talking gets hard, slow down. Staying in Z2 is the point.",
      ],
      cue: "You should be able to hold a full conversation in complete sentences — RPE 3–4.",
    },
    cooldown: "Cool-down: easy walk + hamstring, hip-flexor and calf stretches.",
  },
  {
    day: 4, dow: "Thu",
    title: "Full-Body Strength B", subtitle: "Hinge / pull focus",
    type: "strength", intensity: "Intense", icon: "Dumbbell", duration: "~65 min",
    warmup: HIP_WARMUP,
    exercises: [
      { ref: "Romanian_Deadlift", sets: "4", reps: "6–8", rest: "2–3 min",
        note: "Heavy hinge. Hips back, soft knees, bar close, flat back. Add load when 8s feel strong." },
      { ref: "Standing_Military_Press", label: "Standing Overhead Press", sets: "4", reps: "5–8", rest: "2–3 min",
        note: "Heavy free-weight press. Brace abs and glutes, don't lean back." },
      { ref: "Pullups", label: "Pull-ups / Chin-ups", alt: "Chin-Up", sets: "4", reps: "5–10", rest: "2 min",
        note: "Full hang to chin over the bar. Add reps before adding load; chin-ups bias biceps." },
      { ref: "Incline_Dumbbell_Press", label: "Incline DB Press (or Dips)", alt: "Dips_-_Chest_Version", sets: "3", reps: "8–10", rest: "90 s",
        note: "Upper-chest work. Dips are a fine swap if shoulders feel good." },
      { ref: "Seated_Cable_Rows", sets: "3", reps: "10–12", rest: "75 s", note: "Second pull angle for the upper back." },
      { ref: "Hyperextensions_Back_Extensions", label: "Back Extension", sets: "3", reps: "12–15", rest: "60 s",
        note: "On the back/glute machine. Squeeze glutes at the top — don't over-extend." },
    ],
    cooldown: "Cool-down: stretch glutes, hamstrings, lats and chest ~30 s each.",
    finisher: "10-min Zone 2 walk to finish.",
  },
  {
    day: 6, dow: "Sat",
    title: "Lower Body", subtitle: "Lighter — quads, glutes, hams, calves",
    type: "strength", intensity: "Light", icon: "Dumbbell", duration: "~45 min",
    warmup: [
      { ref: "Groiners", label: "Groiners (dynamic hips)", sets: "1", reps: "8–10 reps", rest: "—" },
      { ref: "All_Fours_Quad_Stretch", label: "Quad / hip opener", sets: "1", reps: "30 s / side", rest: "—" },
      { ref: "Kneeling_Hip_Flexor", sets: "1", reps: "30 s / side", rest: "—" },
    ],
    exercises: [
      { ref: "Split_Squat_with_Dumbbells", label: "Bulgarian Split Squat", sets: "3", reps: "10–12 / leg", rest: "90 s",
        note: "Rear foot elevated, DBs ≤26 kg. Tall torso, knee tracks over toes." },
      { ref: "Leg_Extensions", sets: "3", reps: "12–15", rest: "60 s", note: "Quads — squeeze at the top, slow negative." },
      { ref: "Lying_Leg_Curls", sets: "3", reps: "12–15", rest: "60 s", note: "Hamstrings — full squeeze, no swinging." },
      { ref: "Barbell_Hip_Thrust", sets: "3", reps: "10–12", rest: "75 s", note: "Glutes — pause and squeeze at the top, ribs down." },
      { ref: "Standing_Calf_Raises", sets: "4", reps: "12–20", rest: "45 s", note: "Full stretch at the bottom, big squeeze at the top." },
    ],
    cooldown: "Cool-down: stretch quads, hamstrings, hip flexors and calves.",
  },
  {
    day: 5, dow: "Fri",
    title: "Intervals", subtitle: "Zone 4–5 conditioning",
    type: "cardio", icon: "Zap", duration: "20–25 min",
    warmup: [
      { ref: "Groiners", label: "Groiners (dynamic hips)", sets: "1", reps: "8–10 reps", rest: "—" },
      { ref: "Standing_Toe_Touches", label: "Toe-touch swings", sets: "1", reps: "10 reps", rest: "—" },
    ],
    cardio: {
      zone: "Zone 4–5", zoneKey: "z4z5",
      structure: [
        "~5 min easy warm-up, build to a light sweat.",
        "8 × [ 1 min HARD (Z4–Z5) / 90 s easy ].",
        "~5 min easy cool-down.",
        "Prefer bike or row here to spare your legs after the week's lifting; running is fine if you feel fresh.",
      ],
      cue: "Hard rep: only a few words (Z4) up to can't-talk (Z5), RPE 7–10. The easy 90 s brings breathing back down.",
    },
    cooldown: "Cool-down: easy spin/walk + full-body stretch.",
  },
  {
    day: 7, dow: "Sun",
    title: "Rest", subtitle: "Recovery",
    type: "rest", icon: "Moon", duration: "—",
    note: "Full rest day. Optional: an easy walk for steps and a gentle 10-min stretch (hips, hamstrings, shoulders). Sleep and protein are doing the work today.",
  },
];
