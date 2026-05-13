import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  Filter,
  Gauge,
  Globe2,
  Info,
  Landmark,
  MapPinned,
  PlugZap,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import projects from "./data/projects.json";
import signals from "./data/signals.json";

const REVIEWED_DATE = "May 13, 2026";

const scoreKeys = [
  { key: "infrastructureReadiness", label: "Infrastructure readiness", icon: Building2, direction: "higher = more prepared" },
  { key: "powerDemandComplexity", label: "Power complexity", icon: Zap, direction: "higher = more planning needed" },
  { key: "waterPlanningStrength", label: "Water planning", icon: Waves, direction: "higher = stronger public planning" },
  { key: "economicUpside", label: "Economic upside", icon: Activity, direction: "higher = more visible upside" },
  { key: "communitySensitivity", label: "Community sensitivity", icon: Users, direction: "higher = more public sensitivity" },
  { key: "transparency", label: "Transparency", icon: ShieldCheck, direction: "higher = more public detail" },
  { key: "policyMomentum", label: "Policy momentum", icon: Landmark, direction: "higher = more active policy movement" },
];

const categoryMeta = {
  "Proposed data center campus": { short: "Campus", icon: Building2 },
  "Mixed-use innovation district with data-center restrictions": { short: "Mixed-use", icon: Landmark },
  "Regulatory / utility planning": { short: "Utility", icon: PlugZap },
  "Local regulation": { short: "Rules", icon: SlidersHorizontal },
  "Market / capacity signal": { short: "Market", icon: BarChart3 },
  "Local zoning / legal pressure": { short: "Zoning", icon: Landmark },
  "Council decision / precedent": { short: "Decision", icon: CheckCircle2 },
  "Water policy / project signal": { short: "Water", icon: Waves },
};

function cls(...items) {
  return items.filter(Boolean).join(" ");
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function planningComplexity(project) {
  return clamp(
    project.powerDemandComplexity * 0.28 +
      project.communitySensitivity * 0.22 +
      project.policyMomentum * 0.18 +
      (100 - project.infrastructureReadiness) * 0.12 +
      (100 - project.waterPlanningStrength) * 0.12 +
      (100 - project.transparency) * 0.08
  );
}

function balancedOpportunity(project) {
  return clamp(
    project.economicUpside * 0.32 +
      project.infrastructureReadiness * 0.22 +
      project.transparency * 0.18 +
      project.waterPlanningStrength * 0.12 +
      project.policyMomentum * 0.1 +
      (100 - project.communitySensitivity) * 0.06
  );
}

function planningLabel(score) {
  if (score >= 85) return "High planning load";
  if (score >= 70) return "Complex";
  if (score >= 50) return "Moderate";
  return "Lower complexity";
}

function sourceGradeLabel(grade) {
  return {
    A: "Gov / utility document",
    B: "Reporting / official release",
    C: "Local material",
    D: "Community claim",
    E: "Needs verification",
  }[grade] || "Source grade";
}

function exportFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildCsv(rows) {
  const headers = [
    "name",
    "city",
    "county",
    "status",
    "category",
    "planningComplexity",
    "balancedOpportunity",
    "infrastructureReadiness",
    "powerDemandComplexity",
    "waterPlanningStrength",
    "economicUpside",
    "communitySensitivity",
    "transparency",
    "policyMomentum",
    "sourceGrade",
    "lastUpdated",
  ];
  const safe = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          if (header === "planningComplexity") return planningComplexity(row);
          if (header === "balancedOpportunity") return balancedOpportunity(row);
          return safe(row[header]);
        })
        .join(",")
    ),
  ].join("\n");
}

function MetricCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Pill({ children, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20"
          : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/70 hover:text-cyan-200"
      )}
    >
      {children}
    </button>
  );
}

function ScoreBar({ label, value, note }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-300">{label}</span>
          {note && <p className="mt-0.5 text-[10px] text-slate-500">{note}</p>}
        </div>
        <span className="font-mono text-slate-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function ArizonaMap({ items, selected, onSelect }) {
  const slots = [
    { x: 24, y: 42, label: "West Valley" },
    { x: 49, y: 22, label: "North Phoenix" },
    { x: 62, y: 42, label: "State policy" },
    { x: 55, y: 82, label: "Tucson" },
    { x: 36, y: 56, label: "Statewide" },
    { x: 46, y: 39, label: "Phoenix" },
    { x: 68, y: 57, label: "Chandler" },
    { x: 38, y: 77, label: "Pima County" },
    { x: 80, y: 31, label: "Mesa / East" },
    { x: 17, y: 63, label: "Far West" },
  ];

  const pins = items.map((item, index) => ({ item, index, ...(slots[index] || { x: 50, y: 50 + index * 3, label: item.city }) }));

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_70%_78%,rgba(99,102,241,0.16),transparent_35%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.17)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Arizona command map</p>
          <h2 className="mt-1 text-xl font-semibold text-white">AI infrastructure watch zones</h2>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200">
          Deconflicted pins
        </div>
      </div>

      <div className="relative h-[520px]">
        <div className="pointer-events-none absolute left-[19%] top-[12%] h-[78%] w-[54%] rounded-[42%_35%_46%_50%] border border-slate-700/70 bg-slate-900/50 shadow-inner shadow-black/50" />
        <div className="pointer-events-none absolute left-[28%] top-[18%] rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-100">
          Maricopa County / Phoenix metro
        </div>
        <div className="pointer-events-none absolute left-[44%] bottom-[12%] rounded-full border border-indigo-400/20 bg-indigo-400/5 px-4 py-2 text-xs text-indigo-100">
          Southern Arizona / Tucson
        </div>

        {pins.map((pin) => {
          const complexity = planningComplexity(pin.item);
          const active = selected?.id === pin.item.id;
          const meta = categoryMeta[pin.item.category] || { short: "Signal", icon: MapPinned };
          const Icon = meta.icon;
          const labelSide = pin.x > 60 ? "right-full mr-3 text-right" : "left-full ml-3 text-left";
          return (
            <button
              key={pin.item.id}
              onClick={() => onSelect(pin.item)}
              className="group absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, zIndex: active ? 50 : 20 + pin.index }}
              title={pin.item.name}
            >
              <span className={cls("absolute h-16 w-16 rounded-full transition", active ? "bg-cyan-300/20 ring-4 ring-cyan-300/25" : complexity >= 85 ? "bg-rose-400/10 ring-2 ring-rose-300/25 group-hover:ring-4" : complexity >= 70 ? "bg-amber-400/10 ring-2 ring-amber-300/25 group-hover:ring-4" : "bg-cyan-400/10 ring-2 ring-cyan-300/20 group-hover:ring-4")} />
              <span className={cls("relative flex h-12 w-12 items-center justify-center rounded-full border shadow-xl transition group-hover:scale-110", active ? "scale-110 border-cyan-100 bg-cyan-300 text-slate-950 shadow-cyan-300/30" : complexity >= 85 ? "border-rose-300/80 bg-rose-500/25 text-rose-50 shadow-rose-500/20" : complexity >= 70 ? "border-amber-300/80 bg-amber-500/20 text-amber-50 shadow-amber-500/20" : "border-cyan-300/70 bg-cyan-500/20 text-cyan-50 shadow-cyan-500/20")}>
                <Icon size={19} />
              </span>
              <span className={cls("pointer-events-none absolute hidden w-40 rounded-xl border border-slate-700 bg-slate-950/95 px-2.5 py-1.5 text-[10px] leading-4 text-slate-200 shadow-xl backdrop-blur md:block", labelSide)}>
                <span className="block font-semibold text-cyan-100">{pin.item.name}</span>
                <span className="block text-slate-400">{planningLabel(complexity)} • {complexity}</span>
              </span>
            </button>
          );
        })}

        <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-700/70 bg-slate-950/75 p-3 text-xs leading-5 text-slate-400 backdrop-blur">
          <span className="font-semibold text-cyan-200">Neutral map:</span> pins are spaced by watch zone, not exact parcel boundaries.
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ item, selected, onSelect }) {
  const complexity = planningComplexity(item);
  const opportunity = balancedOpportunity(item);
  const meta = categoryMeta[item.category] || { short: "Signal", icon: MapPinned };
  const Icon = meta.icon;
  return (
    <motion.button
      layout
      onClick={() => onSelect(item)}
      className={cls(
        "group w-full rounded-3xl border p-4 text-left transition",
        selected?.id === item.id ? "border-cyan-300 bg-cyan-950/30 shadow-2xl shadow-cyan-900/30" : "border-slate-800 bg-slate-950/70 hover:border-cyan-500/60 hover:bg-slate-900/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-cyan-300"><Icon size={18} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] uppercase tracking-widest text-slate-400">{meta.short}</span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400">Grade {item.sourceGrade}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold leading-snug text-white group-hover:text-cyan-100">{item.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{item.region}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cls("rounded-2xl px-3 py-2 font-mono text-sm font-bold", complexity >= 85 ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30" : complexity >= 70 ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30" : "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30")}>{complexity}</div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">Planning</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">{item.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-slate-300">Opportunity <span className="float-right font-mono text-cyan-200">{opportunity}</span></div>
        <div className="rounded-xl bg-slate-900 px-3 py-2 text-slate-300">Transparency <span className="float-right font-mono text-cyan-200">{item.transparency}</span></div>
      </div>
    </motion.button>
  );
}

function SelectedPanel({ selected }) {
  if (!selected) return null;
  const complexity = planningComplexity(selected);
  const opportunity = balancedOpportunity(selected);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/30"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Selected record</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-white">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{selected.status}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-3xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-3"><p className="font-mono text-2xl font-black text-cyan-100">{complexity}</p><p className="text-[10px] uppercase tracking-widest text-cyan-300">Planning</p></div>
            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-3"><p className="font-mono text-2xl font-black text-emerald-100">{opportunity}</p><p className="text-[10px] uppercase tracking-widest text-emerald-300">Upside</p></div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{selected.summary}</p>

        <div className="mt-5 space-y-3">
          {scoreKeys.map((s) => <ScoreBar key={s.key} label={s.label} value={selected[s.key]} note={s.direction} />)}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs uppercase tracking-widest text-slate-500">City / county</p><p className="mt-1 text-sm font-medium text-white">{selected.city} / {selected.county}</p></div>
          <div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-xs uppercase tracking-widest text-slate-500">Source grade</p><p className="mt-1 text-sm font-medium text-white">{selected.sourceGrade} — {sourceGradeLabel(selected.sourceGrade)}</p></div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-xs uppercase tracking-widest text-slate-500">Public facts</p><ul className="mt-2 space-y-2 text-xs leading-5 text-slate-300">{selected.publicFacts.map((f) => <li key={f}>• {f}</li>)}</ul></div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"><p className="text-xs uppercase tracking-widest text-emerald-300">Benefits claimed</p><ul className="mt-2 space-y-2 text-xs leading-5 text-emerald-50/80">{selected.benefitsClaimed.map((f) => <li key={f}>• {f}</li>)}</ul></div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="text-xs uppercase tracking-widest text-amber-300">Concerns raised</p><ul className="mt-2 space-y-2 text-xs leading-5 text-amber-50/80">{selected.concernsRaised.map((f) => <li key={f}>• {f}</li>)}</ul></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selected.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">{tag}</span>)}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selected.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20">{source.label} <ExternalLink size={15} /></a>)}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MethodologyPanel() {
  const constraints = [
    "No single good/bad project score",
    "No unsourced claims",
    "No guessing exact water or power usage unless sourced",
    "Separate developer benefits from community concerns",
    "Separate public concerns from verified engineering facts",
    "Show source grade and last-updated date",
    "Use reported/proposed/estimated language when appropriate",
    "Make formulas visible enough to challenge",
  ];
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/20">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Methodology</p>
      <h2 className="mt-1 text-2xl font-bold text-white">Built to stay neutral</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">The dashboard avoids endorsement language and uses separate dimensions so users can see tradeoffs instead of one biased verdict.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {constraints.map((item) => <div key={item} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300"><CheckCircle2 className="mb-2 text-cyan-300" size={18} />{item}</div>)}
      </div>
    </div>
  );
}

function LinkedInPanel() {
  const post = `Arizona is becoming a major AI infrastructure market, but data centers are not just a tech story.

They also involve power planning, water strategy, zoning, jobs, construction, utilities, and community response.

I built an Arizona AI Infrastructure Tracker to follow data center projects across the state in a neutral, OSINT-style way.

The goal is not to argue for or against data centers.

The goal is to make the tradeoffs easier to see:

• Where projects are being proposed
• What stage they are in
• How power planning is being discussed
• What water/cooling information is public
• What jobs or economic benefits are being claimed
• What concerns local communities are raising
• How much public information is actually available

Question for people in Arizona, tech, utilities, real estate, or public policy:

What should a tracker like this include to be genuinely useful and fair?

#Arizona #Phoenix #DataCenters #AIInfrastructure #CloudInfrastructure #PowerGrid #WaterStrategy #EconomicDevelopment #SupplyChain #OSINT #OpenSourceIntelligence #Infrastructure #Utilities #RealEstateDevelopment #TechJobs #PublicPolicy #DataVisualization #ReactJS #GitHub`;
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-cyan-950/20">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">LinkedIn-ready</p><h2 className="mt-1 text-xl font-semibold text-white">Copy-ready launch post</h2></div><button onClick={() => navigator.clipboard?.writeText(post)} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20">Copy post</button></div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-800 bg-black/30 p-4 text-sm leading-6 text-slate-300">{post}</pre>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [grade, setGrade] = useState("All");
  const [selected, setSelected] = useState(projects[0]);
  const [view, setView] = useState("Command Center");
  const [sortBy, setSortBy] = useState("planning");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const grades = ["All", ...Array.from(new Set(projects.map((p) => p.sourceGrade))).sort()];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = projects
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => grade === "All" || p.sourceGrade === grade)
      .filter((p) => {
        if (!q) return true;
        return [p.name, p.city, p.county, p.region, p.status, p.category, p.summary, p.tags.join(" ")].join(" ").toLowerCase().includes(q);
      });
    return rows.sort((a, b) => {
      if (sortBy === "opportunity") return balancedOpportunity(b) - balancedOpportunity(a);
      if (sortBy === "transparency") return b.transparency - a.transparency;
      if (sortBy === "water") return b.waterPlanningStrength - a.waterPlanningStrength;
      if (sortBy === "community") return b.communitySensitivity - a.communitySensitivity;
      return planningComplexity(b) - planningComplexity(a);
    });
  }, [query, category, grade, sortBy]);

  const metrics = useMemo(() => {
    const avg = (fn) => Math.round(filtered.reduce((sum, item) => sum + fn(item), 0) / Math.max(filtered.length, 1));
    return {
      planning: avg(planningComplexity),
      opportunity: avg(balancedOpportunity),
      transparency: avg((p) => p.transparency),
      community: avg((p) => p.communitySensitivity),
    };
  }, [filtered]);

  const chartRows = filtered.map((p) => ({ name: p.name.split(" /")[0].slice(0, 16), planning: planningComplexity(p), opportunity: balancedOpportunity(p), transparency: p.transparency }));
  const trendRows = signals.map((s) => ({ date: s.date.slice(5), score: s.score, type: s.type }));

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,.20),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,.20),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(20,184,166,.10),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200"><MapPinned size={14} /> Arizona Infrastructure OSINT</span><span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">Last reviewed: {REVIEWED_DATE}</span></div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">Arizona AI Infrastructure Tracker</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">A neutral dashboard tracking Arizona data centers, power planning, water strategy, zoning activity, economic upside, community response, and public transparency.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]"><MetricCard label="Planning" value={metrics.planning} icon={Gauge} sub="avg complexity" /><MetricCard label="Opportunity" value={metrics.opportunity} icon={Activity} sub="avg upside" /><MetricCard label="Transparency" value={metrics.transparency} icon={ShieldCheck} sub="avg detail" /><MetricCard label="Community" value={metrics.community} icon={Users} sub="avg sensitivity" /></div>
          </div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"><Search size={18} className="text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, project, source, concern, or infrastructure signal..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></div><div className="flex flex-wrap gap-2">{["Command Center", "Scores", "Signals", "Methodology", "LinkedIn Post"].map((v) => <Pill key={v} active={view === v} onClick={() => setView(v)}>{v}</Pill>)}</div></div>
          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500"><Filter size={14} /> Category</div><div className="flex flex-wrap gap-2">{categories.map((v) => <Pill key={v} active={category === v} onClick={() => setCategory(v)}>{v === "All" ? "All records" : (categoryMeta[v]?.short || v)}</Pill>)}</div></div>
          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500"><ArrowUpDown size={14} /> Sort / grade</div><div className="flex flex-wrap gap-2">{[["planning","Planning"],["opportunity","Opportunity"],["transparency","Transparency"],["water","Water"],["community","Community"]].map(([k,l]) => <Pill key={k} active={sortBy===k} onClick={() => setSortBy(k)}>{l}</Pill>)}{grades.map((g) => <Pill key={g} active={grade===g} onClick={() => setGrade(g)}>{g === "All" ? "All grades" : `Grade ${g}`}</Pill>)}</div></div>
        </section>

        {view === "Command Center" && <main className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]"><div className="space-y-5"><ArizonaMap items={filtered} selected={selected} onSelect={setSelected} /><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Balanced view</p><h2 className="mt-1 text-xl font-semibold text-white">Planning vs. opportunity</h2></div><BarChart3 className="text-cyan-300" /></div><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} /><Bar dataKey="planning" radius={[8,8,0,0]}>{chartRows.map((_, idx) => <Cell key={idx} fill="currentColor" className="text-cyan-400" />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Executive summary</p><h2 className="mt-1 text-xl font-semibold text-white">What this tracker watches</h2></div><RefreshCcw className="text-cyan-300" /></div><div className="mt-5 space-y-4"><div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-sm font-semibold text-white">Power planning</p><p className="mt-1 text-sm leading-6 text-slate-400">Large-load growth, utility planning, interconnection, on-site generation, and ratepayer-cost concerns.</p></div><div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-sm font-semibold text-white">Water strategy</p><p className="mt-1 text-sm leading-6 text-slate-400">Cooling method, water disclosure, conservation planning, reuse, drought sensitivity, and local ordinances.</p></div><div className="rounded-2xl bg-slate-900/80 p-4"><p className="text-sm font-semibold text-white">Public transparency</p><p className="mt-1 text-sm leading-6 text-slate-400">What is public, what is claimed, what is sourced, and what still needs confirmation.</p></div></div></div></div></div><aside className="space-y-5"><SelectedPanel selected={selected} /><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-4"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Ranked project feed</h2><span className="text-xs text-slate-500">{filtered.length} records</span></div><div className="max-h-[650px] space-y-3 overflow-auto pr-1">{filtered.map((item) => <ProjectCard key={item.id} item={item} selected={selected} onSelect={setSelected} />)}</div></div></aside></main>}

        {view === "Scores" && <main className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Scoring dimensions</p><h2 className="mt-1 text-2xl font-bold text-white">No single good/bad score</h2><p className="mt-3 text-sm leading-7 text-slate-400">Each score measures a different tradeoff. This avoids hiding jobs, tax base, resource planning, local concern, and transparency inside one biased number.</p><div className="mt-5 space-y-3">{scoreKeys.map((s) => <div key={s.key} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center gap-2"><s.icon className="text-cyan-300" size={18} /><h3 className="font-semibold text-white">{s.label}</h3></div><p className="mt-2 text-sm text-slate-400">{s.direction}</p></div>)}</div></div><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Exportable data</p><h2 className="mt-1 text-2xl font-bold text-white">Filtered dataset</h2><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => exportFile("arizona-ai-infrastructure-tracker.json", JSON.stringify(filtered, null, 2), "application/json")} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/20"><Download size={16} /> Export JSON</button><button onClick={() => exportFile("arizona-ai-infrastructure-tracker.csv", buildCsv(filtered), "text/csv")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-400/50"><Download size={16} /> Export CSV</button></div><div className="mt-5 overflow-hidden rounded-2xl border border-slate-800"><div className="max-h-[620px] overflow-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Planning</th><th className="px-4 py-3">Upside</th><th className="px-4 py-3">Water</th><th className="px-4 py-3">Transparency</th><th className="px-4 py-3">Grade</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{filtered.map((p) => <tr key={p.id} className="hover:bg-slate-900/70"><td className="px-4 py-3"><p className="font-medium text-white">{p.name}</p><p className="mt-1 text-xs text-slate-500">{p.status}</p></td><td className="px-4 py-3 text-xs text-slate-300">{p.city}</td><td className="px-4 py-3 font-mono font-bold text-cyan-200">{planningComplexity(p)}</td><td className="px-4 py-3 font-mono font-bold text-emerald-200">{balancedOpportunity(p)}</td><td className="px-4 py-3 font-mono text-slate-300">{p.waterPlanningStrength}</td><td className="px-4 py-3 font-mono text-slate-300">{p.transparency}</td><td className="px-4 py-3 text-xs text-slate-300">{p.sourceGrade}</td></tr>)}</tbody></table></div></div></div></main>}

        {view === "Signals" && <main className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Signal velocity</p><h2 className="mt-1 text-2xl font-bold text-white">Recent policy and market signals</h2><div className="mt-6 h-[420px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendRows} margin={{ left: -20, right: 20, top: 20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" /><XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} /><Line type="monotone" dataKey="score" stroke="currentColor" className="text-cyan-300" strokeWidth={3} dot={{ r: 5 }} /></LineChart></ResponsiveContainer></div></div><div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Watchlist</p><h2 className="mt-1 text-2xl font-bold text-white">Current signal feed</h2><div className="mt-5 space-y-4">{signals.map((s) => <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-widest text-cyan-300">{s.type}</p><span className="rounded-full bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-200">{s.score}</span></div><h3 className="mt-2 font-semibold text-white">{s.headline}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{s.summary}</p><p className="mt-2 text-xs text-slate-500">Impact: {s.impact}</p></div>)}</div></div></main>}

        {view === "Methodology" && <main className="mt-5"><MethodologyPanel /></main>}
        {view === "LinkedIn Post" && <main className="mt-5"><LinkedInPanel /></main>}

        <footer className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-950/70 p-5 text-sm leading-6 text-slate-400"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2"><Info size={16} className="text-cyan-300" />Public-information prototype. It does not endorse or oppose any project.</div><div className="flex items-center gap-2 text-slate-500"><Globe2 size={16} /> Arizona • data centers • power • water • jobs • public transparency</div></div></footer>
      </div>
    </div>
  );
}
