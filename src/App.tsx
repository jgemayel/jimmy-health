import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
 Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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

function TopBar({ section, setSection }: { section: Section; setSection: (s: Section) => void }) {
 const nav: { id: Section; label: string; icon: any }[] = [
 { id: "overview", label: "Overview", icon: HeartPulse },
 { id: "blood", label: "Blood labs", icon: Droplets },
 { id: "urine", label: "Urinalysis", icon: FlaskConical },
 { id: "imaging", label: "Imaging", icon: Activity },
 { id: "pathology", label: "Pathology", icon: Stethoscope },
 { id: "semen", label: "Fertility", icon: Sparkles },
 { id: "reports", label: "Reports", icon: FileText },
 ];

 return (
 <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/85 backdrop-blur">
 <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
 {/* Mobile nav trigger */}
 <Sheet>
 <SheetTrigger asChild>
 <Button variant="ghost" size="icon" className="sm:hidden">
 <Menu className="h-5 w-5" />
 </Button>
 </SheetTrigger>
 <SheetContent side="left" className="w-72 bg-stone-50">
 <SheetHeader>
 <SheetTitle className="text-left font-serif text-xl">Jimmy's Health</SheetTitle>
 </SheetHeader>
 <div className="mt-4 flex flex-col gap-1">
 {nav.map((n) => {
 const Icon = n.icon;
 const active = section === n.id;
 return (
 <button
 key={n.id}
 onClick={() => setSection(n.id)}
 className={cn(
 "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium",
 active ? "bg-stone-900 text-stone-50" : "text-stone-700 hover:bg-stone-100"
 )}
 >
 <Icon className="h-4 w-4" /> {n.label}
 </button>
 );
 })}
 </div>
 </SheetContent>
 </Sheet>

 <div className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-stone-50">
 <HeartPulse className="h-4 w-4" />
 </div>
 <div className="leading-tight">
 <div className="font-serif text-lg">Jimmy's Health</div>
 <div className="text-[11px] uppercase tracking-wider text-stone-500">Personal medical record</div>
 </div>
 </div>

 {/* Desktop nav */}
 <nav className="ml-auto hidden items-center gap-1 sm:flex">
 {nav.map((n) => {
 const Icon = n.icon;
 const active = section === n.id;
 return (
 <button
 key={n.id}
 onClick={() => setSection(n.id)}
 className={cn(
 "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
 active ? "bg-stone-900 text-stone-50" : "text-stone-600 hover:bg-stone-100"
 )}
 >
 <Icon className="h-3.5 w-3.5" /> {n.label}
 </button>
 );
 })}
 </nav>
 </div>
 </header>
 );
}

// ---------- KPI cards ----------

function Kpi({ label, value, tone, sub }: { label: string; value: string; tone: "normal" | "warn" | "bad" | "muted"; sub?: string }) {
 const toneClass = {
 normal: "bg-emerald-50 text-emerald-900 border-emerald-200",
 warn: "bg-amber-50 text-amber-900 border-amber-200",
 bad: "bg-rose-50 text-rose-900 border-rose-200",
 muted: "bg-stone-50 text-stone-800 border-stone-200",
 }[tone];
 return (
 <div className={cn("rounded-xl border p-4", toneClass)}>
 <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
 <div className="mt-1 font-serif text-3xl leading-none">{value}</div>
 {sub && <div className="mt-2 text-xs opacity-75">{sub}</div>}
 </div>
 );
}

// ---------- Marker picker (command palette) ----------

function MarkerPicker({
 value, onChange,
}: { value: BloodMarker | null; onChange: (m: BloodMarker) => void }) {
 const [open, setOpen] = useState(false);
 return (
 <Popover open={open} onOpenChange={setOpen}>
 <PopoverTrigger asChild>
 <Button variant="outline" className="w-full justify-between sm:w-[360px]">
 <span className="flex items-center gap-2 truncate">
 <Search className="h-4 w-4 shrink-0 opacity-60" />
 <span className="truncate">{value ? value.name : "Search marker..."}</span>
 </span>
 <ChevronDown className="h-4 w-4 opacity-60" />
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-[calc(100vw-2rem)] p-0 sm:w-[420px]" align="start">
 <Command>
 <CommandInput placeholder="Search by marker name or category..." />
 <CommandList>
 <CommandEmpty>No matches.</CommandEmpty>
 {CATEGORIES.map((cat) => {
 const items = BLOOD_MARKERS.filter((m) => m.cat === cat);
 if (items.length === 0) return null;
 return (
 <CommandGroup key={cat} heading={cat}>
 {items.map((m) => {
 const lv = latestValue(m);
 const s = statusOf(m, lv.value);
 return (
 <CommandItem
 key={m.name}
 value={`${m.name} ${m.cat}`}
 onSelect={() => { onChange(m); setOpen(false); }}
 >
 <span className={cn("mr-2 inline-block h-1.5 w-1.5 rounded-full", STATUS_STYLES[s].dot)} />
 <span className="flex-1 truncate">{m.name}</span>
 <span className="ml-2 text-xs text-stone-500">{formatValue(lv.value, m.unit)}</span>
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

// ---------- Marker spotlight: chart + trajectory verdict + actions ----------

function MarkerSpotlight({ marker }: { marker: BloodMarker }) {
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

 const Icon = iconFor(marker.cat);

 // Y domain + ticks (nice rounded numbers)
 const nums = data.map((d) => d.value as number).filter((n) => typeof n === "number");
 const { domain, ticks } = niceDomain(nums, marker.low, marker.high);
 const yFmt = (v: number) => formatNumber(v);

 return (
 <div className="space-y-4">
 {/* Header row */}
 <Card className="overflow-hidden border-stone-200">
 <CardContent className="p-5">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
 <Icon className="h-3.5 w-3.5" /> {marker.cat}
 </div>
 <h2 className="mt-1 font-serif text-3xl text-stone-900">{marker.name}</h2>
 <p className="mt-1 text-sm text-stone-600">{diag.desc}</p>
 </div>
 <div className="flex flex-col items-end text-right">
 <div className="font-serif text-4xl text-stone-900">{formatValue(lv.value, "")}</div>
 <div className="text-xs text-stone-500">{marker.unit || ""} · {DATES[lv.dateIdx] || ","}</div>
 </div>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", statusStyle.bg, statusStyle.text, statusStyle.border)}>
 <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
 {statusStyle.label}
 </span>
 <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", trajStyle.bg, trajStyle.text)}>
 <TrajIcon className="h-3 w-3" /> {trajStyle.label}
 </span>
 {marker.ref && (
 <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
 Reference {marker.ref} {marker.unit}
 </span>
 )}
 {deltaStr && (
 <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-600">
 vs prior: {deltaStr}
 </span>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Chart */}
 <Card className="border-stone-200">
 <CardHeader className="pb-2">
 <CardTitle className="flex items-center gap-2 font-serif text-lg">
 <TrendingUp className="h-4 w-4" /> Evolution
 </CardTitle>
 <CardDescription>
 {data.length} measurement{data.length === 1 ? "" : "s"} on record. Shaded band shows the normal range.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-[260px] w-full">
 <ResponsiveContainer>
 <ComposedChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
 <defs>
 <linearGradient id="markerFill" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#0f172a" stopOpacity={0.15} />
 <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
 <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
 <YAxis domain={domain} ticks={ticks} tickFormatter={yFmt} tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} width={52} />
 {marker.low !== null && marker.high !== null && (
 <ReferenceArea y1={marker.low} y2={marker.high} fill="#10b981" fillOpacity={0.07} stroke="none" />
 )}
 {marker.low !== null && (
 <ReferenceLine y={marker.low} stroke="#a8a29e" strokeDasharray="4 4" label={{ value: "min", position: "right", fontSize: 10, fill: "#a8a29e" }} />
 )}
 {marker.high !== null && (
 <ReferenceLine y={marker.high} stroke="#a8a29e" strokeDasharray="4 4" label={{ value: "max", position: "right", fontSize: 10, fill: "#a8a29e" }} />
 )}
 <Area type="monotone" dataKey="value" stroke="none" fill="url(#markerFill)" />
 <Line
 type="monotone"
 dataKey="value"
 stroke="#0f172a"
 strokeWidth={2}
 dot={{ r: 4, fill: "#0f172a" }}
 activeDot={{ r: 6 }}
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

 {/* Two columns on desktop: meaning + actions */}
 <div className="grid gap-4 md:grid-cols-2">
 <Card className="border-stone-200">
 <CardHeader className="pb-2">
 <CardTitle className="flex items-center gap-2 font-serif text-lg">
 <Info className="h-4 w-4" /> What this means
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-sm text-stone-700">
 <p><span className="font-medium text-stone-900">Why we measure it.</span> {diag.why}</p>
 <p><span className="font-medium text-stone-900">Your latest reading.</span> {whatItMeans}</p>
 <p><span className="font-medium text-stone-900">Trajectory.</span> {traj.reason}</p>
 {diag.context && <p className="text-stone-600"><span className="font-medium text-stone-800">Context.</span> {diag.context}</p>}
 {marker.notes && (
 <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-900">Lab note: {marker.notes}</div>
 )}
 </CardContent>
 </Card>

 <Card className={cn("border", status === "normal" ? "border-emerald-200 bg-emerald-50/30" : status === "high" ? "border-rose-200 bg-rose-50/30" : status === "low" ? "border-amber-200 bg-amber-50/30" : "border-stone-200")}>
 <CardHeader className="pb-2">
 <CardTitle className="flex items-center gap-2 font-serif text-lg">
 {status === "normal" ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
 {status === "high" ? "Actions to bring this down" : status === "low" ? "Actions to bring this up" : status === "normal" ? "Keep it here" : "Suggested next steps"}
 </CardTitle>
 <CardDescription>
 Reference only, not medical advice. Discuss persistent findings with your physician.
 </CardDescription>
 </CardHeader>
 <CardContent>
 <ul className="space-y-2">
 {actions.map((a, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-stone-800">
 <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-900" />
 <span>{a}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}

// ---------- Overview ----------

function Overview({ onFocus, setSection }: { onFocus: (m: BloodMarker) => void; setSection: (s: Section) => void }) {
 const counts = countAbnormal();
 const attention = attentionList();

 // Default spotlight: first in attention list, or HbA1c, or first marker
 const defaultMarker =
 (attention[0] && attention[0].m) ||
 BLOOD_MARKERS.find((m) => m.name === "HbA1c") ||
 BLOOD_MARKERS[0];

 const [focus, setFocus] = useState<BloodMarker>(defaultMarker);

 return (
 <div className="space-y-6">
 {/* Hero KPIs */}
 <div>
 <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">Good morning, Jimmy.</h1>
 <p className="mt-1 text-sm text-stone-600">
 {DATES.length} lab visits on record. Latest results from {DATES[DATES.length - 1]}.
 </p>
 </div>

 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <Kpi label="Markers tracked" value={`${BLOOD_MARKERS.length}`} tone="muted" sub={`${CATEGORIES.length} categories`} />
 <Kpi label="In range" value={`${counts.total - counts.high - counts.low}`} tone="normal" sub={`of ${counts.total} latest`} />
 <Kpi label="High" value={`${counts.high}`} tone={counts.high ? "bad" : "muted"} sub="above reference" />
 <Kpi label="Low" value={`${counts.low}`} tone={counts.low ? "warn" : "muted"} sub="below reference" />
 </div>

 {/* Marker Spotlight */}
 <section className="space-y-3">
 <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <h2 className="font-serif text-2xl text-stone-900">Marker spotlight</h2>
 <p className="text-sm text-stone-600">Pick any marker to see its history and what to do about it.</p>
 </div>
 <MarkerPicker value={focus} onChange={(m) => { setFocus(m); onFocus(m); }} />
 </div>
 <MarkerSpotlight marker={focus} />
 </section>

 {/* Needs attention list */}
 {attention.length > 0 && (
 <section>
 <div className="mb-2 flex items-end justify-between">
 <div>
 <h2 className="font-serif text-2xl text-stone-900">Needs attention</h2>
 <p className="text-sm text-stone-600">{attention.length} marker{attention.length === 1 ? "" : "s"} outside the reference range right now.</p>
 </div>
 </div>
 <Card className="border-stone-200">
 <CardContent className="p-0">
 <ul className="divide-y divide-stone-100">
 {attention.map((a) => {
 const Icon = iconFor(a.m.cat);
 const ss = STATUS_STYLES[a.status];
 return (
 <li key={a.m.name}>
 <button
 onClick={() => setFocus(a.m)}
 className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
 >
 <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", ss.bg, ss.border)}>
 <Icon className={cn("h-4 w-4", ss.text)} />
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <div className="truncate font-medium text-stone-900">{a.m.name}</div>
 <Badge variant="outline" className={cn("shrink-0 border-stone-200 text-[10px]", ss.text)}>{ss.label}</Badge>
 </div>
 <div className="truncate text-xs text-stone-500">{a.m.cat} · Reference {a.m.ref} {a.m.unit}</div>
 </div>
 <div className="text-right">
 <div className="font-medium text-stone-900">{formatValue(a.value, a.m.unit)}</div>
 <div className="text-[11px] text-stone-500">{Math.round(a.sev * 100)}% off range</div>
 </div>
 <ArrowRight className="ml-1 h-4 w-4 text-stone-400" />
 </button>
 </li>
 );
 })}
 </ul>
 </CardContent>
 </Card>
 </section>
 )}

 {/* Quick access rows */}
 <section>
 <h2 className="mb-2 font-serif text-2xl text-stone-900">Browse records</h2>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
 {[
 { id: "blood", label: "Blood labs", count: `${BLOOD_MARKERS.length} markers`, icon: Droplets },
 { id: "urine", label: "Urinalysis", count: `${URINALYSIS.length} parameters`, icon: FlaskConical },
 { id: "imaging", label: "Imaging", count: `${IMAGING.length} studies`, icon: Activity },
 { id: "pathology", label: "Pathology", count: `${PATHOLOGY.length} report${PATHOLOGY.length === 1 ? "" : "s"}`, icon: Stethoscope },
 { id: "semen", label: "Fertility", count: "Semen analysis", icon: Sparkles },
 { id: "reports", label: "Reports", count: `${SOURCES.length} sources`, icon: FileText },
 ].map((q) => {
 const Icon = q.icon;
 return (
 <button
 key={q.id}
 onClick={() => setSection(q.id as Section)}
 className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-3 text-left hover:border-stone-300 hover:bg-stone-50"
 >
 <Icon className="h-4 w-4 text-stone-700" />
 <div className="text-sm font-medium text-stone-900">{q.label}</div>
 <div className="text-xs text-stone-500">{q.count}</div>
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
 const [q, setQ] = useState("");

 const grouped = useMemo(() => {
 const qq = q.trim().toLowerCase();
 const filtered = qq
 ? BLOOD_MARKERS.filter((m) => m.name.toLowerCase().includes(qq) || m.cat.toLowerCase().includes(qq))
 : BLOOD_MARKERS;
 const byCat: Record<string, BloodMarker[]> = {};
 for (const m of filtered) {
 byCat[m.cat] = byCat[m.cat] || [];
 byCat[m.cat].push(m);
 }
 return byCat;
 }, [q]);

 return (
 <div className="space-y-4">
 <div>
 <h1 className="font-serif text-3xl text-stone-900">Blood labs</h1>
 <p className="mt-1 text-sm text-stone-600">{BLOOD_MARKERS.length} markers across {CATEGORIES.length} categories.</p>
 </div>

 <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
 {/* Marker list */}
 <div className="space-y-2">
 <div className="sticky top-16 space-y-2">
 <Input placeholder="Search markers..." value={q} onChange={(e) => setQ(e.target.value)} />
 <Card className="border-stone-200">
 <ScrollArea className="h-[520px]">
 <div className="p-1">
 {Object.entries(grouped).map(([cat, items]) => (
 <div key={cat} className="mb-1">
 <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">{cat}</div>
 {items.map((m) => {
 const lv = latestValue(m);
 const s = statusOf(m, lv.value);
 const active = m.name === marker.name;
 return (
 <button
 key={m.name}
 onClick={() => setMarker(m)}
 className={cn(
 "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
 active ? "bg-stone-900 text-stone-50" : "text-stone-700 hover:bg-stone-100"
 )}
 >
 <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_STYLES[s].dot)} />
 <span className="flex-1 truncate">{m.name}</span>
 <span className={cn("text-xs", active ? "text-stone-300" : "text-stone-500")}>
 {formatValue(lv.value, "")}
 </span>
 </button>
 );
 })}
 </div>
 ))}
 </div>
 </ScrollArea>
 </Card>
 </div>
 </div>

 {/* Spotlight */}
 <MarkerSpotlight marker={marker} />
 </div>
 </div>
 );
}

// ---------- Urinalysis view ----------

function UrineView() {
 return (
 <div className="space-y-4">
 <div>
 <h1 className="font-serif text-3xl text-stone-900">Urinalysis</h1>
 <p className="mt-1 text-sm text-stone-600">{URINALYSIS.length} parameters across {URINALYSIS_DATES.length} dates.</p>
 </div>
 <Card className="overflow-hidden border-stone-200">
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-stone-50">
 <TableRow>
 <TableHead className="min-w-[160px]">Parameter</TableHead>
 <TableHead>Reference</TableHead>
 {URINALYSIS_DATES.map((d, i) => (
 <TableHead key={d} className="min-w-[120px]">
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
 <div className="space-y-4">
 <h1 className="font-serif text-3xl text-stone-900">Imaging</h1>
 <div className="grid gap-4 md:grid-cols-2">
 {IMAGING.map((img) => (
 <Card key={img.date + img.study} className="border-stone-200">
 <CardHeader>
 <div className="flex items-start justify-between gap-3">
 <div>
 <CardTitle className="font-serif text-xl">{img.study}</CardTitle>
 <CardDescription>{img.date} · {img.facility}</CardDescription>
 </div>
 <Badge variant="outline" className="shrink-0 border-stone-200 text-xs">{img.physician}</Badge>
 </div>
 </CardHeader>
 <CardContent className="space-y-3 text-sm text-stone-700">
 <div>
 <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Findings</div>
 <p>{img.findings}</p>
 </div>
 <Separator />
 <div>
 <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Impression</div>
 <p className="font-medium text-stone-900">{img.impression}</p>
 </div>
 <div className="text-[11px] text-stone-500">Source: {img.source}</div>
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
 <div className="space-y-4">
 <h1 className="font-serif text-3xl text-stone-900">Pathology</h1>
 <div className="grid gap-4 md:grid-cols-2">
 {PATHOLOGY.map((p) => (
 <Card key={p.date + p.specimen} className="border-stone-200">
 <CardHeader>
 <CardTitle className="font-serif text-xl">{p.specimen}</CardTitle>
 <CardDescription>{p.date} · {p.facility}</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3 text-sm text-stone-700">
 <div>
 <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Clinical</div>
 <p>{p.clinical}</p>
 </div>
 <div>
 <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Findings</div>
 <p>{p.findings}</p>
 </div>
 <Separator />
 <div>
 <div className="text-xs font-medium uppercase tracking-wider text-stone-500">Diagnosis</div>
 <p className="font-medium text-stone-900">{p.diagnosis}</p>
 </div>
 <div className="text-[11px] text-stone-500">Source: {p.source}</div>
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
 <div className="space-y-4">
 <div>
 <h1 className="font-serif text-3xl text-stone-900">Fertility · Semen analysis</h1>
 <p className="mt-1 text-sm text-stone-600">{OTHER_META.semenDate} · {OTHER_META.semenLab}</p>
 </div>
 <Card className="border-emerald-200 bg-emerald-50/40">
 <CardContent className="p-4 text-sm text-emerald-900">
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
 <div className="space-y-4">
 <div>
 <h1 className="font-serif text-3xl text-stone-900">Source reports</h1>
 <p className="mt-1 text-sm text-stone-600">{SOURCES.length} reports on file across {new Set(SOURCES.map((s) => s.lab)).size} labs and facilities.</p>
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

 return (
 <div className="min-h-screen bg-stone-50 text-stone-900">
 <TopBar section={section} setSection={setSection} />
 <main className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6">
 {section === "overview" && <Overview onFocus={(m) => { setFocusMarker(m); }} setSection={setSection} />}
 {section === "blood" && <BloodView initial={focusMarker} />}
 {section === "urine" && <UrineView />}
 {section === "imaging" && <ImagingView />}
 {section === "pathology" && <PathologyView />}
 {section === "semen" && <SemenView />}
 {section === "reports" && <ReportsView />}
 </main>
 <footer className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-[11px] text-stone-500 sm:px-6">
 Personal health record · Reference information only, not medical advice.
 </footer>
 </div>
 );
}
