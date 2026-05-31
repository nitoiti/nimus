import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { SeedDemoDataDialog } from "@/components/SeedDemoDataDialog";
import {
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ClipboardList,
  Target as TargetIcon,
  Map as MapIcon,
  BarChart3,
  BookOpen,
  Inbox,
  ChevronDown,
  Cake,
  Brain,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard | Nimus" }] }),
});

type ViewMode = "empty" | "template-applied" | "populated";

type Child = {
  id: string;
  name: string;
  ageYears: number;
  ageMonths: number;
  devAgeMonths: number; // VB-MAPP level proxy
  vbmappLevel: 1 | 2 | 3;
  initials: string;
  accent: string; // oklch token-ish
};

const CHILDREN: Child[] = [
  {
    id: "leo",
    name: "Leo",
    ageYears: 4,
    ageMonths: 7,
    devAgeMonths: 30,
    vbmappLevel: 2,
    initials: "L",
    accent: "oklch(0.62_0.18_250)",
  },
  {
    id: "mira",
    name: "Mira",
    ageYears: 3,
    ageMonths: 2,
    devAgeMonths: 20,
    vbmappLevel: 1,
    initials: "M",
    accent: "oklch(0.65_0.16_330)",
  },
];

function Dashboard() {
  const [mode, setMode] = useState<ViewMode>("populated");
  const [seedOpen, setSeedOpen] = useState(false);
  const [childId, setChildId] = useState<string>(CHILDREN[0].id);
  const child = CHILDREN.find((c) => c.id === childId)!;

  const isEmpty = mode !== "populated";
  const step1Done = mode !== "empty";
  const step2Done = mode === "populated";
  const showOnboarding = isEmpty;

  return (
    <AppLayout
      title={isEmpty ? "Welcome to Nimus" : `${child.name}'s progress`}
      subtitle={
        isEmpty
          ? `Here's where ${child.name}'s ABA progress will live.`
          : `Active programs, emerging targets and skill map at a glance.`
      }
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-[11px] font-semibold">
            {(["empty", "template-applied", "populated"] as ViewMode[]).map(
              (m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "empty"
                    ? "Empty"
                    : m === "template-applied"
                      ? "Template applied"
                      : "Populated"}
                </button>
              ),
            )}
          </div>
        </div>
      }
    >
      {/* Active child card */}
      <ChildCard
        child={child}
        onSwitch={(id) => setChildId(id)}
        isEmpty={isEmpty}
      />

      {showOnboarding && (
        <div className="mt-6">
          <OnboardingChecklist
            childName={child.name}
            step1Done={step1Done}
            step2Done={step2Done}
            onSeedDemo={() => setSeedOpen(true)}
          />
        </div>
      )}

      {/* Stats — targets & programs centric */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat
          label="Active programs"
          value={isEmpty ? "—" : "8"}
          tone="primary"
          muted={isEmpty}
        />
        <Stat
          label="Targets in progress"
          value={isEmpty ? "—" : "23"}
          muted={isEmpty}
        />
        <Stat
          label="Goals ready to test"
          value={isEmpty ? "—" : "3"}
          tone="success"
          muted={isEmpty}
        />

        <Stat
          label="Mastered total"
          value={isEmpty ? "—" : "47"}
          tone="success"
          muted={isEmpty}
        />
        <Stat
          label="Independence (30d)"
          value={isEmpty ? "—" : "74%"}
          tone="primary"
          muted={isEmpty}
        />
      </section>

      {/* Quick links to the 4 working pages */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          to="/programs"
          icon={<BookOpen className="size-4" />}
          title="Programs"
          desc="Active, paused, mastered"
          accent="primary"
        />
        <QuickLink
          to="/skill-map"
          icon={<MapIcon className="size-4" />}
          title="Skill map"
          desc="VB-MAPP milestones & targets"
        />
        <QuickLink
          to="/progress"
          icon={<ClipboardList className="size-4" />}
          title="Progress tracker"
          desc="Daily +/P/− per target"
        />
        <QuickLink
          to="/analytics"
          icon={<BarChart3 className="size-4" />}
          title="Analytics"
          desc="Trends, supervision reports"
        />
      </section>

      {!isEmpty && (
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <InsightCard
            tone="warning"
            icon={<AlertTriangle className="size-4" />}
            label="Needs attention"
            headline="3 targets stalled"
            body="“Asks for water” hasn't been practiced in 18 days. Schedule it this week to avoid losing ground."
            cta={{ label: "Open programs", to: "/programs" }}
          />
          <InsightCard
            tone="success"
            icon={<CheckCircle2 className="size-4" />}
            label="Ready to close"
            headline="2 targets nearly mastered"
            body="Matching identical objects and pointing to red are at 90%+. Ready for clinician review."
            cta={{ label: "Review now", to: "/analytics" }}
          />
          <InsightCard
            tone="info"
            icon={<TrendingUp className="size-4" />}
            label="Momentum"
            headline="+12% independence this week"
            body={`${child.name} needed fewer prompts on social skills. Keep tomorrow's focus on tacting.`}
            cta={{ label: "Open analytics", to: "/analytics" }}
          />
        </section>
      )}

      {/* Active programs preview */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Active programs
            </h2>
            <p className="text-sm text-muted-foreground">
              What {child.name} is working on right now
            </p>
          </div>
          {!isEmpty && (
            <Link
              to="/programs"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All programs →
            </Link>
          )}
        </div>
        {isEmpty ? (
          <EmptyBlock
            icon={<TargetIcon className="size-5" />}
            title="No active programs yet"
            body="Apply a curriculum template or create a program from the skill map to see it here."
            cta={
              step1Done
                ? { to: "/programs", label: "Open programs" }
                : { to: "/skill-map", label: "Open skill map" }
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                id: "p1",
                name: "Echoic 2-3 syllables",
                area: "Verbal Behavior · L2",
                targets: 4,
                emerging: 2,
                lastTrial: "today",
              },
              {
                id: "p2",
                name: "Mand for preferred items",
                area: "Mand · L2",
                targets: 3,
                emerging: 1,
                lastTrial: "yesterday",
              },
              {
                id: "p3",
                name: "Tact common objects",
                area: "Tact · L2",
                targets: 5,
                emerging: 3,
                lastTrial: "2 days ago",
              },
              {
                id: "p4",
                name: "Sitting nicely",
                area: "Cooperation · L1",
                targets: 2,
                emerging: 1,
                lastTrial: "today",
              },
            ].map((p) => (
              <Link
                key={p.id}
                to="/programs/$programId"
                params={{ programId: p.id }}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.area}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      {p.targets} targets
                    </span>
                    {p.emerging > 0 && (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning-foreground">
                        {p.emerging} emerging
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      last trial {p.lastTrial}
                    </span>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Goals ready to test — programs are ready, time to probe the milestone */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              Goals ready to test
            </h2>
            <p className="text-sm text-muted-foreground">
              Milestones whose linked programs are ready — run a probe to score them
            </p>
          </div>
          {!isEmpty && (
            <Link
              to="/skill-map"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open skill map →
            </Link>
          )}
        </div>
        {isEmpty ? (
          <EmptyBlock
            icon={<CheckCircle2 className="size-5" />}
            title="No goals ready yet"
            body="When a program reaches mastery, its linked milestone surfaces here as ready to test."
            cta={{ to: "/programs", label: "Open programs" }}
          />
        ) : (
          <div className="grid gap-2">
            {[
              {
                milestone: "Tact · 5 actions on request",
                area: "Tact · L2 · M7",
                program: "Tact common actions",
                programPct: 92,
              },
              {
                milestone: "Mand · 2-word phrases",
                area: "Mand · L2 · M5",
                program: "Mand for preferred items",
                programPct: 88,
              },
              {
                milestone: "Echoic · 2-3 syllable words",
                area: "Echoic · L2 · M3",
                program: "Echoic 2-3 syllables",
                programPct: 95,
              },
            ].map((t) => (
              <Link
                key={t.milestone}
                to="/skill-map"
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/15 text-success">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {t.milestone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.area} · via{" "}
                    <span className="text-foreground/80">{t.program}</span>
                  </p>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <div className="text-right">
                    <div className="font-display text-sm font-bold text-success">
                      Ready
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      program {t.programPct}%
                    </div>
                  </div>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${t.programPct}%` }}
                    />
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>



      {/* VB-MAPP skill map summary */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              VB-MAPP skill map
            </h2>
            <p className="text-sm text-muted-foreground">
              Estimated progress across learning areas and levels
            </p>
          </div>
          {!isEmpty && (
            <Link
              to="/skill-map"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open map →
            </Link>
          )}
        </div>
        {isEmpty && !step1Done ? (
          <EmptyBlock
            icon={<BookOpen className="size-5" />}
            title="No programs yet"
            body="Apply a curriculum template to see VB-MAPP progress across Levels 1–3."
            cta={{ to: "/skill-map", label: "Apply template" }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                level: "Level 1",
                pct: isEmpty ? 0 : 65,
                count: isEmpty ? "0/20 milestones" : "13/20 milestones",
              },
              {
                level: "Level 2",
                pct: isEmpty ? 0 : 32,
                count: isEmpty ? "0/20 milestones" : "6/20 milestones",
              },
              {
                level: "Level 3",
                pct: isEmpty ? 0 : 8,
                count: isEmpty ? "0/12 milestones" : "1/12 milestones",
              },
            ].map((l) => (
              <div
                key={l.level}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{l.level}</span>
                  <span className="text-xs text-muted-foreground">
                    {l.count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${l.pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isEmpty ? "No data" : `${l.pct}% complete`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reports */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Reports</h2>
            <p className="text-sm text-muted-foreground">
              Supervision-ready reports from program data.
            </p>
          </div>
          {!isEmpty && (
            <Link
              to="/analytics"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open reports →
            </Link>
          )}
        </div>
        {isEmpty ? (
          <EmptyBlock
            icon={<Inbox className="size-5" />}
            title="No data yet"
            body="Once a few targets have trial data — or seed demo data — supervision reports will appear here."
            cta={
              step1Done
                ? { label: "Seed demo data", onClick: () => setSeedOpen(true) }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <ReportCard
              title="Supervision Report"
              desc="Practiced, prompts, errors, ready targets."
            />
            <ReportCard
              title="Last 14 days"
              desc="Quick review of recent work."
            />
            <ReportCard
              title="Last 30 days"
              desc="Monthly parent/supervision view."
            />
          </div>
        )}
      </section>

      <SeedDemoDataDialog
        open={seedOpen}
        onOpenChange={setSeedOpen}
        childName={child.name}
        onConfirm={() => {}}
      />
    </AppLayout>
  );
}

/* ────────────────────────── Child header card ────────────────────────── */

function ChildCard({
  child,
  onSwitch,
  isEmpty,
}: {
  child: Child;
  onSwitch: (id: string) => void;
  isEmpty: boolean;
}) {
  const devYears = Math.floor(child.devAgeMonths / 12);
  const devRemMonths = child.devAgeMonths % 12;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="grid size-14 place-items-center rounded-2xl text-xl font-bold text-white shadow-soft"
            style={{ background: child.accent }}
          >
            {child.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">{child.name}</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                    Switch <ChevronDown className="size-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-1.5">
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Active child
                  </div>
                  {CHILDREN.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSwitch(c.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <div
                        className="grid size-8 place-items-center rounded-lg text-xs font-bold text-white"
                        style={{ background: c.accent }}
                      >
                        {c.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.ageYears}y {c.ageMonths}m · VB-MAPP L
                          {c.vbmappLevel}
                        </div>
                      </div>
                      {c.id === child.id && (
                        <Check className="size-4 text-primary" />
                      )}
                    </button>
                  ))}
                  <div className="mt-1 border-t border-border pt-1">
                    <button className="w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-primary hover:bg-primary/5">
                      + Add child
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tracking ABA progress with VB-MAPP
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <MiniMeta
            icon={<Cake className="size-3.5" />}
            label="Age"
            value={`${child.ageYears}y ${child.ageMonths}m`}
          />
          <MiniMeta
            icon={<Brain className="size-3.5" />}
            label="Dev. age"
            value={
              isEmpty ? "—" : `${devYears}y ${devRemMonths}m`
            }
          />
          <MiniMeta
            icon={<TargetIcon className="size-3.5" />}
            label="VB-MAPP"
            value={`Level ${child.vbmappLevel}`}
          />
        </div>
      </div>
    </section>
  );
}

function MiniMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-sm font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ────────────────────────── Shared bits ────────────────────────── */

function EmptyBlock({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: { to?: string; label: string; onClick?: () => void };
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-card text-muted-foreground">
        {icon}
      </div>
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {body}
      </p>
      {cta &&
        (cta.to ? (
          <Link
            to={cta.to}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            {cta.label} <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {cta.label}
          </button>
        ))}
    </div>
  );
}

function ReportCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <button className="mt-4 w-full rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
        Open
      </button>
    </div>
  );
}

function InsightCard({
  tone,
  icon,
  label,
  headline,
  body,
  cta,
}: {
  tone: "success" | "warning" | "info";
  icon: React.ReactNode;
  label: string;
  headline: string;
  body: string;
  cta: { label: string; to: string };
}) {
  const map = {
    success: { chip: "bg-success/10 text-success", ring: "ring-success/20" },
    warning: {
      chip: "bg-warning/15 text-warning-foreground",
      ring: "ring-warning/30",
    },
    info: { chip: "bg-info/10 text-info", ring: "ring-info/20" },
  } as const;
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-soft ring-1 ${map[tone].ring}`}
    >
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[tone].chip}`}
      >
        {icon} {label}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug">
        {headline}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      <Link
        to={cta.to}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
      >
        {cta.label} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
  muted = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "success" | "warning";
  muted?: boolean;
}) {
  const color = muted
    ? "text-muted-foreground"
    : tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
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

function QuickLink({
  to,
  icon,
  title,
  desc,
  accent,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: "primary";
}) {
  const isPrimary = accent === "primary";
  return (
    <Link
      to={to}
      className={`group flex items-start gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
        isPrimary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "border-border bg-card hover:bg-muted/40 shadow-soft"
      }`}
    >
      <div
        className={`grid size-9 place-items-center rounded-lg ${
          isPrimary
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-foreground border border-border"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
