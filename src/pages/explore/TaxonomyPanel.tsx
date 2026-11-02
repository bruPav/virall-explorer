import { useMemo, useState } from 'react';
import { TaxonomySunburst } from '@/components/charts/TaxonomySunburst';
import { Callout } from '@/components/ui/Callout';
import { cn } from '@/lib/cn';
import { formatShare, formatTpm } from '@/lib/format';
import type { Sample, SpeciesData } from '@/lib/types';

export function TaxonomyPanel({ species, samples }: { species: SpeciesData; samples: Sample[] }) {
  const [pma, setPma] = useState(false);

  const families = useMemo(() => {
    const sampleById = new Map(samples.map((sample) => [sample.id, sample]));
    const active = new Set(
      species.samples
        .map((id, index) => (sampleById.get(id)?.pma === pma ? index : -1))
        .filter((index) => index >= 0),
    );
    const totals = new Map<string, number>();
    for (const entry of species.species) {
      if (entry.group === 'nonviral') continue;
      let total = 0;
      for (const [index, value] of entry.values) if (active.has(index)) total += value;
      if (total <= 0) continue;
      const key =
        entry.family ?? entry.genus ?? `${entry.class ?? 'Unassigned'} (unassigned)`;
      totals.set(key, (totals.get(key) ?? 0) + total);
    }
    const rows = Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
    const overall = rows.reduce((sum, row) => sum + row.total, 0);
    return { rows: rows.slice(0, 8), overall };
  }, [species, samples, pma]);

  return (
    <div>
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold">Taxonomy weighted by abundance</h2>
          <p className="text-xs text-muted">
            Kaiju classification · TPM matrix · click a ring to zoom
          </p>
        </div>
        <div
          className="inline-flex rounded-lg border border-border bg-surface p-1"
          role="group"
          aria-label="PMA status"
        >
          {[
            { value: false, label: 'Untreated' },
            { value: true, label: 'PMA' },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => setPma(option.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium text-muted transition-colors',
                pma === option.value && 'bg-accent/14 text-fg',
              )}
              aria-pressed={pma === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr] lg:items-start">
        <div className="panel-flat p-3 sm:p-4">
          <TaxonomySunburst data={species} samples={samples} pma={pma} />
        </div>

        <div className="space-y-4">
          <div className="panel-flat p-4 sm:p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Top families & genera</h3>
              <span className="mono-num text-[0.62rem] text-muted">TPM · share</span>
            </div>
            <ol className="mt-3 space-y-2.5">
              {families.rows.map((row, index) => (
                <li key={row.name}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.74rem]">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="mono-num w-4 shrink-0 text-[0.58rem] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate" title={row.name}>{row.name}</span>
                    </span>
                    <span className="mono-num shrink-0 text-[0.62rem] text-muted">
                      {formatTpm(row.total)} · {formatShare(row.total, families.overall)}
                    </span>
                  </div>
                  <div className="ml-6 mt-1 h-1.5 overflow-hidden rounded-full bg-border/50">
                    <div
                      className="h-full rounded-full bg-teal/80"
                      style={{ width: `${Math.max(2, (row.total / families.rows[0].total) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <Callout variant="note" title="How to read this">
            Ring area is proportional to summed TPM in{' '}
            {pma ? 'PMA-treated' : 'untreated'} samples. The middle ring uses family when assigned
            and genus otherwise. Switching PMA status re-weights the same taxonomy; it does not
            change the classification.
          </Callout>
        </div>
      </div>
    </div>
  );
}
