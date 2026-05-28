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
  Link2,
  Search,
  ChevronRight,
  Plus,
  Clock,
  StickyNote,
  Target as TargetIcon,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skill-map")({
  component: SkillMap,
  head: () => ({
    meta: [
      { title: "Skill map | Nimus" },
      {
        name: "description",
        content:
          "VB-MAPP skill map: 16 areas × 3 developmental levels with 0 / 0.5 / 1 scoring, emerging-skill targeting, and linked programs.",
      },
    ],
  }),
});

/* ----------------------------------------------------------------------------
 * VB-MAPP MODEL
 * Score per milestone is the canonical paper convention:
 *   null   → not assessed
 *   0      → not acquired
 *   0.5    → emerging (partial / inconsistent) — HIGHEST-VALUE TARGET
 *   1      → mastered
 * Areas exist only at the levels where VB-MAPP defines them.
 * -------------------------------------------------------------------------- */

type Score = null | 0 | 0.5 | 1;

type Milestone = {
  n: number; // 1..15
  criteria: string;
  score: Score;
  subTargets: SubTarget[]; // Targets-supplement breakdown
  links: ProgramLink[]; // links can attach to whole milestone or a specific target
  history: HistoryEvent[];
};

type SubTarget = {
  code: string;
  text: string;
  mastered: boolean;
};

type ProgramLink = {
  id: string;
  programId: string;
  scope: "milestone" | "target";
  targetCode?: string; // when scope === "target"
  trigger: "mastered" | "generalized";
  closes: "target" | "milestone";
};

type HistoryEvent =
  | { kind: "score"; date: string; score: 0 | 0.5 | 1; notes?: string }
  | { kind: "link"; date: string; programName: string; scope: "milestone" | "target"; targetCode?: string; trigger: "mastered" | "generalized"; closes: "target" | "milestone" }
  | { kind: "unlink"; date: string; programName: string; scope: "milestone" | "target"; targetCode?: string };

type AreaDef = {
  code: string;
  name: string;
  short: string;
  levels: [boolean, boolean, boolean]; // available at L1, L2, L3?
};

/* The canonical VB-MAPP grid: which areas exist at each developmental level. */
const AREAS: AreaDef[] = [
  { code: "MND", name: "Mand", short: "Requesting", levels: [true, true, true] },
  { code: "TCT", name: "Tact", short: "Naming", levels: [true, true, true] },
  { code: "LSN", name: "Listener", short: "Responding", levels: [true, true, true] },
  { code: "VPM", name: "VP-MTS", short: "Visual perceptual / match-to-sample", levels: [true, true, true] },
  { code: "PLY", name: "Play", short: "Independent play", levels: [true, true, true] },
  { code: "SOC", name: "Social", short: "Social / play with peers", levels: [true, true, true] },
  { code: "IMI", name: "Imitation", short: "Motor imitation", levels: [true, true, false] },
  { code: "ECH", name: "Echoic", short: "Vocal imitation", levels: [true, true, false] },
  { code: "SVB", name: "Spont. vocal", short: "Spontaneous vocal", levels: [true, false, false] },
  { code: "LRF", name: "LRFFC", short: "Listener by feature / function / class", levels: [false, true, true] },
  { code: "INT", name: "Intraverbal", short: "Intraverbal responding", levels: [false, true, true] },
  { code: "GRP", name: "Classroom", short: "Group / classroom routines", levels: [false, true, true] },
  { code: "LIN", name: "Linguistics", short: "Linguistic structure", levels: [false, true, true] },
  { code: "RED", name: "Reading", short: "Reading", levels: [false, false, true] },
  { code: "WRT", name: "Writing", short: "Writing", levels: [false, false, true] },
  { code: "MTH", name: "Math", short: "Math", levels: [false, false, true] },
];

const LEVELS = [
  { n: 1, label: "Level 1", age: "0–18 mo", range: "M1–M5", color: "level-1" },
  { n: 2, label: "Level 2", age: "18–30 mo", range: "M6–M10", color: "level-2" },
  { n: 3, label: "Level 3", age: "30–48 mo", range: "M11–M15", color: "level-3" },
] as const;

const PROGRAMS = [
  { id: "p1", name: "Mand training — preferred items", area: "MND" },
  { id: "p2", name: "Tact — common nouns", area: "TCT" },
  { id: "p3", name: "Listener — body parts", area: "LSN" },
  { id: "p4", name: "Match-to-sample (identical)", area: "VPM" },
  { id: "p5", name: "Independent play — puzzles", area: "PLY" },
  { id: "p6", name: "Gross motor imitation", area: "IMI" },
  { id: "p7", name: "Circle-time routines", area: "GRP" },
  { id: "p8", name: "Name copy / pre-writing", area: "WRT" },
];

/* ---------- Mock data (deterministic) ---------- */

function seeded(n: number) {
  return Math.abs((Math.sin(n * 9301 + 49297) * 233280) % 1);
}

type Cell = { milestones: Milestone[] } | null;
type Grid = Cell[][]; // [areaIdx][levelIdx]

function buildGrid(): Grid {
  return AREAS.map((a, ai) =>
    a.levels.map((available, lvl) => {
      if (!available) return null;
      const milestones = Array.from({ length: 5 }, (_, i) => {
        const milestoneN = lvl * 5 + i + 1;
        const r = seeded(ai * 31 + milestoneN);
        // L1 mostly mastered; L2 mixed with lots of emerging; L3 mostly unassessed
        let score: Score;
        if (lvl === 0) score = r > 0.2 ? 1 : r > 0.08 ? 0.5 : r > 0.02 ? 0 : null;
        else if (lvl === 1) score = r > 0.75 ? 1 : r > 0.45 ? 0.5 : r > 0.2 ? 0 : null;
        else score = r > 0.9 ? 0.5 : r > 0.7 ? 0 : null;

        const subCount = 3 + Math.floor(r * 5);
        const subTargets: SubTarget[] = Array.from({ length: subCount }, (_, ti) => ({
          code: `${milestoneN}-${String.fromCharCode(97 + ti)}`,
          text: subCriteria(a.code, milestoneN, ti),
          mastered: score === 1 || (score === 0.5 && ti < Math.floor(subCount / 2)),
        }));

        const history: HistoryEvent[] = [];
        if (score === 1) {
          history.push({ kind: "score", date: `2026-0${(ai % 4) + 1}-${10 + i}`, score: 1, notes: "Met criterion across 3 sessions." });
        } else if (score === 0.5) {
          history.push({ kind: "score", date: `2026-04-${10 + i}`, score: 0, notes: "Below criterion — needs more reps." });
          history.push({ kind: "score", date: `2026-05-${10 + i}`, score: 0.5, notes: "Inconsistent across stimuli." });
        }

        const links: ProgramLink[] =
          score === 0.5
            ? [
                {
                  id: `lnk-${ai}-${milestoneN}`,
                  programId: PROGRAMS[ai % PROGRAMS.length].id,
                  scope: "milestone",
                  trigger: "mastered",
                  closes: "milestone",
                },
              ]
            : [];

        return {
          n: milestoneN,
          criteria: criterionText(a.code, milestoneN),
          score,
          subTargets,
          links,
          history,
        };
      });
      return { milestones };
    }) as Cell[],
  );
}

function criterionText(area: string, m: number): string {
  const stems: Record<string, string> = {
    MND: "Spontaneously emits mands for preferred items/activities",
    TCT: "Tacts items, actions, and features in the environment",
    LSN: "Responds correctly to spoken instructions and labels",
    VPM: "Matches identical/similar stimuli across arrays",
    PLY: "Engages with toys independently for an extended period",
    SOC: "Initiates and sustains interaction with a peer",
    IMI: "Imitates motor actions on request",
    ECH: "Echoes words and phrases clearly",
    SVB: "Emits spontaneous vocalizations during play",
    LRF: "Identifies items by feature, function, or class",
    INT: "Answers questions in absence of the referent",
    GRP: "Participates in group routines and follows classroom expectations",
    LIN: "Produces grammatically correct utterances",
    RED: "Decodes printed words and reads simple text",
    WRT: "Writes letters, numbers, and own name legibly",
    MTH: "Demonstrates one-to-one correspondence and quantity",
  };
  return `${stems[area] ?? "Demonstrates skill across novel stimuli"} (M${m}).`;
}

function subCriteria(area: string, m: number, t: number): string {
  const verbs = ["with 3 items", "across 5 trials", "without prompt", "with novel stimuli", "in 2 settings", "with a peer", "after 30s delay"];
  const stem = criterionText(area, m).replace(/\s*\(M\d+\)\.$/, "");
  return `${stem} — ${verbs[t % verbs.length]}`;
}

/* ----------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

type ViewMode = "score" | "targeting";

function SkillMap() {
  const [grid] = useState<Grid>(() => buildGrid());
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("score");
  const [selected, setSelected] = useState<{
    areaIdx: number;
    levelIdx: 0 | 1 | 2;
    milestoneIdx: number;
  } | null>(null);

  const filteredAreas = useMemo(() => {
    if (!query.trim()) return AREAS.map((_, i) => i);
    const q = query.toLowerCase();
    return AREAS.map((a, i) => ({ a, i }))
      .filter(({ a }) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.short.toLowerCase().includes(q))
      .map(({ i }) => i);
  }, [query]);

  // Level summaries: total earned / total scored max for each level
  const levelStats = useMemo(() => {
    return LEVELS.map((_, lvl) => {
      let earned = 0;
      let possible = 0;
      let emerging = 0;
      let unassessed = 0;
      grid.forEach((row) => {
        const cell = row[lvl];
        if (!cell) return;
        cell.milestones.forEach((m) => {
          possible += 1;
          if (m.score === null) unassessed += 1;
          else {
            earned += m.score;
            if (m.score === 0.5) emerging += 1;
          }
        });
      });
      return { earned, possible, emerging, unassessed };
    });
  }, [grid]);

  return (
    <AppLayout
      title="Skill map"
      subtitle="VB-MAPP scoring grid — 16 skill areas across 3 developmental levels."
    >
      {/* Level summary strip — what the BCBA scans first */}
      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LEVELS.map((lv, i) => (
          <LevelSummary key={lv.n} lv={lv} levelIdx={i as 0 | 1 | 2} stats={levelStats[i]} />
        ))}
      </section>

      {/* Toolbar */}
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skill area…"
              className="h-9 pl-8"
            />
          </div>

          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
            <ViewToggle active={view === "score"} onClick={() => setView("score")} label="Score grid" />
            <ViewToggle active={view === "targeting"} onClick={() => setView("targeting")} label="Targeting view" />
          </div>
        </div>

        <Legend />
      </section>

      {/* The grid */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 w-[180px] border-b border-r border-border bg-surface px-3 py-2 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Skill area
                  </span>
                </th>
                {LEVELS.map((lv, i) => (
                  <th
                    key={lv.n}
                    className={cn(
                      "border-b border-r border-border px-2 py-2 text-center",
                      levelHeaderBg(i as 0 | 1 | 2),
                    )}
                  >
                    <div className="font-display text-sm font-bold text-foreground">{lv.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {lv.age} · {lv.range}
                    </div>
                  </th>
                ))}
                <th className="border-b border-border px-3 py-2 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Area score
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((ai) => {
                const a = AREAS[ai];
                return (
                  <AreaRow
                    key={a.code}
                    a={a}
                    areaIdx={ai}
                    cells={grid[ai]}
                    view={view}
                    onPick={(levelIdx, milestoneIdx) =>
                      setSelected({ areaIdx: ai, levelIdx, milestoneIdx })
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
          {selected && (
            <MilestoneDetail
              area={AREAS[selected.areaIdx]}
              levelIdx={selected.levelIdx}
              milestone={grid[selected.areaIdx][selected.levelIdx]!.milestones[selected.milestoneIdx]}
            />
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}

/* ----------------------------------------------------------------------------
 * Area row — three level cells, each containing 5 milestone squares
 * -------------------------------------------------------------------------- */

function AreaRow({
  a,
  areaIdx,
  cells,
  view,
  onPick,
}: {
  a: AreaDef;
  areaIdx: number;
  cells: Cell[];
  view: ViewMode;
  onPick: (levelIdx: 0 | 1 | 2, milestoneIdx: number) => void;
}) {
  // total area score across all scored milestones
  const { earned, possible, emerging } = useMemo(() => {
    let e = 0, p = 0, em = 0;
    cells.forEach((c) => {
      if (!c) return;
      c.milestones.forEach((m) => {
        p += 1;
        if (m.score !== null) {
          e += m.score;
          if (m.score === 0.5) em += 1;
        }
      });
    });
    return { earned: e, possible: p, emerging: em };
  }, [cells]);

  return (
    <tr className="group">
      <th
        scope="row"
        className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-2 text-left align-middle group-hover:bg-surface"
      >
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {a.code}
        </div>
        <div className="text-sm font-semibold leading-tight text-foreground">{a.name}</div>
        <div className="text-[10px] leading-tight text-muted-foreground">{a.short}</div>
      </th>

      {cells.map((cell, levelIdx) => (
        <td
          key={levelIdx}
          className={cn("border-b border-r border-border align-middle", levelCellBg(levelIdx as 0 | 1 | 2))}
        >
          {cell ? (
            <div className="flex items-center justify-center gap-1 px-2 py-2">
              {cell.milestones.map((m, mi) => (
                <MilestoneSquare
                  key={m.n}
                  m={m}
                  levelIdx={levelIdx as 0 | 1 | 2}
                  view={view}
                  onClick={() => onPick(levelIdx as 0 | 1 | 2, mi)}
                />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center px-2 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/40">
              not in level
            </div>
          )}
        </td>
      ))}

      <td className="border-b border-border px-3 py-2 text-right align-middle">
        <div className="font-display text-sm font-bold tabular-nums text-foreground">
          {formatScore(earned)}
          <span className="text-muted-foreground"> / {possible}</span>
        </div>
        {emerging > 0 && (
          <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
            {emerging} emerging
          </div>
        )}
      </td>
    </tr>
  );
}

/* ----------------------------------------------------------------------------
 * Milestone square — paper VB-MAPP convention: empty / half / full
 * Coloured by LEVEL, not by status. Tiny link indicator only when linked.
 * -------------------------------------------------------------------------- */

function MilestoneSquare({
  m,
  levelIdx,
  view,
  onClick,
}: {
  m: Milestone;
  levelIdx: 0 | 1 | 2;
  view: ViewMode;
  onClick: () => void;
}) {
  const fill = levelFillClass(levelIdx);

  // In "targeting" view, dim everything that's not an action item (0.5 emerging)
  const isAction = m.score === 0.5;
  const dimmed = view === "targeting" && !isAction && m.score !== null;

  let inner: React.ReactNode;
  if (m.score === null) {
    inner = (
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-muted-foreground/50">
        ?
      </span>
    );
  } else if (m.score === 1) {
    inner = <span className={cn("absolute inset-[3px] rounded-[3px]", fill.solid)} />;
  } else if (m.score === 0.5) {
    inner = (
      <span
        className={cn("absolute inset-[3px] rounded-[3px]", fill.solid)}
        style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
      />
    );
  } else {
    inner = null;
  }

  return (
    <button
      onClick={onClick}
      title={`M${m.n} · ${scoreLabel(m.score)}`}
      aria-label={`Milestone ${m.n}, ${scoreLabel(m.score)}`}
      className={cn(
        "relative grid size-8 place-items-center rounded-[5px] border-2 transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
        m.score === null
          ? "border-dashed border-border bg-background/40"
          : cn("bg-background/60", fill.border),
        dimmed && "opacity-25",
        isAction && view === "targeting" && "ring-2 ring-amber-400 ring-offset-1 ring-offset-card",
      )}
    >
      {inner}
      <span className="absolute -bottom-3.5 text-[8px] font-bold tabular-nums text-muted-foreground">
        M{m.n}
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------------------
 * Level summary card — what the BCBA scans first
 * -------------------------------------------------------------------------- */

function LevelSummary({
  lv,
  levelIdx,
  stats,
}: {
  lv: (typeof LEVELS)[number];
  levelIdx: 0 | 1 | 2;
  stats: { earned: number; possible: number; emerging: number; unassessed: number };
}) {
  const pct = stats.possible > 0 ? (stats.earned / stats.possible) * 100 : 0;
  const fill = levelFillClass(levelIdx);
  return (
    <div className={cn("rounded-2xl border p-4 shadow-soft", fill.border, "bg-card")}>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-display text-base font-bold text-foreground">{lv.label}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {lv.age}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold tabular-nums text-foreground">
            {formatScore(stats.earned)}
            <span className="text-sm text-muted-foreground"> / {stats.possible}</span>
          </div>
          <div className="text-[10px] tabular-nums text-muted-foreground">
            {Math.round(pct)}% mastered
          </div>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all", fill.solid)} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px]">
        {stats.emerging > 0 && (
          <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3" />
            {stats.emerging} emerging
          </span>
        )}
        {stats.unassessed > 0 && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <AlertCircle className="size-3" />
            {stats.unassessed} unassessed
          </span>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Detail panel — drill-down with 0 / 0.5 / 1 scoring, sub-targets, programs, history
 * -------------------------------------------------------------------------- */

function MilestoneDetail({
  area,
  levelIdx,
  milestone,
}: {
  area: AreaDef;
  levelIdx: 0 | 1 | 2;
  milestone: Milestone;
}) {
  const lv = LEVELS[levelIdx];
  const [tab, setTab] = useState("score");
  const [score, setScore] = useState<0 | 0.5 | 1 | null>(milestone.score);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [links, setLinks] = useState<ProgramLink[]>(milestone.links);
  const [linker, setLinker] = useState<
    | null
    | { scope: "milestone" } 
    | { scope: "target"; targetCode: string }
  >(null);
  const fill = levelFillClass(levelIdx);

  // Build combined timeline (most recent first)
  const timeline = useMemo<HistoryEvent[]>(() => {
    return [...milestone.history].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [milestone.history]);

  const milestoneLinks = links.filter((l) => l.scope === "milestone");
  const targetLinksByCode = useMemo(() => {
    const map = new Map<string, ProgramLink[]>();
    links.filter((l) => l.scope === "target").forEach((l) => {
      const code = l.targetCode!;
      if (!map.has(code)) map.set(code, []);
      map.get(code)!.push(l);
    });
    return map;
  }, [links]);

  const removeLink = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="space-y-3 border-b border-border bg-surface px-6 py-5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>{area.code}</span>
          <ChevronRight className="size-3" />
          <span>{lv.label}</span>
          <ChevronRight className="size-3" />
          <span>M{milestone.n}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="font-display text-2xl leading-tight">
              {area.name} · M{milestone.n}
            </SheetTitle>
            <SheetDescription className="mt-1">{milestone.criteria}</SheetDescription>
          </div>
          <ScoreChip score={milestone.score} fill={fill} />
        </div>
      </SheetHeader>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-1 flex-col">
        <TabsList className="mx-6 mt-4 grid grid-cols-2">
          <TabsTrigger value="score">
            <Sparkles className="mr-1.5 size-3.5" />
            Score & history
          </TabsTrigger>
          <TabsTrigger value="targets">
            <TargetIcon className="mr-1.5 size-3.5" />
            Targets & programs
            {(milestone.subTargets.length > 0 || links.length > 0) && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {milestone.subTargets.length}
                {links.length > 0 && <span className="ml-0.5 opacity-70">· {links.length}🔗</span>}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* SCORE + HISTORY */}
        <TabsContent value="score" className="flex-1 space-y-6 px-6 py-5">
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Score this milestone
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ScoreButton active={score === 0} value={0} fill={fill} onClick={() => setScore(0)}>
                  <Minus className="size-4" />
                  <span>0 — Not acquired</span>
                </ScoreButton>
                <ScoreButton active={score === 0.5} value={0.5} fill={fill} onClick={() => setScore(0.5)}>
                  <Sparkles className="size-4" />
                  <span>½ — Emerging</span>
                </ScoreButton>
                <ScoreButton active={score === 1} value={1} fill={fill} onClick={() => setScore(1)}>
                  <Check className="size-4" />
                  <span>1 — Mastered</span>
                </ScoreButton>
              </div>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-3">
              <div>
                <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="size-3" />
                  Clinical notes
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you observe? Prompt level, stimuli, settings…"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Button className="w-full" disabled={score === milestone.score}>
              Save score
            </Button>
          </div>

          {/* HISTORY — assessments + program links interleaved */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3" />
              History
            </div>
            {timeline.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">No events yet</p>
                <p className="text-xs text-muted-foreground/80">
                  Scoring and program-link changes will appear here.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-2.5 border-l border-border pl-5">
                {timeline.map((h, i) => (
                  <HistoryRow key={i} h={h} />
                ))}
              </ol>
            )}
          </div>
        </TabsContent>

        {/* TARGETS + PROGRAMS combined */}
        <TabsContent value="targets" className="flex-1 space-y-5 px-6 py-5">
          {/* Milestone-level programs */}
          <section className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-semibold">Programs for whole milestone</h4>
                <p className="text-[11px] text-muted-foreground">
                  When the program is reached, it closes this milestone.
                </p>
              </div>
              <Button size="sm" onClick={() => setLinker({ scope: "milestone" })}>
                <Plus className="mr-1 size-3.5" />
                Link
              </Button>
            </div>
            {milestoneLinks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-background/40 px-3 py-3 text-center text-xs text-muted-foreground">
                No program linked to the whole milestone.
              </p>
            ) : (
              <div className="space-y-1.5">
                {milestoneLinks.map((l) => (
                  <LinkRow key={l.id} link={l} onRemove={() => removeLink(l.id)} />
                ))}
              </div>
            )}
          </section>

          {/* Targets */}
          <section>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                Targets ({milestone.subTargets.length})
              </span>
              <span className="text-muted-foreground">From the Targets supplement</span>
            </div>
            <div className="space-y-2">
              {milestone.subTargets.map((t) => {
                const tLinks = targetLinksByCode.get(t.code) ?? [];
                return (
                  <div
                    key={t.code}
                    className={cn(
                      "rounded-lg border px-3 py-2.5",
                      t.mastered ? "border-border bg-card" : "border-dashed border-border bg-background/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-sm border-2",
                          t.mastered ? cn(fill.border, fill.solid) : "border-border",
                        )}
                      >
                        {t.mastered && <Check className="size-2.5 text-white" />}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums text-muted-foreground">
                        {t.code}
                      </span>
                      <span className="min-w-0 flex-1 text-xs text-foreground">{t.text}</span>
                      <button
                        onClick={() => setLinker({ scope: "target", targetCode: t.code })}
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition",
                          tLinks.length > 0
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Link2 className="size-3" />
                        {tLinks.length > 0 ? `${tLinks.length} linked` : "Link"}
                      </button>
                    </div>
                    {tLinks.length > 0 && (
                      <div className="mt-2 space-y-1 pl-6">
                        {tLinks.map((l) => (
                          <LinkRow key={l.id} link={l} onRemove={() => removeLink(l.id)} compact />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {linker && (
            <LinkerCard
              scope={linker.scope}
              targetCode={linker.scope === "target" ? linker.targetCode : undefined}
              existingIds={links.map((l) => l.programId)}
              onCancel={() => setLinker(null)}
              onSave={(programId, trigger, closes) => {
                setLinks((prev) => [
                  ...prev,
                  {
                    id: `lnk-${Date.now()}`,
                    programId,
                    scope: linker.scope,
                    targetCode: linker.scope === "target" ? linker.targetCode : undefined,
                    trigger,
                    closes,
                  },
                ]);
                setLinker(null);
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- History row ---------- */
function HistoryRow({ h }: { h: HistoryEvent }) {
  if (h.kind === "score") {
    return (
      <li className="relative">
        <span
          className={cn(
            "absolute -left-[26px] top-1 grid size-4 place-items-center rounded-full ring-4 ring-card",
            h.score === 1 ? "bg-emerald-500" : h.score === 0.5 ? "bg-amber-500" : "bg-muted-foreground",
          )}
        >
          {h.score === 1 && <Check className="size-2.5 text-white" />}
          {h.score === 0.5 && <Sparkles className="size-2.5 text-white" />}
          {h.score === 0 && <X className="size-2.5 text-white" />}
        </span>
        <div className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold tabular-nums text-foreground">
              Scored {scoreLabel(h.score)}
            </span>
            <span className="tabular-nums text-muted-foreground">{h.date}</span>
          </div>
          {h.notes && <p className="mt-1 text-xs text-foreground/80">{h.notes}</p>}
        </div>
      </li>
    );
  }
  const isLink = h.kind === "link";
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-[26px] top-1 grid size-4 place-items-center rounded-full ring-4 ring-card",
          isLink ? "bg-primary" : "bg-muted-foreground",
        )}
      >
        <Link2 className="size-2.5 text-white" />
      </span>
      <div className="rounded-lg border border-border bg-card p-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            {isLink ? "Linked" : "Unlinked"} <span className="font-normal">{h.programName}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{h.date}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {h.scope === "milestone" ? "Whole milestone" : `Target ${h.targetCode}`}
          {isLink && ` · closes ${h.closes} when ${h.trigger}`}
        </p>
      </div>
    </li>
  );
}

/* ---------- Linked program row ---------- */
function LinkRow({
  link,
  onRemove,
  compact,
}: {
  link: ProgramLink;
  onRemove: () => void;
  compact?: boolean;
}) {
  const p = PROGRAMS.find((x) => x.id === link.programId);
  if (!p) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border border-border bg-background",
        compact ? "px-2.5 py-1.5" : "px-3 py-2.5",
      )}
    >
      <div className="min-w-0">
        <div className={cn("truncate font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
          {p.name}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          Closes {link.closes} when {link.trigger}
        </div>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 text-[11px] text-muted-foreground hover:text-destructive"
      >
        Unlink
      </button>
    </div>
  );
}

/* ---------- Linker card (chooses program + trigger + what it closes) ---------- */
function LinkerCard({
  scope,
  targetCode,
  existingIds,
  onCancel,
  onSave,
}: {
  scope: "milestone" | "target";
  targetCode?: string;
  existingIds: string[];
  onCancel: () => void;
  onSave: (programId: string, trigger: "mastered" | "generalized", closes: "target" | "milestone") => void;
}) {
  const [programId, setProgramId] = useState<string>("");
  const [trigger, setTrigger] = useState<"mastered" | "generalized">("mastered");
  const [closes, setCloses] = useState<"target" | "milestone">(scope === "target" ? "target" : "milestone");
  const available = PROGRAMS.filter((p) => !existingIds.includes(p.id));

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary">
        Link a program · {scope === "milestone" ? "whole milestone" : `target ${targetCode}`}
      </div>
      <div className="space-y-2">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Program
          </label>
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Choose program…" />
            </SelectTrigger>
            <SelectContent>
              {available.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.area})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              When the program is…
            </label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as "mastered" | "generalized")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mastered">Mastered (instructional setting)</SelectItem>
                <SelectItem value="generalized">Generalized (across settings)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              …it closes
            </label>
            <Select value={closes} onValueChange={(v) => setCloses(v as "target" | "milestone")}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scope === "target" && <SelectItem value="target">Just this target</SelectItem>}
                <SelectItem value="milestone">The whole milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md bg-background px-2.5 py-2 text-[11px] text-foreground/80">
          <strong>Rule:</strong> when{" "}
          <span className="font-semibold">{PROGRAMS.find((p) => p.id === programId)?.name ?? "the program"}</span>{" "}
          is <span className="font-semibold">{trigger}</span>, it closes{" "}
          <span className="font-semibold">{closes === "milestone" ? "the whole milestone" : `target ${targetCode}`}</span>.
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" disabled={!programId} onClick={() => onSave(programId, trigger, closes)}>
            Save link
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Bits
 * -------------------------------------------------------------------------- */

function ViewToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="grid size-3.5 place-items-center rounded-[3px] border-2 border-dashed border-border bg-background/40 text-[7px] font-bold text-muted-foreground/50">
          ?
        </span>
        Not assessed
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3.5 rounded-[3px] border-2 border-foreground/30 bg-background" />
        0
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="relative grid size-3.5 place-items-center rounded-[3px] border-2 border-foreground/40 bg-background">
          <span
            className="absolute inset-[1px] rounded-[2px] bg-foreground/60"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
          />
        </span>
        ½ emerging
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3.5 rounded-[3px] border-2 border-foreground/40 bg-foreground/60" />
        1 mastered
      </span>
    </div>
  );
}

function ScoreChip({ score, fill }: { score: Score; fill: ReturnType<typeof levelFillClass> }) {
  if (score === null) {
    return (
      <span className="shrink-0 rounded-full border border-dashed border-border bg-background/40 px-3 py-1 text-[11px] font-bold text-muted-foreground">
        Not assessed
      </span>
    );
  }
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border-2 px-3 py-1 text-[11px] font-bold",
        fill.border,
        score === 1 ? cn(fill.solid, "text-white") : score === 0.5 ? "bg-background text-foreground" : "bg-background text-foreground",
      )}
    >
      Score: {scoreLabel(score)}
    </span>
  );
}

function ScoreButton({
  active,
  value,
  fill,
  onClick,
  children,
}: {
  active: boolean;
  value: 0 | 0.5 | 1;
  fill: ReturnType<typeof levelFillClass>;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-3 py-3 text-xs font-semibold transition",
        active
          ? value === 1
            ? cn(fill.border, fill.solid, "text-white")
            : value === 0.5
              ? "border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"
              : "border-foreground/40 bg-foreground/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

/* ---------- helpers ---------- */

function scoreLabel(s: Score): string {
  if (s === null) return "—";
  if (s === 0.5) return "0.5";
  return String(s);
}

function formatScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function levelHeaderBg(lvl: 0 | 1 | 2): string {
  return ["bg-sky-50 dark:bg-sky-950/30", "bg-teal-50 dark:bg-teal-950/30", "bg-orange-50 dark:bg-orange-950/30"][lvl];
}
function levelCellBg(lvl: 0 | 1 | 2): string {
  return ["bg-sky-50/30 dark:bg-sky-950/10", "bg-teal-50/30 dark:bg-teal-950/10", "bg-orange-50/30 dark:bg-orange-950/10"][lvl];
}
function levelFillClass(lvl: 0 | 1 | 2) {
  return [
    { solid: "bg-sky-500", border: "border-sky-400" },
    { solid: "bg-teal-500", border: "border-teal-400" },
    { solid: "bg-orange-500", border: "border-orange-400" },
  ][lvl];
}
