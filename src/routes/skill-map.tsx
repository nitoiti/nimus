import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import {
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Target,
  ArrowRight,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/skill-map")({
  component: SkillMap,
  head: () => ({
    meta: [
      { title: "Skill map | Nimus" },
      {
        name: "description",
        content:
          "VB-MAPP–inspired bird's-eye view of every learning area and developmental level for your child, with predicted milestones and clear next steps.",
      },
    ],
  }),
});

/* ---------- Types & mock data ---------- */

type CellStatus = "mastered" | "on-track" | "active" | "stalled" | "not-started" | "needs-mapping";

type Cell = {
  status: CellStatus;
  total: number; // targets in this area×level
  mastered: number;
  active: number;
  stalled: number;
  // average independence % across active targets
  independence: number;
  // weeks until projected completion (null = unknown / not enough data)
  etaWeeks: number | null;
};

type AreaRow = {
  code: string;
  name: string;
  // 3 levels: 0–18m, 18–30m, 30–48m
  levels: [Cell, Cell, Cell];
};

const AREAS: AreaRow[] = [
  row("MND", "Mand / Requesting", [
    cell("active", 13, 4, 6, 1, 72, 5),
    cell("on-track", 11, 1, 5, 0, 58, 11),
    cell("not-started", 9, 0, 0, 0, 0, null),
  ]),
  row("TCT", "Tact / Labeling", [
    cell("active", 12, 3, 7, 0, 64, 7),
    cell("not-started", 10, 0, 0, 0, 0, null),
    cell("not-started", 9, 0, 0, 0, 0, null),
  ]),
  row("LSN", "Listener Responding", [
    cell("on-track", 13, 6, 4, 0, 81, 4),
    cell("active", 11, 1, 4, 1, 47, 14),
    cell("not-started", 8, 0, 0, 0, 0, null),
  ]),
  row("VPM", "Visual Perceptual / Match-to-Sample", [
    cell("active", 15, 4, 5, 1, 60, 8),
    cell("not-started", 12, 0, 0, 0, 0, null),
    cell("not-started", 10, 0, 0, 0, 0, null),
  ]),
  row("PLY", "Independent Play", [
    cell("on-track", 10, 5, 3, 0, 78, 6),
    cell("active", 8, 1, 4, 0, 55, 12),
    cell("not-started", 6, 0, 0, 0, 0, null),
  ]),
  row("SOC", "Social Behavior / Social Skills", [
    cell("active", 10, 2, 4, 1, 51, 10),
    cell("not-started", 9, 0, 0, 0, 0, null),
    cell("not-started", 7, 0, 0, 0, 0, null),
  ]),
  row("IMI", "Motor Imitation", [
    cell("on-track", 7, 4, 2, 0, 84, 3),
    cell("active", 6, 1, 3, 0, 60, 9),
    cell("not-started", 5, 0, 0, 0, 0, null),
  ]),
  row("ECH", "Echoic / Vocal Imitation", [
    cell("stalled", 8, 1, 3, 3, 31, null),
    cell("not-started", 7, 0, 0, 0, 0, null),
    cell("not-started", 6, 0, 0, 0, 0, null),
  ]),
  row("INT", "Intraverbal", [
    cell("not-started", 9, 0, 0, 0, 0, null),
    cell("not-started", 9, 0, 0, 0, 0, null),
    cell("not-started", 8, 0, 0, 0, 0, null),
  ]),
  row("GRP", "Group / Classroom Skills", [
    cell("not-started", 7, 0, 0, 0, 0, null),
    cell("not-started", 7, 0, 0, 0, 0, null),
    cell("not-started", 6, 0, 0, 0, 0, null),
  ]),
  row("BHV", "Behavior / Cooperation", [
    cell("on-track", 9, 6, 3, 0, 86, 2),
    cell("active", 7, 2, 3, 0, 64, 7),
    cell("not-started", 5, 0, 0, 0, 0, null),
  ]),
  row("SLF", "Self-Help / Daily Living", [
    cell("active", 12, 2, 5, 1, 49, 13),
    cell("not-started", 10, 0, 0, 0, 0, null),
    cell("not-started", 9, 0, 0, 0, 0, null),
  ]),
];

function row(code: string, name: string, levels: [Cell, Cell, Cell]): AreaRow {
  return { code, name, levels };
}
function cell(
  status: CellStatus,
  total: number,
  mastered: number,
  active: number,
  stalled: number,
  independence: number,
  etaWeeks: number | null,
): Cell {
  return { status, total, mastered, active, stalled, independence, etaWeeks };
}

const LEVELS = [
  { n: 1, label: "Level 1", age: "0–18m" },
  { n: 2, label: "Level 2", age: "18–30m" },
  { n: 3, label: "Level 3", age: "30–48m" },
] as const;

/* ---------- Helpers ---------- */

function pct(c: Cell) {
  if (!c.total) return 0;
  return Math.round((c.mastered / c.total) * 100);
}

function statusTone(s: CellStatus) {
  switch (s) {
    case "mastered":
      return {
        ring: "ring-success/40",
        bg: "bg-success/10",
        bar: "bg-success",
        text: "text-success",
        label: "Mastered",
      };
    case "on-track":
      return {
        ring: "ring-success/30",
        bg: "bg-success/5",
        bar: "bg-success",
        text: "text-success",
        label: "On track",
      };
    case "active":
      return {
        ring: "ring-primary/30",
        bg: "bg-primary/5",
        bar: "bg-primary",
        text: "text-primary",
        label: "In progress",
      };
    case "stalled":
      return {
        ring: "ring-warning/40",
        bg: "bg-warning/10",
        bar: "bg-warning",
        text: "text-warning-foreground",
        label: "Stalled",
      };
    case "needs-mapping":
      return {
        ring: "ring-destructive/30",
        bg: "bg-destructive/5",
        bar: "bg-destructive",
        text: "text-destructive",
        label: "Needs mapping",
      };
    default:
      return {
        ring: "ring-border",
        bg: "bg-surface/60",
        bar: "bg-muted-foreground/30",
        text: "text-muted-foreground",
        label: "Not started",
      };
  }
}

function fmtEta(weeks: number | null) {
  if (weeks === null) return "—";
  if (weeks < 4) return `${weeks}w`;
  const m = Math.round(weeks / 4.345);
  return `${m}mo`;
}

/* ---------- Page ---------- */

function SkillMap() {
  const [selected, setSelected] = useState<{ area: AreaRow; levelIdx: number } | null>(null);

  // Aggregates per level (for top "milestone" insight cards)
  const levelTotals = useMemo(() => {
    return LEVELS.map((_, idx) => {
      let total = 0,
        mastered = 0,
        stalled = 0;
      let etaMax = 0;
      let etaKnown = 0;
      let unmappedAreas = 0;
      AREAS.forEach((a) => {
        const c = a.levels[idx];
        total += c.total;
        mastered += c.mastered;
        stalled += c.stalled;
        if (c.etaWeeks !== null) {
          etaMax = Math.max(etaMax, c.etaWeeks);
          etaKnown++;
        } else if (c.status !== "mastered" && c.status !== "on-track") {
          unmappedAreas++;
        }
      });
      const percent = total ? Math.round((mastered / total) * 100) : 0;
      return { total, mastered, stalled, percent, etaMax, etaKnown, unmappedAreas };
    });
  }, []);

  const overall = useMemo(() => {
    const total = AREAS.reduce((s, a) => s + a.levels.reduce((ss, c) => ss + c.total, 0), 0);
    const mastered = AREAS.reduce((s, a) => s + a.levels.reduce((ss, c) => ss + c.mastered, 0), 0);
    const active = AREAS.reduce((s, a) => s + a.levels.reduce((ss, c) => ss + c.active, 0), 0);
    const stalled = AREAS.reduce((s, a) => s + a.levels.reduce((ss, c) => ss + c.stalled, 0), 0);
    return { total, mastered, active, stalled };
  }, []);

  return (
    <AppLayout
      title="Skill map"
      subtitle="A bird's-eye view of every learning area across developmental levels — inspired by VB-MAPP, mapped to your active programs."
    >
      {/* Plain-language banner */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-info/20 bg-info/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p className="text-foreground/80">
          Each tile shows progress across the targets you're actively running for that area and level.
          This is <strong>not</strong> a formal VB-MAPP assessment — a BCBA confirms mastery. We use your
          attempt data to estimate how close each level is to completion.
        </p>
      </div>

      {/* Milestone insight cards — focus on ETA, not raw counts */}
      <section className="mb-6 grid gap-3 md:grid-cols-3">
        {LEVELS.map((lv, idx) => {
          const t = levelTotals[idx];
          const tone =
            t.percent >= 80
              ? "success"
              : t.percent >= 30
                ? "primary"
                : t.percent > 0
                  ? "secondary"
                  : "muted";
          const etaLabel =
            t.etaMax > 0
              ? fmtEta(t.etaMax)
              : t.percent === 100
                ? "Complete"
                : "Not enough data";
          return (
            <article
              key={lv.n}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {lv.label} · {lv.age}
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {t.percent === 100
                      ? "Level complete"
                      : t.percent >= 80
                        ? "Almost there"
                        : t.percent === 0
                          ? "Not started"
                          : "In progress"}
                  </h3>
                </div>
                <span
                  className={`grid size-10 place-items-center rounded-xl ${
                    tone === "success"
                      ? "bg-success/15 text-success"
                      : tone === "primary"
                        ? "bg-primary/15 text-primary"
                        : tone === "secondary"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.percent === 100 ? <CheckCircle2 className="size-5" /> : <Target className="size-5" />}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold tabular-nums">{t.percent}%</div>
                <div className="text-xs text-muted-foreground">
                  {t.mastered}/{t.total} targets mastered
                </div>
              </div>
              <Progress value={t.percent} className="mt-2 h-1.5" />

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  Projected to complete
                </span>
                <span className="font-semibold text-foreground">{etaLabel}</span>
              </div>

              {(t.stalled > 0 || t.unmappedAreas > 0) && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-warning-foreground">
                  <AlertTriangle className="size-3.5" />
                  {t.stalled > 0 && `${t.stalled} stalled target${t.stalled === 1 ? "" : "s"}`}
                  {t.stalled > 0 && t.unmappedAreas > 0 && " · "}
                  {t.unmappedAreas > 0 &&
                    `${t.unmappedAreas} area${t.unmappedAreas === 1 ? "" : "s"} not yet started`}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Overall counters */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Total targets" value={overall.total} />
        <KPI label="Mastered" value={overall.mastered} tone="success" />
        <KPI label="Active" value={overall.active} tone="primary" />
        <KPI label="Stalled" value={overall.stalled} tone="warning" />
      </section>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <LegendDot cls="bg-success" label="Mastered / On track" />
        <LegendDot cls="bg-primary" label="In progress" />
        <LegendDot cls="bg-warning" label="Stalled" />
        <LegendDot cls="bg-muted-foreground/30" label="Not started" />
        <span className="ml-auto inline-flex items-center gap-1">
          <Sparkles className="size-3" /> Click any tile for insights
        </span>
      </div>

      {/* Matrix */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {/* Header */}
        <div className="grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(0,1fr))] gap-px bg-border">
          <div className="bg-surface px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Learning area
          </div>
          {LEVELS.map((lv) => (
            <div
              key={lv.n}
              className="bg-surface px-4 py-3 text-center"
            >
              <div className="font-display text-sm font-bold text-foreground">{lv.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{lv.age}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {AREAS.map((area) => (
            <div
              key={area.code}
              className="grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(0,1fr))] gap-px bg-border"
            >
              <div className="flex items-center gap-3 bg-card px-4 py-3">
                <span className="grid size-8 place-items-center rounded-lg bg-surface text-[10px] font-bold tracking-wider text-muted-foreground">
                  {area.code}
                </span>
                <span className="font-medium text-foreground leading-tight">{area.name}</span>
              </div>
              {area.levels.map((c, i) => (
                <BrickCell
                  key={i}
                  cell={c}
                  onClick={() => setSelected({ area, levelIdx: i })}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Drill-down panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && <CellDetail area={selected.area} levelIdx={selected.levelIdx} />}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

/* ---------- Subcomponents ---------- */

function BrickCell({ cell, onClick }: { cell: Cell; onClick: () => void }) {
  const tone = statusTone(cell.status);
  const percent = pct(cell);
  const isEmpty = cell.status === "not-started" && cell.mastered === 0 && cell.active === 0;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col gap-2 ${tone.bg} px-4 py-3 text-left ring-1 ring-inset ${tone.ring} transition hover:bg-opacity-80 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-primary`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${tone.text}`}>
          {tone.label}
        </span>
        {isEmpty ? (
          <span className="text-[11px] text-muted-foreground">{cell.total} targets</span>
        ) : (
          <span className="text-[11px] font-semibold tabular-nums text-foreground">{percent}%</span>
        )}
      </div>

      {!isEmpty && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/60">
          <div
            className={`h-full ${tone.bar} transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {cell.mastered}/{cell.total}{" "}
          <span className="hidden sm:inline">mastered</span>
        </span>
        {cell.etaWeeks !== null ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
            <CalendarClock className="size-3" />
            {fmtEta(cell.etaWeeks)}
          </span>
        ) : cell.status === "stalled" ? (
          <span className="inline-flex items-center gap-1 text-warning-foreground">
            <AlertTriangle className="size-3" /> attention
          </span>
        ) : null}
      </div>
    </button>
  );
}

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "primary" | "warning";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "primary"
        ? "text-primary"
        : tone === "warning"
          ? "text-warning-foreground"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
      <div className={`font-display text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-sm ${cls}`} /> {label}
    </span>
  );
}

function CellDetail({ area, levelIdx }: { area: AreaRow; levelIdx: number }) {
  const c = area.levels[levelIdx];
  const lv = LEVELS[levelIdx];
  const tone = statusTone(c.status);
  const percent = pct(c);

  // Mock target rows for the selected cell
  const targets = [
    { name: "Requests 'open'", status: "active", indep: 78, trend: "+12%" },
    { name: "Requests help", status: "active", indep: 64, trend: "+5%" },
    { name: "Requests by feature", status: "not-started", indep: 0, trend: "—" },
    { name: "Spontaneous mand", status: c.stalled > 0 ? "stalled" : "active", indep: 31, trend: "−4%" },
  ].slice(0, Math.max(2, Math.min(4, c.active + (c.stalled || 0) + 1)));

  return (
    <div className="space-y-6">
      <SheetHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
            {area.code} · {lv.label}
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tone.bg} ${tone.text}`}>
            {tone.label}
          </span>
        </div>
        <SheetTitle className="font-display text-2xl">{area.name}</SheetTitle>
        <SheetDescription>
          {lv.age} milestones — {c.total} targets in this area · level
        </SheetDescription>
      </SheetHeader>

      {/* Headline metric */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <div className="font-display text-3xl font-bold tabular-nums">{percent}%</div>
          <div className="text-xs text-muted-foreground">
            {c.mastered} of {c.total} mastered
          </div>
        </div>
        <Progress value={percent} className="mt-2 h-1.5" />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="Active" value={c.active} />
          <MiniStat label="Stalled" value={c.stalled} tone={c.stalled ? "warning" : undefined} />
          <MiniStat label="Indep." value={`${c.independence}%`} />
        </div>
      </div>

      {/* ETA insight */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 text-primary">
          <CalendarClock className="size-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Projection</span>
        </div>
        <p className="mt-2 text-sm text-foreground">
          {c.etaWeeks === null
            ? c.status === "mastered"
              ? "All targets in this cell are mastered. Consider closing the level or adding generalization probes."
              : c.status === "stalled"
                ? "Progress has slowed. Try a different prompt level, smaller stimuli set, or revisit prerequisites before estimating completion."
                : "Not enough recent data to project. Run a few more sessions to unlock an estimate."
            : `At the current rate of mastery (~${Math.max(1, Math.round(c.active * 0.4))} targets / month), this cell should reach 100% in about ${fmtEta(c.etaWeeks)}.`}
        </p>
      </div>

      {/* Recommended next action */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="size-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-wider">Suggested next step</span>
        </div>
        <p className="mt-2 text-sm text-foreground/80">
          {c.status === "stalled"
            ? "Pause new targets — review the 1–2 stalled targets with your supervisor and adjust prompting."
            : c.status === "not-started"
              ? "Map this cell to one of the active programs to begin baseline data collection."
              : c.active > 4
                ? "You have many targets running. Consider closing the highest-independence target to make room for the next one."
                : "Keep current pace. Add the next prerequisite target when one of the active targets crosses 80% independence for 3 consecutive sessions."}
        </p>
      </div>

      {/* Targets list */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold">Targets in this cell</h4>
          <a className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" href="/progress">
            Open in Progress <ArrowRight className="size-3" />
          </a>
        </div>
        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {targets.map((t) => {
            const tt = statusTone(t.status as CellStatus);
            const trendUp = t.trend.startsWith("+");
            const trendDown = t.trend.startsWith("−") || t.trend.startsWith("-");
            return (
              <div key={t.name} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{t.name}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${tt.text}`}>
                    {tt.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="tabular-nums text-foreground">{t.indep}%</span>
                  <span
                    className={`inline-flex items-center gap-0.5 tabular-nums ${
                      trendUp ? "text-success" : trendDown ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {trendUp && <TrendingUp className="size-3" />}
                    {t.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "warning";
}) {
  return (
    <div className="rounded-lg bg-card px-2 py-2 ring-1 ring-inset ring-border">
      <div
        className={`font-display text-base font-bold tabular-nums ${
          tone === "warning" ? "text-warning-foreground" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
