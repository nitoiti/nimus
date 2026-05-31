import { useRouterState, Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; href?: string };

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  progress: "Progress",
  "skill-map": "Skill Map",
  analytics: "Analytics",
  programs: "Programs",
};

export function BreadcrumbNav({ overrides }: { overrides?: Crumb[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Landing page — no breadcrumbs
  if (pathname === "/") return null;

  const crumbs = overrides ?? buildAutoCrumbs(pathname);
  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs text-muted-foreground">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <BreadcrumbItem key={i}>
              {isLast || !crumb.href ? (
                <BreadcrumbPage className="text-foreground font-medium">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator className="text-muted-foreground/50" />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function buildAutoCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const crumbs: Crumb[] = [];
  let cumulative = "";

  segments.forEach((segment, i) => {
    cumulative += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = ROUTE_LABELS[segment] ?? segment;

    if (isLast) {
      crumbs.push({ label });
    } else {
      crumbs.push({ label, href: cumulative });
    }
  });

  return crumbs;
}
