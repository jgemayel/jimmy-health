// Nutrition plan — fat loss while retaining muscle, paired with the workout plan.
// Tailored to Jim (83 kg, 181 cm, 37, ~13% BF, desk job, trains 6×/week, eats everything).
// All targets are adjustable in-app. Not medical advice.

export interface BodyStats {
  weightKg: number;
  heightCm: number;
  age: number;
  bodyFatPct: number;      // 0 = unknown → falls back to Mifflin–St Jeor
  neat: number;            // non-exercise activity multiplier (job/lifestyle, NOT training)
  proteinPerKg: number;
  fatPerKg: number;
  trainingCals: number;    // target kcal on training days
  restCals: number;        // target kcal on rest days
}

// The current week has 6 training days (4 lifts + long run + intervals) and 1 rest day.
export const TRAINING_DAYS = 6;
export const REST_DAYS = 1;

// Estimated weekly exercise burn from the plan (4 lifts ≈ 300 ea + long run ≈ 550 + intervals ≈ 250).
export const TRAINING_KCAL_WEEK = 2000;

export const DEFAULT_STATS: BodyStats = {
  weightKg: 83,
  heightCm: 181,
  age: 37,
  bodyFatPct: 13,
  neat: 1.25,
  proteinPerKg: 2.2,
  fatPerKg: 0.8,
  trainingCals: 2200,
  restCals: 1900,
};

// NEAT = everyday, non-training activity only (training is added separately).
export const NEAT_LEVELS: { value: number; label: string; hint: string }[] = [
  { value: 1.25, label: "Desk job", hint: "Seated most of the day" },
  { value: 1.4, label: "Moderate", hint: "Some walking, on/off your feet" },
  { value: 1.55, label: "On feet a lot", hint: "Standing / manual work" },
];

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

function bmr(s: BodyStats): number {
  if (s.bodyFatPct > 0) {
    // Katch–McArdle (uses lean mass) — more accurate for lean, muscular people.
    const lbm = s.weightKg * (1 - s.bodyFatPct / 100);
    return 370 + 21.6 * lbm;
  }
  // Mifflin–St Jeor (male).
  return 10 * s.weightKg + 6.25 * s.heightCm - 5 * s.age + 5;
}

export interface EnergyBreakdown {
  bmr: number;
  neat: number;        // BMR after the non-exercise activity multiplier
  training: number;    // average daily training burn
  maintenance: number; // total daily maintenance
}

export function energyBreakdown(s: BodyStats): EnergyBreakdown {
  const b = Math.round(bmr(s));
  const neat = Math.round(b * s.neat);
  const training = Math.round(TRAINING_KCAL_WEEK / 7);
  return { bmr: b, neat, training, maintenance: neat + training };
}

export function maintenanceCals(s: BodyStats): number {
  return energyBreakdown(s).maintenance;
}

/** Protein and fat are anchored to bodyweight; carbs fill the remaining calories. */
export function macrosFor(cals: number, s: BodyStats): Macros {
  const protein = Math.round(s.proteinPerKg * s.weightKg);
  const fat = Math.round(s.fatPerKg * s.weightKg);
  const carbs = Math.max(0, Math.round((cals - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
}

export interface SupplementItem {
  name: string;
  dose: string;
  timing: string;
  why: string;
}

export const SUPPLEMENTS: { tier: "Core" | "Helpful"; items: SupplementItem[] }[] = [
  {
    tier: "Core",
    items: [
      { name: "Creatine monohydrate", dose: "5 g", timing: "Daily, any time",
        why: "The most proven supplement — preserves strength, power and muscle while you're in a calorie deficit. No need to load." },
      { name: "Whey / protein powder", dose: "1–2 scoops as needed", timing: "Whenever you're short on protein",
        why: "Convenient, high-quality protein to reliably hit ~180 g/day — the single biggest lever for keeping muscle on a cut." },
      { name: "Vitamin D3", dose: "2,000–4,000 IU", timing: "With a meal containing fat",
        why: "Very common deficiency; supports bone, immune and hormonal health. Worth a blood test to dial in your dose." },
      { name: "Omega-3 (fish oil)", dose: "1–2 g combined EPA+DHA", timing: "With a meal",
        why: "Supports recovery, joints, heart and helps manage inflammation from 6 sessions/week." },
    ],
  },
  {
    tier: "Helpful",
    items: [
      { name: "Caffeine", dose: "100–200 mg", timing: "~30–45 min pre-workout",
        why: "Boosts training performance and focus, blunts appetite. Keep it ≥8 h from bed — sleep matters more at 37 for recovery." },
      { name: "Magnesium glycinate", dose: "200–400 mg", timing: "Evening",
        why: "Supports sleep and muscle function; intake often drops on a cut." },
      { name: "Electrolytes / sodium", dose: "Per need", timing: "Around training & the long run",
        why: "Hydration and performance — especially on the long-run and interval days, and when carbs are low." },
      { name: "Multivitamin", dose: "1 serving", timing: "Daily with food",
        why: "Cheap micronutrient insurance while overall food volume is reduced." },
    ],
  },
];

export interface Guideline {
  title: string;
  body: string;
}

export const GUIDELINES: Guideline[] = [
  { title: "Spread protein across the day",
    body: "Aim for ~40 g protein at each of your 3 meals plus ~20–30 g in each snack — splitting ~180 g across 4–5 feedings beats cramming it into fewer." },
  { title: "Put carbs around training",
    body: "Front-load carbs into the meals before and after lifting and the long run — that's where they fuel performance and recovery. Rest days run leaner on carbs (~145 g vs ~220 g) by design." },
  { title: "Hydrate",
    body: "~3 L water/day (≈35 ml per kg of bodyweight), more on the long-run and interval days. Add electrolytes when you sweat hard or carbs are low." },
  { title: "Fiber & whole foods",
    body: "30–40 g fiber/day from veg, fruit, legumes and whole grains keeps you full and digestion happy. Aim ~80% whole foods, 20% flexible." },
  { title: "Don't drop fat too low",
    body: "Keep fat at/above ~0.6 g/kg (~50 g) to protect hormones — the plan sits at ~0.8 g/kg (~66 g)." },
  { title: "Track the trend, not the day",
    body: "Weigh in at the same time daily and watch the weekly average. If it stalls for 2–3 weeks, trim ~100–150 kcal or add steps — don't slash everything at once." },
  { title: "Recovery at 37",
    body: "Sleep 7–9 h — it drives hunger, recovery and how well you hold muscle. With 6 sessions/week on a deficit, protect sleep and take a maintenance-calorie break every ~6–8 weeks." },
];

export const FOOD_SOURCES: { macro: string; color: string; foods: string }[] = [
  { macro: "Protein", color: "rose",
    foods: "Chicken & turkey breast, lean beef, eggs / egg whites, Greek yogurt, cottage cheese, white fish, salmon, whey, prawns." },
  { macro: "Carbs", color: "amber",
    foods: "Rice, oats, potatoes & sweet potato, fruit (berries, banana), whole-grain bread, quinoa, legumes, pasta." },
  { macro: "Fats", color: "sky",
    foods: "Olive oil, nuts & nut butter, avocado, whole eggs, oily fish, seeds, a little dark chocolate." },
];

export interface Meal {
  name: string;
  items: string;
  kcal: number;
  protein: number;
}

// A worked training-day menu (~2,200 kcal / ~185 g protein). Rest day: see restNote.
export const SAMPLE_DAY: { meals: Meal[]; restNote: string } = {
  meals: [
    { name: "Breakfast", items: "3 whole eggs + 3 egg whites, 80 g oats with berries, black coffee", kcal: 500, protein: 42 },
    { name: "Snack", items: "200 g Greek yogurt + honey + a handful of berries (or a whey shake)", kcal: 230, protein: 25 },
    { name: "Lunch", items: "180 g chicken breast, 200 g cooked rice, big mixed salad + 1 tbsp olive oil", kcal: 620, protein: 52 },
    { name: "Pre-workout snack", items: "Apple + 30 g almonds, or 2 rice cakes + a scoop of whey", kcal: 260, protein: 18 },
    { name: "Dinner", items: "200 g salmon or lean steak, 250 g potatoes, greens, drizzle of olive oil", kcal: 600, protein: 48 },
  ],
  restNote:
    "Rest day (~1,900 kcal): drop the breakfast oats and halve the lunch rice — about 300 fewer carb calories, protein stays the same.",
};

export const DIET_PLAN = {
  title: "Nutrition — Cut Phase",
  subtitle: "Fat loss · hold muscle · built around your training week",
  principles: [
    "Targets come from your own maintenance (~2,700 kcal) minus ~20% — sustainable, not a crash diet.",
    "Eat more on training days (~2,200), less on your one rest day (~1,900) — same weekly deficit, better performance.",
    "Protein stays high every day (~2.2 g/kg ≈ 180 g) — this is what keeps your muscle while you lean out.",
    "Carbs cycle to where the work is; fat stays steady (~66 g) for hormones.",
  ],
};
