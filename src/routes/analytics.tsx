import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
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
  ReferenceLine,
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
  // Generate weeks from Feb 2024 up to (roughly) today so the live era has data.
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const count = Math.max(70, Math.ceil((Date.now() - start.getTime()) / WEEK_MS));
  for (let i = 0; i < count; i++) {
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
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const count = Math.max(40, Math.ceil((Date.now() - start.getTime()) / WEEK_MS));
  return Array.from({ length: count }, (_, i) => {
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

      {/* 1. The single most parent-facing number. */}
      <div className="mb-6">
        <DevAgeCard />
      </div>

      {/* 2. Where the child is on the VB-MAPP ladder + when the active level lands. */}
      <div className="mb-6">
        <VbMappCard />
      </div>

      {/* 3. How fast we're moving right now (pace, cadence, movers). */}
      <div className="mb-6">
        <SkillMapCard />
      </div>

      {/* 4. Progress shape over time — continuous vs stepped. */}
      <div className="mb-6">
        <ProgressTrajectoriesCard />
      </div>

      {/* 5. Programs closed — units of teaching work, with/without trial data. */}
      <div className="mb-6">
        <ProgramsClosedCard />
      </div>


      {/* 6. Trial-level behaviour — independence & prompt dependence. */}
      <div className="mb-6">
        <IndependenceTrendCard />
      </div>

      <PromptByAreaCard />
      <ActiveTargetsCard />
      <DataQualityFooter />
    </AppLayout>
  );
}

function ProgressTrajectoriesCard() {
  return (
    <div className="space-y-6">
      <ClosureTimelineCard
        title={`Targets in Level ${ACTIVE_LEVEL.level} — ${ACTIVE_LEVEL.range}`}
        subtitle="Sub-skills closed within the current developmental level. Click a dot to see what was mastered that week."
        color="oklch(0.52 0.21 280)"
        closed={ACTIVE_LEVEL_TARGETS_CLOSED}
        goal={ACTIVE_LEVEL_TARGETS_GOAL}
        goalLabel={`Level ${ACTIVE_LEVEL.level} goal · ${ACTIVE_LEVEL_TARGETS_GOAL} targets`}
        series={activeLevelTargetSeries}
        closures={activeLevelTargetClosures}
        groupByWeek
      />
      <ClosureTimelineCard
        title={`Milestones in Level ${ACTIVE_LEVEL.level} — ${ACTIVE_LEVEL.range}`}
        subtitle="Whole milestones signed off. Each dot is one milestone — click to see exactly which."
        color="oklch(0.62 0.13 200)"
        closed={ACTIVE_LEVEL.mastered}
        goal={ACTIVE_LEVEL.total}
        goalLabel={`Level ${ACTIVE_LEVEL.level} goal · ${ACTIVE_LEVEL.total} milestones`}
        series={activeLevelMilestoneSeries}
        closures={activeLevelMilestoneClosures}
      />
    </div>
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

function ProgramsClosedCard() {
  const chartStart = programClosureSeries[0]?.date;
  const chartEnd = programClosureSeries[programClosureSeries.length - 1]?.date;
  const startMs = chartStart ? new Date(chartStart).getTime() : 0;
  const endMs = chartEnd ? new Date(chartEnd).getTime() : 1;
  const span = Math.max(1, endMs - startMs);

  const totalClosed = programClosures.length;
  const withData = _trialCount;
  const noData = _noTrialCount;
  const pct = Math.round((totalClosed / PROGRAMS_GOAL) * 100);
  const remaining = Math.max(0, PROGRAMS_GOAL - totalClosed);

  return (
    <Card
      title="Programs closed"
      subtitle="A program is a unit of teaching work (e.g. 'Sits nicely 1 min'). Some have per-trial records, others are start/end-only — the strip below shows which is which."
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
          {totalClosed}{" "}
          <span className="text-sm font-normal text-muted-foreground">/ {PROGRAMS_GOAL} programs</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {pct}% there · {remaining} to go
        </p>
        <p className="ml-auto text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{withData}</span> with trial data ·{" "}
          <span className="font-medium text-foreground">{noData}</span> start/end only
        </p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart
            data={programClosureSeries}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="programsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.52 0.21 280)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.52 0.21 280)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="programsTrialGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.13 200)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.62 0.13 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.93 0.01 250)" strokeDasharray="2 4" vertical={false} />
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
              domain={[0, Math.ceil(PROGRAMS_GOAL * 1.05)]}
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
              formatter={(v: number, name) => [
                v,
                name === "closed" ? "All programs (cum.)" : "With trial data (cum.)",
              ]}
            />
            <ReferenceLine
              y={PROGRAMS_GOAL}
              stroke="oklch(0.55 0.02 260)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Goal · ${PROGRAMS_GOAL} programs`,
                position: "insideTopRight",
                fill: "oklch(0.42 0.02 260)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="closed"
              stroke="oklch(0.52 0.21 280)"
              strokeWidth={2.5}
              fill="url(#programsGrad)"
            />
            <Area
              type="monotone"
              dataKey="withTrialData"
              stroke="oklch(0.62 0.13 200)"
              strokeWidth={2}
              strokeDasharray="3 3"
              fill="url(#programsTrialGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-program closure strip — one dot per program, aligned to its
          closure date, colored by whether trial data exists. Lines up
          visually with the Independence trend chart below (which can only
          plot weeks where trial data is present). */}
      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Each program closure</span>
          <span className="font-normal normal-case tracking-normal">
            hover for date · color = trial data
          </span>
        </div>
        <div className="relative h-5 rounded-md border border-border bg-surface/40">
          {programClosures.map((p) => {
            const x = ((new Date(p.closedAt).getTime() - startMs) / span) * 100;
            return (
              <div
                key={p.id}
                title={`${new Date(p.closedAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} · ${p.hasTrialData ? "with trial data" : "start/end only"}`}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${Math.max(0, Math.min(100, x))}%` }}
              >
                <div
                  className="size-2 rounded-full ring-1 ring-background"
                  style={{
                    backgroundColor: p.hasTrialData
                      ? "oklch(0.62 0.13 200)"
                      : "oklch(0.78 0.01 260)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <Legend swatch="bg-primary" label="All programs closed" />
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: "oklch(0.62 0.13 200)" }}
          />
          With trial data (feeds Independence trend)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: "oklch(0.78 0.01 260)" }}
          />
          Start/end only (no per-trial record)
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
    <Card
      title="VB-MAPP levels & forecast"
      subtitle="Milestones mastered per developmental level, with an ETA for the level currently in focus."
    >
      <div className="space-y-3">
        {vbMappLevels.map((l, i) => {
          const pct = Math.round((l.mastered / l.total) * 100);
          const complete = l.status === "complete";
          const f = levelForecasts[i];
          const isActive = f?.isActive;
          const eta = f?.etaLabel;
          const etaDate = f?.etaDate
            ? new Date(f.etaDate).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;
          const statusLabel = complete
            ? "Complete"
            : isActive
              ? "Current focus"
              : "Sequenced";
          const statusTone = complete
            ? "text-success"
            : isActive
              ? "text-info"
              : "text-muted-foreground";
          return (
            <div
              key={l.level}
              className={`rounded-xl border bg-surface/50 p-4 ${
                isActive ? "border-info/40 bg-info/5" : "border-border"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Level {l.level}
                  </span>
                  <span className="ml-2 text-[11px] text-muted-foreground">{l.range}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${statusTone}`}
                >
                  {statusLabel}
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
              {/* Forecast row — only meaningful for the active level. */}
              {!complete && (
                <div className="mt-3 border-t border-border/60 pt-2.5 text-[11px] leading-relaxed">
                  {isActive ? (
                    etaDate ? (
                      <div className="text-foreground">
                        <span className="font-semibold">Projected completion</span>{" "}
                        <span className="tabular-nums">{etaDate}</span>{" "}
                        <span className="text-muted-foreground">({eta} at current pace)</span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Building pace</span> —
                        close a few more targets to generate a date.
                      </div>
                    )
                  ) : (
                    <div className="text-muted-foreground">
                      Forecast appears once Level {l.level - 1} completes.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Developmental age — one number for parents.

   Methodology (prototype, surfaced in the card so it isn't a black box):
     1. For each VB-MAPP area, compute % mastered within each level the area
        covers (L1 = 0–18m, L2 = 18–30m, L3 = 30–48m).
     2. Convert to developmental months per area, sequentially:
          • if L1 < 80% mastered → areaMonths = 18 × L1pct
          • else if L2 < 80% mastered → areaMonths = 18 + 12 × L2pct
          • else                       → areaMonths = 30 + 18 × L3pct
        An area must finish a level before contributing months from the next
        one — partial mastery in a higher level can't paper over a gap below.
     3. Overall developmental age = the MINIMUM across areas.
        Reason: a single weak area (e.g. social) holds the child back
        functionally; reporting an average would over-state readiness.
     4. Gap to biological age = bioMonths − devMonths. Trend tracks whether
        the gap is widening (falling further behind) or narrowing
        (catching up) over the last 12 months.

   This is a clinical UI proposal — the exact thresholds and the bottleneck
   rule should be validated by a BCBA before going live in production.
   ────────────────────────────────────────────────────────────────────────── */

// Mock — in production this comes from the child profile.
const childBirthDate = new Date("2020-02-10"); // ~5y 4m today
const bioMonthsNow = (() => {
  const now = new Date();
  return (now.getFullYear() - childBirthDate.getFullYear()) * 12 + (now.getMonth() - childBirthDate.getMonth());
})();

function areaDevMonths(ai: number): number | null {
  const cells = skillGrid[ai];
  // Find first available level (some areas start at L2 or L3 in VB-MAPP).
  const firstAvail = cells.findIndex((c) => c.available);
  if (firstAvail === -1) return null;
  const LEVEL_FLOORS = [0, 18, 30];
  const LEVEL_SPANS = [18, 12, 18];
  let months = LEVEL_FLOORS[firstAvail];
  for (let l = firstAvail; l < 3; l++) {
    const c = cells[l];
    if (!c.available) break;
    const denom = c.mastered + c.emerging + c.failed + c.unassessed;
    const pct = denom > 0 ? c.mastered / denom : 0;
    if (pct < 0.8) {
      months = LEVEL_FLOORS[l] + LEVEL_SPANS[l] * pct;
      return months;
    }
    months = LEVEL_FLOORS[l] + LEVEL_SPANS[l];
  }
  return months;
}

const perAreaDev = SKILL_AREAS.map((a, ai) => ({
  code: a.code,
  name: a.name,
  months: areaDevMonths(ai),
})).filter((a): a is { code: string; name: string; months: number } => a.months !== null);

const devMonthsNow = perAreaDev.length
  ? Math.round(Math.min(...perAreaDev.map((a) => a.months)))
  : 0;

// Mock period snapshots — in production these come from re-computing dev age
// against historical snapshots. Compared in months of dev-age growth.
// Convention: narrowing rate = how many dev-months gained vs how many bio-months
// passed in the same window. >0 means we closed gap, 0 means no improvement.
const devGain30d = 1.4; // mock: dev age advanced 1.4 mo over last 30 days
const devGainPrev30d = 0.9; // prior 30 days advanced 0.9 mo
// 1 bio-month always passes in 30 days, so narrowing = devGain - 1.
const gapChange30d = devGain30d - 1; // +0.4 mo closed
const gapChangePrev30d = devGainPrev30d - 1; // -0.1 (no improvement)

// "Where to focus next" — areas closest to a level threshold whose closure
// would lift the overall dev age the most. Positive framing: each suggestion
// = a concrete unlock.
const focusAreas = [...perAreaDev]
  .sort((a, b) => a.months - b.months)
  .slice(0, 3)
  .map((a, i) => ({
    ...a,
    // Mock projected lift if the next few targets close in this area.
    liftMonths: [3, 2, 1][i] ?? 1,
    nextTargets: [4, 3, 2][i] ?? 2,
  }));

function fmtMonths(m: number) {
  const y = Math.floor(m / 12);
  const mo = Math.round(m - y * 12);
  if (y === 0) return `${mo} mo`;
  return mo === 0 ? `${y}y` : `${y}y ${mo}mo`;
}

function DevAgeCard() {
  const narrowed = Math.max(0, gapChange30d); // never show negative
  const improving = narrowed > 0;
  const prevNarrowed = Math.max(0, gapChangePrev30d);
  const faster = narrowed > prevNarrowed + 0.05;
  const sameSpeed = Math.abs(narrowed - prevNarrowed) <= 0.05;
  const trendTone = improving ? "text-success" : "text-muted-foreground";
  const TrendIcon = improving ? TrendingUp : Minus;
  const trendLabel = !improving
    ? "No gap improvement in the last 30 days"
    : faster
      ? `Narrowing the gap faster — closed ${narrowed.toFixed(1)} mo in last 30 days (was ${prevNarrowed.toFixed(1)})`
      : sameSpeed
        ? `Holding pace — closed ${narrowed.toFixed(1)} mo in last 30 days, same as prior 30d`
        : `Closed ${narrowed.toFixed(1)} mo of gap in last 30 days · prior 30d was ${prevNarrowed.toFixed(1)} mo`;

  return (
    <Card
      title="Developmental age"
      subtitle="A single number for parents — how much of the early-childhood skill ladder this child has mastered, expressed in months. Driven by the weakest VB-MAPP area, because one lagging area limits real-world function."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {/* Hero number */}
        <div className="rounded-2xl border border-border bg-surface/40 p-5 md:col-span-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Developmental age
          </div>
          <div className="mt-1 font-display text-4xl font-bold tabular-nums text-foreground">
            {fmtMonths(devMonthsNow)}
          </div>
          <div className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${trendTone}`}>
            <TrendIcon className="size-4" /> {trendLabel}
          </div>
          <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-muted-foreground">
            We compare the last 30 days of developmental growth to the prior 30 days, so a single
            slow week doesn't move the number. The goal isn't a specific age — it's keeping the
            growth rate consistent month over month.
          </p>
        </div>

        {/* Where to focus next — positive, action-oriented */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Where to focus next
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Closing targets in these areas will lift the overall developmental age the fastest.
          </p>
          <ul className="mt-3 space-y-2">
            {focusAreas.map((a) => (
              <li
                key={a.code}
                className="rounded-lg border border-border bg-surface/50 px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="truncate text-sm font-medium text-foreground">{a.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {a.code}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-success">
                    +{a.liftMonths} mo
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Close {a.nextTargets} more targets to unlock
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Methodology footnote */}
      <details className="mt-4 rounded-xl border border-border bg-surface/30 px-4 py-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">
          How this number is calculated
        </summary>
        <div className="mt-2 space-y-1.5 leading-relaxed">
          <p>
            <span className="font-medium text-foreground">Per area:</span> we walk the VB-MAPP
            levels in order (L1 0–18m → L2 18–30m → L3 30–48m). An area only graduates to the next
            level once it crosses 80% mastery in the current one.
          </p>
          <p>
            <span className="font-medium text-foreground">Overall:</span> the developmental age is
            the MINIMUM across areas, not the average — one lagging area limits real-world function.
          </p>
          <p>
            <span className="font-medium text-foreground">Trend:</span> we compare developmental
            growth in the last 30 days to the prior 30 days. If growth slowed, we say so without
            scoring it — every child progresses at their own pace.
          </p>
        </div>
      </details>
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

// ── Per-level closure simulation (named, dated) ──────────────────────────
// For the active VB-MAPP level we surface every closed milestone + target as
// a clickable dot on a timeline. Names are seeded but stable.
const _activeLevelIdxForData = vbMappLevels.findIndex((l) => l.mastered < l.total);
const ACTIVE_LEVEL = vbMappLevels[_activeLevelIdxForData >= 0 ? _activeLevelIdxForData : 0];
const TARGETS_PER_LEVEL_MILESTONE = 7; // avg sub-skills per milestone
const ACTIVE_LEVEL_TARGETS_GOAL = ACTIVE_LEVEL.total * TARGETS_PER_LEVEL_MILESTONE;
const ACTIVE_LEVEL_TARGETS_CLOSED = Math.max(
  0,
  Math.round(ACTIVE_LEVEL_TARGETS_GOAL * (ACTIVE_LEVEL.mastered / ACTIVE_LEVEL.total)) - 3,
);

const _AREA_POOL_FOR_ACTIVE_LEVEL = SKILL_AREAS
  .filter((a) => a.levels[ACTIVE_LEVEL.level - 1])
  .map((a) => a.name);

type Closure = { id: string; date: string; name: string; meta?: string };

const _DATA_START = "2024-02-01";
const _DATA_END = new Date().toISOString().slice(0, 10);

const activeLevelMilestoneClosures: Closure[] = (() => {
  const start = new Date(_DATA_START).getTime();
  const end = new Date(_DATA_END).getTime();
  const span = Math.max(1, end - start);
  return Array.from({ length: ACTIVE_LEVEL.mastered }, (_, i) => {
    const r1 = seeded(i * 31 + 100);
    const r2 = seeded(i * 47 + 113);
    const d = new Date(start + Math.floor(r1 * span));
    const area = _AREA_POOL_FOR_ACTIVE_LEVEL[Math.floor(r2 * _AREA_POOL_FOR_ACTIVE_LEVEL.length)] ?? "Skill";
    return {
      id: `ms-${i}`,
      date: d.toISOString().slice(0, 10),
      name: `${area} · L${ACTIVE_LEVEL.level}-${(i % 15) + 1}`,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
})();

const activeLevelTargetClosures: Closure[] = (() => {
  const start = new Date(_DATA_START).getTime();
  const list: Closure[] = [];
  activeLevelMilestoneClosures.forEach((m, mi) => {
    const n = 5 + Math.round(seeded(mi * 23 + 5) * 4);
    const mTime = new Date(m.date).getTime();
    for (let k = 0; k < n; k++) {
      const back = Math.floor(seeded(mi * 37 + k * 11) * 30 * 24 * 3600 * 1000);
      const t = Math.max(start, mTime - back);
      list.push({
        id: `t-${mi}-${k}`,
        date: new Date(t).toISOString().slice(0, 10),
        name: `${m.name} · sub-skill ${k + 1}`,
      });
    }
  });
  return list.slice(0, ACTIVE_LEVEL_TARGETS_CLOSED).sort((a, b) => a.date.localeCompare(b.date));
})();

function _buildCumSeries(closures: Closure[]): { date: string; value: number }[] {
  return masteryTrajectory.map((w) => ({
    date: w.date,
    value: closures.filter((c) => c.date <= w.date).length,
  }));
}
const activeLevelMilestoneSeries = _buildCumSeries(activeLevelMilestoneClosures);
const activeLevelTargetSeries = _buildCumSeries(activeLevelTargetClosures);

// ── Programs: real catalog of seeded names; no fabricated goal. ──────────
type ProgramClosure = { id: string; closedAt: string; hasTrialData: boolean; name: string };

const _PROGRAM_NAMES = [
  "Sits nicely 1 min", "Hand washing", "Tact - vehicles", "Mand - cookie",
  "Imitates clap", "Matches colors", "Echoic /b/", "Listener - body parts",
  "Plays solo 5min", "Greets peers", "Names letters A-G", "Sorts by size",
  "Requests break", "Independent toileting", "Counts 1-5", "Plays catch",
  "Removes coat", "Identifies emotions", "Follows 2-step", "Receptive shapes",
  "Tact - animals", "Mand - juice", "Imitates fine motor", "Matches shapes",
  "Echoic /m/", "Listener - actions", "Parallel play", "Eye contact 3s",
  "Sorts by color", "Toileting routine", "Counts 6-10", "Throws ball",
  "Puts on shoes", "Identifies family", "Follows 3-step", "Receptive colors",
  "Tact - food", "Mand - help",
];

const programClosures: ProgramClosure[] = (() => {
  const start = new Date(_DATA_START).getTime();
  const end = Date.now();
  const totalDays = Math.max(1, (end - start) / (24 * 3600 * 1000));
  const count = 38;
  return Array.from({ length: count }, (_, i) => {
    const r = seeded(i * 41 + 7);
    const dayOffset = Math.floor(r * totalDays);
    const d = new Date(start + dayOffset * 24 * 3600 * 1000);
    const date = d.toISOString().slice(0, 10);
    const isLive = date >= ERA_SPLIT;
    const hasTrialData = isLive
      ? seeded(i * 53 + 11) > 0.28
      : seeded(i * 53 + 11) > 0.9;
    return {
      id: `prog-${i}`,
      closedAt: date,
      hasTrialData,
      name: _PROGRAM_NAMES[i % _PROGRAM_NAMES.length],
    };
  }).sort((a, b) => a.closedAt.localeCompare(b.closedAt));
})();

// Weekly cumulative program closures.
const programClosureSeries = (() => {
  return masteryTrajectory.map((w) => ({
    date: w.date,
    value: programClosures.filter((p) => p.closedAt <= w.date).length,
    withTrialData: programClosures.filter((p) => p.closedAt <= w.date && p.hasTrialData).length,
  }));
})();

const _trialCount = programClosures.filter((p) => p.hasTrialData).length;
const _noTrialCount = programClosures.length - _trialCount;


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
  // Active level — try recent (4w) pace first; fall back to lifetime pace
  // so we can always show a date instead of a vague "building pace" label.
  const lifetimeTargets = sumDelta(liveWeeklyTargets);
  const lifetimeWeeks = Math.max(1, liveWeeklyTargets.length);
  const lifetimePerWeek = lifetimeTargets / lifetimeWeeks;
  const usingRecent = targetsPerWeek >= 0.5;
  const weeklyTargets = usingRecent ? targetsPerWeek : lifetimePerWeek;
  // If even lifetime velocity is 0, we genuinely have no signal yet.
  if (weeklyTargets < 0.1) {
    return {
      level: lv.level,
      range: lv.range,
      mastered: lv.mastered,
      total: lv.total,
      pct,
      remaining: remainingMilestones,
      weeklyTargets: 0,
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
  const pacing: LevelForecast["pacing"] = !usingRecent
    ? "building"
    : targetsDeltaPct !== null && targetsDeltaPct < -20
      ? "slowing"
      : "on-track";
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

      {/* Movers — what's accelerating vs stalling at the area level. */}
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

function TrajectoryMini({
  label,
  help,
  dataKey,
  color,
  type,
  goal,
  goalLabel,
}: {
  label: string;
  help: string;
  dataKey: "targets" | "milestones";
  color: string;
  type: "monotone" | "stepAfter";
  goal: number;
  goalLabel: string;
}) {
  const last = liveTrajectory[liveTrajectory.length - 1]?.[dataKey] ?? 0;
  const pct = Math.min(100, Math.round((last / goal) * 100));
  const remaining = Math.max(0, goal - last);
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground">{help}</p>
      </div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-lg font-semibold tabular-nums text-foreground">
          {last} <span className="text-xs font-normal text-muted-foreground">/ {goal}</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          {pct}% there · {remaining} to go
        </p>
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer>
          <LineChart data={liveTrajectory} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
              tick={{ fontSize: 10, fill: "oklch(0.52 0.02 260)" }}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={[0, Math.ceil(goal * 1.05)]}
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
            <ReferenceLine
              y={goal}
              stroke="oklch(0.65 0.02 260)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: goalLabel,
                position: "insideTopRight",
                fill: "oklch(0.45 0.02 260)",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <Line type={type} dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
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
                {f.pacing === "building" && " (lifetime pace — recent 4w is light)"}
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
                Projected to complete
              </div>
              <div className="mt-0.5 font-display text-base font-semibold text-muted-foreground">
                Needs first closures
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Close a few targets in this level to generate a date.
              </div>
            </>
          )
        ) : (
          <>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sequenced
            </div>
            <div className="mt-0.5 font-display text-base font-semibold text-muted-foreground">
              After Level {vbMappLevels[activeLevelIdx]?.level ?? 1} completes
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {f.remaining} milestone{f.remaining === 1 ? "" : "s"} here · forecast appears once
              this becomes the current focus.
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
