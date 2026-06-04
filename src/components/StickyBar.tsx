import { ArrowLeft } from "lucide-react";

/**
 * Fixed BOTTOM back bar — keeps the "Dashboard" button in the thumb zone
 * (the top of the screen is hard to reach one-handed on a phone).
 * Used by the Workout and Nutrition views (the Health view puts Back in its bottom nav).
 */
export default function StickyBar({ onBack }: { title?: string; onBack?: () => void }) {
  if (!onBack) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-stone-50/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-3xl px-4 py-2.5 sm:px-6">
        <button
          onClick={onBack}
          aria-label="Back to dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-medium text-stone-50 active:bg-stone-700"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>
      </div>
    </div>
  );
}
