import { useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { SeedDemoDataDialog } from "@/components/SeedDemoDataDialog";
import {
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Upload,
  ClipboardList,
  Target as TargetIcon,
  FileText,
  BookOpen,
  Inbox,
} from "lucide-react";

type DashSearch = { empty?: boolean; step?: number };

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard | Nimus" }] }),
  validateSearch: (s: Record<string, unknown>): DashSearch => ({
    empty: s.empty === true || s.empty === "1" || s.empty === "true",
    step: typeof s.step === "number" ? s.step : s.step ? Number(s.step) : undefined,
  }),
});

function Dashboard() {
  const { empty, step } = useSearch({ from: "/dashboard" });
  const [seedOpen, setSeedOpen] = useState(false);

  // Empty-state preview: ?empty=1 (step 0), ?empty=1&step=1 (template applied)
  const isEmpty = !!empty;
  const step1Done = isEmpty ? (step ?? 0) >= 1 : true;
  const step2Done = isEmpty ? (step ?? 0) >= 2 : true;
  const showOnboarding = isEmpty && !(step1Done && step2Done);
  const childName = "Test child";

  return (
    <AppLayout
      title={isEmpty ? `Welcome to Nimus` : "Welcome back, Evgeniy"}
      subtitle={
        isEmpty
          ? `Here's where ${childName}'s ABA progress will live.`
          : "Here's the clearest picture of Leo's ABA progress this week."
      }
      actions={
        isEmpty ? (
          <>
            <Link
              to="/dashboard"
              search={{ empty: undefined, step: undefined } as never}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Preview populated →
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              search={{ empty: true, step: 0 } as never}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Preview empty →
            </Link>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">
              <Upload className="size-4" /> Upload session
            </button>
            <Link
              to="/progress"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform"
            >
              <ClipboardList className="size-4" /> Record a session
            </Link>
          </>
        )
      }
    >
      {showOnboarding && (
        <OnboardingChecklist
          childName={childName}
          step1Done={step1Done}
          step2Done={step2Done}
          onSeedDemo={() => setSeedOpen(true)}
        />
      )}

      {!isEmpty && (
        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <InsightCard
            tone="warning"
            icon={<AlertTriangle className="size-4" />}
            label="Action needed"
            headline="3 targets need attention"
            body="“Asks for water” hasn't been practiced in 18 days. Schedule it this week to avoid losing ground."
            cta={{ label: "See targets", to: "/progress" }}
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
            body="Leo needed fewer prompts on social skills. Keep tomorrow's session focused on tacting."
            cta={{ label: "Open analytics", to: "/analytics" }}
          />
        </section>
      )}

      {/* Compact stats — same shape, empty values when no data */}
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="In progress" value={isEmpty ? "—" : "12"} muted={isEmpty} />
        <Stat label="Mastered" value={isEmpty ? "—" : "18"} tone="success" muted={isEmpty} />
        <Stat label="Practiced this week" value={isEmpty ? "—" : "7"} tone="primary" muted={isEmpty} />
        <Stat label="Mastered this week" value={isEmpty ? "—" : "2"} tone="success" muted={isEmpty} />
        <Stat label="Correct rate (week)" value={isEmpty ? "—" : "74%"} tone="primary" muted={isEmpty} />
      </section>

      {!isEmpty ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Today's focus</h2>
              <Link to="/progress" className="text-xs font-semibold text-primary hover:underline">
                Open progress tracker →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction
                to="/progress"
                icon={<ClipboardList className="size-4" />}
                title="Record session results"
                desc="Tap +, P, or − for each trial"
                accent="primary"
              />
              <QuickAction
                to="/analytics"
                icon={<TrendingUp className="size-4" />}
                title="Review trends"
                desc="What's improving, what's stuck"
              />
              <QuickAction
                to="/skill-map"
                icon={<TargetIcon className="size-4" />}
                title="Open skill map"
                desc="Areas, programs and targets"
              />
              <QuickAction
                to="/analytics"
                icon={<FileText className="size-4" />}
                title="Generate report"
                desc="Share with therapist or BCBA"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-foreground p-6 text-background shadow-soft">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="size-3" /> Weekly summary
            </div>
            <p className="text-base leading-relaxed">
              Leo practiced <strong>7 targets</strong> across <strong>5 sessions</strong> this week. Independence is
              trending up in <strong>social skills</strong>, but <strong>verbal imitation</strong> hasn't been touched
              in over two weeks.
            </p>
            <div className="mt-5 rounded-xl bg-white/5 p-4 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Ask your BCBA</p>
              <p className="mt-1 text-white">
                "Should we re-introduce echoic targets, or pause them this month?"
              </p>
            </div>
            <Link
              to="/analytics"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white"
            >
              Open full report <ArrowRight className="size-3.5" />
            </Link>
          </section>
        </div>
      ) : null}

      {/* VB-MAPP skill map */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">VB-MAPP skill map</h2>
            <p className="text-sm text-muted-foreground">Estimated progress across learning areas and levels</p>
          </div>
          {!isEmpty && (
            <Link to="/skill-map" className="text-xs font-semibold text-primary hover:underline">
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
              { level: "Level 1", pct: isEmpty ? 0 : 65, count: isEmpty ? "0/20 milestones" : "13/20 milestones" },
              { level: "Level 2", pct: isEmpty ? 0 : 32, count: isEmpty ? "0/20 milestones" : "6/20 milestones" },
              { level: "Level 3", pct: isEmpty ? 0 : 8, count: isEmpty ? "0/12 milestones" : "1/12 milestones" },
            ].map((l) => (
              <div key={l.level} className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{l.level}</span>
                  <span className="text-xs text-muted-foreground">{l.count}</span>
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
            <p className="text-sm text-muted-foreground">Create supervision-ready reports from session data.</p>
          </div>
          {!isEmpty && (
            <Link to="/analytics" className="text-xs font-semibold text-primary hover:underline">
              Open reports →
            </Link>
          )}
        </div>
        {isEmpty ? (
          <EmptyBlock
            icon={<Inbox className="size-5" />}
            title="No session data yet"
            body="Once you log a few sessions — or seed demo data — supervision reports will appear here."
            cta={
              step1Done
                ? { label: "Seed demo data", onClick: () => setSeedOpen(true) }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <ReportCard title="Supervision Report" desc="Practiced, prompts, errors, ready targets." />
            <ReportCard title="Last 14 days" desc="Quick review of recent work." />
            <ReportCard title="Last 30 days" desc="Monthly parent/supervision view." />
          </div>
        )}
      </section>

      <SeedDemoDataDialog
        open={seedOpen}
        onOpenChange={setSeedOpen}
        childName={childName}
        onConfirm={() => {
          /* prototype: no-op; Windsurf wires this to the real server action */
        }}
      />
    </AppLayout>
  );
}

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
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
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
    warning: { chip: "bg-warning/15 text-warning-foreground", ring: "ring-warning/30" },
    info: { chip: "bg-info/10 text-info", ring: "ring-info/20" },
  } as const;
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-soft ring-1 ${map[tone].ring}`}>
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[tone].chip}`}
      >
        {icon} {label}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug">{headline}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
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
  tone?: "default" | "primary" | "success";
  muted?: boolean;
}) {
  const color = muted
    ? "text-muted-foreground"
    : tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickAction({
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
          : "border-border bg-surface hover:bg-muted"
      }`}
    >
      <div
        className={`grid size-9 place-items-center rounded-lg ${
          isPrimary ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
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
