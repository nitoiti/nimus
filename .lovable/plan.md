## Goal

Turn `/dashboard` into a first-login empty state that walks a BCBA through two clear steps — **apply a curriculum template**, then **seed demo data (or start logging real sessions)** — so they reach a fully-populated dashboard without us hand-holding them.

This is a **design prototype** in the Lovable repo. Once you approve it, we'll generate a Windsurf prompt to apply the same journey to the production app (nimus.app).

## The user journey

```text
Step 0  First login → /dashboard
        ├─ All stats show "—" / 0
        ├─ Big "Get started" panel up top with 2 steps
        └─ Sections below: muted empty states ("No data yet")

Step 1  Click "Apply curriculum template" → /templates
        └─ User applies Nimus Early ABA Curriculum
            ↓ returns to /progress (not /dashboard)

Step 2  /progress shows targets list but no session data
        ├─ Hint banner: "Tap + to log your first session — or
        │   seed demo data to explore the app first"
        └─ Two CTAs:
            • "+ Add session" (primary, bottom-right FAB, existing)
            • "Seed demo data" (secondary, opens existing seed flow)

Step 3  After seed or real entries → dashboard fully populated,
        onboarding panel auto-hides.
```

## What I'll change

### 1. `/dashboard` — empty-state redesign

Replace the current hardcoded "Welcome back, Evgeniy" insight cards with a state-aware layout. For the prototype I'll add a local toggle (or URL param `?empty=1`) so you can preview both states side-by-side without backend wiring.

**Empty state layout** (top → bottom):

- **Header**: "Welcome to Nimus" + "Let's get Test child's dashboard set up — takes ~30 seconds."
- **Onboarding panel** (replaces the 3 insight cards): a 2-step checklist card
  - Step 1 — *Apply a curriculum template* → button → `/templates`
    - Checked off automatically once any programs exist
  - Step 2 — *Add your first session* (or *Seed demo data to explore*)
    - Two side-by-side buttons: "Go to Progress" (primary) + "Seed demo data" (ghost)
- **Stat row**: same 5 cards, but values are `—` and labels muted
- **VB-MAPP map**: shown with `0/0` and a "No programs yet — apply a template" inline hint
- **Reports**: shown disabled with "No session data yet" overlay
- **Profile card removed** from the dashboard (per your note)

**Populated state**: keep the existing dashboard structure (insight cards, stats, VB-MAPP, reports). Onboarding panel auto-hides.

### 2. `/progress` — empty-state hint

When targets exist but no session records: add a dismissible banner above the table:
> "No sessions logged yet. Tap **+** below to log your first trial, or **seed demo data** to explore the app with ~11 months of fake history."
- "+ Add session" → existing FAB
- "Seed demo data" → opens the existing seed-demo-data confirmation (lifted from child settings into a shared dialog component)

### 3. Shared `SeedDemoDataDialog` component

Extract the existing seed-demo-data UI from child settings into `src/components/SeedDemoDataDialog.tsx` so it can be triggered from both `/dashboard` (step 2) and `/progress` (banner). In this Lovable prototype the dialog is visual-only (no real backend wiring) — Windsurf will hook it up to the existing server action in production.

## Files touched

- Edit `src/routes/dashboard.tsx` — empty + populated states, onboarding panel, `?empty=1` toggle
- Edit `src/routes/progress.tsx` — empty-state banner above table
- New `src/components/OnboardingChecklist.tsx` — the 2-step card
- New `src/components/SeedDemoDataDialog.tsx` — visual dialog matching your existing child-settings seed flow

## What happens after you approve

1. I implement the design (build mode).
2. You review in preview at `/dashboard?empty=1` and `/dashboard` (populated).
3. Once you're happy, I generate a Windsurf prompt describing this journey + linking to the relevant files, so Windsurf can replicate it in the production repo against the real backend (template state, session count, seed action).

Ready to build?
