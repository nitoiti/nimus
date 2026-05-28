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
