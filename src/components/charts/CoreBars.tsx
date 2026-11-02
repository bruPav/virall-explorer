import type { CoreStats } from '@/lib/types';

export function CoreBars({ core }: { core: CoreStats }) {
  const rows = [
    { label: 'Detected in 3 flights', value: core.byFlights['3'], color: 'var(--orange)' },
    { label: 'Detected in 2 flights', value: core.byFlights['2'], color: 'var(--teal)' },
    { label: 'Detected in 1 flight', value: core.byFlights['1'], color: 'var(--muted)' },
  ];
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-muted">{row.label}</span>
            <span className="mono-num font-semibold">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full"
              style={{ width: `${(row.value / max) * 100}%`, background: row.color, opacity: 0.8 }}
            />
          </div>
        </div>
      ))}
      <p className="text-[0.7rem] leading-snug text-muted">
        {core.coreSpecies} species were detected both with and without PMA. None were found in
        PMA-treated samples from all three flights.
      </p>
    </div>
  );
}
