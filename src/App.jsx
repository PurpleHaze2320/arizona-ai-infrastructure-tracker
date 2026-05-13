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
    <div className="rounded-2xl border border-stone-800 bg-stone-950/75 p-4 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
        </div>
        <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-3 text-orange-300">
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
          ? "border-orange-300 bg-orange-300 text-stone-950 shadow-lg shadow-orange-500/20"
          : "border-stone-700 bg-stone-950/70 text-stone-300 hover:border-orange-400/70 hover:text-orange-200"
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
          <span className="text-stone-300">{label}</span>
          {note && <p className="mt-0.5 text-[10px] text-stone-500">{note}</p>}
        </div>
        <span className="font-mono text-stone-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function ArizonaMap({ items, selected, onSelect }) {
  /*
    Region-board layout:
    This avoids clustered map circles and makes the tracker feel more like an Arizona
    infrastructure watchboard than the Pacific seabed command map.
  */
  const regionRules = [
    {
      id: "phoenix-metro",
      title: "Phoenix Metro / North Valley",
      subtitle: "TSMC corridor, zoning pressure, metro policy",
      accent: "orange",
      test: (p) =>
        p.city?.toLowerCase().includes("phoenix") ||
        p.name?.toLowerCase().includes("halo") ||
        p.name?.toLowerCase().includes("phoenix"),
    },
    {
      id: "west-valley",
      title: "West Valley / Maricopa County",
      subtitle: "Large campuses, county review, utility-scale planning",
      accent: "amber",
      test: (p) =>
        p.name?.toLowerCase().includes("baccara") ||
        p.city?.toLowerCase().includes("maricopa") ||
        p.region?.toLowerCase().includes("west valley"),
    },
    {
      id: "tucson-pima",
      title: "Tucson / Pima County",
      subtitle: "Water policy, local rules, southern Arizona signals",
      accent: "emerald",
      test: (p) =>
        p.city?.toLowerCase().includes("tucson") ||
        p.county?.toLowerCase().includes("pima") ||
        p.name?.toLowerCase().includes("pima"),
    },
    {
      id: "east-valley",
      title: "East Valley",
      subtitle: "Chandler, Mesa, precedent decisions",
      accent: "teal",
      test: (p) =>
        p.city?.toLowerCase().includes("chandler") ||
        p.city?.toLowerCase().includes("mesa") ||
        p.region?.toLowerCase().includes("east"),
    },
    {
      id: "statewide-policy",
      title: "Statewide / Utility Policy",
      subtitle: "ACC, grid planning, market and public-policy signals",
      accent: "stone",
      test: (p) =>
        p.category?.toLowerCase().includes("regulatory") ||
        p.category?.toLowerCase().includes("market") ||
        p.name?.toLowerCase().includes("acc") ||
        p.city?.toLowerCase().includes("statewide"),
    },
  ];

  const grouped = useMemo(() => {
    const used = new Set();
    const rows = regionRules.map((region) => {
      const matches = items.filter((item) => {
        if (used.has(item.id)) return false;
        return region.test(item);
      });
      matches.forEach((item) => used.add(item.id));
      return { ...region, items: matches };
    });

    const unmatched = items.filter((item) => !used.has(item.id));
    if (unmatched.length) {
      rows.push({
        id: "other-watchlist",
        title: "Other Arizona Signals",
        subtitle: "Records that do not cleanly map to one region",
        accent: "orange",
        items: unmatched,
      });
    }

    return rows.filter((row) => row.items.length > 0);
  }, [items]);

  const accentClasses = {
    orange: {
      card: "border-orange-400/25 bg-orange-950/10",
      badge: "border-orange-400/35 bg-orange-400/10 text-orange-200",
      chip: "hover:border-orange-300/70 hover:bg-orange-400/10",
      active: "border-orange-300 bg-orange-400/15 shadow-orange-950/30",
    },
    amber: {
      card: "border-amber-400/25 bg-amber-950/10",
      badge: "border-amber-400/35 bg-amber-400/10 text-amber-200",
      chip: "hover:border-amber-300/70 hover:bg-amber-400/10",
      active: "border-amber-300 bg-amber-400/15 shadow-amber-950/30",
    },
    emerald: {
      card: "border-emerald-400/25 bg-emerald-950/10",
      badge: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
      chip: "hover:border-emerald-300/70 hover:bg-emerald-400/10",
      active: "border-emerald-300 bg-emerald-400/15 shadow-emerald-950/30",
    },
    teal: {
      card: "border-teal-400/25 bg-teal-950/10",
      badge: "border-teal-400/35 bg-teal-400/10 text-teal-200",
      chip: "hover:border-teal-300/70 hover:bg-teal-400/10",
      active: "border-teal-300 bg-teal-400/15 shadow-teal-950/30",
    },
    stone: {
      card: "border-stone-500/30 bg-stone-900/30",
      badge: "border-stone-500/40 bg-stone-700/20 text-stone-200",
      chip: "hover:border-stone-300/70 hover:bg-stone-600/10",
      active: "border-stone-300 bg-stone-500/15 shadow-stone-950/30",
    },
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-stone-700/80 bg-stone-950 shadow-2xl shadow-orange-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,106,43,0.20),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(224,164,58,0.14),transparent_32%),radial-gradient(circle_at_56%_88%,rgba(95,125,77,0.16),transparent_38%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(245,235,221,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(245,235,221,.12)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative flex flex-col gap-3 border-b border-stone-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Arizona region board</p>
          <h2 className="mt-1 text-xl font-semibold text-stone-50">AI infrastructure watch zones</h2>
        </div>
        <div className="rounded-2xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-xs font-medium text-orange-200">
          Region cards + project chips
        </div>
      </div>

      <div className="relative p-4">
        <div className="mb-4 rounded-3xl border border-stone-700/70 bg-stone-950/60 p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Map mode</p>
              <p className="mt-1 text-sm leading-6 text-stone-300">
                Records are grouped by Arizona watch zone for readability, not exact parcel boundaries.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-orange-200">power</span>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-200">zoning</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">water</span>
              <span className="rounded-full border border-stone-500/40 bg-stone-700/20 px-3 py-1 text-stone-200">policy</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {grouped.map((region) => {
            const color = accentClasses[region.accent] || accentClasses.orange;
            const avgPlanning = Math.round(
              region.items.reduce((sum, item) => sum + planningComplexity(item), 0) / Math.max(region.items.length, 1)
            );
            const avgOpportunity = Math.round(
              region.items.reduce((sum, item) => sum + balancedOpportunity(item), 0) / Math.max(region.items.length, 1)
            );

            return (
              <div key={region.id} className={cls("rounded-3xl border p-4 backdrop-blur", color.card)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cls("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest", color.badge)}>
                        {region.items.length} record{region.items.length === 1 ? "" : "s"}
                      </span>
                      <span className="rounded-full border border-stone-700 bg-stone-950/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-stone-400">
                        planning {avgPlanning}
                      </span>
                      <span className="rounded-full border border-stone-700 bg-stone-950/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-stone-400">
                        upside {avgOpportunity}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-stone-50">{region.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-400">{region.subtitle}</p>
                  </div>
                  <MapPinned className="mt-1 shrink-0 text-orange-300" size={22} />
                </div>

                <div className="mt-4 grid gap-2">
                  {region.items.map((item) => {
                    const active = selected?.id === item.id;
                    const meta = categoryMeta[item.category] || { short: "Signal", icon: MapPinned };
                    const Icon = meta.icon;
                    const complexity = planningComplexity(item);

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={cls(
                          "group rounded-2xl border bg-stone-950/70 p-3 text-left transition",
                          active
                            ? cls("shadow-xl", color.active)
                            : cls("border-stone-800", color.chip)
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 rounded-xl border border-stone-700 bg-stone-900 p-2 text-orange-300">
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-stone-50">{item.name}</p>
                              <p className="mt-1 text-xs text-stone-500">{meta.short} • {item.city}</p>
                            </div>
                          </div>
                          <div className="shrink-0 rounded-xl border border-stone-700 bg-stone-900/80 px-2.5 py-1 text-right">
                            <p className="font-mono text-sm font-bold text-orange-200">{complexity}</p>
                            <p className="text-[9px] uppercase tracking-widest text-stone-500">plan</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
        selected?.id === item.id ? "border-orange-300 bg-orange-950/30 shadow-2xl shadow-orange-900/30" : "border-stone-800 bg-stone-950/70 hover:border-orange-500/60 hover:bg-stone-900/90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-2xl border border-stone-700 bg-stone-900 p-2 text-orange-300"><Icon size={18} /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-stone-700 bg-stone-900 px-2 py-0.5 text-[11px] uppercase tracking-widest text-stone-400">{meta.short}</span>
              <span className="rounded-full border border-stone-700 bg-stone-900 px-2 py-0.5 text-[11px] text-stone-400">Grade {item.sourceGrade}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold leading-snug text-white group-hover:text-orange-100">{item.name}</h3>
            <p className="mt-1 text-xs text-stone-500">{item.region}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cls("rounded-2xl px-3 py-2 font-mono text-sm font-bold", complexity >= 85 ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/30" : complexity >= 70 ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30" : "bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30")}>{complexity}</div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-stone-500">Planning</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{item.summary}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-stone-900 px-3 py-2 text-stone-300">Opportunity <span className="float-right font-mono text-orange-200">{opportunity}</span></div>
        <div className="rounded-xl bg-stone-900 px-3 py-2 text-stone-300">Transparency <span className="float-right font-mono text-orange-200">{item.transparency}</span></div>
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
        className="rounded-[2rem] border border-orange-400/20 bg-stone-950/80 p-5 shadow-2xl shadow-orange-950/30"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Selected record</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-white">{selected.name}</h2>
            <p className="mt-1 text-sm text-stone-400">{selected.status}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-3xl border border-orange-400/30 bg-orange-400/10 px-3 py-3"><p className="font-mono text-2xl font-black text-orange-100">{complexity}</p><p className="text-[10px] uppercase tracking-widest text-orange-300">Planning</p></div>
            <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-3"><p className="font-mono text-2xl font-black text-emerald-100">{opportunity}</p><p className="text-[10px] uppercase tracking-widest text-emerald-300">Upside</p></div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-stone-300">{selected.summary}</p>

        <div className="mt-5 space-y-3">
          {scoreKeys.map((s) => <ScoreBar key={s.key} label={s.label} value={selected[s.key]} note={s.direction} />)}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-stone-900/80 p-4"><p className="text-xs uppercase tracking-widest text-stone-500">City / county</p><p className="mt-1 text-sm font-medium text-white">{selected.city} / {selected.county}</p></div>
          <div className="rounded-2xl bg-stone-900/80 p-4"><p className="text-xs uppercase tracking-widest text-stone-500">Source grade</p><p className="mt-1 text-sm font-medium text-white">{selected.sourceGrade} — {sourceGradeLabel(selected.sourceGrade)}</p></div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4"><p className="text-xs uppercase tracking-widest text-stone-500">Public facts</p><ul className="mt-2 space-y-2 text-xs leading-5 text-stone-300">{selected.publicFacts.map((f) => <li key={f}>• {f}</li>)}</ul></div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4"><p className="text-xs uppercase tracking-widest text-emerald-300">Benefits claimed</p><ul className="mt-2 space-y-2 text-xs leading-5 text-emerald-50/80">{selected.benefitsClaimed.map((f) => <li key={f}>• {f}</li>)}</ul></div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="text-xs uppercase tracking-widest text-amber-300">Concerns raised</p><ul className="mt-2 space-y-2 text-xs leading-5 text-amber-50/80">{selected.concernsRaised.map((f) => <li key={f}>• {f}</li>)}</ul></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selected.tags.map((tag) => <span key={tag} className="rounded-full border border-stone-700 bg-stone-900 px-3 py-1 text-xs text-stone-200">{tag}</span>)}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selected.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-200 hover:bg-orange-400/20">{source.label} <ExternalLink size={15} /></a>)}
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
    <div className="rounded-[2rem] border border-stone-800 bg-stone-950/80 p-5 shadow-2xl shadow-orange-950/20">
      <p className="text-xs uppercase tracking-[0.28em] text-orange-300">Methodology</p>
      <h2 className="mt-1 text-2xl font-bold text-white">Built to stay neutral</h2>
      <p className="mt-3 text-sm leading-7 text-stone-400">The dashboard avoids endorsement language and uses separate dimensions so users can see tradeoffs instead of one biased verdict.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {constraints.map((item) => <div key={item} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4 text-sm text-stone-300"><CheckCircle2 className="mb-2 text-orange-300" size={18} />{item}</div>)}
      </div>
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
    <div className="min-h-screen overflow-hidden bg-stone-950 text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(201,106,43,.20),transparent_35%),radial-gradient(circle_at_82%_0%,rgba(224,164,58,.16),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(95,125,77,.14),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-6 shadow-2xl shadow-orange-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-orange-200"><MapPinned size={14} /> Arizona Infrastructure OSINT</span><span className="rounded-full border border-stone-700 bg-stone-900 px-3 py-1 text-xs text-stone-400">Last reviewed: {REVIEWED_DATE}</span></div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">Arizona AI Infrastructure Tracker</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-stone-300 sm:text-lg">A neutral public-information dashboard for Arizona data centers, power planning, water strategy, zoning activity, economic upside, community response, and transparency.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[560px]"><MetricCard label="Planning" value={metrics.planning} icon={Gauge} sub="avg complexity" /><MetricCard label="Opportunity" value={metrics.opportunity} icon={Activity} sub="avg upside" /><MetricCard label="Transparency" value={metrics.transparency} icon={ShieldCheck} sub="avg detail" /><MetricCard label="Community" value={metrics.community} icon={Users} sub="avg sensitivity" /></div>
          </div>
        </header>

        <section className="mt-5 rounded-[2rem] border border-stone-800 bg-stone-950/70 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-1 items-center gap-3 rounded-2xl border border-stone-800 bg-stone-900/80 px-4 py-3"><Search size={18} className="text-stone-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, project, source, concern, or infrastructure signal..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-stone-500" /></div><div className="flex flex-wrap gap-2">{["Command Center", "Scores", "Signals", "Methodology"].map((v) => <Pill key={v} active={view === v} onClick={() => setView(v)}>{v}</Pill>)}</div></div>
          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500"><Filter size={14} /> Category</div><div className="flex flex-wrap gap-2">{categories.map((v) => <Pill key={v} active={category === v} onClick={() => setCategory(v)}>{v === "All" ? "All records" : (categoryMeta[v]?.short || v)}</Pill>)}</div></div>
          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500"><ArrowUpDown size={14} /> Sort / grade</div><div className="flex flex-wrap gap-2">{[["planning","Planning"],["opportunity","Opportunity"],["transparency","Transparency"],["water","Water"],["community","Community"]].map(([k,l]) => <Pill key={k} active={sortBy===k} onClick={() => setSortBy(k)}>{l}</Pill>)}{grades.map((g) => <Pill key={g} active={grade===g} onClick={() => setGrade(g)}>{g === "All" ? "All grades" : `Grade ${g}`}</Pill>)}</div></div>
        </section>

        {view === "Command Center" && <main className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]"><div className="space-y-5"><ArizonaMap items={filtered} selected={selected} onSelect={setSelected} /><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5 shadow-2xl shadow-orange-950/20"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Balanced view</p><h2 className="mt-1 text-xl font-semibold text-white">Planning vs. opportunity</h2></div><BarChart3 className="text-orange-300" /></div><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} /><Bar dataKey="planning" radius={[8,8,0,0]}>{chartRows.map((_, idx) => <Cell key={idx} fill="currentColor" className="text-orange-400" />)}</Bar></BarChart></ResponsiveContainer></div></div><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5 shadow-2xl shadow-orange-950/20"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Executive summary</p><h2 className="mt-1 text-xl font-semibold text-white">What this tracker watches</h2></div><RefreshCcw className="text-orange-300" /></div><div className="mt-5 space-y-4"><div className="rounded-2xl bg-stone-900/80 p-4"><p className="text-sm font-semibold text-white">Power planning</p><p className="mt-1 text-sm leading-6 text-stone-400">Large-load growth, utility planning, interconnection, on-site generation, and ratepayer-cost concerns.</p></div><div className="rounded-2xl bg-stone-900/80 p-4"><p className="text-sm font-semibold text-white">Water strategy</p><p className="mt-1 text-sm leading-6 text-stone-400">Cooling method, water disclosure, conservation planning, reuse, drought sensitivity, and local ordinances.</p></div><div className="rounded-2xl bg-stone-900/80 p-4"><p className="text-sm font-semibold text-white">Public transparency</p><p className="mt-1 text-sm leading-6 text-stone-400">What is public, what is claimed, what is sourced, and what still needs confirmation.</p></div></div></div></div></div><aside className="space-y-5"><SelectedPanel selected={selected} /><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-4"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Ranked project feed</h2><span className="text-xs text-stone-500">{filtered.length} records</span></div><div className="max-h-[650px] space-y-3 overflow-auto pr-1">{filtered.map((item) => <ProjectCard key={item.id} item={item} selected={selected} onSelect={setSelected} />)}</div></div></aside></main>}

        {view === "Scores" && <main className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Scoring dimensions</p><h2 className="mt-1 text-2xl font-bold text-white">No single good/bad score</h2><p className="mt-3 text-sm leading-7 text-stone-400">Each score measures a different tradeoff. This avoids hiding jobs, tax base, resource planning, local concern, and transparency inside one biased number.</p><div className="mt-5 space-y-3">{scoreKeys.map((s) => <div key={s.key} className="rounded-3xl border border-stone-800 bg-stone-900/70 p-4"><div className="flex items-center gap-2"><s.icon className="text-orange-300" size={18} /><h3 className="font-semibold text-white">{s.label}</h3></div><p className="mt-2 text-sm text-stone-400">{s.direction}</p></div>)}</div></div><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Exportable data</p><h2 className="mt-1 text-2xl font-bold text-white">Filtered dataset</h2><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => exportFile("arizona-ai-infrastructure-tracker.json", JSON.stringify(filtered, null, 2), "application/json")} className="inline-flex items-center gap-2 rounded-2xl border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-200 hover:bg-orange-400/20"><Download size={16} /> Export JSON</button><button onClick={() => exportFile("arizona-ai-infrastructure-tracker.csv", buildCsv(filtered), "text/csv")} className="inline-flex items-center gap-2 rounded-2xl border border-stone-700 bg-stone-900 px-4 py-2 text-sm font-medium text-stone-200 hover:border-orange-400/50"><Download size={16} /> Export CSV</button></div><div className="mt-5 overflow-hidden rounded-2xl border border-stone-800"><div className="max-h-[620px] overflow-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="sticky top-0 bg-stone-900 text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-4 py-3">Project</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Planning</th><th className="px-4 py-3">Upside</th><th className="px-4 py-3">Water</th><th className="px-4 py-3">Transparency</th><th className="px-4 py-3">Grade</th></tr></thead><tbody className="divide-y divide-stone-800 bg-stone-950/50">{filtered.map((p) => <tr key={p.id} className="hover:bg-stone-900/70"><td className="px-4 py-3"><p className="font-medium text-white">{p.name}</p><p className="mt-1 text-xs text-stone-500">{p.status}</p></td><td className="px-4 py-3 text-xs text-stone-300">{p.city}</td><td className="px-4 py-3 font-mono font-bold text-orange-200">{planningComplexity(p)}</td><td className="px-4 py-3 font-mono font-bold text-emerald-200">{balancedOpportunity(p)}</td><td className="px-4 py-3 font-mono text-stone-300">{p.waterPlanningStrength}</td><td className="px-4 py-3 font-mono text-stone-300">{p.transparency}</td><td className="px-4 py-3 text-xs text-stone-300">{p.sourceGrade}</td></tr>)}</tbody></table></div></div></div></main>}

        {view === "Signals" && <main className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Signal velocity</p><h2 className="mt-1 text-2xl font-bold text-white">Recent policy and market signals</h2><div className="mt-6 h-[420px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendRows} margin={{ left: -20, right: 20, top: 20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" /><XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: 16, color: "#e2e8f0" }} /><Line type="monotone" dataKey="score" stroke="currentColor" className="text-orange-300" strokeWidth={3} dot={{ r: 5 }} /></LineChart></ResponsiveContainer></div></div><div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5"><p className="text-xs uppercase tracking-[0.28em] text-orange-300">Watchlist</p><h2 className="mt-1 text-2xl font-bold text-white">Current signal feed</h2><div className="mt-5 space-y-4">{signals.map((s) => <div key={s.id} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-widest text-orange-300">{s.type}</p><span className="rounded-full bg-slate-800 px-2.5 py-1 font-mono text-xs text-stone-200">{s.score}</span></div><h3 className="mt-2 font-semibold text-white">{s.headline}</h3><p className="mt-2 text-sm leading-6 text-stone-400">{s.summary}</p><p className="mt-2 text-xs text-stone-500">Impact: {s.impact}</p></div>)}</div></div></main>}

        {view === "Methodology" && <main className="mt-5"><MethodologyPanel /></main>}
        <footer className="mt-6 rounded-[2rem] border border-stone-800 bg-stone-950/70 p-5 text-sm leading-6 text-stone-400"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-2"><Info size={16} className="text-orange-300" />Public-information prototype. It does not endorse or oppose any project.</div><div className="flex items-center gap-2 text-stone-500"><Globe2 size={16} /> Arizona • data centers • power • water • jobs • public transparency</div></div></footer>
      </div>
    </div>
  );
}
