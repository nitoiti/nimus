import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ApplicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  role: z.enum(["bcba", "therapist", "parent", "interested"]),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  wantsToCodesign: z.boolean(),
});

const ROLE_LABELS: Record<string, string> = {
  bcba: "BCBA",
  therapist: "Therapist / RBT",
  parent: "Parent",
  interested: "Just interested",
};

// NOTE: Email notifications to nitoiti@gmail.com will be wired up once the
// project's email domain is configured. Until then every submission is safely
// stored in the `beta_applications` table — view them in the backend.

export const Route = createFileRoute("/api/public/beta-apply")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = ApplicationSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const data = parsed.data;
        const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

        const { error } = await supabaseAdmin.from("beta_applications").insert({
          name: data.name,
          email: data.email,
          role: data.role,
          years_experience: data.yearsExperience ?? null,
          wants_to_codesign: data.wantsToCodesign,
          user_agent: userAgent,
        });

        if (error) {
          console.error("[beta-apply] insert failed:", error);
          return Response.json(
            { error: "Could not save your application. Please try again." },
            { status: 500 },
          );
        }

        await tryNotifyByEmail({
          name: data.name,
          email: data.email,
          role: data.role,
          yearsExperience: data.yearsExperience ?? null,
          wantsToCodesign: data.wantsToCodesign,
        });

        return Response.json({ ok: true });
      },
    },
  },
});
