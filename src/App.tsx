import { useState } from "react";
import {
 Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Check, ChevronDown,
 FlaskConical, Droplets, Stethoscope, FileText, Menu, Search, Sparkles,
 ArrowRight, Info, HeartPulse
} from "lucide-react";
import {
 ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
 Tooltip as RTooltip, ReferenceArea, ReferenceLine
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
 Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { BLOOD_MARKERS, CATEGORIES } from "@/data/blood";
import type { BloodMarker } from "@/data/blood";
import { DATES, SHORT_DATES, LABS } from "@/data/dates";
import { URINALYSIS, URINALYSIS_DATES, URINALYSIS_LABS, IMAGING, PATHOLOGY, SEMEN, META as OTHER_META, SOURCES } from "@/data/other";
import { getDiagnostic } from "@/data/diagnostics";
import {
 statusOf, latestValue, previousValue, chartData, formatValue, formatNumber, niceDomain, countAbnormal,
 attentionList, trajectory
} from "@/lib/health";
import { iconFor } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

type Section = "overview" | "blood" | "urine" | "imaging" | "pathology" | "semen" | "reports";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
 high: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500", label: "High" },
 low: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500", label: "Low" },
 normal: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "In range" },
 unknown: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400", label: "No data" },
};

const TRAJECTORY_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
 improving: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: TrendingUp, label: "Improving" },
 worsening: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", icon: TrendingDown, label: "Worsening" },
 maintaining: { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: Minus, label: "Maintaining" },
 "new-concern": { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: AlertTriangle, label: "New concern" },
 "insufficient-data": { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", icon: Info, label: "Not enough data" },
};

// ---------- Top App Bar ----------

function TopBar() {
 return (
 <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/85 backdrop-blur">
 <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-stone-50">
 <HeartPulse className="h-4 w-4" />
 </div>
 <div className="leading-tight">
 <div className="font-serif text-base sm:text-lg">Jimmy's Health</div>
 <div className="text-[10px] uppercase tracking-wider text-stone-500">Personal longitudinal record</div>
 </div>
 </div>
 </div>
 </header>
 );
}

// ---------- Bottom tab bar (mobile-native feel, also visible on desktop) ----------

function BottomNav({ section, setSection }: { section: Section; setSection: (s: Section) => void }) {
 const tabs: { id: Section; label: string; icon: any }[] = [
 { id: "overview", label: "Home", icon: HeartPulse },
 { id: "blood", label: "Blood", icon: Droplets },
 { id: "urine", label: "Urine", icon: FlaskConical },
 { id: "imaging", label: "Imaging", icon: Activity },
 { id: "reports", label: "More", icon: Menu },
 ];
 return (
 <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-stone-50/95 backdrop-blur pb-[env(safe-area-inset-bottom,0)]">
 <div className="mx-auto flex max-w-md items-stretch justify-around">
 {tabs.map((t) => {
 const Icon = t.icon;
 const active = section === t.id;
 return (
 <button
 key={t.id}
 onClick={() => setSection(t.id)}
 className={cn(
 "flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[11px] font-medium",
 active ? "text-stone-900" : "text-stone-500"
 )}
 >
 <Icon className={cn("h-5 w-5", active ? "stroke-[2.3]" : "stroke-[1.8]")} />
 <span>{t.label}</span>
 <span className={cn("mt-0.5 h-0.5 w-5 rounded-full", active ? "bg-stone-900" : "bg-transparent")} />
 </button>
 );
 })}
 </div>
 </nav>
 );
}

// ---------- KPI pills (compact) ----------

function KpiPill({ label, value, tone }: { label: string; value: string; tone: "normal" | "warn" | "bad" | "muted" }) {
 const toneClass = {
 normal: "bg-emerald-50 text-emerald-900 border-emerald-200",
 warn: "bg-amber-50 text-amber-900 border-amber-200",
 bad: "bg-rose-50 text-rose-900 border-rose-200",
 muted: "bg-white text-stone-800 border-stone-200",
 }[tone];
 return (
 <div className={cn("rounded-xl border p-2.5", toneClass)}>
 <div className="text-[10px] uppercase tracking-wide opacity-70">{label}</div>
 <div className="mt-0.5 font-serif text-xl leading-none">{value}</div>
 </div>
 );
}

// ---------- Marker picker button (integrated trigger) ----------

function MarkerPickerButton({
 value, onChange, className,
}: { value: BloodMarker; onChange: (m: BloodMarker) => void; className?: string }) {
 const [open, setOpen] = useState(false);
 const lv = latestValue(value);
 const s = statusOf(value, lv.value);
 const dotClass = STATUS_STYLES[s].dot;
 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <button
 className={cn(
 "flex w-full items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left shadow-sm hover:bg-stone-50",
 className
 )}
 >
 <Search className="h-4 w-4 shrink-0 text-stone-500" />
 <div className="min-w-0 flex-1">
 <div className="truncate text-[10px] uppercase tracking-wider text-stone-500">{value.cat}</div>
 <div className="flex items-center gap-1.5">
 <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
 <span className="truncate font-medium text-stone-900">{value.name}</span>
 </div>
 </div>
 <ChevronDown className="h-4 w-4 shrink-0 text-stone-500" />
 </button>
 </PopoverTrigger>
 <PopoverContent className="w-[calc(100vw-1.5rem)] p-0 sm:w-[420px]" align="start">
 <Command>
 <CommandInput placeholder="Search by marker or category..." />
 <CommandList>
 <CommandEmpty>No matches.</CommandEmpty>
 {CATEGORIES.map((cat) => {
 const items = BLOOD_MARKERS.filter((m) => m.cat === cat);
 if (items.length === 0) return null;
 return (
 <CommandGroup key={cat} heading={cat}>
 {items.map((m) => {
 const ilv = latestValue(m);
 const ss = statusOf(m, ilv.value);
 return (
 <CommandItem
 key={m.name}
 value={`${m.name} ${m.cat}`}
 onSelect={() => { onChange(m); setOpen(false); }}
 >
 <span className={cn("mr-2 inline-block h-1.5 w-1.5 rounded-full", STATUS_STYLES[ss].dot)} />
 <span className="flex-1 truncate">{m.name}</span>
 <span className="ml-2 text-xs text-stone-500">{formatValue(ilv.value, m.unit)}</span>
 </CommandItem>
 );
 })}
 </CommandGroup>
 );
 })}
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 );
}

// ---------- Marker spotlight: picker + chart + verdict + actions in one unit ----------

function MarkerSpotlight({ marker, onPick }: { marker: BloodMarker; onPick: (m: BloodMarker) => void }) {
 const lv = latestValue(marker);
 const pv = previousValue(marker, lv.dateIdx);
 const status = statusOf(marker, lv.value);
 const traj = trajectory(marker);
 const diag = getDiagnostic(marker.name);
 const data = chartData(marker);

 const statusStyle = STATUS_STYLES[status];
 const trajStyle = TRAJECTORY_STYLES[traj.verdict];
 const TrajIcon = trajStyle.icon;

 const actions =
 status === "high" ? diag.actions.high :
 status === "low" ? diag.actions.low :
 diag.actions.maintain;

 const whatItMeans =
 status === "high" ? diag.highMeans :
 status === "low" ? diag.lowMeans :
 "Within the normal reference range.";

 const deltaStr = lv.value !== null && pv.value !== null
 ? `${lv.value > pv.value ? "+" : ""}${formatNumber(lv.value - pv.value)} ${marker.unit}`.trim()
 : null;

 const { domain, ticks } = niceDomain(
 data.map((d) => d.value as number).filter((n) => typeof n === "number"),
 marker.low, marker.high
 );
 const yFmt = (v: number) => formatNumber(v);

 return (
 <div className="space-y-3">
 {/* Unified picker + chart card */}
 <Card className="border-stone-200">
 <CardContent className="space-y-3 p-3 sm:p-4">
 {/* Picker trigger at top */}
 <MarkerPickerButton value={marker} onChange={onPick} />

 {/* Value + status strip */}
 <div className="flex flex-wrap items-end justify-between gap-2">
 <div className="min-w-0">
 <div className="flex items-baseline gap-2">
 <div className="font-serif text-3xl leading-none text-stone-900">{formatValue(lv.value, "")}</div>
 <div className="text-xs text-stone-500">{marker.unit}</div>
 </div>
 <div className="mt-1 text-[11px] text-stone-500">
 {DATES[lv.dateIdx] || ""}
 {deltaStr && <span className="ml-1.5 text-stone-700">· {deltaStr} vs prior</span>}
 </div>
 </div>
 <div className="flex flex-wrap justify-end gap-1.5">
 <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", statusStyle.bg, statusStyle.text, statusStyle.border)}>
 <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
 {statusStyle.label}
 </span>
 <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", trajStyle.bg, trajStyle.text)}>
 <TrajIcon className="h-3 w-3" /> {trajStyle.label}
 </span>
 </div>
 </div>

 {/* Reference range chip */}
 {marker.ref && (
 <div className="text-[11px] text-stone-500">
 Reference range <span className="font-medium text-stone-700">{marker.ref}</span> {marker.unit}
 </div>
 )}

 {/* Chart (tight height) */}
 <div className="h-[220px] w-full sm:h-[260px]">
 <ResponsiveContainer>
 <ComposedChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
 <defs>
 <linearGradient id="markerFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#0f172a" stopOpacity={0.15} />
 <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
 <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} />
 <YAxis domain={domain} ticks={ticks} tickFormatter={yFmt} tick={{ fontSize: 10, fill: "#78716c" }} axisLine={false} tickLine={false} width={44} />
 {(marker.low !== null || marker.high !== null) && (
 <ReferenceArea
 y1={marker.low !== null ? marker.low : domain[0]}
 y2={marker.high !== null ? marker.high : domain[1]}
 fill="#10b981" fillOpacity={0.07} stroke="none"
 />
 )}
 {marker.low !== null && (
 <ReferenceLine y={marker.low} stroke="#a8a29e" strokeDasharray="4 4" label={{ value: "min", position: "insideLeft", fontSize: 10, fill: "#a8a29e" }} />
 )}
 {marker.high !== null && (
 <ReferenceLine y={marker.high} stroke="#a8a29e" strokeDasharray="4 4" label={{ value: "max", position: "insideLeft", fontSize: 10, fill: "#a8a29e" }} />
 )}
 <Area type="monotone" dataKey="value" stroke="none" fill="url(#markerFill)" />
 <Line
 type="monotone"
 dataKey="value"
 stroke="#0f172a"
 strokeWidth={2}
 dot={{ r: 3.5, fill: "#0f172a" }}
 activeDot={{ r: 5 }}
 />
 <RTooltip
 contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
 formatter={(v: any) => [`${formatNumber(Number(v))} ${marker.unit}`.trim(), marker.name]}
 labelFormatter={(l) => {
 const i = SHORT_DATES.indexOf(l as any);
 return i >= 0 ? `${DATES[i]} · ${LABS[i]}` : l;
 }}
 />
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 {/* What this means */}
 <Card className="border-stone-200">
 <CardContent className="space-y-2 p-3 text-sm text-stone-700 sm:p-4">
 <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
 <Info className="h-3.5 w-3.5" /> What this means
 </div>
 <p>{diag.desc}</p>
 <p><span className="font-medium text-stone-900">Why we measure it.</span> {diag.why}</p>
 <p><span className="font-medium text-stone-900">Your reading.</span> {whatItMeans}</p>
 <p><span className="font-medium text-stone-900">Trajectory.</span> {traj.reason}</p>
 {diag.context && <p className="text-stone-600"><span className="font-medium text-stone-800">Context.</span> {diag.context}</p>}
 {marker.notes && (
 <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">Lab note. {marker.notes}</div>
 )}
 </CardContent>
 </Card>

 {/* Actions */}
 <Card className={cn("border",
 status === "normal" ? "border-emerald-200 bg-emerald-50/30" :
 status === "high" ? "border-rose-200 bg-rose-50/30" :
 status === "low" ? "border-amber-200 bg-amber-50/30" :
 "border-stone-200"
 )}>
 <CardContent className="space-y-2 p-3 sm:p-4">
 <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
 {status === "normal" ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
 {status === "high" ? "Ways to bring this down" : status === "low" ? "Ways to bring this up" : status === "normal" ? "How to keep it here" : "Suggested next steps"}
 </div>
 <ul className="space-y-1.5">
 {actions.map((a, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-stone-800">
 <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
 <span>{a}</span>
 </li>
 ))}
 </ul>
 <p className="pt-1 text-[11px] text-stone-500">Reference only, not medical advice. Discuss persistent findings with your physician.</p>
 </CardContent>
 </Card>
 </div>
 );
}

// ---------- Overview ----------

function Overview({ onFocus, setSection }: { onFocus: (m: BloodMarker) => void; setSection: (s: Section) => void }) {
 const counts = countAbnormal();
 const attention = attentionList();

 const defaultMarker =
 (attention[0] && attention[0].m) ||
 BLOOD_MARKERS.find((m) => m.name === "HbA1c") ||
 BLOOD_MARKERS[0];

 const [focus, setFocus] = useState<BloodMarker>(defaultMarker);

 return (
 <div className="space-y-4">
 {/* Compact header */}
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
 <HeartPulse className="h-5 w-5" />
 </div>
 <div className="leading-tight">
 <div className="font-serif text-lg text-stone-900">Jimmy's Health</div>
 <div className="text-[11px] text-stone-500">{DATES.length} visits on record. Latest {DATES[DATES.length - 1]}.</div>
 </div>
 </div>

 {/* KPI row (compact pills) */}
 <div className="grid grid-cols-4 gap-2">
 <KpiPill label="Tracked" value={`${BLOOD_MARKERS.length}`} tone="muted" />
 <KpiPill label="In range" value={`${counts.total - counts.high - counts.low}`} tone="normal" />
 <KpiPill label="High" value={`${counts.high}`} tone={counts.high ? "bad" : "muted"} />
 <KpiPill label="Low" value={`${counts.low}`} tone={counts.low ? "warn" : "muted"} />
 </div>

 {/* Integrated spotlight (picker + chart in one card) */}
 <MarkerSpotlight marker={focus} onPick={(m) => { setFocus(m); onFocus(m); }} />

 {/* Needs attention */}
 {attention.length > 0 && (
 <section>
 <div className="mb-1.5 flex items-end justify-between">
 <h2 className="font-serif text-base text-stone-900">Needs attention</h2>
 <span className="text-[11px] text-stone-500">{attention.length} outside range</span>
 </div>
 <Card className="border-stone-200">
 <CardContent className="p-0">
 <ul className="divide-y divide-stone-100">
 {attention.slice(0, 6).map((a) => {
 const Icon = iconFor(a.m.cat);
 const ss = STATUS_STYLES[a.status];
 return (
 <li key={a.m.name}>
 <button
 onClick={() => setFocus(a.m)}
 className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-stone-50"
 >
 <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", ss.bg, ss.border)}>
 <Icon className={cn("h-3.5 w-3.5", ss.text)} />
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5">
 <div className="truncate text-sm font-medium text-stone-900">{a.m.name}</div>
 <Badge variant="outline" className={cn("shrink-0 border-stone-200 px-1.5 py-0 text-[10px]", ss.text)}>{ss.label}</Badge>
 </div>
 <div className="truncate text-[11px] text-stone-500">{a.m.cat}</div>
 </div>
 <div className="text-right">
 <div className="text-sm font-medium text-stone-900">{formatValue(a.value, a.m.unit)}</div>
 <div className="text-[10px] text-stone-500">{Math.round(a.sev * 100)}% off</div>
 </div>
 <ArrowRight className="ml-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
 </button>
 </li>
 );
 })}
 </ul>
 </CardContent>
 </Card>
 </section>
 )}

 {/* Quick jump */}
 <section>
 <h2 className="mb-1.5 font-serif text-base text-stone-900">Browse records</h2>
 <div className="grid grid-cols-3 gap-2">
 {[
 { id: "blood", label: "Blood", sub: `${BLOOD_MARKERS.length} markers`, icon: Droplets },
 { id: "urine", label: "Urine", sub: `${URINALYSIS.length} rows`, icon: FlaskConical },
 { id: "imaging", label: "Imaging", sub: `${IMAGING.length} studies`, icon: Activity },
 { id: "pathology", label: "Pathology", sub: `${PATHOLOGY.length} report${PATHOLOGY.length === 1 ? "" : "s"}`, icon: Stethoscope },
 { id: "semen", label: "Fertility", sub: "Semen", icon: Sparkles },
 { id: "reports", label: "Reports", sub: `${SOURCES.length} sources`, icon: FileText },
 ].map((q) => {
 const Icon = q.icon;
 return (
 <button
 key={q.id}
 onClick={() => setSection(q.id as Section)}
 className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-2.5 text-left hover:border-stone-300 hover:bg-stone-50"
 >
 <Icon className="h-4 w-4 text-stone-700" />
 <div className="text-sm font-medium text-stone-900">{q.label}</div>
 <div className="text-[11px] text-stone-500">{q.sub}</div>
 </button>
 );
 })}
 </div>
 </section>
 </div>
 );
}

// ---------- Blood labs view ----------

function BloodView({ initial }: { initial: BloodMarker | null }) {
 const [marker, setMarker] = useState<BloodMarker>(initial || BLOOD_MARKERS[0]);

 return (
 <div className="space-y-3">
 <div>
 <h1 className="font-serif text-xl text-stone-900">Blood labs</h1>
 <p className="mt-0.5 text-xs text-stone-500">{BLOOD_MARKERS.length} markers across {CATEGORIES.length} categories. Tap the marker name to switch.</p>
 </div>
 <MarkerSpotlight marker={marker} onPick={setMarker} />
 </div>
 );
}

// ---------- Urinalysis view ----------

function UrineView() {
 return (
 <div className="space-y-3">
 <div>
 <h1 className="font-serif text-xl text-stone-900">Urinalysis</h1>
 <p className="mt-0.5 text-xs text-stone-500">{URINALYSIS.length} parameters across {URINALYSIS_DATES.length} dates.</p>
 </div>
 <Card className="overflow-hidden border-stone-200">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-stone-50">
 <TableRow>
 <TableHead className="min-w-[140px]">Parameter</TableHead>
 <TableHead>Reference</TableHead>
 {URINALYSIS_DATES.map((d, i) => (
 <TableHead key={d} className="min-w-[110px]">
 <div>{d}</div>
 <div className="text-[10px] font-normal text-stone-500">{URINALYSIS_LABS[i]}</div>
 </TableHead>
 ))}
 </TableRow>
 </TableHeader>
 <TableBody>
 {URINALYSIS.map((r) => (
 <TableRow key={r.parameter}>
 <TableCell className="font-medium">{r.parameter}</TableCell>
 <TableCell className="text-xs text-stone-500">{r.ref}</TableCell>
 {r.values.map((v, i) => (
 <TableCell key={i} className="text-sm">{v === null ? "," : String(v)}</TableCell>
 ))}
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </Card>
 </div>
 );
}

// ---------- Imaging view ----------

function ImagingView() {
 return (
 <div className="space-y-3">
 <h1 className="font-serif text-xl text-stone-900">Imaging</h1>
 <div className="grid gap-3 md:grid-cols-2">
 {IMAGING.map((img) => (
 <Card key={img.date + img.study} className="border-stone-200">
 <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
 <div className="flex items-start justify-between gap-2">
 <div>
 <CardTitle className="font-serif text-base sm:text-lg">{img.study}</CardTitle>
 <CardDescription className="text-xs">{img.date} · {img.facility}</CardDescription>
 </div>
 <Badge variant="outline" className="shrink-0 border-stone-200 text-[10px]">{img.physician}</Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-2 p-3 pt-0 text-sm text-stone-700 sm:p-4 sm:pt-0">
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Findings</div>
 <p>{img.findings}</p>
 </div>
 <Separator />
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Impression</div>
 <p className="font-medium text-stone-900">{img.impression}</p>
 </div>
 <div className="text-[10px] text-stone-500">Source. {img.source}</div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}

// ---------- Pathology view ----------

function PathologyView() {
 return (
 <div className="space-y-3">
 <h1 className="font-serif text-xl text-stone-900">Pathology</h1>
 <div className="grid gap-3 md:grid-cols-2">
 {PATHOLOGY.map((p) => (
 <Card key={p.date + p.specimen} className="border-stone-200">
 <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
 <CardTitle className="font-serif text-base sm:text-lg">{p.specimen}</CardTitle>
 <CardDescription className="text-xs">{p.date} · {p.facility}</CardDescription>
 </CardHeader>
 <CardContent className="space-y-2 p-3 pt-0 text-sm text-stone-700 sm:p-4 sm:pt-0">
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Clinical</div>
 <p>{p.clinical}</p>
 </div>
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Findings</div>
 <p>{p.findings}</p>
 </div>
 <Separator />
 <div>
 <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Diagnosis</div>
 <p className="font-medium text-stone-900">{p.diagnosis}</p>
 </div>
 <div className="text-[10px] text-stone-500">Source. {p.source}</div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}

// ---------- Semen view ----------

function SemenView() {
 return (
 <div className="space-y-3">
 <div>
 <h1 className="font-serif text-xl text-stone-900">Fertility · Semen analysis</h1>
 <p className="mt-0.5 text-xs text-stone-500">{OTHER_META.semenDate} · {OTHER_META.semenLab}</p>
 </div>
 <Card className="border-emerald-200 bg-emerald-50/40">
 <CardContent className="p-3 text-sm text-emerald-900 sm:p-4">
 <div className="flex items-center gap-2">
 <Check className="h-4 w-4" />
 <span className="font-medium">Interpretation</span>
 </div>
 <p className="mt-1">{OTHER_META.semenInterpretation}</p>
 </CardContent>
 </Card>
 <Card className="border-stone-200">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-stone-50">
 <TableRow>
 <TableHead>Parameter</TableHead>
 <TableHead>Reference</TableHead>
 <TableHead>Value</TableHead>
 <TableHead>Unit</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {SEMEN.map((s) => (
 <TableRow key={s.parameter}>
 <TableCell className="font-medium">{s.parameter}</TableCell>
 <TableCell className="text-stone-500">{s.ref || ","}</TableCell>
 <TableCell>{String(s.value)}</TableCell>
 <TableCell className="text-stone-500">{s.unit || ","}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </Card>
 </div>
 );
}

// ---------- Reports view ----------

function ReportsView() {
 return (
 <div className="space-y-3">
 <div>
 <h1 className="font-serif text-xl text-stone-900">Source reports</h1>
 <p className="mt-0.5 text-xs text-stone-500">{SOURCES.length} reports on file across {new Set(SOURCES.map((s) => s.lab)).size} labs and facilities.</p>
 </div>
 <Card className="border-stone-200">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-stone-50">
 <TableRow>
 <TableHead>Date</TableHead>
 <TableHead>Lab</TableHead>
 <TableHead>Location</TableHead>
 <TableHead>Type</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {SOURCES.map((s) => (
 <TableRow key={s.date + s.lab + s.file}>
 <TableCell className="whitespace-nowrap font-medium">{s.date}</TableCell>
 <TableCell>{s.lab}</TableCell>
 <TableCell className="text-stone-500">{s.location}</TableCell>
 <TableCell className="text-sm text-stone-700">{s.type}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </Card>
 </div>
 );
}

// ---------- App ----------

export default function App() {
 const [section, setSection] = useState<Section>("overview");
 const [focusMarker, setFocusMarker] = useState<BloodMarker | null>(null);
 const [moreOpen, setMoreOpen] = useState(false);

 const openMore = (s: Section) => { setSection(s); setMoreOpen(false); };

 const handleTab = (s: Section) => {
 if (s === "reports") { setMoreOpen(true); return; }
 setSection(s);
 };

 return (
 <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
 <main className="mx-auto max-w-3xl px-3 py-3 sm:px-5 sm:py-4">
 {section === "overview" && <Overview onFocus={(m) => { setFocusMarker(m); setSection("blood"); }} setSection={setSection} />}
 {section === "blood" && <BloodView initial={focusMarker} />}
 {section === "urine" && <UrineView />}
 {section === "imaging" && <ImagingView />}
 {section === "pathology" && <PathologyView />}
 {section === "semen" && <SemenView />}
 {section === "reports" && <ReportsView />}
 </main>
 <footer className="mx-auto max-w-3xl px-4 pb-3 pt-1 text-center text-[10px] text-stone-400 sm:px-6">
 Reference information only, not medical advice.
 </footer>
 <BottomNav section={section} setSection={handleTab} />
 <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
 <SheetContent side="bottom" className="rounded-t-2xl bg-stone-50 pb-8">
 <SheetHeader>
 <SheetTitle className="text-left font-serif text-lg">More</SheetTitle>
 </SheetHeader>
 <div className="mt-3 grid grid-cols-3 gap-2">
 <button onClick={() => openMore("pathology")} className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:bg-stone-100">
 <Stethoscope className="h-5 w-5" /> Pathology
 </button>
 <button onClick={() => openMore("semen")} className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:bg-stone-100">
 <Sparkles className="h-5 w-5" /> Fertility
 </button>
 <button onClick={() => openMore("reports")} className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700 hover:bg-stone-100">
 <FileText className="h-5 w-5" /> Reports
 </button>
 </div>
 </SheetContent>
 </Sheet>
 </div>
 );
}
