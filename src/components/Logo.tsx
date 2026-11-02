import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 rounded-lg"
      aria-label="Virall Virome Explorer home"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-white/95 p-1.5 shadow-sm transition-transform duration-200 group-hover:-rotate-3 dark:bg-white/90">
        <img src="/logo-mark.png" alt="" className="size-full object-contain" />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.15rem] font-semibold tracking-[-0.04em]">Virall</span>
        {!compact && (
          <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted sm:inline">
            Virome Explorer
          </span>
        )}
      </span>
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-2xl border border-border bg-white/95 p-3 shadow-sm dark:bg-white/90',
        className,
      )}
    >
      <img src="/logo-mark.png" alt="Virall logo" className="size-full object-contain" />
    </span>
  );
}
