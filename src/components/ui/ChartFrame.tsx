import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function ChartFrame({
  title,
  subtitle,
  legend,
  children,
  footer,
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <figure className={cn('panel-flat flex flex-col overflow-hidden', className)} id={id}>
      <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div>
          <figcaption className="text-sm font-semibold tracking-[-0.01em]">{title}</figcaption>
          {subtitle && <p className="mt-0.5 text-xs leading-snug text-muted">{subtitle}</p>}
        </div>
        {legend && <div className="flex flex-wrap items-center gap-3 text-xs text-muted">{legend}</div>}
      </div>
      <div className="min-w-0 flex-1 p-3 sm:p-4">{children}</div>
      {footer && <div className="border-t border-border/70 px-4 py-3 text-xs text-muted sm:px-5">{footer}</div>}
    </figure>
  );
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}

export function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-3 rounded-[2px]" style={{ background: color }} aria-hidden />
      {label}
    </span>
  );
}
