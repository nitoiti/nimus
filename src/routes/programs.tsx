import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Plus,
  Library,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  Sparkles,
  Check,
  CircleDot,
  Target as TargetIcon,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/programs")({
  component: ProgramsPage,
  head: () => ({
    meta: [
      { title: "Programs | Nimus" },
      {
        name: "description",
        content:
          "Working programs grouped by VB-MAPP area. See active programs, mastered targets, start and end dates at a glance.",
      },
    ],
  }),
});

/* ───────────────────────── Status model ───────────────────────── */

type Status = "planned" | "active" | "paused" | "mastered" | "generalized";

const STATUS_META: Record<
  Status,
  { label: string; dot: string; chip: string; row: string }
> = {
  planned: {
    label: "Planned",
    dot: "bg-muted-foreground/60",
    chip: "bg-muted text-muted-foreground",
    row: "",
  },
  active: {
    label: "Active",
    dot: "bg-[oklch(0.62_0.18_250)]",
    chip: "bg-[oklch(0.95_0.04_250)] text-[oklch(0.4_0.18_260)]",
    row: "bg-[oklch(0.98_0.02_250)]",
  },
  paused: {
    label: "Paused",
    dot: "bg-[oklch(0.78_0.15_75)]",
    chip: "bg-[oklch(0.96_0.05_80)] text-[oklch(0.45_0.13_75)]",
    row: "",
  },
  mastered: {
    label: "Mastered",
    dot: "bg-[oklch(0.65_0.16_160)]",
    chip: "bg-[oklch(0.95_0.05_160)] text-[oklch(0.4_0.14_160)]",
    row: "bg-[oklch(0.985_0.025_160)]",
  },
  generalized: {
    label: "Generalized",
    dot: "bg-[oklch(0.6_0.18_300)]",
    chip: "bg-[oklch(0.96_0.04_300)] text-[oklch(0.42_0.18_300)]",
    row: "",
  },
};

/* ───────────────────────── Types & seed ───────────────────────── */

/* ───────────────────────── Date helpers ───────────────────────── */

function parseDdMmYy(s?: string): Date | undefined {
  if (!s || s === "—") return undefined;
  const parts = s.split(".").map((x) => Number(x));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
  const [d, m, y] = parts;
  return new Date(2000 + y, m - 1, d);
}

function fmtDdMmYy(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear() % 100).padStart(2, "0")}`;
}

/* ───────────────────────── Stimuli (mock) ───────────────────────── */

type StimulusState = "in-program" | "target" | "mastered";

const STIMULUS_META: Record<StimulusState, { label: string; chip: string; icon: typeof CircleDot }> = {
  "in-program": { label: "In program", chip: "bg-muted text-muted-foreground", icon: CircleDot },
  target: { label: "Target", chip: "bg-[oklch(0.95_0.04_250)] text-[oklch(0.4_0.18_260)]", icon: TargetIcon },
  mastered: { label: "Mastered", chip: "bg-[oklch(0.95_0.05_160)] text-[oklch(0.4_0.14_160)]", icon: CheckCircle2 },
};

function mockStimuli(code: string, count: number): { label: string; state: StimulusState }[] {
  // Deterministic placeholder stimuli per program code
  const labels = ["cat", "dog", "ball", "cup", "book", "shoe", "car", "spoon", "apple", "chair"];
  const out: { label: string; state: StimulusState }[] = [];
  for (let i = 0; i < count; i++) {
    const s: StimulusState = i < Math.floor(count / 3) ? "mastered" : i < Math.floor((count * 2) / 3) ? "target" : "in-program";
    out.push({ label: `${labels[i % labels.length]} (${code}.${i + 1})`, state: s });
  }
  return out;
}

/* ───────────────────────── Types & seed ───────────────────────── */

type Program = {
  code: string;
  name: string;
  skill: string;
  status: Status;
  startedAt: string;
  endedAt?: string;
  targetsTotal?: number;
  targetsDone?: number;
};

type Area = {
  code: string;
  title: string;
  programs: Program[];
};

const SEED_AREAS: Area[] = [
  {
    code: "A",
    title: "Behavior / Cooperation",
    programs: [
      { code: "A1", name: "Independent work", skill: "Independent work", status: "mastered", startedAt: "22.09.24", endedAt: "28.05.26" },
      { code: "A2", name: "Sitting nicely while waiting", skill: "Sitting nicely – hands o…", status: "mastered", startedAt: "04.12.25", endedAt: "28.05.26" },
      { code: "A3", name: "Sitting nicely - hands on table while sitting", skill: "Sitting nicely – hands o…", status: "mastered", startedAt: "26.02.24", endedAt: "28.02.24", targetsDone: 0, targetsTotal: 1 },
      { code: "A4", name: "Sitting nicely - hands on table while sitting (Feb 2024)", skill: "Sitting nicely – hands o…", status: "mastered", startedAt: "04.02.24", endedAt: "16.02.24", targetsDone: 0, targetsTotal: 1 },
    ],
  },
  {
    code: "B",
    title: "Echoic / Verbal Behavior",
    programs: [
      { code: "B1", name: "Echoics", skill: "Echoic – sounds", status: "active", startedAt: "15.01.26" },
    ],
  },
  {
    code: "C",
    title: "Intraverbal",
    programs: [
      { code: "C1", name: "Answer 'What do you use to…' questions", skill: "Answers to \"What\" que…", status: "active", startedAt: "10.05.26", targetsDone: 0, targetsTotal: 8 },
      { code: "C2", name: "Answer 'What is happening?' for common actions", skill: "Answers to \"What\" que…", status: "active", startedAt: "10.05.26", targetsDone: 0, targetsTotal: 8 },
      { code: "C3", name: "Answer 'What is this?' for common objects", skill: "Answers to \"What\" que…", status: "mastered", startedAt: "10.05.26", endedAt: "28.05.26", targetsDone: 0, targetsTotal: 8 },
      { code: "C4", name: "Animal sounds answer the questions", skill: "Answers to \"What\" que…", status: "mastered", startedAt: "08.12.25", endedAt: "15.01.26" },
    ],
  },
  {
    code: "D",
    title: "Independent Play",
    programs: [
      { code: "D1", name: "Thick colouring", skill: "Drawing and Coloring", status: "active", startedAt: "23.05.26" },
      { code: "D2", name: "Block design on pics", skill: "Lego and Block Buildin…", status: "active", startedAt: "10.05.26", targetsDone: 0, targetsTotal: 1 },
      { code: "D3", name: "Jigsaw", skill: "Puzzle and Jigsaw play", status: "mastered", startedAt: "08.07.24", endedAt: "12.07.24", targetsDone: 0, targetsTotal: 3 },
      { code: "D4", name: "Play skills scenarios", skill: "Pretend and Symbolic p…", status: "mastered", startedAt: "09.06.24", endedAt: "06.07.24" },
      { code: "D5", name: "jigsaw play", skill: "Puzzle and Jigsaw play", status: "mastered", startedAt: "27.06.24", endedAt: "05.07.24", targetsDone: 0, targetsTotal: 1 },
      { code: "D6", name: "Jigsaw puzzle play", skill: "Puzzle and Jigsaw play", status: "mastered", startedAt: "17.06.24", endedAt: "25.06.24", targetsDone: 0, targetsTotal: 1 },
      { code: "D7", name: "Load cargo play", skill: "Pretend and Symbolic p…", status: "mastered", startedAt: "11.06.24", endedAt: "16.06.24", targetsDone: 0, targetsTotal: 1 },
      { code: "D8", name: "Puzzle and Jigsaw play (no dates)", skill: "Puzzle and Jigsaw play", status: "mastered", startedAt: "04.03.24", endedAt: "08.06.24", targetsDone: 0, targetsTotal: 3 },
      { code: "D9", name: "Fine Motor skills", skill: "Fine Motor skills", status: "mastered", startedAt: "12.03.24", endedAt: "24.05.24", targetsDone: 0, targetsTotal: 1 },
      { code: "D10", name: "Functional toy play", skill: "Functional toy play", status: "mastered", startedAt: "04.03.24", endedAt: "10.04.24", targetsDone: 0, targetsTotal: 2 },
      { code: "D11", name: "Active Play", skill: "Active Play", status: "mastered", startedAt: "21.02.24", endedAt: "17.03.24", targetsDone: 0, targetsTotal: 1 },
      { code: "D12", name: "Puzzle and Jigsaw play (Feb 2024 – Mar 2024)", skill: "Puzzle and Jigsaw play", status: "mastered", startedAt: "19.02.24", endedAt: "17.03.24", targetsDone: 0, targetsTotal: 3 },
      { code: "D13", name: "Learn to play first game", skill: "Functional toy play", status: "mastered", startedAt: "19.02.24", endedAt: "03.03.24", targetsDone: 0, targetsTotal: 1 },
    ],
  },
  {
    code: "E",
    title: "Listener Behavior",
    programs: [
      { code: "E1", name: "Receptive 2 words noun verb combinations", skill: "Listener responding b…", status: "active", startedAt: "03.12.25" },
      { code: "E2", name: "Receptive categories", skill: "Identifying pictures by …", status: "mastered", startedAt: "16.02.26", endedAt: "28.05.26" },
      { code: "E3", name: "Receptive instructions – 2 steps", skill: "Listener responding b…", status: "paused", startedAt: "11.04.26" },
    ],
  },
];

const AREA_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

/* ───────────────────────── Page ───────────────────────── */

function ProgramsPage() {
  const [areas, setAreas] = useState<Area[]>(SEED_AREAS);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [query, setQuery] = useState("");

  const [newAreaOpen, setNewAreaOpen] = useState(false);
  const [newProgramArea, setNewProgramArea] = useState<string | null>(null);

  const filteredAreas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return areas
      .map((area) => {
        const programs = area.programs.filter((p) => {
          const isActive = p.status === "active" || p.status === "paused" || p.status === "planned";
          if (filter === "active" && !isActive) return false;
          if (q && !(`${p.code} ${p.name} ${p.skill}`.toLowerCase().includes(q))) return false;
          return true;
        });
        return { ...area, programs };
      })
      .filter((a) => a.programs.length > 0);
  }, [areas, filter, query]);

  const totals = useMemo(() => {
    const all = areas.flatMap((a) => a.programs);
    return {
      total: all.length,
      active: all.filter((p) => p.status === "active" || p.status === "paused" || p.status === "planned").length,
    };
  }, [areas]);

  const isEmpty = totals.total === 0;

  const handleCreateArea = (title: string) => {
    const code = AREA_CODES[areas.length] ?? `X${areas.length + 1}`;
    setAreas((prev) => [...prev, { code, title, programs: [] }]);
    setNewAreaOpen(false);
  };

  const handleCreateProgram = (
    areaCode: string,
    data: { name: string; skill: string; status: Status; startedAt: string },
  ) => {
    setAreas((prev) =>
      prev.map((a) => {
        if (a.code !== areaCode) return a;
        const code = `${a.code}${a.programs.length + 1}`;
        return {
          ...a,
          programs: [
            ...a.programs,
            {
              code,
              name: data.name,
              skill: data.skill || "—",
              status: data.status,
              startedAt: data.startedAt || "—",
            },
          ],
        };
      }),
    );
    setNewProgramArea(null);
  };

  const handleUpdateProgram = (
    areaCode: string,
    code: string,
    patch: Partial<Program>,
  ) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.code !== areaCode
          ? a
          : {
              ...a,
              programs: a.programs.map((p) => (p.code === code ? { ...p, ...patch } : p)),
            },
      ),
    );
  };

  return (
    <AppLayout
      title="Programs"
      subtitle="Working programs grouped by VB-MAPP area."
      actions={
        !isEmpty ? (
          <Button className="rounded-full" onClick={() => setNewAreaOpen(true)}>
            <Plus className="size-4" /> New area
          </Button>
        ) : undefined
      }
    >
      {isEmpty ? (
        <FirstRunEmptyState
          onStartFromTemplate={() => {
            /* TODO: open templates picker */
          }}
          onStartFromScratch={() => setNewAreaOpen(true)}
        />
      ) : (
        <>
          {/* Filter strip */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "active" | "all")}>
              <TabsList className="rounded-full bg-card shadow-soft">
                <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Active · {totals.active}
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All · {totals.total}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs…"
                  className="rounded-full pl-9 bg-card"
                />
              </div>
            </div>
          </div>

          {/* Status legend */}
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {(Object.keys(STATUS_META) as Status[]).map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", STATUS_META[s].dot)} />
                {STATUS_META[s].label}
              </span>
            ))}
          </div>

          {/* Area cards */}
          <div className="space-y-5">
            {filteredAreas.length === 0 ? (
              <FilterEmptyState />
            ) : (
              filteredAreas.map((area) => (
                <AreaCard
                  key={area.code}
                  area={area}
                  onAddProgram={() => setNewProgramArea(area.code)}
                />
              ))
            )}
          </div>
        </>
      )}

      <NewAreaDialog
        open={newAreaOpen}
        onOpenChange={setNewAreaOpen}
        onCreate={handleCreateArea}
      />
      <NewProgramDialog
        areaCode={newProgramArea}
        onOpenChange={(open) => !open && setNewProgramArea(null)}
        onCreate={(data) => newProgramArea && handleCreateProgram(newProgramArea, data)}
      />
    </AppLayout>
  );
}

/* ───────────────────────── Area card ───────────────────────── */

function AreaCard({ area, onAddProgram }: { area: Area; onAddProgram: () => void }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-border bg-muted/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {area.code}
          </span>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground sm:text-base">
            {area.title}
          </h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAddProgram}
          className="h-7 self-start rounded-full text-xs font-medium text-primary hover:bg-primary/10 sm:self-auto"
        >
          <Plus className="size-3.5" /> Program
        </Button>
      </header>

      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-12 px-5 py-2.5">#</th>
              <th className="px-3 py-2.5">Program</th>
              <th className="px-3 py-2.5">Skill</th>
              <th className="w-32 px-3 py-2.5">Status</th>
              <th className="w-24 px-3 py-2.5">Start</th>
              <th className="w-24 px-3 py-2.5">End</th>
              <th className="w-20 px-3 py-2.5 text-right">Targets</th>
              <th className="w-8 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {area.programs.map((p) => {
              const meta = STATUS_META[p.status];
              return (
                <tr
                  key={p.code}
                  className={cn(
                    "border-t border-border/60 transition-colors hover:bg-muted/30",
                    meta.row,
                  )}
                >
                  <td className="px-5 py-3 align-middle text-xs font-medium text-muted-foreground">
                    {p.code}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <button className="text-left font-medium text-primary hover:underline">
                      {p.name}
                    </button>
                  </td>
                  <td className="px-3 py-3 align-middle text-xs italic text-muted-foreground">
                    {p.skill}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        meta.chip,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle text-xs tabular-nums text-foreground/70">
                    {p.startedAt}
                  </td>
                  <td className="px-3 py-3 align-middle text-xs tabular-nums text-foreground/70">
                    {p.endedAt ?? "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-right text-xs tabular-nums text-muted-foreground">
                    {p.targetsTotal ? `${p.targetsDone ?? 0}/${p.targetsTotal}` : "—"}
                  </td>
                  <td className="px-3 py-3 align-middle text-muted-foreground">
                    <ChevronRight className="size-4" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border/60 md:hidden">
        {area.programs.map((p) => {
          const meta = STATUS_META[p.status];
          return (
            <li key={p.code} className={cn("px-4 py-3", meta.row)}>
              <button className="flex w-full items-start gap-3 text-left">
                <span className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {p.code}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-primary">{p.name}</p>
                  <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
                    {p.skill}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium",
                        meta.chip,
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
                      <Calendar className="size-3" />
                      {p.startedAt}
                      {p.endedAt ? ` → ${p.endedAt}` : ""}
                    </span>
                    {p.targetsTotal ? (
                      <span className="tabular-nums text-muted-foreground">
                        {p.targetsDone ?? 0}/{p.targetsTotal} targets
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────── Empty states ───────────────────────── */

function FirstRunEmptyState({
  onStartFromTemplate,
  onStartFromScratch,
}: {
  onStartFromTemplate: () => void;
  onStartFromScratch: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        Start your first program
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
        Pick a ready-made VB-MAPP template, or start from scratch and build
        your own areas and programs.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
        <Button variant="outline" className="rounded-full" onClick={onStartFromTemplate}>
          <Library className="size-4" /> Start from template
        </Button>
        <Button className="rounded-full" onClick={onStartFromScratch}>
          <Plus className="size-4" /> Start from scratch
        </Button>
      </div>
    </div>
  );
}

function FilterEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        Nothing here yet
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        No programs match the current filter. Try switching to <strong>All</strong>{" "}
        or clearing your search.
      </p>
    </div>
  );
}

/* ───────────────────────── Dialogs ───────────────────────── */

function NewAreaDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate(t);
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setTitle(""); }}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>New area</DialogTitle>
          <DialogDescription>
            Group related programs under a VB-MAPP area (e.g. Listener, Intraverbal).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-title">Area name</Label>
            <Input
              id="area-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Intraverbal"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={!title.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewProgramDialog({
  areaCode,
  onOpenChange,
  onCreate,
}: {
  areaCode: string | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; skill: string; status: Status; startedAt: string }) => void;
}) {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState<Status>("planned");
  const [startedAt, setStartedAt] = useState("");

  const open = areaCode !== null;

  const handleOpenChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setName(""); setSkill(""); setStatus("planned"); setStartedAt("");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    onCreate({ name: n, skill: skill.trim(), status, startedAt: startedAt.trim() });
    setName(""); setSkill(""); setStatus("planned"); setStartedAt("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>New program</DialogTitle>
          <DialogDescription>
            {areaCode ? `Add a program to area ${areaCode}.` : "Add a program."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Program name *</Label>
            <Input
              id="prog-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Matching identical pictures…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-skill">Skill (group)</Label>
            <Input
              id="prog-skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Skill name (or leave empty)…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prog-status">Status</Label>
              <select
                id="prog-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {(Object.keys(STATUS_META) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-start">Start date</Label>
              <Input
                id="prog-start"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                placeholder="dd.mm.yy"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={!name.trim()}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
