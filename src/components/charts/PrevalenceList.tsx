import type { SpeciesEntry } from '@/lib/types';

export function PrevalenceList({
  species,
  group,
  limit = 6,
  totalSamples = 24,
}: {
  species: SpeciesEntry[];
  group: 'phage' | 'giant';
  limit?: number;
  totalSamples?: number;
}) {
  const rows = species
    .filter((entry) => entry.group === group)
    .sort((a, b) => b.prevalence - a.prevalence || b.total - a.total)
    .slice(0, limit);
  const max = Math.max(...rows.map((row) => row.prevalence), 1);

  return (
    <ol className="space-y-2.5">
      {rows.map((entry, index) => (
        <li key={entry.name}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="mono-num w-4 shrink-0 text-[0.62rem] text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="truncate text-[0.78rem]" title={entry.name}>
                {entry.name}
              </span>
            </span>
            <span className="mono-num shrink-0 text-[0.65rem] text-muted">
              {entry.prevalence}/{totalSamples}
            </span>
          </div>
          <div className="mt-1 ml-6 h-1.5 overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(entry.prevalence / max) * 100}%`,
                background: group === 'phage' ? 'var(--teal)' : 'var(--blue)',
                opacity: 0.8,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
