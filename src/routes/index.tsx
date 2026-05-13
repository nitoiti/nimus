import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  LineChart,
  ClipboardList,
  Sparkles,
  HeartHandshake,
  Target,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Nimus — Clear ABA progress for parents and BCBAs" },
      {
        name: "description",
        content:
          "Turn ABA session data into clear dashboards, plain-language insights, and reports parents and BCBAs can act on.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Hero />
      <AudienceSplit />
      <ValueGrid />
      <HowItWorks />
      <InsightShowcase />
      <CTA />
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
          <a href="#parents" className="hover:text-foreground transition-colors">For parents</a>
          <a href="#bcbas" className="hover:text-foreground transition-colors">For BCBAs</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:inline">
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            Open dashboard
            <ArrowRight className="size-3.5" />
          </Link>
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
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
          <Sparkles className="size-3.5 text-primary" />
          Built by a parent, for parents — and the clinicians who help them
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Finally see what's <span className="text-primary">actually working</span>
          <br className="hidden sm:block" /> in your child's ABA.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Nimus turns messy session notes into clear dashboards, plain-language insights, and reports
          you can share with your therapist. No spreadsheets. No clinical degree required.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform"
          >
            Try the dashboard
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            See how it works
          </a>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Free to start • No credit card • Your data stays private
        </p>

        {/* Hero preview card */}
        <div className="mx-auto mt-16 max-w-5xl">
          <DashboardPreviewCard />
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewCard() {
  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-glow">
      <div className="rounded-2xl bg-gradient-soft p-6 text-left">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              This week
            </p>
            <h3 className="font-display text-xl font-bold">Leo's progress at a glance</h3>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
            +12% independence
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InsightMini
            tone="success"
            label="Ready to close"
            text="2 targets are at 90%+. Time to celebrate and move on."
          />
          <InsightMini
            tone="warning"
            label="Needs attention"
            text="“Asks for water” hasn't been practiced in 18 days."
          />
          <InsightMini
            tone="info"
            label="What to ask next"
            text="“Why are we still prompting on the matching task?”"
          />
        </div>
      </div>
    </div>
  );
}

function InsightMini({
  tone,
  label,
  text,
}: {
  tone: "success" | "warning" | "info";
  label: string;
  text: string;
}) {
  const map = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-left shadow-soft">
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}>
        {label}
      </span>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

function AudienceSplit() {
  return (
    <section className="border-t border-border bg-background py-24">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        <AudienceCard
          id="parents"
          icon={<HeartHandshake className="size-5" />}
          tag="For parents"
          title="Run ABA at home with confidence"
          desc="You don't need a BCBA's budget to track progress like one. Nimus tells you what's improving, what's stuck, and what to ask the therapist next."
          bullets={[
            "Plain-language insights — no jargon",
            "Know which skills are open, stuck, or ready to close",
            "Share clean reports with your supervisor or BCBA",
          ]}
          cta="Start tracking free"
          accent="primary"
        />
        <AudienceCard
          id="bcbas"
          icon={<LineChart className="size-5" />}
          tag="For BCBAs"
          title="Decisions backed by clean data"
          desc="Stop reconstructing weeks of paper notes. Nimus surfaces practice intensity, prompt levels, and mastery velocity per target — across every case."
          bullets={[
            "Per-target health: active, stalled, ready to close",
            "Correct / Prompt / Error rates by week",
            "Supervision-ready reports in one click",
          ]}
          cta="Explore the BCBA view"
          accent="secondary"
        />
      </div>
    </section>
  );
}

function AudienceCard({
  id,
  icon,
  tag,
  title,
  desc,
  bullets,
  cta,
  accent,
}: {
  id: string;
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  cta: string;
  accent: "primary" | "secondary";
}) {
  const ring = accent === "primary" ? "ring-primary/20" : "ring-secondary/20";
  const dot = accent === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground";
  return (
    <div id={id} className={`rounded-3xl border border-border bg-card p-8 shadow-soft ring-1 ${ring}`}>
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
      <Link
        to="/dashboard"
        className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
      >
        {cta} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function ValueGrid() {
  const items = [
    {
      icon: <Layers className="size-5" />,
      title: "Organize learning",
      desc: "Areas, programs, targets, and stimuli — structured the way ABA actually works.",
    },
    {
      icon: <ClipboardList className="size-5" />,
      title: "Track every attempt",
      desc: "Independent (+), prompted (P), error (−) — recorded in seconds, kept in context.",
    },
    {
      icon: <Target className="size-5" />,
      title: "See what's stuck",
      desc: "Surface stalled targets, low practice intensity, and skills ready for the next step.",
    },
    {
      icon: <Sparkles className="size-5" />,
      title: "Insights, not numbers",
      desc: "Nimus translates trends into a sentence you can read and act on this week.",
    },
  ];
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">What Nimus does</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            A clearer way to track learning
          </h2>
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
    { n: "01", title: "Add programs and targets", desc: "Pick from VB-MAPP or build your own learning areas." },
    { n: "02", title: "Record session results", desc: "Tap +, P, or − for each trial. That's it." },
    { n: "03", title: "Review progress and trends", desc: "Daily, weekly, monthly — for one child or many." },
    { n: "04", title: "Share clear reports", desc: "Hand a clean summary to your therapist or supervisor." },
  ];
  return (
    <section id="how" className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">From session data to clarity in 4 steps</h2>
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

function InsightShowcase() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Know what's really moving forward</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Stop guessing. Start asking better questions.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Which skills are open or already closed",
            "Which targets may be ready to close",
            "Where the child still needs many prompts",
            "Which areas are getting enough practice",
            "Which targets haven't been practiced recently",
            "How much progress happened this week or month",
            "What to ask the therapist or supervisor next",
            "Where to focus your time tomorrow",
          ].map((s) => (
            <div key={s} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <span className="text-sm font-medium text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center shadow-glow sm:p-14">
          <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            See your child's progress more clearly — starting today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Built for parents who want a clearer picture of what's happening in therapy, and BCBAs who want decisions
            backed by clean data.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft hover:-translate-y-0.5 transition-transform"
          >
            Open the dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
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
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
