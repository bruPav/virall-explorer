import CountUp from '@/components/reactbits/CountUp/CountUp';
import { cn } from '@/lib/cn';

export function Stat({
  label,
  value,
  display,
  prefix,
  suffix,
  decimals = 0,
  note,
  accent = 'teal',
  className,
}: {
  label: string;
  value?: number;
  display?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  note?: string;
  accent?: 'teal' | 'blue' | 'orange' | 'purple' | 'fg';
  className?: string;
}) {
  const accentClass = {
    teal: 'text-teal',
    blue: 'text-blue',
    orange: 'text-orange',
    purple: 'text-purple',
    fg: 'text-fg',
  }[accent];

  return (
    <div className={cn('panel-flat relative overflow-hidden p-4 sm:p-5', className)}>
      <p className="label-mono text-[0.62rem]">{label}</p>
      <div className={cn('stat-value mt-2.5 text-[2rem] sm:text-[2.35rem]', accentClass)}>
        {display ? (
          display
        ) : (
          <CountUp
            to={value ?? 0}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            duration={1.4}
            trigger="view"
            separator=","
          />
        )}
      </div>
      {note && <p className="mt-2 text-xs leading-snug text-muted">{note}</p>}
    </div>
  );
}
