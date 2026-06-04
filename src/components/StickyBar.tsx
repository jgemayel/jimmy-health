import { ArrowLeft } from "lucide-react";

/** Sticky top bar with an always-reachable back-to-launcher button. */
export default function StickyBar({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-3xl items-center gap-1.5 px-3 sm:px-6">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="-ml-1 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-200/70 active:bg-stone-300"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
        )}
        {title && <span className="truncate font-serif text-sm text-stone-500">{title}</span>}
      </div>
    </div>
  );
}
