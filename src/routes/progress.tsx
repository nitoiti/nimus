import { useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { SeedDemoDataDialog } from "@/components/SeedDemoDataDialog";
import { ChevronLeft, ChevronRight, Filter, FlaskConical, Plus, X, Sparkles } from "lucide-react";

type ProgSearch = { empty?: boolean };

export const Route = createFileRoute("/progress")({
  component: Progress,
  head: () => ({ meta: [{ title: "Progress | Nimus" }] }),
  validateSearch: (s: Record<string, unknown>): ProgSearch => ({
    empty: s.empty === true || s.empty === "1" || s.empty === "true",
  }),
});

type Mark = "+" | "P" | "-" | null;

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const dates = ["11", "12", "13", "14", "15", "16", "17"];

const rows: {
  status: "active" | "ready" | "stalled";
  area: string;
  program: string;
  target: string;
  stimulus: string;
  marks: Mark[][]; // per day, multiple trials
}[] = [
  {
    status: "active",
    area: "Behavior / Cooperation",
    program: "Sitting nicely",
    target: "Sit nicely with hands on table",
    stimulus: "1 minute",
    marks: [
      ["P", "P", "P", "+"],
      ["P", "+", "+", "+"],
      ["+", "+", "+", "P"],
      ["+", "+", "+", "+"],
      ["+", "+", "+"],
      ["+", "+", "+"],
      [null],
    ],
  },
  {
    status: "ready",
    area: "Receptive",
    program: "Identification",
    target: "Touch blue vs yellow",
    stimulus: "Field of 2",
    marks: [
      ["+", "+", "+"],
      ["+", "+", "+", "+"],
      ["+", "+", "+", "+"],
      ["+", "+", "+", "+"],
      ["+", "+", "+", "+"],
      ["+", "+", "+", "+"],
      [null],
    ],
  },
  {
    status: "stalled",
    area: "Verbal Behavior",
    program: "Echoic",
    target: "2-3 syllable words",
    stimulus: "Verbal model",
    marks: [
      ["P", "-", "P"],
      ["-", "P", "-"],
      [null],
      [null],
      [null],
      [null],
      [null],
    ],
  },
  {
    status: "active",
    area: "Mand",
    program: "Requests",
    target: "Asks for 'open'",
    stimulus: "Closed container",
    marks: [
      ["+", "P", "+"],
      ["+", "+", "P", "+"],
      ["+", "+", "+"],
      ["+", "P", "+"],
      ["+", "+", "+"],
      [null],
      [null],
    ],
  },
];

function statusChip(s: "active" | "ready" | "stalled") {
  if (s === "ready")
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">Ready</span>;
  if (s === "stalled")
    return <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-foreground">Stalled</span>;
  return <span className="rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-bold uppercase text-info">Active</span>;
}

function MarkCell({ marks }: { marks: Mark[] }) {
  if (!marks.length || (marks.length === 1 && marks[0] === null)) {
    return <div className="grid h-9 place-items-center text-muted-foreground">—</div>;
  }
  return (
    <div className="flex h-9 flex-wrap items-center justify-center gap-1">
      {marks.map((m, i) => {
        if (!m) return null;
        const cls =
          m === "+"
            ? "bg-success/15 text-success border-success/30"
            : m === "P"
              ? "bg-warning/20 text-warning-foreground border-warning/40"
              : "bg-destructive/15 text-destructive border-destructive/30";
        return (
          <span
            key={i}
            className={`grid size-5 place-items-center rounded border text-[10px] font-bold ${cls}`}
          >
            {m}
          </span>
        );
      })}
    </div>
  );
}

function Progress() {
  const { empty } = useSearch({ from: "/progress" });
  const isEmpty = !!empty;
  const [seedOpen, setSeedOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const visibleRows = isEmpty ? [] : rows;

  return (
    <AppLayout
      title="Progress"
      subtitle="All programs, targets and daily attempts. Tap a cell to record a trial."
      actions={
        <>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted">
            <Filter className="size-3.5" /> All areas
          </button>
          <div className="inline-flex items-center rounded-full border border-border bg-card text-xs font-semibold">
            <button className="grid size-9 place-items-center hover:bg-muted rounded-l-full"><ChevronLeft className="size-3.5" /></button>
            <span className="px-3">11–17 May 2026</span>
            <button className="grid size-9 place-items-center hover:bg-muted rounded-r-full"><ChevronRight className="size-3.5" /></button>
          </div>
        </>
      }
    >
      {isEmpty && !bannerDismissed && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-soft sm:flex-row sm:items-center">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold">No sessions logged yet</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tap <strong>+</strong> below to log your first trial — or seed demo data to explore the app with ~11 months of fake history.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSeedOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <FlaskConical className="size-3.5" /> Seed demo data
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform">
              <Plus className="size-3.5" /> Add target
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <Legend swatch="bg-success/15 border-success/30 text-success" mark="+" label="Independent" />
        <Legend swatch="bg-warning/20 border-warning/40 text-warning-foreground" mark="P" label="Prompted" />
        <Legend swatch="bg-destructive/15 border-destructive/30 text-destructive" mark="−" label="Error" />
        <span className="ml-auto">{visibleRows.length} targets shown</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Area / Program</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">Stimulus</th>
              {days.map((d, i) => (
                <th key={d} className="px-2 py-3 text-center font-semibold">
                  <div className="text-foreground text-xs font-bold">{dates[i]}</div>
                  <div>{d}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={4 + days.length} className="px-6 py-16 text-center">
                  <p className="font-display text-base font-semibold">No targets yet</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    Tap the <strong>+</strong> button to add your first target — or use “Seed demo data” above to explore with sample history.
                  </p>
                </td>
              </tr>
            ) : (
              visibleRows.map((r, i) => (
                <tr key={i} className="hover:bg-surface/60 transition-colors">
                  <td className="px-4 py-3">{statusChip(r.status)}</td>
                  <td className="px-4 py-3">
                    <div className="text-foreground font-medium">{r.program}</div>
                    <div className="text-[11px] text-muted-foreground">{r.area}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{r.target}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.stimulus}</td>
                  {r.marks.map((dayMarks, j) => (
                    <td key={j} className="px-2 py-2">
                      <MarkCell marks={dayMarks} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Add button */}
      <button
        className="fixed bottom-6 right-6 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:-translate-y-0.5 transition-transform"
        aria-label="Add target"
      >
        <Plus className="size-6" />
      </button>

      <SeedDemoDataDialog
        open={seedOpen}
        onOpenChange={setSeedOpen}
        childName="Test child"
      />
    </AppLayout>
  );
}

function Legend({ swatch, mark, label }: { swatch: string; mark: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`grid size-5 place-items-center rounded border text-[10px] font-bold ${swatch}`}>{mark}</span>
      {label}
    </span>
  );
}
