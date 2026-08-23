import * as React from "react";
import { ChevronLeft, Home } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  crumbs,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.07] via-background to-background" />
        <div className="absolute -right-24 -top-20 size-[22rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -left-24 top-8 size-[18rem] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-grid-light bg-[size:38px_38px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] dark:bg-grid-dark" />
      </div>

      <div className="container py-14 md:py-20">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="مسار التنقل" className="mb-5 flex items-center gap-1 text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronLeft className="size-3.5 opacity-50" />}
                {c.href ? (
                  <a href={c.href} className="flex items-center gap-1 transition hover:text-accent">
                    {i === 0 && <Home className="size-3.5" />}
                    {c.label}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground">{c.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <Reveal>
          {eyebrow && (
            <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1 text-sm font-semibold text-accent">
              {eyebrow}
            </span>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>}
          {children && <div className="mt-6">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}
