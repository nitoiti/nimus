import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/skill-map")({
  component: SkillMap,
  head: () => ({ meta: [{ title: "Skill map | Nimus" }] }),
});

type Cell = { code: string; label: string; status: "mastered" | "active" | "todo" | "stalled" };

const areas: { name: string; cells: Cell[] }[] = [
  {
    name: "Mand (Requests)",
    cells: [
      { code: "M1", label: "Requests reinforcer", status: "mastered" },
      { code: "M2", label: "Requests with sign", status: "mastered" },
      { code: "M3", label: "Requests 'open'", status: "active" },
      { code: "M4", label: "Requests help", status: "todo" },
      { code: "M5", label: "Requests by feature", status: "todo" },
    ],
  },
  {
    name: "Tact (Labeling)",
    cells: [
      { code: "T1", label: "Tacts common items", status: "mastered" },
      { code: "T2", label: "Tacts actions", status: "active" },
      { code: "T3", label: "Tacts colors", status: "active" },
      { code: "T4", label: "Tacts 2 features", status: "todo" },
      { code: "T5", label: "Tacts 50 items", status: "todo" },
    ],
  },
  {
    name: "Listener Responding",
    cells: [
      { code: "L1", label: "Looks at speaker", status: "mastered" },
      { code: "L2", label: "Touches body parts", status: "mastered" },
      { code: "L3", label: "Touch blue vs yellow", status: "active" },
      { code: "L4", label: "Follows 1-step", status: "active" },
      { code: "L5", label: "Selects from 8", status: "todo" },
    ],
  },
  {
    name: "Echoic / Verbal",
    cells: [
      { code: "E1", label: "Echoes sounds", status: "mastered" },
      { code: "E2", label: "Echoes words", status: "active" },
      { code: "E3", label: "2-3 syllables", status: "stalled" },
      { code: "E4", label: "Vocal approximations", status: "todo" },
      { code: "E5", label: "Echoes phrases", status: "todo" },
    ],
  },
  {
    name: "Imitation",
    cells: [
      { code: "I1", label: "Gross motor", status: "mastered" },
      { code: "I2", label: "Fine motor", status: "active" },
      { code: "I3", label: "Two-step actions", status: "todo" },
      { code: "I4", label: "Imitate w/ object", status: "todo" },
      { code: "I5", label: "Imitate peers", status: "todo" },
    ],
  },
  {
    name: "Independent Play",
    cells: [
      { code: "P1", label: "Plays w/ toy 1 min", status: "mastered" },
      { code: "P2", label: "Plays w/ toy 5 min", status: "active" },
      { code: "P3", label: "Functional play", status: "active" },
      { code: "P4", label: "Pretend play", status: "todo" },
      { code: "P5", label: "Play with peer", status: "todo" },
    ],
  },
];

function statusStyle(s: Cell["status"]) {
  switch (s) {
    case "mastered":
      return "bg-success/15 border-success/30 text-success";
    case "active":
      return "bg-primary/10 border-primary/30 text-primary";
    case "stalled":
      return "bg-warning/20 border-warning/40 text-warning-foreground";
    default:
      return "bg-surface border-border text-muted-foreground";
  }
}

function SkillMap() {
  const total = areas.reduce((a, ar) => a + ar.cells.length, 0);
  const mastered = areas.reduce((a, ar) => a + ar.cells.filter((c) => c.status === "mastered").length, 0);
  const active = areas.reduce((a, ar) => a + ar.cells.filter((c) => c.status === "active").length, 0);
  const stalled = areas.reduce((a, ar) => a + ar.cells.filter((c) => c.status === "stalled").length, 0);

  return (
    <AppLayout
      title="Skill map"
      subtitle="A clear map of every skill area Leo is working on, has mastered, or has yet to start."
    >
      {/* Summary */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total skills" value={String(total)} />
        <Stat label="Mastered" value={String(mastered)} tone="success" />
        <Stat label="Active" value={String(active)} tone="primary" />
        <Stat label="Stalled" value={String(stalled)} tone="warning" />
      </section>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs">
        <LegendDot cls="bg-success/30 border-success/40" label="Mastered" />
        <LegendDot cls="bg-primary/20 border-primary/40" label="Active" />
        <LegendDot cls="bg-warning/30 border-warning/40" label="Stalled" />
        <LegendDot cls="bg-surface border-border" label="Not started" />
      </div>

      {/* Areas */}
      <div className="space-y-4">
        {areas.map((area) => (
          <section key={area.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{area.name}</h3>
              <span className="text-xs text-muted-foreground">
                {area.cells.filter((c) => c.status === "mastered").length}/{area.cells.length} mastered
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {area.cells.map((c) => (
                <div
                  key={c.code}
                  className={`rounded-xl border p-3 transition-transform hover:-translate-y-0.5 ${statusStyle(c.status)}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{c.code}</div>
                  <div className="mt-1 text-sm font-semibold leading-tight">{c.label}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "primary" | "warning" }) {
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
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`size-3 rounded border ${cls}`} /> {label}
    </span>
  );
}
