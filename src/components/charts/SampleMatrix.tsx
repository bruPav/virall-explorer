import type { Sample } from '@/lib/types';
import { cn } from '@/lib/cn';
import { compareFlights, flightLabel } from '@/lib/format';

export function SampleMatrix({ samples }: { samples: Sample[] }) {
  const flights = Array.from(new Set(samples.map((sample) => sample.flight))).sort(compareFlights);
  const replicates = Array.from(new Set(samples.map((sample) => sample.replicate))).sort();
  const max = Math.max(...samples.map((sample) => sample.richness ?? 0), 1);

  return (
    <div className="panel-flat overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Sampling design</p>
          <p className="text-xs text-muted">13 paired swabs across three flights</p>
        </div>
        <div className="flex items-center gap-2 text-[0.6rem] text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-[2px] bg-orange" /> Untreated
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-[2px] bg-blue" /> PMA
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-[2.2rem_repeat(5,1fr)] gap-1.5">
          <span />
          {replicates.map((replicate) => (
            <span key={replicate} className="pb-1 text-center font-mono text-[0.58rem] text-muted">
              {replicate}
            </span>
          ))}
          {flights.map((flight) => (
            <div key={flight} className="contents">
              <span className="flex items-center font-mono text-[0.62rem] text-muted">
                {flight.replace('F', 'F')}
              </span>
              {replicates.map((replicate) => {
                const untreated = samples.find(
                  (sample) =>
                    sample.flight === flight && sample.replicate === replicate && !sample.pma,
                );
                const pma = samples.find(
                  (sample) =>
                    sample.flight === flight && sample.replicate === replicate && sample.pma,
                );
                return (
                  <div key={`${flight}-${replicate}`} className="flex gap-1">
                    {[untreated, pma].map((sample, index) => {
                      const value = sample?.richness ?? 0;
                      const opacity = sample ? 0.18 + (value / max) * 0.82 : 0.06;
                      return (
                        <span
                          key={index}
                          className={cn(
                            'aspect-square flex-1 rounded-[3px] border border-bg-elev/40',
                            !sample && 'border-dashed border-border',
                          )}
                          style={{
                            background:
                              sample === undefined
                                ? 'transparent'
                                : index === 0
                                  ? `color-mix(in srgb, var(--orange) ${opacity * 100}%, transparent)`
                                  : `color-mix(in srgb, var(--blue) ${opacity * 100}%, transparent)`,
                          }}
                          title={
                            sample
                              ? `${flightLabel(flight)} ${replicate} ${sample.pma ? 'PMA' : 'Untreated'}: ${sample.richness ?? 'no detection'} virus types`
                              : 'No sample'
                          }
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[0.68rem] leading-snug text-muted">
          Colour intensity = virus types detected. Two PMA samples had no detectable viral signal.
        </p>
      </div>
    </div>
  );
}
