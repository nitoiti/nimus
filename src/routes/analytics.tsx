import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics | Nimus" }] }),
});

/* ──────────────────────────────────────────────────────────────────────────
   Mock data — modelled on the screenshots the user shared.
   Two distinct eras:
     • RETROSPECTIVE (Feb 2024 – Jul 2025): legacy programs back-filled with
       start/end dates only. No per-trial data → independence is unknown.
     • LIVE (Aug 2025 – today): real session data with +/P/− marks.
   The UI shades and labels the retrospective era so BCBAs are never misled.
   ────────────────────────────────────────────────────────────────────────── */

const ERA_SPLIT = "2025-08-01"; // retrospective → live

// Cumulative mastered (every week from Feb 2024)
const masteryTrajectory = (() => {
  const start = new Date("2024-02-01");
  const weeks: { date: string; mastered: number; era: "retro" | "live" }[] = [];
  let total = 0;
  for (let i = 0; i < 70; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    const iso = d.toISOString().slice(0, 10);
    const era: "retro" | "live" = iso < ERA_SPLIT ? "retro" : "live";
    // retro: chunky bursts (back-filled). live: steady cadence.
    const delta =
      era === "retro"
        ? [0, 0, 6, 4, 2, 0, 0, 8, 5, 3, 0, 0, 0, 2, 0][i % 15]
        : [1, 2, 1, 0, 2, 3, 1, 2, 1, 0, 2, 1][i % 12];
    total += delta;
    weeks.push({ date: iso, mastered: total, era });
  }
  return weeks;
})();

// Weekly independence% (live era only)
const independenceTrend = (() => {
  const start = new Date(ERA_SPLIT);
  return Array.from({ length: 40 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    const base = 42 + i * 0.7 + Math.sin(i / 3) * 6;
    const indep = Math.min(78, Math.max(35, base));
    const prompt = Math.max(15, 60 - i * 0.6 + Math.cos(i / 4) * 5);
    return {
      date: d.toISOString().slice(0, 10),
      independence: Math.round(indep),
      prompt: Math.round(prompt),
      error: Math.max(2, Math.round(100 - indep - prompt)),
    };
  });
})();

// Prompt dependency by VB-MAPP area (live era)
const promptByArea = [
  { area: "Self-Help / DLS", indep: 24, prompt: 68, error: 8, trials: 142, flag: "high-prompt" },
  { area: "Listener Behavior", indep: 55, prompt: 41, error: 4, trials: 218, flag: "high-prompt" },
  { area: "Motor Imitation", indep: 61, prompt: 35, error: 4, trials: 187, flag: "ok" },
  { area: "Tact / Naming", indep: 72, prompt: 24, error: 4, trials: 96, flag: "ok" },
  { area: "Mand / Requests", indep: 84, prompt: 14, error: 2, trials: 64, flag: "strong" },
  { area: "VP-MTS", indep: 78, prompt: 18, error: 4, trials: 121, flag: "strong" },
] as const;

const vbMappLevels = [
  { level: 1, range: "0–18m", mastered: 82, total: 83, status: "in-progress" as const },
  { level: 2, range: "18–30m", mastered: 13, total: 14, status: "in-progress" as const },
  { level: 3, range: "30–48m", mastered: 2, total: 2, status: "complete" as const },
];

/* ──────────────────────────────────────────────────────────────────────────
   Skill map (VB-MAPP grid) — mirrors /skill-map.
   16 areas × 3 developmental levels × 5 milestones per cell.
   Same seeded distribution as skill-map.tsx so numbers stay in sync.
   ────────────────────────────────────────────────────────────────────────── */

type SkillScore = 0 | 0.5 | 1 | null;

const SKILL_AREAS: { code: string; name: string; levels: [boolean, boolean, boolean] }[] = [
  { code: "MND", name: "Mand", levels: [true, true, true] },
  { code: "TCT", name: "Tact", levels: [true, true, true] },
  { code: "LSN", name: "Listener", levels: [true, true, true] },
  { code: "VPM", name: "VP-MTS", levels: [true, true, true] },
  { code: "PLY", name: "Play", levels: [true, true, true] },
  { code: "SOC", name: "Social", levels: [true, true, true] },
  { code: "IMI", name: "Imitation", levels: [true, true, false] },
  { code: "ECH", name: "Echoic", levels: [true, true, false] },
  { code: "SVB", name: "Spont. vocal", levels: [true, false, false] },
  { code: "LRF", name: "LRFFC", levels: [false, true, true] },
  { code: "INT", name: "Intraverbal", levels: [false, true, true] },
  { code: "GRP", name: "Classroom", levels: [false, true, true] },
  { code: "LIN", name: "Linguistics", levels: [false, true, true] },
  { code: "RED", name: "Reading", levels: [false, false, true] },
  { code: "WRT", name: "Writing", levels: [false, false, true] },
  { code: "MTH", name: "Math", levels: [false, false, true] },
];

const SKILL_LEVELS = [
  { n: 1, label: "L1", age: "0–18m" },
  { n: 2, label: "L2", age: "18–30m" },
  { n: 3, label: "L3", age: "30–48m" },
];

function seeded(n: number) {
  return Math.abs((Math.sin(n * 9301 + 49297) * 233280) % 1);
}

type CellStats = {
  available: boolean;
  mastered: number;
  emerging: number;
  failed: number;
  unassessed: number;
  total: number; // mastered + emerging counts toward "scored" denominator
};

const skillGrid: CellStats[][] = SKILL_AREAS.map((a, ai) =>
  a.levels.map((available, lvl): CellStats => {
    if (!available)
      return { available: false, mastered: 0, emerging: 0, failed: 0, unassessed: 0, total: 0 };
    let mastered = 0,
      emerging = 0,
      failed = 0,
      unassessed = 0;
    for (let i = 0; i < 5; i++) {
      const milestoneN = lvl * 5 + i + 1;
      const r = seeded(ai * 31 + milestoneN);
      let s: SkillScore;
      if (lvl === 0) s = r > 0.2 ? 1 : r > 0.08 ? 0.5 : r > 0.02 ? 0 : null;
      else if (lvl === 1) s = r > 0.75 ? 1 : r > 0.45 ? 0.5 : r > 0.2 ? 0 : null;
      else s = r > 0.9 ? 0.5 : r > 0.7 ? 0 : null;
      if (s === 1) mastered++;
      else if (s === 0.5) emerging++;
      else if (s === 0) failed++;
      else unassessed++;
    }
    return { available: true, mastered, emerging, failed, unassessed, total: 5 };
  }),
);

const skillTotals = (() => {
  let mastered = 0,
    emerging = 0,
    failed = 0,
    unassessed = 0,
    available = 0;
  skillGrid.forEach((row) =>
    row.forEach((c) => {
      if (!c.available) return;
      available += c.total;
      mastered += c.mastered;
      emerging += c.emerging;
      failed += c.failed;
      unassessed += c.unassessed;
    }),
  );
  return { mastered, emerging, failed, unassessed, available };
})();

const skillLevelTotals = SKILL_LEVELS.map((_, lvl) => {
  let mastered = 0,
    emerging = 0,
    available = 0;
  skillGrid.forEach((row) => {
    const c = row[lvl];
    if (!c.available) return;
    available += c.total;
    mastered += c.mastered;
    emerging += c.emerging;
  });
  return { mastered, emerging, available };
});


// Top areas to attack — most emerging milestones across all levels.
const emergingQueue = SKILL_AREAS.map((a, ai) => {
  const emerging = skillGrid[ai].reduce((sum, c) => sum + c.emerging, 0);
  const mastered = skillGrid[ai].reduce((sum, c) => sum + c.mastered, 0);
  const available = skillGrid[ai].reduce((sum, c) => sum + (c.available ? c.total : 0), 0);
  return { code: a.code, name: a.name, emerging, mastered, available };
})
  .filter((a) => a.emerging > 0)
  .sort((a, b) => b.emerging - a.emerging)
  .slice(0, 6);


const activePrograms = [
  {
    id: "p-self-help-brush",
    area: "Self-Help / DLS",
    program: "Brushes teeth with model",
    targets: 3,
    status: "stalled",
    detail: "17 days idle · 6 trials · 18% indep",
    action: "Re-introduce or pause",
  },
  {
    id: "p-listener-2step",
    area: "Listener Behavior",
    program: "Touch 2-step direction (kitchen)",
    targets: 2,
    status: "stalled",
    detail: "12 days idle · 38% indep · plateau 4w",
    action: "Review prompt strategy",
  },
  {
    id: "p-tact-person-action",
    area: "Tact / Naming",
    program: "Tact person + action",
    targets: 4,
    status: "ready",
    detail: "92% indep · 28 trials · 5 sessions",
    action: "Move to generalization",
  },
  {
    id: "p-mand-open",
    area: "Mand / Requests",
    program: "Mands 'open' across 3 contexts",
    targets: 3,
    status: "on-track",
    detail: "74% indep · improving 2w",
    action: "Continue current plan",
  },
  {
    id: "p-echoic-syllable",
    area: "Echoic / Verbal Behavior",
    program: "Echoic 2–3 syllable",
    targets: 1,
    status: "no-data",
    detail: "Opened 10 days ago · 0 sessions",
    action: "Schedule first probe",
  },
];

/* ────────────────────────── component ────────────────────────── */

function Analytics() {
  const [range, setRange] = useState<"30" | "90" | "180" | "all">("90");

  return (
    <AppLayout
      title="Analytics"
      subtitle="Clinical view — what's progressing, what's stuck, what needs a decision this week."
      actions={
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-semibold">
          {(
            [
              ["30", "30d"],
              ["90", "90d"],
              ["180", "6m"],
              ["all", "All time"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={`rounded-full px-3 py-1.5 transition ${
                range === k
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <HeroInsight />
      <KpiStrip />
      <DataEraBanner />
      <div className="mb-6">
        <MasteryTrajectoryCard />
      </div>

      <div className="mb-6">
        <SkillMapCard />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <IndependenceTrendCard />
        </div>
        <div className="lg:col-span-2">
          <VbMappCard />
        </div>
      </div>


      <PromptByAreaCard />
      <ActiveTargetsCard />
      <DataQualityFooter />
    </AppLayout>
  );
}

/* ────────────────────────── sections ────────────────────────── */

function HeroInsight() {
  return (
    <section className="mb-5 rounded-2xl border border-border bg-foreground p-5 text-background shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
            This week
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-snug sm:text-2xl">
            Independence trending up <span className="text-success">+8%</span> over 4 weeks ·{" "}
            <span style={{ color: "oklch(0.85 0.16 75)" }}>2 programs stalled</span> in Self-Help
            and Listener Behavior.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
            Live tracking is 14 weeks in. Trial volume is steady (~22/day) and prompt dependency in
            Self-Help is the dominant clinical signal — worth reviewing the fading plan.
          </p>
        </div>
      </div>
    </section>
  );
}

function KpiStrip() {
  return (
    <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
      <Kpi label="Active programs" value="12" trend={null} />
      <Kpi
        label="Mastered (90d)"
        value="9"
        trend="up"
        trendValue="+3 vs prev"
        tone="success"
        hint="Targets closed as mastered in the last 90 days. Includes both live and retrospective programs."
      />
      <Kpi
        label="Independence"
        value="68%"
        trend="up"
        trendValue="+8% / 4w"
        tone="success"
        hint="Share of independent (+) responses across live trials. Shows '—' when this child has no +/P trial data."
      />
      <Kpi
        label="Prompt dependency"
        value="27%"
        trend="down"
        trendValue="−5% / 4w"
        tone="info"
        hint="Share of prompted (P) responses across live trials. Lower is better. Hidden when no trial data exists."
      />
      <Kpi label="Avg days to mastery" value="21" trend="flat" trendValue="live era" />
    </section>
  );
}

function Kpi({
  label,
  value,
  trend,
  trendValue,
  tone,
  hint,
  empty,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "flat" | null;
  trendValue?: string;
  tone?: "success" | "info";
  hint?: string;
  empty?: boolean;
}) {
  const valueClass =
    empty
      ? "text-muted-foreground"
      : tone === "success"
      ? "text-success"
      : tone === "info"
      ? "text-info"
      : "text-foreground";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendTone =
    label.toLowerCase().includes("prompt") && trend === "down"
      ? "text-success"
      : trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-soft">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="truncate">{label}</span>
        {hint && (
          <span title={hint} className="cursor-help">
            <HelpCircle className="size-3 text-muted-foreground/60" />
          </span>
        )}
      </div>
      <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${valueClass}`}>
        {empty ? "—" : value}
      </div>
      {empty ? (
        <div className="mt-1 text-[11px] text-muted-foreground">No trial data yet</div>
      ) : (
        trend &&
        trendValue && (
          <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${trendTone}`}>
            <TrendIcon className="size-3" /> {trendValue}
          </div>
        )
      )}
    </div>
  );
}

function DataEraBanner() {
  // Only render when this child actually has both retrospective (no-trial) and
  // live (+/P) programs. Hide entirely otherwise so it doesn't read as a
  // platform-wide rule.
  const hasRetro = true;
  const hasLive = true;
  if (!(hasRetro && hasLive)) return null;
  const liveStart = new Date(ERA_SPLIT).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
  return (
    <section className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm">
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Mixed data for this child.</span> Some
        programs were closed without trial-level records and only have start/end dates — those count
        toward mastery but can't contribute to independence or prompt charts. Trial-based tracking
        started <span className="font-medium text-foreground">{liveStart}</span>; ranges without
        trial data are shown with diagonal hatching, and weeks with no sessions render as gaps.
      </div>
    </section>
  );
}

function MasteryTrajectoryCard() {
  const splitIdx = useMemo(
    () => masteryTrajectory.findIndex((d) => d.date >= ERA_SPLIT),
    [],
  );
  const liveStart = masteryTrajectory[splitIdx]?.date;
  const liveEnd = masteryTrajectory[masteryTrajectory.length - 1]?.date;
  const retroStart = masteryTrajectory[0]?.date;
  const retroEnd = masteryTrajectory[splitIdx - 1]?.date;

  return (
    <Card
      title="Mastery trajectory"
      subtitle="Cumulative targets mastered. Retrospective era is hatched — counts are real but not session-derived."
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={masteryTrajectory} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="masteryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.52 0.21 280)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.52 0.21 280)" stopOpacity={0} />
              </linearGradient>
              <pattern id="retroHatch" patternUnits="userSpaceOnUse" width="6" height="6">
                <rect width="6" height="6" fill="oklch(0.96 0.008 250)" />
                <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="oklch(0.85 0.01 250)" strokeWidth="1" />
              </pattern>
            </defs>
            <CartesianGrid stroke="oklch(0.93 0.01 250)" strokeDasharray="2 4" vertical={false} />
            {retroStart && retroEnd && (
              <ReferenceArea x1={retroStart} x2={retroEnd} fill="url(#retroHatch)" fillOpacity={1} />
            )}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "oklch(0.52 0.02 260)" }}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en", { month: "short", year: "2-digit" })
              }
              minTickGap={40}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.52 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid oklch(0.9 0.01 250)",
                fontSize: 12,
                boxShadow: "0 8px 24px -12px rgba(0,0,0,.15)",
              }}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })
              }
              formatter={(v: number) => [v, "Mastered (cum.)"]}
            />
            <Area
              type="monotone"
              dataKey="mastered"
              stroke="oklch(0.52 0.21 280)"
              strokeWidth={2.5}
              fill="url(#masteryGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <Legend swatch="bg-primary" label="Cumulative mastered" />
        <Legend pattern label="Retrospective era (no trial data)" />
        <span className="ml-auto">
          Live tracking: <span className="font-medium text-foreground">
            {liveStart && new Date(liveStart).toLocaleDateString("en", { month: "short", year: "2-digit" })} → {liveEnd && new Date(liveEnd).toLocaleDateString("en", { month: "short", year: "2-digit" })}
          </span>
        </span>
      </div>
    </Card>
  );
}

function IndependenceTrendCard() {
  return (
    <Card
      title="Independence trend"
      subtitle="Weekly % of independent (+) and prompted (P) responses. Weeks without trial data render as gaps — the chart never extrapolates across silence."
    >
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={independenceTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.93 0.01 250)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "oklch(0.52 0.02 260)" }}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
              }
              minTickGap={40}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "oklch(0.52 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              width={30}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid oklch(0.9 0.01 250)",
                fontSize: 12,
              }}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
              }
            />
            <Line
              type="monotone"
              dataKey="independence"
              stroke="oklch(0.72 0.16 160)"
              strokeWidth={2.5}
              dot={false}
              name="Independent"
            />
            <Line
              type="monotone"
              dataKey="prompt"
              stroke="oklch(0.78 0.15 75)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Prompted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <Legend swatch="bg-success" label="Independent (+)" />
        <Legend swatch="bg-warning" dashed label="Prompted (P)" />
      </div>
    </Card>
  );
}

function VbMappCard() {
  return (
    <Card title="VB-MAPP levels" subtitle="Milestones mastered per developmental level.">
      <div className="space-y-3">
        {vbMappLevels.map((l) => {
          const pct = Math.round((l.mastered / l.total) * 100);
          const complete = l.status === "complete";
          return (
            <div key={l.level} className="rounded-xl border border-border bg-surface/50 p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Level {l.level}
                  </span>
                  <span className="ml-2 text-[11px] text-muted-foreground">{l.range}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    complete ? "text-success" : "text-info"
                  }`}
                >
                  {complete ? "Complete" : "In progress"}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold tabular-nums">{pct}%</span>
                <span className="text-xs text-muted-foreground">
                  {l.mastered}/{l.total} milestones
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${complete ? "bg-success" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SkillMapCard — velocity & forecasts derived from the skill map.

   Why targets (not milestones) drive the headline numbers
   -------------------------------------------------------
   A VB-MAPP milestone is not a uniform unit — some milestones are a single
   discrete skill ("touches 1 body part on instruction"), others are a chain
   of 5–10 sub-skills ("manually signs 20 different mands across 3 contexts").
   The VB-MAPP Task Analysis adds ~900 supporting targets across the same
   170 milestones. Counting milestones therefore under-weights heavy
   milestones and makes pace look stalled even when real clinical progress
   is happening. Velocity, cadence and forecasts here use **targets closed**
   as the unit; milestone closures are surfaced separately as a coarser
   "stage complete" signal.
   ────────────────────────────────────────────────────────────────────────── */

// Approx target count per milestone, modelled to match VB-MAPP's variance
// (1 → 10 supporting targets / sub-skills per milestone, avg ~4.5).
const TARGETS_PER_MILESTONE = (i: number) => 2 + Math.round(seeded(i * 17 + 3) * 6);

// Live weekly milestone closures (deltas from masteryTrajectory).
const liveWeekly = (() => {
  const live = masteryTrajectory.filter((w) => w.era === "live");
  return live.map((w, i) => ({
    date: w.date,
    delta:
      i === 0
        ? w.mastered - (masteryTrajectory.find((x) => x.era === "retro")?.mastered ?? 0)
        : w.mastered - live[i - 1].mastered,
  }));
})();

// Live weekly target closures. Targets close more frequently than milestones —
// a child can close 2–3 targets within a milestone before the milestone itself
// is signed off. We seed weeks that had a milestone closure with a fat burst,
// and add 0–3 standalone target closures on most other weeks.
const liveWeeklyTargets = liveWeekly.map((w, i) => {
  const milestoneBurst = w.delta > 0 ? w.delta * (3 + Math.round(seeded(i * 13) * 4)) : 0;
  const standalone =
    w.delta > 0 ? 0 : seeded(i * 11 + 5) > 0.35 ? 1 + Math.round(seeded(i * 19) * 2) : 0;
  return { date: w.date, delta: milestoneBurst + standalone };
});

const sumDelta = (xs: { delta: number }[]) => xs.reduce((s, x) => s + x.delta, 0);

const recent12wTargets = liveWeeklyTargets.slice(-12);
const last4wTargets = liveWeeklyTargets.slice(-4);
const prior4wTargets = liveWeeklyTargets.slice(-8, -4);

const targetsLast4 = sumDelta(last4wTargets);
const targetsPrior4 = sumDelta(prior4wTargets);
const targetsPerWeek = targetsLast4 / 4;
const targetsDeltaPct =
  targetsPrior4 > 0
    ? Math.round(((targetsLast4 - targetsPrior4) / targetsPrior4) * 100)
    : null;

// Cadence — average days between target closures. Compares last 8w vs prior 8w.
function cadenceDays(weeks: { delta: number }[]) {
  const closures = weeks.reduce((s, w) => s + w.delta, 0);
  if (closures === 0) return null;
  return Math.round((weeks.length * 7) / closures);
}
const cadenceNow = cadenceDays(liveWeeklyTargets.slice(-8));
const cadencePrev = cadenceDays(liveWeeklyTargets.slice(-16, -8));

// Cumulative trajectories — used by the combined milestones+targets chart.
const liveTrajectory = (() => {
  let mCum = masteryTrajectory.find((x) => x.era === "retro")?.mastered ?? 0;
  let tCum = mCum * 4; // assume retro targets ~ 4× milestones (estimate, hatched on chart)
  return liveWeekly.map((w, i) => {
    mCum += w.delta;
    tCum += liveWeeklyTargets[i].delta;
    return { date: w.date, milestones: mCum, targets: tCum };
  });
})();

// Active developmental level = the lowest level that isn't 100% complete.
// Levels above the active one aren't "stalled" — they're scheduled for later
// once the current level's foundation is solid. This matches how BCBAs run
// VB-MAPP: bottom-up, area-by-area within a level.
const activeLevelIdx = vbMappLevels.findIndex((l) => l.mastered < l.total);

type LevelForecast = {
  level: number;
  range: string;
  mastered: number;
  total: number;
  pct: number;
  remaining: number;
  weeklyTargets: number;
  isActive: boolean;
  isComplete: boolean;
  etaLabel: string | null;
  etaDate: string | null;
  pacing: "on-track" | "slowing" | "building" | null;
};

// Estimate targets remaining per level using avg targets-per-milestone.
const levelForecasts: LevelForecast[] = vbMappLevels.map((lv, i) => {
  const pct = Math.round((lv.mastered / lv.total) * 100);
  const remainingMilestones = lv.total - lv.mastered;
  // Avg supporting targets per milestone within this level (seeded).
  const avgTargets =
    Array.from({ length: 5 }, (_, k) => TARGETS_PER_MILESTONE(i * 50 + k)).reduce(
      (s, x) => s + x,
      0,
    ) / 5;
  const remainingTargets = Math.round(remainingMilestones * avgTargets);
  const isComplete = remainingMilestones === 0;
  const isActive = i === activeLevelIdx;
  // Only forecast for the active level — that's where weekly target closures
  // are actually landing. Non-active levels get a neutral "upcoming" message.
  if (isComplete) {
    return {
      level: lv.level,
      range: lv.range,
      mastered: lv.mastered,
      total: lv.total,
      pct,
      remaining: 0,
      weeklyTargets: 0,
      isActive: false,
      isComplete: true,
      etaLabel: null,
      etaDate: null,
      pacing: null,
    };
  }
  if (!isActive) {
    return {
      level: lv.level,
      range: lv.range,
      mastered: lv.mastered,
      total: lv.total,
      pct,
      remaining: remainingMilestones,
      weeklyTargets: 0,
      isActive: false,
      isComplete: false,
      etaLabel: null,
      etaDate: null,
      pacing: null,
    };
  }
  // Active level — use the full target velocity, since that's where work lands.
  const weeklyTargets = targetsPerWeek;
  if (weeklyTargets < 0.5) {
    return {
      level: lv.level,
      range: lv.range,
      mastered: lv.mastered,
      total: lv.total,
      pct,
      remaining: remainingMilestones,
      weeklyTargets,
      isActive: true,
      isComplete: false,
      etaLabel: null,
      etaDate: null,
      pacing: "building",
    };
  }
  const weeks = remainingTargets / weeklyTargets;
  const ms = Date.now() + weeks * 7 * 24 * 60 * 60 * 1000;
  const etaDate = new Date(ms).toISOString().slice(0, 10);
  const pacing: LevelForecast["pacing"] =
    targetsDeltaPct !== null && targetsDeltaPct < -20 ? "slowing" : "on-track";
  const etaLabel =
    weeks < 1.5
      ? `~${Math.max(1, Math.round(weeks * 7))} days`
      : weeks < 8
        ? `~${Math.round(weeks)} weeks`
        : `~${Math.round(weeks / 4.33)} months`;
  return {
    level: lv.level,
    range: lv.range,
    mastered: lv.mastered,
    total: lv.total,
    pct,
    remaining: remainingMilestones,
    weeklyTargets,
    isActive: true,
    isComplete: false,
    etaLabel,
    etaDate,
    pacing,
  };
});

// Movers — target-based counts so a single milestone with many sub-skills
// can still register as movement. Areas where targets are closing faster
// than the prior 4 weeks; areas with emerging targets but no closures.
const areaAccelerating = [
  { name: "Mand", code: "MND", recent: 11, prior: 4 },
  { name: "VP-MTS", code: "VPM", recent: 7, prior: 2 },
  { name: "Tact", code: "TCT", recent: 6, prior: 3 },
];
const areaStalling = [
  { name: "Listener", code: "LSN", weeksIdle: 6, emergingTargets: 9 },
  { name: "Self-Help / DLS", code: "DLS", weeksIdle: 5, emergingTargets: 12 },
  { name: "Classroom", code: "GRP", weeksIdle: 4, emergingTargets: 6 },
];

function SkillMapCard() {
  const trendUp = targetsDeltaPct !== null && targetsDeltaPct > 0;
  const trendDown = targetsDeltaPct !== null && targetsDeltaPct < 0;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
  const trendTone = trendUp
    ? "text-success"
    : trendDown
      ? "text-destructive"
      : "text-muted-foreground";

  // Cadence framing: "1 target every N days, was M". Faster (smaller N) = good.
  const cadenceTone =
    cadenceNow === null
      ? "text-muted-foreground"
      : cadencePrev === null
        ? "text-foreground"
        : cadenceNow < cadencePrev
          ? "text-success"
          : cadenceNow > cadencePrev * 1.2
            ? "text-destructive"
            : "text-foreground";
  const cadenceLabel =
    cadenceNow === null
      ? "No target closures in the last 8 weeks"
      : cadenceNow === 1
        ? "1 target / day"
        : `1 target every ${cadenceNow} days`;
  const cadenceSub =
    cadenceNow === null
      ? "Cadence appears when target-level data is available."
      : cadencePrev === null
        ? "Average over the last 8 weeks."
        : cadenceNow < cadencePrev
          ? `Faster than the prior 8 weeks (was every ${cadencePrev} days).`
          : cadenceNow > cadencePrev
            ? `Slower than the prior 8 weeks (was every ${cadencePrev} days).`
            : `Matches the prior 8-week cadence (${cadencePrev} days).`;

  return (
    <Card
      title="Skill map velocity & forecast"
      subtitle="How fast we're closing VB-MAPP targets (the sub-skills inside each milestone), where the pace is shifting, and — at the current rate — when the active developmental level finishes. Targets are the unit here because milestones vary from 1 to 10 sub-skills."
    >
      {/* Velocity hero row */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/40 px-4 py-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Closure pace
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground">
              {targetsPerWeek.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">targets / week</span>
          </div>
          {targetsDeltaPct !== null ? (
            <div
              className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${trendTone}`}
            >
              <TrendIcon className="size-3" />
              {targetsDeltaPct > 0 ? "+" : ""}
              {targetsDeltaPct}% vs prior 4 weeks
            </div>
          ) : (
            <div className="mt-1 text-[11px] text-muted-foreground">
              Average over the last 4 weeks.
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface/40 px-4 py-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Closure cadence
          </div>
          <div className={`mt-1 font-display text-2xl font-bold tabular-nums ${cadenceTone}`}>
            {cadenceLabel}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{cadenceSub}</div>
        </div>
      </div>

      {/* Combined milestones + targets trajectory (live era only) */}
      {liveTrajectory.length > 1 && (
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Skill-map trajectory — targets &amp; milestones
            </p>
            <p className="text-[11px] text-muted-foreground">
              Targets advance continuously; milestones step up when a whole sub-skill chain closes.
            </p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart
                data={liveTrajectory}
                margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid stroke="oklch(0.93 0.01 250)" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "oklch(0.52 0.02 260)" }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
                  }
                  minTickGap={40}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="targets"
                  tick={{ fontSize: 10, fill: "oklch(0.52 0.21 280)" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <YAxis
                  yAxisId="milestones"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "oklch(0.62 0.13 200)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.9 0.01 250)",
                    fontSize: 12,
                  }}
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
                  }
                />
                <Line
                  yAxisId="targets"
                  type="monotone"
                  dataKey="targets"
                  stroke="oklch(0.52 0.21 280)"
                  strokeWidth={2.5}
                  dot={false}
                  name="Targets (cum.)"
                />
                <Line
                  yAxisId="milestones"
                  type="stepAfter"
                  dataKey="milestones"
                  stroke="oklch(0.62 0.13 200)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Milestones (cum.)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <Legend swatch="bg-primary" label="Targets (cumulative)" />
            <Legend swatch="bg-info" dashed label="Milestones (cumulative)" />
          </div>
        </div>
      )}

      {/* Forecast per level */}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Forecast by developmental level
        </p>
        <p className="mb-3 text-[11px] text-muted-foreground">
          Only the active level is forecast — higher levels are sequenced for later, not stalled.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {levelForecasts.map((lf) => (
            <LevelForecastCard key={lf.level} f={lf} />
          ))}
        </div>
      </div>

      {/* Movers */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <MoversList
          title="Accelerating areas"
          subtitle="Closing more targets than the prior 4 weeks."
          tone="success"
          items={areaAccelerating.map((a) => ({
            primary: a.name,
            code: a.code,
            secondary: `${a.recent} targets closed in last 4w · was ${a.prior}`,
            badge: `+${a.recent - a.prior}`,
          }))}
        />
        <MoversList
          title="Stalling areas"
          subtitle="Emerging targets present, but no closures recently."
          tone="warning"
          items={areaStalling.map((a) => ({
            primary: a.name,
            code: a.code,
            secondary: `${a.weeksIdle}w idle · ${a.emergingTargets} emerging targets`,
            badge: `${a.weeksIdle}w`,
          }))}
        />
      </div>
    </Card>
  );
}

function LevelForecastCard({ f }: { f: LevelForecast }) {
  const accentClass = f.isComplete
    ? "border-success/40"
    : f.isActive
      ? f.pacing === "slowing"
        ? "border-warning/40"
        : "border-primary/40"
      : "border-border";
  return (
    <div className={`rounded-xl border ${accentClass} bg-card p-4`}>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Level {f.level}
          </span>
          <span className="ml-2 text-[11px] text-muted-foreground">{f.range}</span>
        </div>
        <div className="flex items-center gap-2">
          {f.isActive && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              Current focus
            </span>
          )}
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {f.mastered}/{f.total}
          </span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${f.isComplete ? "bg-success" : "bg-primary"}`}
          style={{ width: `${f.pct}%` }}
        />
      </div>
      <div className="mt-3">
        {f.isComplete ? (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="mt-0.5 font-display text-lg font-bold text-success">Complete</div>
          </>
        ) : f.isActive ? (
          f.etaDate && f.etaLabel ? (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Projected to complete
              </div>
              <div className="mt-0.5 font-display text-lg font-bold text-foreground">
                {new Date(f.etaDate).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {f.etaLabel} away · at {f.weeklyTargets.toFixed(1)} targets/wk
              </div>
              {f.pacing === "slowing" && (
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-warning-foreground">
                  <AlertTriangle className="size-3" /> Pace slowing — date may slip
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Forecast
              </div>
              <div className="mt-0.5 font-display text-base font-semibold text-muted-foreground">
                Building pace
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Need a few more target closures here before a date is meaningful.
              </div>
            </>
          )
        ) : (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </div>
            <div className="mt-0.5 font-display text-base font-semibold text-muted-foreground">
              Upcoming
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {f.remaining} milestone{f.remaining === 1 ? "" : "s"} remaining · scheduled after the
              current level closes.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MoversList({
  title,
  subtitle,

  tone,
  items,
}: {
  title: string;
  subtitle: string;
  tone: "success" | "warning";
  items: { primary: string; code: string; secondary: string; badge: string }[];
}) {
  const badgeCls =
    tone === "success"
      ? "bg-success/10 text-success"
      : "bg-warning/15 text-warning-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <span className="text-[10px] tabular-nums text-muted-foreground">{items.length}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">None in this range.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li
              key={it.code}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{it.primary}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {it.code}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{it.secondary}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${badgeCls}`}
              >
                {it.badge}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



function PromptByAreaCard() {
  const data = [...promptByArea].sort((a, b) => a.indep - b.indep);
  return (
    <div className="mb-6">
      <Card
        title="Prompt dependency by VB-MAPP area"
        subtitle="Based on trial-level data only. Areas with no live trials in this range are hidden — they don't appear as empty bars."
      >
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="oklch(0.93 0.01 250)" strokeDasharray="2 4" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "oklch(0.52 0.02 260)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="area"
                tick={{ fontSize: 12, fill: "oklch(0.32 0.04 264)" }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.9 0.01 250)",
                  fontSize: 12,
                }}
                formatter={(v: number, name) => [`${v}%`, name]}
              />
              <Bar dataKey="indep" stackId="a" name="Independent" radius={[6, 0, 0, 6]}>
                {data.map((d) => (
                  <Cell key={d.area} fill="oklch(0.72 0.16 160)" />
                ))}
              </Bar>
              <Bar dataKey="prompt" stackId="a" name="Prompted">
                {data.map((d) => (
                  <Cell key={d.area} fill="oklch(0.82 0.13 75)" />
                ))}
              </Bar>
              <Bar dataKey="error" stackId="a" name="Error" radius={[0, 6, 6, 0]}>
                {data.map((d) => (
                  <Cell key={d.area} fill="oklch(0.72 0.15 25 / 0.7)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          <Legend swatch="bg-success" label="Independent" />
          <Legend swatch="bg-warning" label="Prompted" />
          <Legend swatch="bg-destructive/70" label="Error" />
        </div>
      </Card>
    </div>
  );
}

function ActiveTargetsCard() {
  const order = { stalled: 0, "no-data": 1, ready: 2, "on-track": 3 } as const;
  const sorted = [...activePrograms].sort(
    (a, b) => order[a.status as keyof typeof order] - order[b.status as keyof typeof order],
  );
  return (
    <section className="mb-6 rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-display text-base font-semibold">Programs — needs review</h3>
          <p className="text-xs text-muted-foreground">
            Sorted by clinical priority. Click a program to open it in the skill map.
          </p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {sorted.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              // demo prototype — would navigate to /skill-map?program={p.id}
              console.info("open program", p.id);
            }}
            className="grid w-full grid-cols-12 items-center gap-3 px-5 py-4 text-left transition hover:bg-surface/60 focus:bg-surface/60 focus:outline-none"
          >
            <div className="col-span-12 sm:col-span-5">
              <p className="font-medium text-foreground">{p.program}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {p.area} · {p.targets} target{p.targets === 1 ? "" : "s"}
              </p>
            </div>
            <div className="col-span-7 text-sm text-muted-foreground sm:col-span-4">{p.detail}</div>
            <div className="col-span-5 sm:col-span-2">
              <StatusChip kind={p.status as StatusKind} />
            </div>
            <div className="col-span-12 inline-flex items-center justify-end gap-1 text-xs font-medium text-primary sm:col-span-1">
              {p.action} <ChevronRight className="size-3" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

type StatusKind = "stalled" | "ready" | "on-track" | "no-data";

function StatusChip({ kind }: { kind: StatusKind }) {
  const map: Record<StatusKind, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    stalled: {
      label: "Stalled",
      cls: "bg-warning/15 text-warning-foreground",
      Icon: AlertTriangle,
    },
    ready: { label: "Ready to close", cls: "bg-success/10 text-success", Icon: CheckCircle2 },
    "on-track": { label: "On track", cls: "bg-info/10 text-info", Icon: TrendingUp },
    "no-data": { label: "No data yet", cls: "bg-muted text-muted-foreground", Icon: Clock },
  };
  const { label, cls, Icon } = map[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      <Icon className="size-3" /> {label}
    </span>
  );
}

function DataQualityFooter() {
  const chips = [
    { label: "13 targets without opened date", tone: "warning" as const },
    { label: "2 active targets, no sessions yet", tone: "warning" as const },
    { label: "0 closed targets missing closedAt", tone: "ok" as const },
    { label: "0 unknown trial symbols", tone: "ok" as const },
  ];
  return (
    <section className="mb-2">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Data quality
      </h3>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
              c.tone === "warning"
                ? "border-warning/40 bg-warning/10 text-warning-foreground"
                : "border-success/30 bg-success/10 text-success"
            }`}
          >
            {c.tone === "warning" ? (
              <AlertTriangle className="size-3" />
            ) : (
              <CheckCircle2 className="size-3" />
            )}
            {c.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────── primitives ────────────────────────── */

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-0 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({
  swatch,
  pattern,
  dashed,
  label,
}: {
  swatch?: string;
  pattern?: boolean;
  dashed?: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {pattern ? (
        <span
          className="size-3 rounded-sm border border-border"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, oklch(0.85 0.01 250) 0 1.5px, transparent 1.5px 4px)",
          }}
        />
      ) : dashed ? (
        <span className={`block h-0.5 w-4 ${swatch}`} style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 7px)" }} />
      ) : (
        <span className={`size-3 rounded ${swatch}`} />
      )}
      {label}
    </span>
  );
}
