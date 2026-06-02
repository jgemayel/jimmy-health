import { useEffect, useState } from "react";
import {
  Dumbbell, Footprints, Zap, Wind, Moon, ChevronDown, Check, ArrowLeft,
  HeartPulse, Info, Clock, RotateCcw, Repeat, ArrowRightLeft,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  WEEK, PLAN, ZONES, EXERCISES, karvonen,
} from "@/data/workout";
import type { DayPlan, SetScheme } from "@/data/workout";
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
      /* ignore quota / private-mode errors */
    }
  }, [key, value]);
  return [value, setValue];
}

// ---------- visual maps ----------

const ICONS = { Dumbbell, Footprints, Zap, Wind, Moon } as const;

const ICON_BADGE: Record<string, string> = {
  Dumbbell: "bg-stone-900 text-stone-50",
  Footprints: "bg-emerald-600 text-stone-50",
  Zap: "bg-orange-500 text-stone-50",
  Wind: "bg-sky-600 text-stone-50",
  Moon: "bg-stone-200 text-stone-500",
};

const ZONE_CLR: Record<string, string> = {
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

// Image paths in workout data are relative (e.g. "exercises/<id>/0.jpg") so they
// resolve correctly under the GitHub Pages base path and work under any bundler.

// ---------- My Zones calculator ----------

function ZoneCalculator() {
  const [cfg, setCfg] = useLocalStorage("workout.zones", { age: 30, restHR: 55, maxHR: 0 });
  const [open, setOpen] = useState(false);
  const hrMax = cfg.maxHR && cfg.maxHR > 0 ? cfg.maxHR : 220 - cfg.age;

  const num = (v: string) => (v === "" ? 0 : Math.max(0, Math.round(Number(v) || 0)));

  return (
    <Card className="border-stone-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left sm:p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500 text-stone-50">
            <HeartPulse className="h-4 w-4" />
          </span>
          <span className="flex-1">
            <span className="block font-serif text-base text-stone-900">My Zones</span>
            <span className="block text-xs text-stone-500">
              Personal HR targets · max ≈ {hrMax} bpm
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="z-age" className="text-xs text-stone-500">Age</Label>
                <Input id="z-age" inputMode="numeric" value={cfg.age || ""}
                  onChange={(e) => setCfg({ ...cfg, age: num(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="z-rhr" className="text-xs text-stone-500">Resting HR</Label>
                <Input id="z-rhr" inputMode="numeric" value={cfg.restHR || ""}
                  onChange={(e) => setCfg({ ...cfg, restHR: num(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="z-mhr" className="text-xs text-stone-500">Max HR <span className="text-stone-300">(opt)</span></Label>
                <Input id="z-mhr" inputMode="numeric" placeholder={`${220 - cfg.age}`} value={cfg.maxHR || ""}
                  onChange={(e) => setCfg({ ...cfg, maxHR: num(e.target.value) })} />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              Karvonen method · target = (max − rest) × %HRR + rest. Leave Max HR blank to use 220 − age.
            </p>
            <div className="space-y-1.5">
              {ZONES.map((z) => (
                <div key={z.key}
                  className={cn("flex items-center justify-between rounded-md border px-3 py-1.5 text-sm", ZONE_CLR[z.color])}>
                  <span className="font-medium">{z.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="hidden text-xs opacity-70 sm:inline">{z.feel}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {karvonen(z.pctLow, cfg.age, cfg.restHR, cfg.maxHR)}–{karvonen(z.pctHigh, cfg.age, cfg.restHR, cfg.maxHR)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ---------- Exercise row (expandable: photos + instructions + weight log) ----------

function ExerciseRow({ item, logKey, hideWeight }: { item: SetScheme; logKey: string; hideWeight?: boolean }) {
  const ex = EXERCISES[item.ref];
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useLocalStorage(`workout.wt.${logKey}`, "");
  if (!ex) return null;
  const name = item.label ?? ex.name;

  return (
    <div className={cn("rounded-lg border border-stone-200 bg-white", item.superset && "ml-3 border-l-2 border-l-stone-300")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-3 p-2 text-left">
          <img src={ex.images[0]} alt={name} loading="lazy"
            className="h-12 w-16 shrink-0 rounded-md border border-stone-200 object-cover" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              {item.superset && <Repeat className="h-3 w-3 text-stone-400" />}
              <span className="truncate text-sm font-medium text-stone-900">{name}</span>
            </span>
            <span className="mt-0.5 block text-xs text-stone-500">
              {item.sets} × {item.reps}
              <span className="text-stone-300"> · </span>
              <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" />{item.rest}</span>
            </span>
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone-400 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 px-2 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {ex.images.map((src, i) => (
                <figure key={src} className="overflow-hidden rounded-md border border-stone-200">
                  <img src={src} alt={`${name} ${i === 0 ? "start" : "finish"}`} loading="lazy" className="w-full object-cover" />
                  <figcaption className="bg-stone-50 px-2 py-1 text-center text-[10px] uppercase tracking-wide text-stone-500">
                    {i === 0 ? "Start" : "Finish"}
                  </figcaption>
                </figure>
              ))}
            </div>
            {item.note && (
              <p className="rounded-md bg-stone-50 px-2.5 py-2 text-xs leading-relaxed text-stone-600">{item.note}</p>
            )}
            {item.alt && EXERCISES[item.alt] && (
              <p className="flex items-center gap-1.5 text-xs text-stone-500">
                <ArrowRightLeft className="h-3 w-3" /> Alternative: {EXERCISES[item.alt].name}
              </p>
            )}
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-stone-600">
              {ex.instructions.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            {!hideWeight && (
              <div className="flex items-center gap-2 border-t border-stone-100 pt-2">
                <Label htmlFor={`wt-${logKey}`} className="text-xs text-stone-500">Working weight</Label>
                <Input id={`wt-${logKey}`} value={weight} placeholder="e.g. 20 kg"
                  onChange={(e) => setWeight(e.target.value)} className="h-8 max-w-[140px] text-sm" />
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ---------- Day card ----------

function DayCard({
  day, done, onToggle, defaultOpen,
}: { day: DayPlan; done: boolean; onToggle: () => void; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = ICONS[day.icon];
  const isRest = day.type === "rest";
  const count = day.exercises?.length ?? 0;

  const summary = isRest
    ? "Recovery"
    : day.type === "cardio"
      ? day.cardio?.zone
      : `${count} exercise${count === 1 ? "" : "s"}`;

  return (
    <Card className={cn("overflow-hidden border-stone-200", done && "opacity-70")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ICON_BADGE[day.icon])}>
            <Icon className="h-5 w-5" />
          </span>
          <CollapsibleTrigger className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                Day {day.day} · {day.dow}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("font-serif text-base text-stone-900", done && "line-through")}>{day.title}</span>
              {day.intensity && (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  day.intensity === "Intense" ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-500")}>
                  {day.intensity}
                </span>
              )}
              {!isRest && <ChevronDown className={cn("h-4 w-4 text-stone-400 transition-transform", open && "rotate-180")} />}
            </div>
            <span className="block text-xs text-stone-500">
              {day.subtitle} · {day.duration}{summary ? ` · ${summary}` : ""}
            </span>
          </CollapsibleTrigger>
          {!isRest && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={done ? "Mark not done" : "Mark done"}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 text-stone-300 hover:border-stone-400",
              )}>
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>

        <CollapsibleContent>
          <Separator />
          <CardContent className="space-y-2.5 p-3 sm:p-4">
            {day.note && (
              <p className="rounded-md bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">{day.note}</p>
            )}

            {/* Warm-up & mobility */}
            {day.warmup && day.warmup.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-sky-600">
                  <Wind className="h-3.5 w-3.5" /> Warm-up & mobility
                </div>
                {day.warmup.map((item, i) => (
                  <ExerciseRow key={`wu-${item.ref}-${i}`} item={item} logKey={`${day.day}-wu-${i}-${item.ref}`} hideWeight />
                ))}
              </div>
            )}

            {/* Main work */}
            {day.exercises && day.exercises.length > 0 && (
              <div className="space-y-2.5">
                {day.warmup && (
                  <div className="pt-1 text-[11px] font-medium uppercase tracking-wider text-stone-400">Workout</div>
                )}
                {day.exercises.map((item, i) => (
                  <ExerciseRow key={`${item.ref}-${i}`} item={item} logKey={`${day.day}-${i}-${item.ref}`} />
                ))}
              </div>
            )}

            {day.cooldown && (
              <p className="flex items-start gap-2 rounded-md bg-sky-50/60 px-3 py-2 text-xs leading-relaxed text-sky-800">
                <Wind className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {day.cooldown}
              </p>
            )}

            {day.finisher && (
              <p className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800">
                <Footprints className="h-3.5 w-3.5" /> {day.finisher}
              </p>
            )}

            {/* Cardio */}
            {day.cardio && (
              <div className="space-y-2.5">
                <Badge variant="outline" className={cn("border", ZONE_CLR[day.cardio.zoneKey === "z2" ? "emerald" : "orange"])}>
                  {day.cardio.zone}
                </Badge>
                <ul className="space-y-1.5 text-sm text-stone-700">
                  {day.cardio.structure.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-start gap-2 rounded-md bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <span>{day.cardio.cue}</span>
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ---------- Workout view ----------

export default function WorkoutView({ onBack }: { onBack?: () => void }) {
  const [done, setDone] = useLocalStorage<Record<number, boolean>>("workout.done", {});
  const trainingDays = WEEK.filter((d) => d.type !== "rest");
  const completed = trainingDays.filter((d) => done[d.day]).length;

  const toggle = (dayNum: number) => setDone({ ...done, [dayNum]: !done[dayNum] });
  const resetWeek = () => setDone({});

  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 pb-24 pt-3 sm:px-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mt-0.5 h-8 w-8 shrink-0" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-xl text-stone-900">{PLAN.title}</h1>
          <p className="mt-0.5 text-xs text-stone-500">{PLAN.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-lg text-stone-900">{completed}<span className="text-stone-400">/{trainingDays.length}</span></div>
          <div className="text-[10px] uppercase tracking-wider text-stone-400">this week</div>
        </div>
      </div>

      {/* Principles */}
      <Card className="border-stone-200 bg-stone-50/60">
        <CardContent className="space-y-1.5 p-3 sm:p-4">
          <ul className="space-y-1.5 text-xs leading-relaxed text-stone-600">
            {PLAN.principles.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <p className="text-[11px] leading-relaxed text-stone-400">{PLAN.note}</p>
        </CardContent>
      </Card>

      <ZoneCalculator />

      {/* Week */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-stone-400">The week</h2>
        {completed > 0 && (
          <Button variant="ghost" size="sm" onClick={resetWeek} className="h-7 gap-1.5 text-xs text-stone-500">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {WEEK.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            done={!!done[day.day]}
            onToggle={() => toggle(day.day)}
            defaultOpen={false}
          />
        ))}
      </div>

      <p className="px-1 pt-2 text-center text-[10px] text-stone-400">
        Exercise photos &amp; instructions: free-exercise-db (public domain). Not medical advice.
      </p>
    </div>
  );
}
