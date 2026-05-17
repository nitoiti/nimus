import { useState } from "react";
import { FlaskConical, AlertTriangle, Check, X } from "lucide-react";

export function SeedDemoDataDialog({
  open,
  onOpenChange,
  childName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
  onConfirm?: () => void;
}) {
  const [state, setState] = useState<"idle" | "done">("idle");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    setState("done");
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(() => setState("idle"), 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <FlaskConical className="size-5 text-warning-foreground" />
            <h2 className="font-display text-xl font-bold">Seed demo data</h2>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
              dev
            </span>
          </div>

          {state === "idle" ? (
            <>
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
                <div className="mb-1.5 flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="size-4" />
                  This will overwrite all existing progress data
                </div>
                <p className="leading-relaxed">
                  Generates ~11 months of fake session results: all Level 1 programs marked{" "}
                  <strong>mastered</strong>, ~45% of Level 2 programs set to <strong>in progress</strong>.
                  All previous session records and target statuses for <strong>{childName}</strong> will be{" "}
                  <strong>permanently erased</strong> first.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  onClick={close}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-soft hover:-translate-y-0.5 transition-transform"
                >
                  <AlertTriangle className="size-3.5" /> Yes, erase &amp; seed demo data
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-success/30 bg-success/10 p-5 text-sm text-success">
                <div className="mb-2 flex items-center gap-1.5 font-semibold">
                  <Check className="size-4" /> Done!
                </div>
                <ul className="space-y-1 pl-5 [&_li]:list-disc">
                  <li>4357 session records created</li>
                  <li>targets updated</li>
                  <li>programs mastered (Level 1)</li>
                  <li>programs in progress (Level 2)</li>
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={close}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 transition-transform"
                >
                  Got it
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
