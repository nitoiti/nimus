import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Link2,
  Sparkles,
  Filter,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  Plus,
  Clock,
  StickyNote,
  Target as TargetIcon,
  Layers,
  CircleDashed,
  CircleDot,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skill-map")({
  component: SkillMap,
  head: () => ({
    meta: [
      { title: "Development map | Nimus" },
      {
        name: "description",
        content:
          "VB-MAPP–style development map: areas, milestones, and targets across levels — with one-tap test recording and program linking.",
      },
    ],
  }),
});

/* ---------- Types & mock data ---------- */

type Status = "not-started" | "in-prep" | "ready" | "passed" | "failed" | "deferred";

type Target = {
  code: string; // "14-a"
  text: string;
  status: Status;
  linkedProgramIds: string[];
};

type Milestone = {
  n: number; // 1..15
  criteria: string;
  status: Status;
  targets: Target[];
  linkedProgramIds: string[];
  history: TestEvent[];
};

type TestEvent = {
  date: string;
  scope: "milestone" | "target";
  scopeLabel: string; // "M14" or "14-b"
  result: "passed" | "failed" | "retest";
  notes?: string;
};

type AreaCell = {
  areaCode: string;
  areaName: string;
  levels: [Milestone[], Milestone[], Milestone[]]; // L1, L2, L3 — each 5 milestones
};

const PROGRAMS = [
  { id: "p1", name: "Mand training — items", area: "MND" },
  { id: "p2", name: "Tact — common nouns", area: "TCT" },
  { id: "p3", name: "Listener — body parts", area: "LSN" },
  { id: "p4", name: "Match-to-sample (identical)", area: "VPM" },
  { id: "p5", name: "Independent play — puzzles", area: "PLY" },
  { id: "p6", name: "Imitation — gross motor", area: "IMI" },
  { id: "p7", name: "Group skills — circle time", area: "GRP" },
  { id: "p8", name: "Writing — name copy", area: "WRT" },
];

const AREAS_DEF: { code: string; name: string }[] = [
  { code: "MND", name: "Mand / Requesting" },
  { code: "TCT", name: "Tact / Naming" },
  { code: "LSN", name: "Listener Responding" },
  { code: "VPM", name: "Visual Perceptual / MTS" },
  { code: "PLY", name: "Independent Play" },
  { code: "SOC", name: "Social / Social Skills" },
  { code: "IMI", name: "Motor Imitation" },
  { code: "ECH", name: "Echoic / Vocal Imitation" },
  { code: "SVB", name: "Spontaneous Vocal" },
  { code: "LRF", name: "LRFFC / Conditional" },
  { code: "INT", name: "Intraverbal" },
  { code: "GRP", name: "Group / Classroom" },
  { code: "LIN", name: "Linguistics" },
  { code: "WRT", name: "Writing" },
  { code: "RED", name: "Reading" },
  { code: "MTH", name: "Math" },
];

const LEVELS = [
  { n: 1, label: "L1", age: "0–18m", range: "M1–M5" },
  { n: 2, label: "L2", age: "18–30m", range: "M6–M10" },
  { n: 3, label: "L3", age: "30–48m", range: "M11–M15" },
] as const;

// Deterministic mock: most L1 passed, some L2 in progress, L3 untouched.
function buildMockAreas(): AreaCell[] {
  const seed = (n: number) => (Math.sin(n) * 10000) % 1;
  return AREAS_DEF.map((a, ai) => {
    const levels = [0, 1, 2].map((lvl) => {
      return Array.from({ length: 5 }, (_, i) => {
        const milestoneN = lvl * 5 + i + 1;
        const r = Math.abs(seed(ai * 17 + milestoneN));
        let status: Status = "not-started";
        if (lvl === 0) status = r > 0.15 ? "passed" : r > 0.05 ? "ready" : "in-prep";
        else if (lvl === 1) {
          status =
            r > 0.85 ? "passed" : r > 0.55 ? "ready" : r > 0.3 ? "in-prep" : "not-started";
        } else {
          status = r > 0.92 ? "ready" : r > 0.75 ? "in-prep" : "not-started";
        }
        const targetCount = 3 + Math.floor(r * 4); // 3–6
        const targets: Target[] = Array.from({ length: targetCount }, (_, ti) => {
          const code = `${milestoneN}-${String.fromCharCode(97 + ti)}`;
          let tStatus: Status = "not-started";
          if (status === "passed") tStatus = "passed";
          else if (status === "ready") tStatus = ti < targetCount - 1 ? "passed" : "ready";
          else if (status === "in-prep")
            tStatus = ti === 0 ? "ready" : ti === 1 ? "in-prep" : "not-started";
          return {
            code,
            text: sampleCriteria(a.code, milestoneN, ti),
            status: tStatus,
            linkedProgramIds: ti === 0 && status !== "not-started" ? [PROGRAMS[ai % PROGRAMS.length].id] : [],
          };
        });
        const history: TestEvent[] =
          status === "passed"
            ? [
                {
                  date: `2026-0${(ai % 4) + 1}-${10 + i}`,
                  scope: "milestone",
                  scopeLabel: `M${milestoneN}`,
                  result: "passed",
                  notes: "Met criteria across 3 sessions.",
                },
              ]
            : status === "ready"
              ? [
                  {
                    date: `2026-05-${10 + i}`,
                    scope: "target",
                    scopeLabel: `${milestoneN}-a`,
                    result: "passed",
                  },
                ]
              : [];
        return {
          n: milestoneN,
          criteria: sampleCriteria(a.code, milestoneN, -1),
          status,
          targets,
          linkedProgramIds:
            status !== "not-started" ? [PROGRAMS[(ai + lvl) % PROGRAMS.length].id] : [],
          history,
        } as Milestone;
      });
    }) as [Milestone[], Milestone[], Milestone[]];
    return { areaCode: a.code, areaName: a.name, levels };
  });
}

function sampleCriteria(area: string, m: number, t: number): string {
  const base: Record<string, string> = {
    MND: "Requests preferred items spontaneously",
    TCT: "Tacts common objects in the environment",
    LSN: "Follows multi-step listener instructions",
    VPM: "Matches identical pictures across an array",
    PLY: "Engages independently with toys for 5+ min",
    SOC: "Initiates interaction with a peer",
    IMI: "Imitates gross motor actions on request",
    ECH: "Echoes 2-syllable words clearly",
    WRT: "Writes own name legibly without a model",
    GRP: "Sits in a 20-min group session, responds to 5 questions",
  };
  const stem = base[area] ?? "Demonstrates skill across novel stimuli";
  if (t < 0) return `${stem} (M${m})`;
  return `${stem} — sub-step ${String.fromCharCode(97 + t)}`;
}

/* ---------- Status visual system ---------- */

const STATUS_META: Record<
  Status,
  { label: string; dot: string; tile: string; ring: string; text: string }
> = {
  "not-started": {
    label: "Not started",
    dot: "bg-muted-foreground/30",
    tile: "bg-card hover:bg-surface",
    ring: "ring-border",
    text: "text-muted-foreground",
  },
  "in-prep": {
    label: "In preparation",
    dot: "bg-info",
    tile: "bg-info/8 hover:bg-info/15",
    ring: "ring-info/30",
    text: "text-info",
  },
  ready: {
    label: "Ready to test",
    dot: "bg-primary",
    tile: "bg-primary/10 hover:bg-primary/20",
    ring: "ring-primary/40",
    text: "text-primary",
  },
  passed: {
    label: "Passed",
    dot: "bg-success",
    tile: "bg-success/15 hover:bg-success/25",
    ring: "ring-success/40",
    text: "text-success",
  },
  failed: {
    label: "Failed",
    dot: "bg-destructive",
    tile: "bg-destructive/10 hover:bg-destructive/20",
    ring: "ring-destructive/40",
    text: "text-destructive",
  },
  deferred: {
    label: "Deferred",
    dot: "bg-warning",
    tile: "bg-warning/15 hover:bg-warning/25",
    ring: "ring-warning/40",
    text: "text-warning-foreground",
  },
};

/* ---------- Page ---------- */

function SkillMap() {
  const [areas] = useState<AreaCell[]>(() => buildMockAreas());
  const [levelFilter, setLevelFilter] = useState<1 | 2 | 3 | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [hideClosed, setHideClosed] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{
    area: AreaCell;
    levelIdx: 0 | 1 | 2;
    milestoneIdx: number;
  } | null>(null);

  const filteredAreas = useMemo(() => {
    if (!query.trim()) return areas;
    const q = query.toLowerCase();
    return areas.filter(
      (a) =>
        a.areaName.toLowerCase().includes(q) ||
        a.areaCode.toLowerCase().includes(q),
    );
  }, [areas, query]);

  const visibleLevels = useMemo(
    () => (levelFilter === "all" ? [0, 1, 2] : [levelFilter - 1]),
    [levelFilter],
  );

  // Top stats
  const stats = useMemo(() => {
    let total = 0,
      passed = 0,
      ready = 0,
      inPrep = 0;
    areas.forEach((a) =>
      a.levels.forEach((lvl) =>
        lvl.forEach((m) => {
          total++;
          if (m.status === "passed") passed++;
          else if (m.status === "ready") ready++;
          else if (m.status === "in-prep") inPrep++;
        }),
      ),
    );
    return { total, passed, ready, inPrep };
  }, [areas]);

  return (
    <AppLayout
      title="Development map"
      subtitle="VB-MAPP–style view of every milestone and target across areas and levels."
    >
      {/* Stats strip */}
      <section className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip label="Total milestones" value={stats.total} />
        <StatChip label="Passed" value={stats.passed} tone="success" />
        <StatChip label="Ready to test" value={stats.ready} tone="primary" />
        <StatChip label="In preparation" value={stats.inPrep} tone="info" />
      </section>

      {/* Toolbar */}
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area…"
              className="h-9 pl-8"
            />
          </div>
          <Select value={String(levelFilter)} onValueChange={(v) => setLevelFilter(v === "all" ? "all" : (Number(v) as 1 | 2 | 3))}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="1">Level 1</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="ready">Ready to test</SelectItem>
              <SelectItem value="in-prep">In preparation</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="not-started">Not started</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideClosed((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted"
          >
            {hideClosed ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {hideClosed ? "Show passed targets" : "Hide passed targets"}
          </button>
          <Legend />
        </div>
      </section>

      {/* Grid — areas as horizontal scroll columns, levels as vertical bands */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <div
            className="min-w-fit"
            style={{
              display: "grid",
              gridTemplateColumns: `56px repeat(${filteredAreas.length}, minmax(132px, 1fr))`,
            }}
          >
            {/* Header row */}
            <div className="sticky left-0 z-20 border-b border-r border-border bg-surface" />
            {filteredAreas.map((a) => (
              <div
                key={a.areaCode}
                className="border-b border-r border-border bg-surface px-3 py-3"
              >
                <div className="text-[10px] font-bold tracking-widest text-muted-foreground">
                  {a.areaCode}
                </div>
                <div className="mt-0.5 text-xs font-semibold leading-tight text-foreground">
                  {a.areaName}
                </div>
              </div>
            ))}

            {/* Level bands */}
            {visibleLevels.map((lvlIdx) => {
              const lv = LEVELS[lvlIdx];
              return (
                <LevelBand
                  key={lv.n}
                  lv={lv}
                  lvlIdx={lvlIdx as 0 | 1 | 2}
                  areas={filteredAreas}
                  statusFilter={statusFilter}
                  hideClosed={hideClosed}
                  onSelect={(area, milestoneIdx) =>
                    setSelected({ area, levelIdx: lvlIdx as 0 | 1 | 2, milestoneIdx })
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Drill-down */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected && (
            <MilestoneDetail
              area={selected.area}
              levelIdx={selected.levelIdx}
              milestoneIdx={selected.milestoneIdx}
            />
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

/* ---------- Level band ---------- */

function LevelBand({
  lv,
  lvlIdx,
  areas,
  statusFilter,
  hideClosed,
  onSelect,
}: {
  lv: (typeof LEVELS)[number];
  lvlIdx: 0 | 1 | 2;
  areas: AreaCell[];
  statusFilter: Status | "all";
  hideClosed: boolean;
  onSelect: (area: AreaCell, milestoneIdx: number) => void;
}) {
  return (
    <>
      {/* Level label cell — spans first column, all 5 milestone rows */}
      <div
        className="sticky left-0 z-10 flex flex-col items-center justify-center gap-1 border-b border-r border-border bg-gradient-to-b from-surface to-card"
        style={{ gridRow: `span 1` }}
      >
        <div className="rotate-0 py-3 text-center">
          <div className="font-display text-base font-bold text-foreground">{lv.label}</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
            {lv.age}
          </div>
          <div className="mt-0.5 text-[9px] text-muted-foreground">{lv.range}</div>
        </div>
      </div>

      {/* Stack of 5 milestones per area, rendered as a 5-row mini grid inside each cell */}
      {areas.map((a) => {
        const milestones = a.levels[lvlIdx];
        return (
          <div
            key={a.areaCode}
            className="flex flex-col gap-1 border-b border-r border-border bg-background/40 p-1.5"
          >
            {milestones
              .slice()
              .reverse() // M5 on top, M1 at bottom — matches VB-MAPP convention
              .map((m, revIdx) => {
                const idx = milestones.length - 1 - revIdx;
                const dim =
                  statusFilter !== "all" && m.status !== statusFilter;
                const collapsed = hideClosed && m.status === "passed";
                return (
                  <MilestoneTile
                    key={m.n}
                    m={m}
                    dim={dim}
                    collapsed={collapsed}
                    onClick={() => onSelect(a, idx)}
                  />
                );
              })}
          </div>
        );
      })}
    </>
  );
}

/* ---------- Milestone tile ---------- */

function MilestoneTile({
  m,
  dim,
  collapsed,
  onClick,
}: {
  m: Milestone;
  dim: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const meta = STATUS_META[m.status];
  const passedTargets = m.targets.filter((t) => t.status === "passed").length;
  const linkedCount = m.linkedProgramIds.length;

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "group flex items-center justify-between rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset transition",
          meta.tile,
          meta.ring,
          dim && "opacity-30",
        )}
      >
        <span className="inline-flex items-center gap-1">
          <Check className="size-3 text-success" />
          M{m.n}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-1 rounded-lg px-2 py-1.5 text-left ring-1 ring-inset transition focus:outline-none focus:ring-2 focus:ring-primary",
        meta.tile,
        meta.ring,
        dim && "opacity-30",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold tabular-nums text-foreground">
          M{m.n}
        </span>
        <span className={cn("size-2 rounded-full", meta.dot)} />
      </div>

      {/* Target dots — micro progress */}
      <div className="flex items-center gap-0.5">
        {m.targets.map((t) => (
          <span
            key={t.code}
            className={cn(
              "h-1 flex-1 rounded-full",
              t.status === "passed"
                ? "bg-success"
                : t.status === "ready"
                  ? "bg-primary"
                  : t.status === "in-prep"
                    ? "bg-info"
                    : t.status === "failed"
                      ? "bg-destructive"
                      : "bg-muted-foreground/20",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="tabular-nums">
          {passedTargets}/{m.targets.length}
        </span>
        {linkedCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-primary">
            <Link2 className="size-2.5" />
            {linkedCount}
          </span>
        )}
      </div>
    </button>
  );
}

/* ---------- Milestone detail panel ---------- */

function MilestoneDetail({
  area,
  levelIdx,
  milestoneIdx,
}: {
  area: AreaCell;
  levelIdx: 0 | 1 | 2;
  milestoneIdx: number;
}) {
  const m = area.levels[levelIdx][milestoneIdx];
  const lv = LEVELS[levelIdx];
  const meta = STATUS_META[m.status];

  const [tab, setTab] = useState("record");
  const [quickResult, setQuickResult] = useState<"passed" | "failed" | "retest" | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showLinker, setShowLinker] = useState(false);
  const [linkedPrograms, setLinkedPrograms] = useState<string[]>(m.linkedProgramIds);

  const passedCount = m.targets.filter((t) => t.status === "passed").length;
  const progressPct = Math.round((passedCount / m.targets.length) * 100);

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <SheetHeader className="space-y-3 border-b border-border bg-gradient-to-b from-surface to-card px-6 py-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>{area.areaCode}</span>
          <ChevronRight className="size-3" />
          <span>{lv.label}</span>
          <ChevronRight className="size-3" />
          <span>M{m.n}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="font-display text-2xl leading-tight">
              {area.areaName}
            </SheetTitle>
            <SheetDescription className="mt-1">{m.criteria}</SheetDescription>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ring-1 ring-inset",
              meta.tile,
              meta.ring,
              meta.text,
            )}
          >
            {meta.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {passedCount}/{m.targets.length} targets passed
            </span>
            <span className="tabular-nums font-medium text-foreground">{progressPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-success transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </SheetHeader>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
        <TabsList className="mx-6 mt-4 grid grid-cols-4">
          <TabsTrigger value="record">
            <Sparkles className="mr-1.5 size-3.5" />
            Record
          </TabsTrigger>
          <TabsTrigger value="targets">
            <TargetIcon className="mr-1.5 size-3.5" />
            Targets
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
              {m.targets.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="programs">
            <Link2 className="mr-1.5 size-3.5" />
            Programs
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
              {linkedPrograms.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="mr-1.5 size-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        {/* RECORD — single panel with the most-used action */}
        <TabsContent value="record" className="flex-1 px-6 py-5">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Result for milestone
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ResultButton
                  active={quickResult === "passed"}
                  tone="success"
                  icon={<CheckCircle2 className="size-4" />}
                  label="Passed"
                  onClick={() => setQuickResult("passed")}
                />
                <ResultButton
                  active={quickResult === "failed"}
                  tone="destructive"
                  icon={<XCircle className="size-4" />}
                  label="Failed"
                  onClick={() => setQuickResult("failed")}
                />
                <ResultButton
                  active={quickResult === "retest"}
                  tone="warning"
                  icon={<RotateCcw className="size-4" />}
                  label="Retest"
                  onClick={() => setQuickResult("retest")}
                />
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div>
                <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 w-[150px]"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <StickyNote className="size-3" />
                Session notes (optional)
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you observe? Prompt level, stimuli used, distractors…"
                rows={3}
                className="resize-none"
              />
            </div>

            <Button className="w-full" disabled={!quickResult}>
              Save result
            </Button>

            {/* Per-target quick recording */}
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Per-target quick recording
                </div>
                <span className="text-[10px] text-muted-foreground">Tap ✓/✕</span>
              </div>
              <div className="space-y-1.5">
                {m.targets.map((t) => (
                  <div
                    key={t.code}
                    className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-2 ring-1 ring-inset ring-border"
                  >
                    <span className={cn("size-1.5 rounded-full shrink-0", STATUS_META[t.status].dot)} />
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-muted-foreground">
                      {t.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                      {t.text}
                    </span>
                    <button
                      title="Mark passed"
                      className="grid size-6 place-items-center rounded-md text-success ring-1 ring-inset ring-success/30 hover:bg-success/10"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <button
                      title="Mark failed"
                      className="grid size-6 place-items-center rounded-md text-destructive ring-1 ring-inset ring-destructive/30 hover:bg-destructive/10"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TARGETS */}
        <TabsContent value="targets" className="flex-1 px-6 py-5">
          <div className="space-y-2">
            {m.targets.map((t) => {
              const tm = STATUS_META[t.status];
              return (
                <article
                  key={t.code}
                  className="rounded-xl border border-border bg-card p-3 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", tm.dot)} />
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">
                          {t.code}
                        </span>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", tm.text)}>
                          {tm.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-foreground/90">{t.text}</p>
                      {t.linkedProgramIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {t.linkedProgramIds.map((pid) => {
                            const p = PROGRAMS.find((x) => x.id === pid);
                            if (!p) return null;
                            return (
                              <Badge key={pid} variant="secondary" className="text-[10px]">
                                <Link2 className="mr-1 size-2.5" />
                                {p.name}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                        <Sparkles className="size-3" />
                        Test
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                        <Link2 className="size-3" />
                        Link
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </TabsContent>

        {/* PROGRAMS */}
        <TabsContent value="programs" className="flex-1 px-6 py-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-semibold">Linked work programs</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Programs feeding data into this milestone.
                </p>
              </div>
              <Button
                size="sm"
                variant={showLinker ? "secondary" : "default"}
                onClick={() => setShowLinker((v) => !v)}
              >
                <Plus className="mr-1 size-3.5" />
                Link program
              </Button>
            </div>

            {linkedPrograms.length === 0 && !showLinker && (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-8 text-center">
                <Link2 className="mx-auto size-6 text-muted-foreground/60" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No programs linked yet.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Link a program so its trial data updates this milestone automatically.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              {linkedPrograms.map((pid) => {
                const p = PROGRAMS.find((x) => x.id === pid);
                if (!p) return null;
                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.area} · whole milestone · requires mastered
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setLinkedPrograms((prev) => prev.filter((x) => x !== pid))
                      }
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Unlink
                    </button>
                  </div>
                );
              })}
            </div>

            {showLinker && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Link a work program
                </div>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Choose program…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.filter((p) => !linkedPrograms.includes(p.id)).map(
                        (p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.area})
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue="milestone">
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milestone">Whole milestone</SelectItem>
                        {m.targets.map((t) => (
                          <SelectItem key={t.code} value={t.code}>
                            Target {t.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="mastered">
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mastered">Requires mastered</SelectItem>
                        <SelectItem value="in-progress">Counts in progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" variant="ghost" onClick={() => setShowLinker(false)}>
                      Cancel
                    </Button>
                    <Button size="sm">Save link</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="flex-1 px-6 py-5">
          {m.history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center">
              <Clock className="mx-auto size-6 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">No test events yet</p>
              <p className="text-xs text-muted-foreground/80">
                Recorded results will show up here as a timeline.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-5">
              {m.history.map((h, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[26px] top-1 grid size-4 place-items-center rounded-full ring-4 ring-card",
                      h.result === "passed"
                        ? "bg-success"
                        : h.result === "failed"
                          ? "bg-destructive"
                          : "bg-warning",
                    )}
                  >
                    {h.result === "passed" && <Check className="size-2.5 text-white" />}
                    {h.result === "failed" && <X className="size-2.5 text-white" />}
                    {h.result === "retest" && <RotateCcw className="size-2.5 text-white" />}
                  </span>
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tabular-nums text-foreground">
                          {h.scopeLabel}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{h.scope}</span>
                      </div>
                      <span className="tabular-nums text-muted-foreground">{h.date}</span>
                    </div>
                    {h.notes && (
                      <p className="mt-1.5 text-xs text-foreground/80">{h.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- Small components ---------- */

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "primary" | "info" | "warning";
}) {
  const c =
    tone === "success"
      ? "text-success"
      : tone === "primary"
        ? "text-primary"
        : tone === "info"
          ? "text-info"
          : tone === "warning"
            ? "text-warning-foreground"
            : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-soft">
      <div className={cn("font-display text-xl font-bold tabular-nums", c)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ResultButton({
  active,
  tone,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  tone: "success" | "destructive" | "warning";
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const base =
    tone === "success"
      ? "border-success/40 text-success hover:bg-success/10"
      : tone === "destructive"
        ? "border-destructive/40 text-destructive hover:bg-destructive/10"
        : "border-warning/40 text-warning-foreground hover:bg-warning/10";
  const activeCls =
    tone === "success"
      ? "bg-success text-success-foreground border-success"
      : tone === "destructive"
        ? "bg-destructive text-destructive-foreground border-destructive"
        : "bg-warning text-warning-foreground border-warning";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition",
        active ? activeCls : cn("bg-card", base),
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Legend() {
  const items: { s: Status }[] = [
    { s: "not-started" },
    { s: "in-prep" },
    { s: "ready" },
    { s: "passed" },
    { s: "failed" },
    { s: "deferred" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
      {items.map(({ s }) => (
        <span key={s} className="inline-flex items-center gap-1">
          <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
          {STATUS_META[s].label}
        </span>
      ))}
    </div>
  );
}
