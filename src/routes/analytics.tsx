import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics | Nimus" }] }),
});

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
const correctSeries = [55, 60, 58, 65, 70, 72, 74, 78];
const promptSeries = [35, 30, 32, 28, 22, 22, 20, 17];
const errorSeries = [10, 10, 10, 7, 8, 6, 6, 5];

function StackedBar() {
  return (
    <div className="flex h-56 items-end gap-3">
      {weeks.map((w, i) => {
        const c = correctSeries[i];
        const p = promptSeries[i];
        const e = errorSeries[i];
        return (
          <div key={w} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-md bg-surface">
              <div className="bg-destructive/70" style={{ height: `${e}%` }} />
              <div className="bg-warning/80" style={{ height: `${p}%` }} />
              <div className="bg-success" style={{ height: `${c}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{w}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChartLite() {
  // Simple sparkline-style progress
  const points = [22, 28, 30, 35, 38, 44, 48, 52];
  const max = 60;
  const w = 320;
  const h = 140;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.21 280)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.52 0.21 280)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#g)" />
      <path d={path} stroke="oklch(0.52 0.21 280)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / max) * h} r="3" fill="oklch(0.52 0.21 280)" />
      ))}
    </svg>
  );
}

function Analytics() {
  return (
    <AppLayout
      title="Analytics"
      subtitle="What's improving, what's stuck, and what to focus on next."
      actions={
        <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-xs font-semibold">
          {["7 days", "30 days", "60 days", "All time"].map((r, i) => (
            <button
              key={r}
              className={`rounded-full px-3 py-1.5 ${
                i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      {/* Headline insight */}
      <section className="mb-6 rounded-2xl border border-border bg-foreground p-6 text-background shadow-soft">
        <div className="flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">This month's headline</p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-snug">
              Independence is up <span className="text-success">+12%</span>. Echoic targets are stalling.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
              Leo is needing fewer prompts on social and matching tasks. But verbal imitation hasn't been practiced in
              17 days — momentum there is at risk.
            </p>
          </div>
        </div>
      </section>

      {/* Stat row */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Stat label="In progress" value="12" />
        <Stat label="Mastered" value="18" tone="success" />
        <Stat label="Mastered (period)" value="2" tone="success" />
        <Stat label="Mastery rate" value="14%" tone="primary" />
        <Stat label="Avg / week" value="0.5" />
        <Stat label="Avg days to master" value="21" />
      </section>

      {/* Charts */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Correct / Prompt / Error by week" subtitle="Weekly trial mix">
          <StackedBar />
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Legend color="bg-success" label="Correct" />
            <Legend color="bg-warning" label="Prompt" />
            <Legend color="bg-destructive/70" label="Error" />
          </div>
        </ChartCard>
        <ChartCard title="Independence trend" subtitle="Independent responses, last 8 weeks">
          <div className="h-56 w-full">
            <LineChartLite />
          </div>
        </ChartCard>
      </section>

      {/* In-progress targets health */}
      <section className="mb-6 rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Targets health</h3>
            <p className="text-xs text-muted-foreground">Sorted by what needs your attention first</p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              status: "warning",
              area: "Verbal Behavior",
              target: "Echoic — 2-3 syllable words",
              detail: "Not practiced in 17 days · 6 attempts total",
              health: "Stalled",
              reason: "Re-introduce or pause",
            },
            {
              status: "success",
              area: "Receptive",
              target: "Touch blue vs yellow",
              detail: "92% correct · 24 attempts this week",
              health: "Ready to close",
              reason: "Move to generalization",
            },
            {
              status: "info",
              area: "Behavior",
              target: "Sit nicely with hands on table",
              detail: "74% correct · 27 attempts · still prompting",
              health: "Active",
              reason: "Fade prompts gradually",
            },
            {
              status: "info",
              area: "Mand",
              target: "Asks for 'open'",
              detail: "70% correct · improving week-over-week",
              health: "Active",
              reason: "Continue current plan",
            },
          ].map((t) => (
            <div key={t.target} className="grid grid-cols-12 items-center gap-3 p-5">
              <div className="col-span-12 sm:col-span-5">
                <p className="font-medium text-foreground">{t.target}</p>
                <p className="text-xs text-muted-foreground">{t.area}</p>
              </div>
              <div className="col-span-12 text-sm text-muted-foreground sm:col-span-4">{t.detail}</div>
              <div className="col-span-6 sm:col-span-2">
                <HealthChip kind={t.status as "warning" | "success" | "info"}>{t.health}</HealthChip>
              </div>
              <div className="col-span-6 text-right text-xs font-medium text-primary sm:col-span-1">
                {t.reason}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plain-language takeaways */}
      <section className="grid gap-4 md:grid-cols-3">
        <Takeaway
          icon={<AlertTriangle className="size-4" />}
          tone="warning"
          title="What needs attention"
          body="Echoic targets stalling. Either re-schedule them this week or talk to your BCBA about pausing them."
        />
        <Takeaway
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
          title="What's working"
          body="Receptive identification is your strongest area. Two targets are ready to close."
        />
        <Takeaway
          icon={<TrendingUp className="size-4" />}
          tone="info"
          title="What to ask next"
          body="“Should we increase trial counts on mand training while momentum is here?”"
        />
      </section>
    </AppLayout>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "primary" }) {
  const color = tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
      <div className={`font-display text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-3 rounded ${color}`} /> {label}
    </span>
  );
}

function HealthChip({ kind, children }: { kind: "warning" | "success" | "info"; children: React.ReactNode }) {
  const map = {
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[kind]}`}>
      {children}
    </span>
  );
}

function Takeaway({
  icon,
  tone,
  title,
  body,
}: {
  icon: React.ReactNode;
  tone: "warning" | "success" | "info";
  title: string;
  body: string;
}) {
  const map = {
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}>
        {icon} {title}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}
