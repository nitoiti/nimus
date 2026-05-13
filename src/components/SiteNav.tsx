import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const appLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/progress", label: "Progress" },
  { to: "/skill-map", label: "Skill Map" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inApp = appLinks.some((l) => pathname.startsWith(l.to));

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-hero shadow-glow flex items-center justify-center">
              <div className="size-2.5 rounded-full bg-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Nimus
            </span>
          </Link>
          {inApp && (
            <div className="hidden md:flex items-center gap-1">
              {appLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    pathname.startsWith(l.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {inApp ? (
            <>
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Child
                </span>
                <span className="text-sm font-semibold text-foreground">Leo</span>
              </div>
              <div className="size-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white grid place-items-center font-semibold text-sm shadow-soft">
                L
              </div>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Open dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
