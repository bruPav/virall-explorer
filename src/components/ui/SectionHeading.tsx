import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="label-mono">{eyebrow}</p>}
        <h2 id={id} className="display mt-2 text-balance text-[1.7rem] sm:text-[2rem] md:text-[2.35rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-[0.95rem]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
