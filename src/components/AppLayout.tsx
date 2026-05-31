import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { BreadcrumbNav, type Crumb } from "./BreadcrumbNav";

export function AppLayout({
  title,
  subtitle,
  actions,
  breadcrumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <BreadcrumbNav overrides={breadcrumbs} />
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
        {children}
      </main>
    </div>
  );
}
