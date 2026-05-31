import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  CircleDot,
  Target as TargetIcon,
  Sparkles,
  Pencil,
} from "lucide-react";

export const Route = createFileRoute("/programs_/$programId")({
  component: ProgramDetailPage,
  head: ({ params }) => ({
    meta: [
      { title: `Program ${params.programId} | Nimus` },
      {
        name: "description",
        content:
          "Program objective, SD / response, stimuli list, sessions and mastery analytics for an ABA program.",
      },
    ],
  }),
});

/* ───────────────────────── Mock program (replace with real lookup) ───────────────────────── */

type StimulusState = "in-program" | "target" | "mastered";

function getMockProgram(id: string) {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const labels = [
    "Vehicles / Transport", "Food", "Clothes", "Furniture", "Fruits",
    "Vegetables", "Farm animals", "Wild animals", "Insects", "Drinks",
    "Musical instruments", "Shapes", "Numbers", "Letters", "Body parts",
    "Flowers", "Shops", "Toys", "Sea animals", "Birds",
  ];
  const stimCount = 12 + (seed % 6);
  const stimuli = labels.slice(0, stimCount).map((label, i) => {
    const state: StimulusState =
      i < Math.floor(stimCount * 0.55) ? "mastered" : i < Math.floor(stimCount * 0.85) ? "target" : "in-program";
    return {
      label,
      state,
      introducedAt: `${String(((i * 3) % 28) + 1).padStart(2, "0")}.0${1 + (i % 3)}.26`,
      masteredAt: state === "mastered" ? `${String(((i * 3) % 28) + 4).padStart(2, "0")}.0${1 + (i % 3)}.26` : undefined,
    };
  });

  // Sessions trial-by-trial (last 14 sessions)
  const sessions = Array.from({ length: 14 }, (_, i) => {
    const correct = Math.min(10, 3 + Math.round(Math.sin(i / 2 + seed) * 2) + Math.floor(i / 2));
    const incorrect = Math.max(0, 10 - correct + ((seed + i) % 3) - 1);
    return {
      session: `S${i + 1}`,
      correct,
      incorrect,
      accuracy: Math.round((correct / Math.max(1, correct + incorrect)) * 100),
    };
  });

  // Mastery progression over time (cumulative mastered stimuli)
  const mastery = Array.from({ length: stimCount }, (_, i) => ({
    day: `D${i + 1}`,
    mastered: Math.min(stimuli.filter((s) => s.state === "mastered").length, Math.floor(i * 0.7)),
  }));

  return {
    code: id,
    name: id.startsWith("C") ? "Answer 'What do you use to…' questions" : "Sorting by category",
    area: "Intraverbal",
    skill: "Answers to \"What\" questions",
    status: "active" as const,
    startedAt: "10.05.26",
    endedAt: undefined as string | undefined,
    objective: "The child will be able to sort objects by category.",
    sd: "We are placing on the table 3 pictures representing a category and we give a picture to the child that represents one of the categories.",
    response: "Child will sort pictures based on the category it represents.",
    stimuli,
    sessions,
    mastery,
    linkedMilestone: "M4 · Intraverbal — answers to common questions",
    linkedGoals: [
      "Independently sort 20 stimuli across 3 sessions",
      "Generalize sorting across 2 instructors",
    ],
  };
}

/* ───────────────────────── Page ───────────────────────── */

function ProgramDetailPage() {
  const { programId } = Route.useParams();
  const program = useMemo(() => getMockProgram(programId), [programId]);

  const counts = {
    mastered: program.stimuli.filter((s) => s.state === "mastered").length,
    target: program.stimuli.filter((s) => s.state === "target").length,
    inProgram: program.stimuli.filter((s) => s.state === "in-program").length,
  };
  const total = program.stimuli.length;
  const masteredPct = Math.round((counts.mastered / Math.max(1, total)) * 100);

  return (
    <AppLayout
      title={program.name}
      subtitle={`${program.area} · ${program.code}`}
      breadcrumbs={[
        { label: "Programs", href: "/programs" },
        { label: program.name },
      ]}
      actions={
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/programs">
            <ArrowLeft className="size-4" /> Back to programs
          </Link>
        </Button>
      }
    >
      {/* Top meta strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard label="Status" value={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.95_0.04_250)] px-2 py-0.5 text-xs font-medium text-[oklch(0.4_0.18_260)]">
            <span className="size-1.5 rounded-full bg-[oklch(0.62_0.18_250)]" /> Active
          </span>
        } />
        <MetaCard label="Started" value={<span className="inline-flex items-center gap-1.5 text-sm"><Calendar className="size-3.5 text-muted-foreground" />{program.startedAt}</span>} />
        <MetaCard label="Ended" value={<span className="text-sm text-muted-foreground">{program.endedAt ?? "—"}</span>} />
        <MetaCard label="Mastery" value={
          <span className="text-sm font-semibold tabular-nums">
            {counts.mastered}/{total} <span className="font-normal text-muted-foreground">· {masteredPct}%</span>
          </span>
        } />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column: objective / SD / R */}
        <section className="space-y-5 lg:col-span-2">
          <Card title="Objective" actions={<Button size="sm" variant="ghost" className="rounded-full text-xs"><Pencil className="size-3.5" />Edit</Button>}>
            <p className="text-sm leading-relaxed text-foreground">{program.objective}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  SD1 · Discriminative stimulus
                </dt>
                <dd className="mt-1 text-foreground">{program.sd}</dd>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  R1 · Target response
                </dt>
                <dd className="mt-1 text-foreground">{program.response}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              In ABA, <strong>SD</strong> (discriminative stimulus) is what you present to the
              child; <strong>R</strong> is the response that counts as correct. SD1/R1 means the
              first SD–R pair defined for this program.
            </p>
          </Card>

          <Card title="Stimuli" subtitle={`${total} total · ${counts.mastered} mastered · ${counts.target} target · ${counts.inProgram} in program`}>
            <ul className="divide-y divide-border/60">
              <li className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-1 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Stimulus</span>
                <span className="w-20 text-right">Introduced</span>
                <span className="w-20 text-right">Mastered</span>
                <span className="w-24 text-right">State</span>
              </li>
              {program.stimuli.map((s, i) => (
                <li key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-1 py-2 text-sm">
                  <span className="truncate">{s.label}</span>
                  <span className="w-20 text-right tabular-nums text-muted-foreground">{s.introducedAt}</span>
                  <span className="w-20 text-right tabular-nums text-muted-foreground">{s.masteredAt ?? "—"}</span>
                  <span className="w-24 text-right">
                    <StimChip state={s.state} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Analytics */}
          <Card title="Trial accuracy per session" subtitle="Correct (+) vs incorrect (–) responses">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={program.sessions} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="session" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="correct" stackId="a" fill="oklch(0.65 0.16 160)" name="Correct (+)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="incorrect" stackId="a" fill="oklch(0.7 0.15 25)" name="Incorrect (–)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Mastery progression" subtitle="Cumulative number of mastered stimuli">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={program.mastery} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 250)" />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="mastered" stroke="oklch(0.62 0.18 250)" strokeWidth={2.5} dot={{ r: 3 }} name="Mastered stimuli" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Right column: links + quick facts */}
        <aside className="space-y-5">
          <Card title="Linked from skill map" subtitle="Linking is done from skill map">
            <div className="space-y-2">
              <Link
                to="/skill-map"
                hash="M4"
                className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.08_300)] bg-[oklch(0.96_0.04_300)] px-2.5 py-1 text-xs font-medium text-[oklch(0.42_0.18_300)] transition-colors hover:bg-[oklch(0.92_0.06_300)]"
              >
                <Sparkles className="size-3" /> {program.linkedMilestone}
              </Link>
              <ul className="mt-2 space-y-1.5">
                {program.linkedGoals.map((g, i) => (
                  <li key={i}>
                    <Link
                      to="/skill-map"
                      hash={`M4-g${i + 1}`}
                      className="inline-flex w-full items-start gap-2 rounded-lg border border-[oklch(0.88_0.06_260)] bg-[oklch(0.97_0.025_250)] px-2.5 py-1.5 text-sm text-[oklch(0.4_0.18_260)] transition-colors hover:bg-[oklch(0.94_0.04_250)]"
                    >
                      <TargetIcon className="mt-0.5 size-3.5 shrink-0" />
                      <span className="text-left">{g}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <Card title="Quick facts">
            <dl className="space-y-2 text-sm">
              <Row label="Skill" value={program.skill} />
              <Row label="Area" value={program.area} />
              <Row label="Code" value={program.code} />
              <Row label="Sessions logged" value={String(program.sessions.length)} />
              <Row label="Trials" value={String(program.sessions.reduce((a, s) => a + s.correct + s.incorrect, 0))} />
            </dl>
          </Card>
        </aside>
      </div>
    </AppLayout>
  );
}

/* ───────────────────────── Bits ───────────────────────── */

function Card({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function StimChip({ state }: { state: StimulusState }) {
  const map = {
    "in-program": { label: "In program", chip: "bg-muted text-muted-foreground", Icon: CircleDot },
    target: { label: "Target", chip: "bg-[oklch(0.95_0.04_250)] text-[oklch(0.4_0.18_260)]", Icon: Circle },
    mastered: { label: "Mastered", chip: "bg-[oklch(0.95_0.05_160)] text-[oklch(0.4_0.14_160)]", Icon: CheckCircle2 },
  } as const;
  const m = map[state];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]", m.chip)}>
      <m.Icon className="size-3" /> {m.label}
    </span>
  );
}
