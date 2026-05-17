## Beta application modal

### What we're building
A modal popup triggered from the existing "Apply for beta" CTAs (Hero + BetaCTA section + top nav) that collects an application and emails it to **nitoiti@gmail.com**.

### Form fields
1. **Name** (required)
2. **Email** (required, validated)
3. **Role** — radio: BCBA / Therapist / Parent / Just interested (required)
4. **Years of experience** — number (required for BCBA/Therapist, optional otherwise)
5. **Willing to co-design skill maps?** — radio: "Yes, I want to help build skill maps for different cases" / "No, I just want to test and get access when it's ready" (required)

Open to all roles — no gating. We just collect, you sort later.

### Backend
- Enable **Lovable Cloud** (needed for email sending + storing submissions).
- Set up **Lovable Emails** with a sender domain (one-click setup dialog).
- Create a `beta_applications` table to persist every submission (so nothing is lost if email fails). RLS: public INSERT only, no SELECT.
- Create a **public server route** `POST /api/public/beta-apply` that:
  - Validates input with Zod (length limits, email format, enum for role/willingness)
  - Inserts into `beta_applications`
  - Enqueues a transactional email to `nitoiti@gmail.com` using a `beta-application` template (subject: "New beta application — {name} ({role})", body: all fields formatted clearly)
- Public route so unauthenticated visitors can submit.

### Frontend
- New `BetaApplyDialog` component (shadcn `Dialog` + `react-hook-form` + zod resolver).
- Wire all existing "Apply for beta" / "Join the alpha" buttons to open the dialog instead of `mailto:` or anchors.
- On success: show a thank-you state inside the dialog ("Got it — we'll be in touch at {email}").
- On error: inline error message, keep form data.

### Files touched
- New: `src/components/BetaApplyDialog.tsx`
- New: `src/routes/api/public/beta-apply.ts` (server route)
- New: `src/lib/email-templates/beta-application.tsx` + register in `registry.ts`
- Edit: `src/routes/index.tsx` (wire CTAs to open dialog)
- DB migration: `beta_applications` table + RLS

### Prerequisites I'll handle automatically
1. Enable Lovable Cloud
2. Set up email domain (you'll get a one-click dialog to pick the subdomain)
3. Scaffold email infrastructure
4. Then build everything above

Ready to implement?