import { Link } from "@tanstack/react-router";
import { Check, BookOpen, FlaskConical, ArrowRight, ClipboardList, Sparkles } from "lucide-react";

type Step = {
  done: boolean;
  title: string;
  desc: string;
};

export function OnboardingChecklist({
  childName,
  step1Done,
  step2Done,
  onSeedDemo,
}: {
  childName: string;
  step1Done: boolean;
  step2Done: boolean;
  onSeedDemo: () => void;
}) {
  const steps: Step[] = [
    {
      done: step1Done,
      title: "Apply a curriculum template",
      desc: "Pick a ready-made scaffold of areas, programs, levels, and targets.",
    },
    {
      done: step2Done,
      title: "Add session data",
      desc: "Log a real trial — or seed demo data to explore the app first.",
    },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-soft">
      <div className="border-b border-border/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-3" /> Get started
            </div>
            <h2 className="font-display text-xl font-bold leading-snug">
              Let's get {childName}'s dashboard set up
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Two quick steps — takes about 30 seconds.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-2xl font-bold text-primary">
              {completed}<span className="text-muted-foreground">/2</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              completed
            </div>
          </div>
        </div>
      </div>

      <ol className="divide-y divide-border/60">
        {/* Step 1 */}
        <li className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <StepBullet index={1} done={steps[0].done} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <p className={`font-semibold ${steps[0].done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {steps[0].title}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{steps[0].desc}</p>
          </div>
          {steps[0].done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <Check className="size-3.5" /> Done
            </span>
          ) : (
            <Link
              to="/skill-map"
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform"
            >
              Apply template <ArrowRight className="size-3.5" />
            </Link>
          )}
        </li>

        {/* Step 2 */}
        <li className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center ${!steps[0].done ? "opacity-50" : ""}`}>
          <StepBullet index={2} done={steps[1].done} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              <p className={`font-semibold ${steps[1].done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {steps[1].title}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{steps[1].desc}</p>
          </div>
          {steps[1].done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <Check className="size-3.5" /> Done
            </span>
          ) : (
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to="/progress"
                className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-transform ${
                  steps[0].done
                    ? "bg-primary text-primary-foreground shadow-soft hover:-translate-y-0.5"
                    : "pointer-events-none bg-muted text-muted-foreground"
                }`}
              >
                Go to Progress <ArrowRight className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={onSeedDemo}
                disabled={!steps[0].done}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FlaskConical className="size-3.5" /> Seed demo data
              </button>
            </div>
          )}
        </li>
      </ol>
    </section>
  );
}

function StepBullet({ index, done }: { index: number; done: boolean }) {
  return (
    <div
      className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
        done
          ? "bg-success text-success-foreground"
          : "bg-primary/10 text-primary ring-1 ring-primary/20"
      }`}
    >
      {done ? <Check className="size-4" /> : index}
    </div>
  );
}
