// Nutrition plan — fat loss while retaining muscle, paired with the workout plan.
// All targets are adjustable in-app (the calculator recomputes from body stats).
// Not medical advice.

export interface BodyStats {
  weightKg: number;
  heightCm: number;
  age: number;
  activity: number;        // activity multiplier (see ACTIVITY_LEVELS)
  proteinPerKg: number;    // g protein per kg bodyweight
  fatPerKg: number;        // g fat per kg bodyweight
  trainingCals: number;    // target kcal on training days
  restCals: number;        // target kcal on rest days
}

// Sensible defaults for Jim (83 kg / 181 cm, ~13% BF, returning lifter on a cut).
export const DEFAULT_STATS: BodyStats = {
  weightKg: 83,
  heightCm: 181,
  age: 30,
  activity: 1.5,
  proteinPerKg: 2.2,
  fatPerKg: 0.8,
  trainingCals: 2000,
  restCals: 1800,
};

export const ACTIVITY_LEVELS: { value: number; label: string; hint: string }[] = [
  { value: 1.2, label: "Sedentary", hint: "Desk job, little exercise" },
  { value: 1.375, label: "Light", hint: "1–3 light sessions/week" },
  { value: 1.5, label: "Moderate", hint: "4–5 sessions/week (this plan)" },
  { value: 1.725, label: "Very active", hint: "6–7 hard sessions/week" },
];

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

/** Mifflin–St Jeor BMR (male) × activity multiplier. */
export function maintenanceCals(s: BodyStats): number {
  const bmr = 10 * s.weightKg + 6.25 * s.heightCm - 5 * s.age + 5;
  return Math.round(bmr * s.activity);
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
        why: "Very common deficiency; supports bone, immune and hormonal health (incl. testosterone in deficient people)." },
      { name: "Omega-3 (fish oil)", dose: "1–2 g combined EPA+DHA", timing: "With a meal",
        why: "Supports recovery, joints, heart and helps manage inflammation from training." },
    ],
  },
  {
    tier: "Helpful",
    items: [
      { name: "Caffeine", dose: "100–200 mg", timing: "~30–45 min pre-workout",
        why: "Boosts training performance and focus, blunts appetite. Avoid within ~8 h of bed." },
      { name: "Magnesium glycinate", dose: "200–400 mg", timing: "Evening",
        why: "Supports sleep and muscle function; intake often drops on a cut." },
      { name: "Electrolytes / sodium", dose: "Per need", timing: "Around training & long cardio",
        why: "Hydration and performance — especially on the long run and interval days, and when carbs are low." },
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
    body: "Aim for 3–4 meals of ~40–50 g protein each rather than one big hit — better for muscle retention than the same total in fewer meals." },
  { title: "Put carbs around training",
    body: "Most of your carbs should land in the meals before and after lifting and the long run — that's where they fuel performance and recovery best. Rest days run leaner on carbs by design." },
  { title: "Hydrate",
    body: "~3–4 L water/day, more on the long-run and interval days. Add electrolytes when you sweat a lot or carbs are low." },
  { title: "Fiber & whole foods",
    body: "30–40 g fiber/day from veg, fruit, legumes and whole grains keeps you full and digestion happy. Aim ~80% whole foods, 20% flexible." },
  { title: "Don't drop fat too low",
    body: "Keep fat at/above ~0.6 g/kg (~50 g) to protect hormones. The plan sits at ~0.8 g/kg." },
  { title: "Track the trend, not the day",
    body: "Weigh in at the same time daily and watch the weekly average. If it stalls for 2–3 weeks, trim ~100–150 kcal or add steps — don't slash everything at once." },
  { title: "Take diet breaks",
    body: "This is an aggressive deficit. Every ~6–8 weeks, eat at maintenance for a few days — it helps hormones, training and adherence. Sleep 7–9 h; under-sleeping wrecks hunger and recovery." },
];

export const FOOD_SOURCES: { macro: string; color: string; foods: string }[] = [
  { macro: "Protein", color: "rose",
    foods: "Chicken & turkey breast, lean beef, eggs / egg whites, Greek yogurt, cottage cheese, white fish, salmon, whey, tofu/tempeh, prawns." },
  { macro: "Carbs", color: "amber",
    foods: "Rice, oats, potatoes & sweet potato, fruit (berries, banana), whole-grain bread, quinoa, legumes, pasta." },
  { macro: "Fats", color: "sky",
    foods: "Olive oil, nuts & nut butter, avocado, whole eggs, oily fish, seeds, a little dark chocolate." },
];

export const DIET_PLAN = {
  title: "Nutrition — Cut Phase",
  subtitle: "Fat loss · hold muscle · paired with your training week",
  principles: [
    "Eat more on training days, less on rest days — same weekly deficit, better performance.",
    "Protein stays high every day (~2.2 g/kg) — this is what keeps your muscle while you lean out.",
    "Carbs cycle to where the work is; fat stays steady for hormones.",
    "It's an aggressive deficit on purpose — prioritise protein, sleep and the weekly trend.",
  ],
};
