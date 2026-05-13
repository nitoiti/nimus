import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
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
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard | Nimus" }] }),
});

function Dashboard() {
  return (
    <AppLayout
      title="Welcome back, Evgeniy"
      subtitle="Here's the clearest picture of Leo's ABA progress this week."
      actions={
        <>
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
      }
    >
      {/* Insight cards — the new "What this means for you" hero */}
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

      {/* Compact stats */}
      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="In progress" value="12" />
        <Stat label="Mastered" value="18" tone="success" />
        <Stat label="Practiced this week" value="7" tone="primary" />
        <Stat label="Mastered this week" value="2" tone="success" />
        <Stat label="Correct rate (week)" value="74%" tone="primary" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
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

        {/* Plain-language summary */}
        <section className="rounded-2xl border border-border bg-foreground p-6 text-background shadow-soft">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="size-3" /> Weekly summary
          </div>
          <p className="text-base leading-relaxed">
            Leo practiced <strong>7 targets</strong> across <strong>5 sessions</strong> this week. Independence is
            trending up in <strong>social skills</strong>, but <strong>verbal imitation</strong> hasn't been touched in
            over two weeks.
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

      {/* Skill map preview */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">VB-MAPP skill map</h2>
            <p className="text-sm text-muted-foreground">Estimated progress across learning areas and levels</p>
          </div>
          <Link to="/skill-map" className="text-xs font-semibold text-primary hover:underline">
            Open map →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { level: "Level 1", pct: 65, count: "13/20 milestones" },
            { level: "Level 2", pct: 32, count: "6/20 milestones" },
            { level: "Level 3", pct: 8, count: "1/12 milestones" },
          ].map((l) => (
            <div key={l.level} className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-semibold">{l.level}</span>
                <span className="text-xs text-muted-foreground">{l.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${l.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{l.pct}% complete</p>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
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
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[tone].chip}`}>
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
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "success";
}) {
  const color =
    tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-foreground";
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
