import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  LineChart as LineChartIcon,
  Sparkles,
  CalendarClock,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Brain,
  Quote,
  Database,
  ScanLine,
  UserPlus,
  ListChecks,
  Wand2,
  Eye,
  Lightbulb,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import paperDataSheet from "@/assets/paper-data-sheet.jpg";
import nimusLogo from "@/assets/nimus-logo.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Nimus, an early alpha ABA forecast tool for BCBAs" },
      {
        name: "description",
        content:
          "Nimus is an early alpha tool that turns ABA session data into a real completion forecast for every learner. We are recruiting BCBAs to co-design the skill map.",
      },
      { property: "og:title", content: "Nimus, early alpha for BCBAs" },
      {
        property: "og:description",
        content:
          "Turn messy ABA session sheets into clean data and a real completion forecast. Recruiting BCBAs for early alpha.",
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
      <PaperToDatabase />
      <ForecastShowcase />
      <SkillMapSection />
      <DemoFlow />
      <HowItWorks />
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
        <Link to="/" className="flex items-center">
          <img src={nimusLogo} alt="Nimus, Autism App" className="h-9 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#paper" className="hover:text-foreground transition-colors">From paper</a>
          <a href="#forecast" className="hover:text-foreground transition-colors">Forecast</a>
          <a href="#skill-map" className="hover:text-foreground transition-colors">Skill map</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Try the demo</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:inline">
            Sign in
          </Link>
          <a
            href="#beta"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            Apply to the BCBA beta
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
            Early alpha. Recruiting BCBAs to co-design the skill map.
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            An honest answer to <span className="text-primary">when</span> a child will reach the next level.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Nimus turns messy session sheets into clean data, and clean data into a real completion forecast for every learner. The skill map is still AI generated, so we are looking for BCBAs to help shape it before we open a proper beta.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href="#beta"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
            >
              Apply to the BCBA beta
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Try the demo flow
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Free during alpha. Built by a parent with a real caseload. Looking for feedback, not testimonials.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <HeroForecastChart />
        </div>
      </div>
    </section>
  );
}

const forecastData = (() => {
  // Actual: Jun 25 -> May 26, 0 -> 63
  // Forecast: May 26 -> Mar 2031, 63 -> 469
  const points: { label: string; mastered: number | null; forecast: number | null }[] = [];
  const actual = [
    ["Jun 25", 0], ["Jul 25", 3], ["Aug 25", 8], ["Sep 25", 14],
    ["Oct 25", 20], ["Nov 25", 27], ["Dec 25", 33], ["Jan 26", 39],
    ["Feb 26", 45], ["Mar 26", 51], ["Apr 26", 57], ["May 26", 63],
  ] as const;
  actual.forEach(([l, v]) => points.push({ label: l as string, mastered: v as number, forecast: null }));
  // bridge point
  points[points.length - 1].forecast = 63;
  const forecast = [
    ["Sep 26", 88], ["Jan 27", 118], ["May 27", 148], ["Sep 27", 178],
    ["Jan 28", 208], ["May 28", 238], ["Sep 28", 268], ["Jan 29", 298],
    ["May 29", 320], ["Sep 29", 342], ["Jan 30", 360], ["May 30", 378],
    ["Sep 30", 395], ["Jan 31", 415], ["Mar 2031", 469],
  ] as const;
  forecast.forEach(([l, v]) => points.push({ label: l as string, mastered: null, forecast: v as number }));
  return points;
})();

function HeroForecastChart() {
  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-glow">
      <div className="rounded-2xl bg-gradient-soft p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              VB-MAPP Level 1 forecast for Leo
            </p>
            <h3 className="mt-1 font-display text-xl font-bold">
              Cumulative progress and projected completion
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Mastery rate today: 1.6 targets per week. 63 of 469 targets mastered. Projected to finish March 2031.
            </p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
            On track
          </span>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={[0, 500]}
                ticks={[0, 150, 300, 469]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--foreground)",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={28}
                iconType="plainline"
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="mastered"
                name="Mastered"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="var(--primary)"
                strokeWidth={2.5}
                strokeDasharray="6 6"
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          The forecast updates every time a trial is logged. Add two hours of session time per day and Level 1 finishes 14 months sooner. Stop logging and the line flatlines, exactly what a parent needs to see.
        </p>
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
            "Every child is unique, we cannot tell you how long it will take."
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every parent of an autistic child has heard this. It is true that no two learners are the same. It is also true that IT projects, construction projects, and every other complex domain still ship forecasts. Saying "we cannot" is no longer good enough. Nimus exists so BCBAs can give a real, data backed answer, and refine it every week.
          </p>
        </div>
      </div>
    </section>
  );
}

function PaperToDatabase() {
  return (
    <section id="paper" className="border-t border-border bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            From paper to database
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Turn messy session sheets into clean, queryable data
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            In 2026, most ABA sessions are still recorded on a clipboard, then re-typed at the end of the day if they are typed at all. Nimus replaces the paper with a structured grid therapists can fill in during the session, so every trial lands in one database you can search, filter, export, and forecast from. Years from now, that history is still there.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: <ScanLine className="size-4" />, text: "One grid per learner, week, and target. Mirrors the sheet your team already knows." },
              { icon: <Database className="size-4" />, text: "Every trial stored with date, therapist, target, stimulus, and prompt level." },
              { icon: <FileSpreadsheet className="size-4" />, text: "Search and filter across months of history in seconds. No scanning binders." },
              { icon: <TrendingUp className="size-4" />, text: "The same data powers the forecast, weekly reports, and supervision review." },
            ].map((b) => (
              <li key={b.text} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  {b.icon}
                </span>
                <span className="text-foreground">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -left-3 top-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-soft ring-1 ring-border">
            Before, paper
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <img
              src={paperDataSheet}
              alt="Handwritten ABA data sheet with weekly trial marks per target"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="mt-5 flex items-center justify-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <ArrowRight className="size-5 rotate-90" />
            </div>
          </div>
          <div className="relative mt-5">
            <div className="absolute -left-3 -top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
              After, Nimus
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                <span>Structured database. 100% searchable.</span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-success" /> live
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {[
                  { t: "Match Id obj, cup", d: "2024-02-03", v: "P P" },
                  { t: "Match Id obj, spoon", d: "2024-02-04", v: "P P P P" },
                  { t: "Match Id obj, apple", d: "2024-02-05", v: "P P P + P" },
                  { t: "Recept instr, clap h.", d: "2024-02-06", v: "P P + +" },
                  { t: "Work at table, 1 min", d: "2024-02-09", v: "+ + + P +" },
                ].map((r) => (
                  <div
                    key={r.t + r.d}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-surface px-2 py-1.5"
                  >
                    <span className="truncate text-foreground">{r.t}</span>
                    <span className="text-muted-foreground">{r.d}</span>
                    <span className="rounded bg-card px-1.5 py-0.5 text-foreground">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
      desc: "Recent targets per week times remaining scope equals a date. Updates with every trial.",
    },
    {
      icon: <CalendarClock className="size-5" />,
      title: "Per level ETAs",
      desc: "Separate forecasts for VB-MAPP Level 1, 2, and 3, and per learning area.",
    },
    {
      icon: <Brain className="size-5" />,
      title: "What if levers",
      desc: "Show what happens if hours go up, sessions are missed, or a stalled area is paused.",
    },
    {
      icon: <FileSpreadsheet className="size-5" />,
      title: "Parent ready story",
      desc: "Cumulative progress and forecast on one chart parents actually understand.",
    },
  ];
  return (
    <section id="forecast" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The forecast engine</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            An ABA tool that actually answers "when?"
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every target a child masters tightens the model. The longer Nimus tracks a learner, the sharper the projection becomes, and the harder it is for anyone in the room to argue with the data.
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

function SkillMapSection() {
  return (
    <section id="skill-map" className="border-t border-border bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The skill map (work in progress)</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            A complete map of what a child should know by age
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Hundreds of programs and targets, organised into areas and stimuli, each tagged with a developmental level. Close every target in Level 1 and you know the learner has the repertoire of a neurotypical 18 month old. That structure is what makes the forecast possible. The current map is AI generated and is exactly what we want BCBAs to review with us.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Inspired by VB-MAPP, built around actual programs and targets, not assessment milestones",
              "Templates per learner profile: early learner, severe, advanced, custom",
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
            Programs tree, Behavior / Cooperation
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

function DemoFlow() {
  const steps = [
    {
      icon: <UserPlus className="size-5" />,
      title: "Create a child",
      desc: "Spin up a learner profile in seconds. No real data needed for the demo.",
    },
    {
      icon: <ListChecks className="size-5" />,
      title: "Apply a skill template",
      desc: "Attach the current AI generated VB-MAPP style skill map to the learner.",
    },
    {
      icon: <Wand2 className="size-5" />,
      title: "Auto generate dummy trials",
      desc: "We fill in months of plausible session data so you can see how Nimus reacts.",
    },
    {
      icon: <Eye className="size-5" />,
      title: "See the forecast",
      desc: "Open analytics and explore the cumulative progress chart and per level ETAs.",
    },
  ];
  return (
    <section id="demo" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Try it in 2 minutes</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Kick the tires before you apply
            </h2>
            <p className="mt-4 text-muted-foreground">
              You do not need to log a single real trial to see what Nimus does. Create a demo child, apply the template, generate dummy data, and the forecast shows up.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
          >
            Start the demo
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="absolute right-4 top-4 font-display text-2xl font-bold text-primary/20">
                0{i + 1}
              </span>
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                {s.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-soft">
          <span className="font-semibold text-foreground">Heads up.</span> This is an early alpha. The skill map is AI generated and not yet usable for real caseload work. The demo exists so you can judge the shape of the tool and decide if you want to help us build the real thing.
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
      desc: "Start from a VB-MAPP inspired skill map or your own template. Different children, different maps.",
    },
    {
      n: "02",
      title: "Therapists log trials in seconds",
      desc: "Plus for correct, P for prompted, minus for error. No more paper sheets your partner has to type up.",
    },
    {
      n: "03",
      title: "Nimus suggests what is ready to close",
      desc: "When mastery criteria are met, Nimus flags the target, program, or stimulus as ready to close. The BCBA always decides.",
    },
    {
      n: "04",
      title: "Show parents the forecast",
      desc: "Per level ETAs, weekly progress, and a story that makes therapy hours feel worth it.",
    },
  ];
  return (
    <section id="how" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How Nimus fits a clinic</p>
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
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-sm shadow-soft">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-muted-foreground">
            Nimus never closes or opens targets on its own. It only suggests. Clinical judgment stays with the BCBA, the data work moves to the software.
          </p>
        </div>
      </div>
    </section>
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
            icon={<LineChartIcon className="size-5" />}
            tag="For BCBAs (primary)"
            title="The clinical brain of your caseload"
            desc="Run every learner from one place. Your therapists capture data, Nimus turns it into target health, mastery velocity, and per level forecasts you can defend in any parent meeting."
            bullets={[
              "Per target health: active, stalled, ready to close",
              "Forecast per level and per area, refined weekly",
              "Build, edit, and share skill map templates",
              "Reports parents understand without a glossary",
            ]}
            cta="Apply to the alpha"
            accent="primary"
            href="#beta"
          />
          <AudienceCard
            icon={<Users className="size-5" />}
            tag="For parents (next)"
            title="See what your child's therapy is really doing"
            desc="Once your BCBA invites you in, you see the same forecast they see, in plain language. No spreadsheets, no jargon, no surprise IEP meetings."
            bullets={[
              "Read only views designed for non clinicians",
              "Plain language insights, not BCBA shorthand",
              "Know what to ask the team at the next meeting",
              "Coming after the BCBA alpha closes",
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
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">BCBA alpha, small cohort</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            Apply to the BCBA beta. Help us turn this alpha into a tool you would actually use.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            We are looking for BCBAs who want to co-design the skill map, stress test the forecast on a real caseload, and shape the data entry flow before we open it to everyone. Send us an email, tell us a bit about your practice, and we will set you up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:beta@nimus.app?subject=BCBA%20beta%20application%20-%20Nimus&body=Hi%20Nimus%20team%2C%0A%0AI%20would%20like%20to%20apply%20to%20the%20BCBA%20beta.%0A%0AName%3A%0ACertification%2Fstate%3A%0ACaseload%20size%3A%0AWhat%20you%20use%20today%3A%0AWhat%20you%20would%20want%20to%20test%20first%3A%0A%0AThanks%21"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft hover:-translate-y-0.5 transition-transform"
            >
              Apply to the BCBA beta
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Try the demo first
            </a>
          </div>
          <p className="mt-5 text-xs text-white/70">
            Free during alpha. Your caseload data stays yours. We ask for feedback, not testimonials.
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <img src={nimusLogo} alt="Nimus, Autism App" className="h-7 w-auto" />
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
