import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  LineChart,
  Sparkles,
  CalendarClock,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Brain,
  Quote,
  Database,
  ScanLine,
} from "lucide-react";
import paperDataSheet from "@/assets/paper-data-sheet.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Nimus — Forecast ABA progress for every learner" },
      {
        name: "description",
        content:
          "Nimus gives BCBAs a complete skill map, trial-level data capture, and a VB-MAPP-style completion forecast — so you can finally tell parents when their child will reach the next milestone.",
      },
      { property: "og:title", content: "Nimus — Forecast ABA progress for every learner" },
      {
        property: "og:description",
        content:
          "A skill map, trial-level data, and a real completion forecast for every child on your caseload.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Hero />
      <ProblemStrip />
      <ForecastShowcase />
      <HowItWorks />
      <SkillMapSection />
      <ProgressSection />
      <AudienceSplit />
      <BetaCTA />
      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-hero shadow-glow grid place-items-center">
            <div className="size-2.5 rounded-full bg-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Nimus</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#forecast" className="hover:text-foreground transition-colors">Forecast</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#skill-map" className="hover:text-foreground transition-colors">Skill map</a>
          <a href="#audience" className="hover:text-foreground transition-colors">Who it's for</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:inline">
            Sign in
          </Link>
          <a
            href="#beta"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            Join the BCBA beta
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-soft" />
      <div className="absolute -top-40 left-1/2 -z-10 size-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <Sparkles className="size-3.5 text-primary" />
            Now in beta for BCBAs and clinic teams
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Tell parents <span className="text-primary">when</span> — not just <em className="not-italic text-muted-foreground">"every child is unique."</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Nimus is the first ABA tool built around a complete skill map and a real completion
            forecast. Capture trial-level data, watch mastery velocity per learner, and show parents
            exactly when their child is projected to finish each VB-MAPP level.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="#beta"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
            >
              Apply to the BCBA beta
              <ArrowRight className="size-4" />
            </a>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              See a live forecast
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Free during beta · Built by a parent with a real caseload · Therapist-ready data entry
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <HeroForecastCard />
        </div>
      </div>
    </section>
  );
}

function HeroForecastCard() {
  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-glow">
      <div className="rounded-2xl bg-gradient-soft p-6 text-left sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              VB-MAPP Level Completion Forecast
            </p>
            <h3 className="mt-1 font-display text-xl font-bold">Leo · all-time mastery rate 1.6 targets/wk</h3>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
            On track
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <LevelCard level="Level 1" range="0–18m" pct={13} mastered="63/469" eta="Mar 2031" status="in progress" />
          <LevelCard level="Level 2" range="18–30m" pct={0} mastered="0/468" eta="Nov 2036" status="not started" />
          <LevelCard level="Level 3" range="30–48m" pct={0} mastered="0/558" eta="Jul 2043" status="not started" />
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          The forecast updates every time a trial is logged. Add 2 hours of session time per day and
          Level 1 finishes 14 months sooner. Stop logging and the forecast flatlines — exactly what
          a parent needs to see.
        </p>
      </div>
    </div>
  );
}

function LevelCard({
  level,
  range,
  pct,
  mastered,
  eta,
  status,
}: {
  level: string;
  range: string;
  pct: number;
  mastered: string;
  eta: string;
  status: "in progress" | "not started";
}) {
  const tone =
    status === "in progress"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {level} · {range}
        </p>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tone}`}>
          {status}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold">{pct}%</span>
        <span className="text-xs text-muted-foreground">{mastered} mastered</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <CalendarClock className="size-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Projected to complete</span>
        <span className="ml-auto font-semibold text-foreground">{eta}</span>
      </div>
    </div>
  );
}

function ProblemStrip() {
  return (
    <section className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft sm:p-10">
          <Quote className="size-6 text-primary" />
          <p className="mt-4 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
            "Every child is unique — we can't tell you how long it will take."
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every parent of an autistic child has heard this. It's true that no two learners are the same —
            and it's also true that IT projects, construction projects, every other complex domain still ships forecasts.
            Saying "we can't" is no longer good enough. Nimus exists so BCBAs can give a real,
            data-backed answer — and refine it every week.
          </p>
        </div>
      </div>
    </section>
  );
}

function ForecastShowcase() {
  const items = [
    {
      icon: <TrendingUp className="size-5" />,
      title: "Mastery velocity, not vibes",
      desc: "Recent targets-per-week × remaining scope = a date. Updates with every trial.",
    },
    {
      icon: <CalendarClock className="size-5" />,
      title: "Per-level ETAs",
      desc: "Separate forecasts for VB-MAPP Level 1, 2, and 3 — and per learning area.",
    },
    {
      icon: <Brain className="size-5" />,
      title: "What-if levers",
      desc: "Show what happens if hours go up, sessions are missed, or a stalled area is paused.",
    },
    {
      icon: <FileSpreadsheet className="size-5" />,
      title: "Parent-ready story",
      desc: "Cumulative progress and forecast on one chart parents actually understand.",
    },
  ];
  return (
    <section id="forecast" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The forecast engine</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            The first ABA tool that answers "when?"
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every target a child masters tightens the model. The longer Nimus tracks a learner, the
            sharper the projection becomes — and the harder it is for anyone in the room to argue
            with the data.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                {it.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create a learner, assign a template",
      desc: "Start from a VB-MAPP-inspired skill map or your own template. Different children, different maps.",
    },
    {
      n: "02",
      title: "Therapists log trials in seconds",
      desc: "+ correct, P prompted, − error. No more paper sheets your partner has to type up.",
    },
    {
      n: "03",
      title: "Nimus closes and opens targets",
      desc: "As mastery criteria are met, targets close and the next ones surface — automatically.",
    },
    {
      n: "04",
      title: "Show parents the forecast",
      desc: "Per-level ETAs, weekly progress, and a story that makes therapy hours feel worth it.",
    },
  ];
  return (
    <section id="how" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            From trial sheet to forecast in four steps
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="font-display text-3xl font-bold text-primary/30">{s.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillMapSection() {
  return (
    <section id="skill-map" className="bg-surface py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The skill map</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            A complete map of what a child should know — by age
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Hundreds of programs and targets, organised into areas and stimuli, each tagged with a
            developmental level. Close every target in Level 1 and you know the learner has the
            repertoire of a neurotypical 18-month-old. That structure is what makes the forecast possible.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Inspired by VB-MAPP, but built around actual programs and targets — not assessment milestones",
              "Templates per learner profile — early learner, severe, advanced, custom",
              "BCBAs can edit, branch, and contribute templates the community can reuse",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Programs tree · Behavior / Cooperation
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            <TreeRow depth={0} label="📁 Behavior / Cooperation" meta="9 programs" />
            <TreeRow depth={1} label="📄 Attending to adult" meta="6 targets" />
            <TreeRow depth={2} label="🎯 Accept simple adult direction" badge="Mastered" tone="success" />
            <TreeRow depth={3} label="· come to table" badge="To do" />
            <TreeRow depth={3} label="· finish one trial" badge="To do" />
            <TreeRow depth={3} label="· give item" badge="To do" />
            <TreeRow depth={2} label="🎯 Complete brief demand with support" badge="To do" />
            <TreeRow depth={2} label="🎯 Handle transitions flexibly" badge="To do" />
            <TreeRow depth={1} label="📄 Group instruction" meta="6 targets" />
            <TreeRow depth={1} label="📄 Gym practice / exercises" meta="5 targets" />
            <TreeRow depth={2} label="🎯 Practice gym exercises in routine" badge="Mastered" tone="success" />
            <TreeRow depth={1} label="📄 Independent work" meta="6 targets" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TreeRow({
  depth,
  label,
  meta,
  badge,
  tone,
}: {
  depth: number;
  label: string;
  meta?: string;
  badge?: string;
  tone?: "success";
}) {
  return (
    <div
      className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-surface"
      style={{ paddingLeft: `${depth * 14 + 8}px` }}
    >
      <span className="truncate text-foreground">{label}</span>
      {meta && <span className="text-muted-foreground">{meta}</span>}
      {badge && (
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            tone === "success" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function ProgressSection() {
  return (
    <section className="border-t border-border bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-muted-foreground">
            <Legend dot="bg-success" label="+ correct" />
            <Legend dot="bg-warning" label="P prompt" />
            <Legend dot="bg-destructive" label="− error" />
          </div>
          <div className="space-y-2 text-xs">
            <TrialRow target="Match/sort simple identical items" cells={["++++", "P+P+", "+", "+"]} />
            <TrialRow target="Matching Non-Identical pictures" cells={["P+PP", "++P+", "+", "+"]} />
            <TrialRow target="Sequencing Steps" cells={["PPP+", "PPP+", "PPP+", ""]} />
            <TrialRow target="Seriation: ordering by size" cells={["", "", "PPP+", "+"]} />
            <TrialRow target="Imitate simple actions" cells={["P++", "++", "+", "+"]} />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Trial-level data, painlessly</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Stop typing up paper sheets at the end of the day
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Therapists log trials inline as the session happens. Status updates, target rotations,
            and stimulus counts fall out of the data automatically — and feed straight into the
            forecast engine.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "+ / P / − entry takes one keystroke per trial",
              "Daily and weekly views per program, target, or stimulus",
              "Mastered targets archive themselves — the active list stays clean",
              "Every entry stamps date, user, and stimulus for audit-ready reporting",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TrialRow({ target, cells }: { target: string; cells: string[] }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5">
      <span className="truncate text-foreground">{target}</span>
      {cells.map((c, i) => (
        <span
          key={i}
          className="grid h-6 min-w-12 place-items-center rounded bg-surface font-mono text-[10px] text-muted-foreground"
        >
          {c || "—"}
        </span>
      ))}
    </div>
  );
}

function AudienceSplit() {
  return (
    <section id="audience" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Who Nimus is for</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Built for BCBAs first. Designed so parents finally get it.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <AudienceCard
            icon={<LineChart className="size-5" />}
            tag="For BCBAs (primary)"
            title="The clinical brain of your caseload"
            desc="Run every learner from one place. Your therapists capture data, Nimus turns it into target health, mastery velocity, and per-level forecasts you can defend in any parent meeting."
            bullets={[
              "Per-target health: active, stalled, ready to close",
              "Forecast per level and per area — refined weekly",
              "Build, edit, and share skill-map templates",
              "Reports parents understand without a glossary",
            ]}
            cta="Apply to the beta"
            accent="primary"
            href="#beta"
          />
          <AudienceCard
            icon={<Users className="size-5" />}
            tag="For parents (next)"
            title="See what your child's therapy is really doing"
            desc="Once your BCBA invites you in, you see the same forecast they see — in plain language. No spreadsheets, no jargon, no surprise IEP meetings."
            bullets={[
              "Read-only views designed for non-clinicians",
              "Plain-language insights, not BCBA shorthand",
              "Know what to ask the team at the next meeting",
              "Coming after the BCBA beta closes",
            ]}
            cta="Get notified"
            accent="secondary"
            href="#beta"
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  icon,
  tag,
  title,
  desc,
  bullets,
  cta,
  accent,
  href,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  cta: string;
  accent: "primary" | "secondary";
  href: string;
}) {
  const ring = accent === "primary" ? "ring-primary/30" : "ring-border";
  const dot = accent === "primary" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground";
  return (
    <div className={`rounded-3xl border border-border bg-card p-8 shadow-soft ring-1 ${ring}`}>
      <div className={`mb-5 inline-flex items-center gap-2 rounded-full ${dot} px-3 py-1.5 text-xs font-semibold`}>
        {icon}
        {tag}
      </div>
      <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
            <span className="text-foreground">{b}</span>
          </li>
        ))}
      </ul>
      <a
        href={href}
        className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
      >
        {cta} <ArrowRight className="size-4" />
      </a>
    </div>
  );
}

function BetaCTA() {
  return (
    <section id="beta" className="bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center shadow-glow sm:p-14">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">BCBA beta — limited cohort</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            Help shape the tool. Get the forecast no one else can give your families.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            We're onboarding a small group of BCBAs who want to co-design templates, stress-test the
            forecast on their caseload, and lead the next wave of data-driven ABA practice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:beta@nimus.app?subject=BCBA%20beta%20-%20Nimus"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft hover:-translate-y-0.5 transition-transform"
            >
              Apply to the beta
              <ArrowRight className="size-4" />
            </a>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Tour the analytics first
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/70">
            Free during beta · Your caseload data stays yours · We ask for feedback, not testimonials
          </p>
        </div>
      </div>
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded ${dot}`} /> {label}
    </span>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-gradient-hero" />
          <span className="font-display font-bold">Nimus</span>
          <span className="text-xs text-muted-foreground">© 2026</span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="mailto:hello@nimus.app" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
