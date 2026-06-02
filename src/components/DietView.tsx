import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft, ChevronDown, Flame, Pill, Dumbbell, Moon, Info, GlassWater,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  DEFAULT_STATS, ACTIVITY_LEVELS, SUPPLEMENTS, GUIDELINES, FOOD_SOURCES, DIET_PLAN,
  maintenanceCals, macrosFor,
} from "@/data/diet";
import type { BodyStats } from "@/data/diet";
import { cn } from "@/lib/utils";

// ---------- localStorage hook ----------

function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

const MACRO_CLR: Record<string, string> = {
  protein: "bg-rose-400",
  carbs: "bg-amber-400",
  fat: "bg-sky-400",
};
const FOOD_CLR: Record<string, string> = {
  rose: "border-rose-200 bg-rose-50/50 text-rose-900",
  amber: "border-amber-200 bg-amber-50/50 text-amber-900",
  sky: "border-sky-200 bg-sky-50/50 text-sky-900",
};

// ---------- macro bar ----------

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const pc = protein * 4, cc = carbs * 4, fc = fat * 9;
  const total = Math.max(1, pc + cc + fc);
  const seg = (v: number) => `${(v / total) * 100}%`;
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div className={MACRO_CLR.protein} style={{ width: seg(pc) }} />
        <div className={MACRO_CLR.carbs} style={{ width: seg(cc) }} />
        <div className={MACRO_CLR.fat} style={{ width: seg(fc) }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs">
        <span className="text-rose-600">P {protein}g</span>
        <span className="text-amber-600">C {carbs}g</span>
        <span className="text-sky-600">F {fat}g</span>
      </div>
    </div>
  );
}

// ---------- day target card ----------

function DayTargetCard({ label, icon: Icon, cals, stats, accent }: {
  label: string; icon: typeof Dumbbell; cals: number; stats: BodyStats; accent: string;
}) {
  const m = macrosFor(cals, stats);
  return (
    <Card className="border-stone-200">
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-stone-50", accent)}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium text-stone-700">{label}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-3xl text-stone-900 tabular-nums">{cals.toLocaleString()}</span>
          <span className="text-sm text-stone-500">kcal</span>
        </div>
        <MacroBar protein={m.protein} carbs={m.carbs} fat={m.fat} />
      </CardContent>
    </Card>
  );
}

// ---------- targets calculator ----------

function TargetsCalculator({ stats, setStats }: { stats: BodyStats; setStats: (s: BodyStats) => void }) {
  const [open, setOpen] = useState(false);
  const maint = maintenanceCals(stats);
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Math.round(Number(v) || 0)));

  const weeklyIntake = stats.trainingCals * 5 + stats.restCals * 2;
  const avgDaily = Math.round(weeklyIntake / 7);
  const weeklyDeficit = maint * 7 - weeklyIntake;
  const estLoss = (weeklyDeficit / 7700).toFixed(2);

  return (
    <Card className="border-stone-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left sm:p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-stone-50">
            <Flame className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <span className="block font-serif text-base text-stone-900">My Targets</span>
            <span className="block text-xs text-stone-500">
              Maintenance ≈ {maint.toLocaleString()} kcal · ~{estLoss} kg/week
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-3">
              <Field id="d-w" label="Weight (kg)" value={stats.weightKg} onChange={(v) => setStats({ ...stats, weightKg: num(v) })} />
              <Field id="d-h" label="Height (cm)" value={stats.heightCm} onChange={(v) => setStats({ ...stats, heightCm: num(v) })} />
              <Field id="d-a" label="Age" value={stats.age} onChange={(v) => setStats({ ...stats, age: num(v) })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-500">Activity</Label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {ACTIVITY_LEVELS.map((a) => (
                  <button key={a.value} type="button" onClick={() => setStats({ ...stats, activity: a.value })}
                    title={a.hint}
                    className={cn("rounded-md border px-2 py-1.5 text-xs transition-colors",
                      stats.activity === a.value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-stone-200 text-stone-600 hover:bg-stone-50")}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field id="d-tc" label="Training-day kcal" value={stats.trainingCals} onChange={(v) => setStats({ ...stats, trainingCals: num(v) })} />
              <Field id="d-rc" label="Rest-day kcal" value={stats.restCals} onChange={(v) => setStats({ ...stats, restCals: num(v) })} />
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-50 p-3 text-sm sm:grid-cols-4">
              <Stat label="Maintenance" value={`${maint.toLocaleString()}`} unit="kcal" />
              <Stat label="Avg intake" value={`${avgDaily.toLocaleString()}`} unit="kcal/day" />
              <Stat label="Weekly deficit" value={`${weeklyDeficit.toLocaleString()}`} unit="kcal" />
              <Stat label="Est. fat loss" value={estLoss} unit="kg/week" />
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              Maintenance via Mifflin–St Jeor × activity. Protein fixed at {stats.proteinPerKg} g/kg (~{Math.round(stats.proteinPerKg * stats.weightKg)} g),
              fat at {stats.fatPerKg} g/kg (~{Math.round(stats.fatPerKg * stats.weightKg)} g); carbs fill the rest. Estimates only — track your real trend.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-stone-500">{label}</Label>
      <Input id={id} inputMode="numeric" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="font-serif text-lg text-stone-900 tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-stone-400">{label}</div>
      <div className="text-[10px] text-stone-400">{unit}</div>
    </div>
  );
}

// ---------- daily logger ----------

type DayType = "training" | "rest";
interface DayLog { dayType: DayType; cals: string; protein: string; }

function DailyLogger({ stats }: { stats: BodyStats }) {
  const today = new Date().toISOString().slice(0, 10);
  const [logs, setLogs] = useLocalStorage<Record<string, DayLog>>("diet.logs", {});
  const log: DayLog = logs[today] ?? { dayType: "training", cals: "", protein: "" };
  const set = (patch: Partial<DayLog>) => setLogs({ ...logs, [today]: { ...log, ...patch } });

  const targetCals = log.dayType === "training" ? stats.trainingCals : stats.restCals;
  const targetProtein = macrosFor(targetCals, stats).protein;
  const calsEaten = Number(log.cals) || 0;
  const proteinEaten = Number(log.protein) || 0;

  return (
    <Card className="border-stone-200">
      <CardContent className="space-y-4 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <span className="font-serif text-base text-stone-900">Today's log</span>
          <div className="flex gap-1 rounded-lg bg-stone-100 p-0.5">
            {(["training", "rest"] as DayType[]).map((t) => (
              <button key={t} type="button" onClick={() => set({ dayType: t })}
                className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  log.dayType === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500")}>
                {t === "training" ? <Dumbbell className="h-3 w-3" /> : <Moon className="h-3 w-3" />}{t}
              </button>
            ))}
          </div>
        </div>

        <Progress label="Calories" eaten={calsEaten} target={targetCals} unit="kcal" tone="emerald"
          input={<Input inputMode="numeric" placeholder="eaten" value={log.cals} onChange={(e) => set({ cals: e.target.value })} className="h-8 w-24 text-sm" />} />
        <Progress label="Protein" eaten={proteinEaten} target={targetProtein} unit="g" tone="rose"
          input={<Input inputMode="numeric" placeholder="eaten" value={log.protein} onChange={(e) => set({ protein: e.target.value })} className="h-8 w-24 text-sm" />} />
      </CardContent>
    </Card>
  );
}

function Progress({ label, eaten, target, unit, tone, input }: {
  label: string; eaten: number; target: number; unit: string; tone: "emerald" | "rose"; input: ReactNode;
}) {
  const pct = Math.min(100, target > 0 ? (eaten / target) * 100 : 0);
  const remaining = target - eaten;
  const barTone = tone === "emerald" ? "bg-emerald-500" : "bg-rose-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        {input}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div className={cn("h-full rounded-full transition-all", barTone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-stone-500">
        <span>{eaten.toLocaleString()} / {target.toLocaleString()} {unit}</span>
        <span className={remaining < 0 ? "text-rose-600" : "text-stone-500"}>
          {remaining >= 0 ? `${remaining.toLocaleString()} ${unit} left` : `${Math.abs(remaining).toLocaleString()} ${unit} over`}
        </span>
      </div>
    </div>
  );
}

// ---------- supplements ----------

function Supplements() {
  return (
    <div className="space-y-2.5">
      {SUPPLEMENTS.map((group) => (
        <Card key={group.tier} className="border-stone-200">
          <CardContent className="space-y-2.5 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-stone-700">{group.tier}</span>
              <Badge variant="outline" className="ml-auto text-[10px] text-stone-500">{group.items.length}</Badge>
            </div>
            {group.items.map((s) => (
              <div key={s.name} className="rounded-lg border border-stone-100 bg-stone-50/50 p-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="text-sm font-medium text-stone-900">{s.name}</span>
                  <span className="text-xs font-medium text-emerald-700">{s.dose} · {s.timing}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">{s.why}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------- view ----------

export default function DietView({ onBack }: { onBack?: () => void }) {
  const [stats, setStats] = useLocalStorage<BodyStats>("diet.stats", DEFAULT_STATS);

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 pb-24 pt-3 sm:px-6">
      <div className="flex items-start gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mt-0.5 h-8 w-8 shrink-0" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl text-stone-900">{DIET_PLAN.title}</h1>
          <p className="mt-0.5 text-xs text-stone-500">{DIET_PLAN.subtitle}</p>
        </div>
      </div>

      <Card className="border-stone-200 bg-stone-50/60">
        <CardContent className="p-3 sm:p-4">
          <ul className="space-y-1.5 text-xs leading-relaxed text-stone-600">
            {DIET_PLAN.principles.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <TargetsCalculator stats={stats} setStats={setStats} />

      <div className="grid grid-cols-2 gap-2.5">
        <DayTargetCard label="Training day" icon={Dumbbell} cals={stats.trainingCals} stats={stats} accent="bg-stone-900" />
        <DayTargetCard label="Rest day" icon={Moon} cals={stats.restCals} stats={stats} accent="bg-stone-400" />
      </div>

      <DailyLogger stats={stats} />

      <h2 className="px-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">Supplements</h2>
      <Supplements />

      <h2 className="px-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">Food sources</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {FOOD_SOURCES.map((f) => (
          <div key={f.macro} className={cn("rounded-xl border p-3", FOOD_CLR[f.color])}>
            <div className="text-sm font-medium">{f.macro}</div>
            <p className="mt-1 text-xs leading-relaxed opacity-80">{f.foods}</p>
          </div>
        ))}
      </div>

      <h2 className="px-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">Guidelines</h2>
      <Card className="border-stone-200">
        <CardContent className="divide-y divide-stone-100 p-0">
          {GUIDELINES.map((g) => (
            <div key={g.title} className="flex gap-3 p-3 sm:p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" />
              <div>
                <div className="text-sm font-medium text-stone-800">{g.title}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{g.body}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 px-1 pt-2 text-center text-[10px] text-stone-400">
        <GlassWater className="h-3 w-3" /> General nutrition guidance, not medical advice. Check with a doctor before changing diet or supplements.
      </p>
    </div>
  );
}
