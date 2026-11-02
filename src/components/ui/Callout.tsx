import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  info: { icon: Info, className: 'border-blue/25 bg-blue/8 text-blue' },
  note: { icon: Lightbulb, className: 'border-teal/25 bg-teal/8 text-teal' },
  caveat: { icon: AlertTriangle, className: 'border-orange/30 bg-orange/8 text-orange' },
};

export function Callout({
  children,
  variant = 'info',
  title,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  title?: string;
  className?: string;
}) {
  const { icon: Icon, className: variantClass } = VARIANTS[variant];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3.5 text-sm leading-relaxed', variantClass, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="text-fg/90">
        {title && <p className="mb-1 font-semibold text-fg">{title}</p>}
        {children}
      </div>
    </div>
  );
}
