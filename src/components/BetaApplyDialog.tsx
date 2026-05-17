import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const BETA_OPEN_EVENT = "open-beta-apply";

export function openBetaApply() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BETA_OPEN_EVENT));
  }
}

const FormSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
  role: z.enum(["bcba", "therapist", "parent", "interested"], {
    required_error: "Pick one",
  }),
  yearsExperience: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 80),
      "Enter a number between 0 and 80",
    ),
  wantsToCodesign: z.enum(["yes", "no"], { required_error: "Pick one" }),
});

type FormValues = z.infer<typeof FormSchema>;

export function BetaApplyDialog() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: "", email: "", yearsExperience: "" },
  });

  useEffect(() => {
    const handler = () => {
      setSubmitted(false);
      setServerError(null);
      form.reset({ name: "", email: "", yearsExperience: "" });
      setOpen(true);
    };
    window.addEventListener(BETA_OPEN_EVENT, handler);
    return () => window.removeEventListener(BETA_OPEN_EVENT, handler);
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/public/beta-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          role: values.role,
          yearsExperience: values.yearsExperience
            ? Number(values.yearsExperience)
            : null,
          wantsToCodesign: values.wantsToCodesign === "yes",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Something went wrong");
      }
      setSubmitted(true);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const role = form.watch("role");
  const wants = form.watch("wantsToCodesign");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-7" />
            </div>
            <DialogTitle className="font-display text-2xl">You're on the list</DialogTitle>
            <DialogDescription className="mt-2 text-base">
              Thanks — we got your application. We'll reach out at{" "}
              <span className="font-medium text-foreground">{form.getValues("email")}</span>{" "}
              within a few days.
            </DialogDescription>
            <Button className="mt-6" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Apply to the Nimus alpha</DialogTitle>
              <DialogDescription>
                Tell us who you are. We'll get back to you within a few days.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} placeholder="Jane Doe" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="you@clinic.com"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>I am a…</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => form.setValue("role", v as FormValues["role"], { shouldValidate: true })}
                  className="grid grid-cols-2 gap-2"
                >
                  {[
                    { v: "bcba", l: "BCBA" },
                    { v: "therapist", l: "Therapist / RBT" },
                    { v: "parent", l: "Parent" },
                    { v: "interested", l: "Just interested" },
                  ].map((opt) => (
                    <label
                      key={opt.v}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        role === opt.v
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={opt.v} id={`role-${opt.v}`} />
                      <span>{opt.l}</span>
                    </label>
                  ))}
                </RadioGroup>
                {form.formState.errors.role && (
                  <p className="text-xs text-destructive">{form.formState.errors.role.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="years">
                  Years of experience{" "}
                  <span className="text-muted-foreground font-normal">
                    {role === "parent" || role === "interested" ? "(optional)" : ""}
                  </span>
                </Label>
                <Input
                  id="years"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...form.register("yearsExperience")}
                  placeholder="e.g. 5"
                />
                {form.formState.errors.yearsExperience && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.yearsExperience.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Do you want to help co-design the skill maps?</Label>
                <RadioGroup
                  value={wants}
                  onValueChange={(v) =>
                    form.setValue("wantsToCodesign", v as "yes" | "no", { shouldValidate: true })
                  }
                  className="space-y-2"
                >
                  <label
                    className={`flex items-start gap-2.5 rounded-md border p-3 text-sm cursor-pointer transition-colors ${
                      wants === "yes" ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value="yes" id="codesign-yes" className="mt-0.5" />
                    <span>
                      <span className="font-medium">Yes</span> — I'd like to help build skill maps
                      for different cases.
                    </span>
                  </label>
                  <label
                    className={`flex items-start gap-2.5 rounded-md border p-3 text-sm cursor-pointer transition-colors ${
                      wants === "no" ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
                    }`}
                  >
                    <RadioGroupItem value="no" id="codesign-no" className="mt-0.5" />
                    <span>
                      <span className="font-medium">No</span> — I just want to test it and get
                      access when it's ready.
                    </span>
                  </label>
                </RadioGroup>
                {form.formState.errors.wantsToCodesign && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.wantsToCodesign.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
