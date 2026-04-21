import {
  Activity, Droplets, HeartPulse, FlaskConical, Leaf, TestTube, Moon, Brain,
  Dna, ShieldCheck, Bone, Pill, Sparkles, Stethoscope
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Hematology (CBC)": Droplets,
  "Glucose / Diabetes": FlaskConical,
  "Lipid Panel": HeartPulse,
  "Kidney Function": Dna,
  "Liver Function": Leaf,
  "Electrolytes": TestTube,
  "Iron Studies": Activity,
  "Thyroid": Brain,
  "Vitamins": Sparkles,
  "Inflammation/Serology": ShieldCheck,
  "Muscle Enzymes": Bone,
  "Hormones": Moon,
  "Prostate": Stethoscope,
  "Miscellaneous": Pill,
};

export function iconFor(cat: string): LucideIcon {
  return CATEGORY_ICON[cat] || Activity;
}
