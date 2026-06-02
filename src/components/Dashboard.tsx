import { HeartPulse, Dumbbell, Salad, ChevronRight } from "lucide-react";

export type AppView = "health" | "workout" | "diet";

const TILES: {
  id: AppView;
  title: string;
  desc: string;
  icon: typeof HeartPulse;
  badge: string;
  iconWrap: string;
}[] = [
  {
    id: "health",
    title: "Health",
    desc: "Blood markers, Whoop, imaging & diagnostics — your longitudinal record.",
    icon: HeartPulse,
    badge: "Records",
    iconWrap: "bg-rose-500",
  },
  {
    id: "workout",
    title: "Workout Plan",
    desc: "Your 5-day training week with demo photos, HR zones & a logbook.",
    icon: Dumbbell,
    badge: "Training",
    iconWrap: "bg-stone-900",
  },
  {
    id: "diet",
    title: "Nutrition",
    desc: "Calorie & macro targets, a daily logger and your supplement stack.",
    icon: Salad,
    badge: "Diet",
    iconWrap: "bg-emerald-600",
  },
];

export default function Dashboard({ onSelect }: { onSelect: (v: AppView) => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-12 sm:px-6">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-2xl text-stone-900">Jimmy's Health</h1>
            <p className="text-xs uppercase tracking-wider text-stone-500">Personal dashboard</p>
          </div>
        </div>

        {/* Tiles */}
        <div className="grid gap-3 sm:grid-cols-2">
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="group flex flex-col items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                <div className="flex w-full items-start justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-stone-50 ${t.iconWrap}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">{t.badge}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 font-serif text-xl text-stone-900">
                    {t.title}
                    <ChevronRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-stone-500">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="px-4 pb-6 text-center text-[10px] text-stone-400">
        Reference information only · not medical advice.
      </footer>
    </div>
  );
}
