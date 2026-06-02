// Month 1–3 training plan — fixed weekly template (athlete self-progresses the loads).
// Exercise library + demo photos: see ./exercises.ts and /public/exercises/.

import { EXERCISES } from "./exercises";
import type { Exercise } from "./exercises";

export { EXERCISES };
export type { Exercise };

export type DayType = "strength" | "cardio" | "mobility" | "rest";

/** One prescribed movement within a strength or mobility day. */
export interface SetScheme {
  ref: string;          // key into EXERCISES
  label?: string;       // display name override (e.g. "Lat Pulldown (or Pull-ups)")
  alt?: string;         // optional alternative exercise (EXERCISES key)
  sets: string;
  reps: string;
  rest: string;
  note?: string;
  superset?: boolean;   // visually grouped with the preceding movement
}

export interface CardioSpec {
  zone: string;         // "Zone 2", "Zone 4–5"
  zoneKey: "z2" | "z4z5";
  structure: string[];
  cue: string;
}

export interface DayPlan {
  day: number;
  dow: string;          // suggested weekday
  title: string;
  subtitle: string;
  type: DayType;
  icon: "Dumbbell" | "Footprints" | "Zap" | "Wind" | "Moon";
  duration: string;
  exercises?: SetScheme[];
  finisher?: string;
  cardio?: CardioSpec;
  note?: string;
}

export interface ZoneDef {
  key: string;
  name: string;
  pctLow: number;       // % of heart-rate reserve (Karvonen)
  pctHigh: number;
  feel: string;
  color: string;        // tailwind text/bg accent token
}

export const PLAN = {
  title: "Strength + Conditioning — Months 1–3",
  subtitle: "Fixed weekly template · 5 training days · 2 rest days",
  principles: [
    "Fixed for 3 months — you drive the loads. Add weight when the top of a rep range feels easy.",
    "Two full-body lifts hit every muscle twice a week — the best lever for keeping muscle in a deficit.",
    "Cardio is ~80% Zone 2, ~20% hard. Base first, intensity second.",
    "Never stack the interval day next to a leg-heavy lift.",
  ],
  note:
    "Built for an 83 kg / 181 cm returning lifter (~13% BF, was ~8%) on a 1,800–2,000 kcal cut. " +
    "Goal: strip fat while holding muscle. Days are swappable to fit your week — keep the one rule above.",
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

export const WEEK: DayPlan[] = [
  {
    day: 1,
    dow: "Mon",
    title: "Full-Body Strength A",
    subtitle: "Squat / push bias",
    type: "strength",
    icon: "Dumbbell",
    duration: "~60 min",
    exercises: [
      { ref: "Barbell_Squat", sets: "3", reps: "6–8", rest: "2–3 min",
        note: "Main lift. Brace hard, sit to ~parallel, drive through mid-foot. Add load when all 8s feel smooth." },
      { ref: "Barbell_Bench_Press_-_Medium_Grip", label: "Barbell Bench Press", sets: "3", reps: "6–8", rest: "2–3 min",
        note: "Free-weight press. Slight arch, control the descent, drive the bar over the chest. DB bench is a fine swap." },
      { ref: "Romanian_Deadlift", sets: "3", reps: "8–10", rest: "90 s–2 min",
        note: "Hips back, soft knees, bar stays close. Feel the hamstrings stretch — don't round the back." },
      { ref: "Wide-Grip_Lat_Pulldown", label: "Lat Pulldown (or Pull-ups)", alt: "Pullups", sets: "3", reps: "8–10", rest: "90 s",
        note: "Pull to the upper chest, drive elbows down and back. Swap in pull-ups if you'd rather." },
      { ref: "Leg_Extensions", sets: "3", reps: "12–15", rest: "60–90 s",
        note: "Quad accessory. Squeeze at the top, slow 2-sec negative." },
      { ref: "Side_Lateral_Raise", label: "Dumbbell Lateral Raise", sets: "3", reps: "12–15", rest: "60 s",
        note: "Lead with the elbows, no swinging. Light weight, clean reps." },
      { ref: "Plank", sets: "3", reps: "30–60 s", rest: "45 s",
        note: "Core. Squeeze glutes, ribs down, straight line head-to-heels." },
    ],
    finisher: "12-min Zone 2 walk — easy pace, just bank some steps.",
  },
  {
    day: 2,
    dow: "Tue",
    title: "Long Run",
    subtitle: "Zone 2 aerobic base",
    type: "cardio",
    icon: "Footprints",
    duration: "45–60 min",
    cardio: {
      zone: "Zone 2",
      zoneKey: "z2",
      structure: [
        "45–60 min continuous at an easy pace.",
        "Outdoors, treadmill, bike or row — whatever's handy.",
        "If pace creeps up and talking gets hard, slow down. Staying in Z2 is the whole point.",
      ],
      cue: "You should be able to hold a full conversation in complete sentences — RPE 3–4. Nose-breathing-ish.",
    },
  },
  {
    day: 3,
    dow: "Wed",
    title: "Rest",
    subtitle: "Mid-week recovery",
    type: "rest",
    icon: "Moon",
    duration: "—",
    note: "Full rest. An easy walk is fine, but today's job is recovery — sleep and protein do the work.",
  },
  {
    day: 4,
    dow: "Thu",
    title: "Full-Body Strength B",
    subtitle: "Hinge / pull bias",
    type: "strength",
    icon: "Dumbbell",
    duration: "~60 min",
    exercises: [
      { ref: "Standing_Military_Press", label: "Standing Overhead Press", sets: "3", reps: "6–8", rest: "2–3 min",
        note: "Free-weight press — barbell or DBs. Brace abs and glutes, press overhead, don't lean back." },
      { ref: "Pullups", label: "Pull-ups / Chin-ups", alt: "Chin-Up", sets: "3", reps: "6–10", rest: "2 min",
        note: "Full hang to chin over the bar. Chin-ups (palms toward you) bias the biceps; add reps before adding load." },
      { ref: "Split_Squat_with_Dumbbells", label: "Bulgarian Split Squat", sets: "3", reps: "8–10 / leg", rest: "90 s",
        note: "Rear foot elevated, DBs up to 26 kg. Front knee tracks over toes, torso tall." },
      { ref: "Incline_Dumbbell_Press", label: "Incline DB Press (or Dips)", alt: "Dips_-_Chest_Version", sets: "3", reps: "8–10", rest: "90 s",
        note: "Upper-chest bias. Dips are a good swap if your shoulders feel happy." },
      { ref: "Lying_Leg_Curls", sets: "3", reps: "12–15", rest: "60–90 s",
        note: "Hamstring accessory. Slow, full squeeze — no swinging the weight up." },
      { ref: "Seated_Cable_Rows", label: "Seated Cable Row", sets: "3", reps: "12–15", rest: "60–90 s",
        note: "Drive elbows back, squeeze the shoulder blades. Superset straight into face pulls ↓" },
      { ref: "Face_Pull", sets: "3", reps: "15–20", rest: "60–90 s", superset: true,
        note: "Rear delts + upper back. Pull rope to the forehead, elbows high." },
      { ref: "Dumbbell_Bicep_Curl", label: "Biceps Curl", sets: "3", reps: "12–15", rest: "45–60 s",
        note: "Arm superset — curls then straight into pushdowns ↓" },
      { ref: "Triceps_Pushdown", sets: "3", reps: "12–15", rest: "45–60 s", superset: true,
        note: "Cable pushdown. Lock the elbows by your sides, full extension." },
      { ref: "Hyperextensions_Back_Extensions", label: "Back Extension", sets: "2", reps: "15", rest: "60 s",
        note: "On the back/glute machine. Squeeze glutes at the top — don't yank into hyperextension." },
    ],
    finisher: "12-min Zone 2 walk — easy steps to finish.",
  },
  {
    day: 5,
    dow: "Fri",
    title: "Mobility & Stretch",
    subtitle: "Recovery flow",
    type: "mobility",
    icon: "Wind",
    duration: "30–40 min",
    note: "Easy, unhurried. Breathe into each stretch — this keeps the hard interval day tomorrow feeling good.",
    exercises: [
      { ref: "Cat_Stretch", label: "Cat–Cow Flow", sets: "3", reps: "Hold 15 s", rest: "—",
        note: "Alternate rounding and arching the spine to warm it up." },
      { ref: "Spinal_Stretch", label: "Spinal Twist", sets: "2", reps: "20 s / side", rest: "—" },
      { ref: "Kneeling_Hip_Flexor", sets: "2", reps: "30 s / side", rest: "—",
        note: "Squeeze the glute of the back leg to really open the hip flexor." },
      { ref: "Standing_Toe_Touches", label: "Standing Hamstring Stretch", sets: "2", reps: "20–30 s", rest: "—",
        note: "Soft knees, hinge from the hips." },
      { ref: "All_Fours_Quad_Stretch", label: "Quad Stretch", sets: "2", reps: "30 s / side", rest: "—" },
      { ref: "Shoulder_Stretch", sets: "2", reps: "20–30 s / side", rest: "—" },
      { ref: "Groiners", label: "Groiners (dynamic hips)", sets: "2", reps: "8–10 reps", rest: "—",
        note: "Dynamic — flow in and out, don't force the range." },
    ],
  },
  {
    day: 6,
    dow: "Sat",
    title: "Intervals",
    subtitle: "Zone 4–5 conditioning",
    type: "cardio",
    icon: "Zap",
    duration: "20–25 min",
    cardio: {
      zone: "Zone 4–5",
      zoneKey: "z4z5",
      structure: [
        "~5 min easy warm-up, build to a light sweat.",
        "8 × [ 1 min HARD (Z4–Z5) / 90 s easy ].",
        "~5 min easy cool-down.",
        "Run, bike or row. The hard minute should be genuinely hard but repeatable for all 8 reps.",
      ],
      cue: "Hard rep: only a few words possible (Z4) up to can't-talk (Z5), RPE 7–10. The easy 90 s brings your breathing back down before the next one.",
    },
  },
  {
    day: 7,
    dow: "Sun",
    title: "Rest",
    subtitle: "Weekend recovery",
    type: "rest",
    icon: "Moon",
    duration: "—",
    note: "Full rest day. Optional easy walk for steps. Let everything recover before next week's Day 1.",
  },
];
