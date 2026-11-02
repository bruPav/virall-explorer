import { useMemo, useState } from 'react';
import { CircleSlash2 } from 'lucide-react';
import type { Sample } from '@/lib/types';
import { cn } from '@/lib/cn';
import { compareFlights, flightLabel, formatNumber } from '@/lib/format';

export function SampleBrowser({
  samples,
  selectedId,
  onSelect,
}: {
  samples: Sample[];
  selectedId?: string | null;
  onSelect?: (sample: Sample) => void;
}) {
  const flights = useMemo(
    () => Array.from(new Set(samples.map((sample) => sample.flight))).sort(compareFlights),
    [samples],
  );
  const [flight, setFlight] = useState<string>('all');
  const max = Math.max(...samples.map((sample) => sample.richness ?? 0), 1);

  const visible = samples
    .filter((sample) => flight === 'all' || sample.flight === flight)
    .sort(
      (a, b) =>
        compareFlights(a.flight, b.flight) ||
        a.replicate.localeCompare(b.replicate) ||
        Number(a.pma) - Number(b.pma),
    );

  return (
    <div>
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All flights' },
          ...flights.map((value) => ({ id: value, label: flightLabel(value) })),
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFlight(item.id)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-fg',
              flight === item.id && 'bg-accent/14 text-fg',
            )}
            aria-pressed={flight === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 max-h-[24rem] space-y-1 overflow-y-auto scroll-thin lg:max-h-none lg:overflow-visible">
        {visible.map((sample) => {
          const value = sample.richness;
          const noDetection = value === null;
          const width = noDetection ? 0 : Math.max(2, (value / max) * 100);
          const isSelected = selectedId === sample.id;
          const content = (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <span className="mono-num w-6 shrink-0 text-[0.68rem] text-muted">{sample.replicate}</span>
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em]',
                    sample.pma ? 'bg-blue/12 text-blue' : 'bg-orange/12 text-orange',
                  )}
                >
                  {sample.pma ? 'PMA' : 'Untreated'}
                </span>
                {flight === 'all' && (
                  <span className="mono-num text-[0.62rem] text-muted">{sample.flight}</span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${width}%`,
                      background: sample.pma ? 'var(--blue)' : 'var(--orange)',
                      opacity: noDetection ? 0 : 0.85,
                    }}
                  />
                </div>
                <span className="mono-num w-14 shrink-0 text-right text-[0.68rem] text-muted">
                  {noDetection ? (
                    <span className="inline-flex items-center gap-1 text-[0.62rem]">
                      <CircleSlash2 className="size-3" /> none
                    </span>
                  ) : (
                    formatNumber(value)
                  )}
                </span>
              </div>
            </>
          );

          return onSelect ? (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample)}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-bg-elev/60',
                isSelected && 'border-border-strong bg-accent/10',
              )}
            >
              {content}
            </button>
          ) : (
            <div key={sample.id} className="flex items-center gap-3 px-2 py-1.5">
              {content}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[0.7rem] leading-snug text-muted">
        Virus types (richness) per sample. Two PMA samples had no detectable viral signal.
      </p>
    </div>
  );
}
