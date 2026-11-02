import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Download } from 'lucide-react';
import { SampleBrowser } from '@/components/charts/SampleBrowser';
import { Callout } from '@/components/ui/Callout';
import { useScrollToOnChange } from '@/lib/hooks';
import { downloadCsv } from '@/lib/csv';
import { cn } from '@/lib/cn';
import { flightLabel, formatCompact, formatNumber, formatShare, formatTpm } from '@/lib/format';
import type { CompositionEntry, Sample, SpeciesData } from '@/lib/types';

export function SamplesPanel({
  samples,
  species,
  composition,
}: {
  samples: Sample[];
  species: SpeciesData;
  composition: CompositionEntry[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selected =
    samples.find((sample) => sample.id === searchParams.get('sample')) ??
    samples.find((sample) => sample.id === 'F10_D1_NO_PMA') ??
    samples[0];
  const detailRef = useRef<HTMLDivElement>(null);
  useScrollToOnChange(selected.id, detailRef);

  const select = (sample: Sample) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'samples');
    params.set('sample', sample.id);
    setSearchParams(params, { replace: true });
  };

  const sampleIndex = species.samples.indexOf(selected.id);
  const topSpecies = useMemo(() => {
    if (sampleIndex < 0) return [];
    return species.species
      .filter((entry) => entry.group !== 'nonviral')
      .map((entry) => {
        const value = entry.values.find(([index]) => index === sampleIndex)?.[1] ?? 0;
        return { ...entry, value };
      })
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [species, sampleIndex]);

  const sampleComposition = composition.find((entry) => entry.id === selected.id);
  const maxTpm = Math.max(...topSpecies.map((entry) => entry.value), 1);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel-flat p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Choose a sample</h2>
            <p className="text-xs text-muted">Paired untreated and PMA swabs</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.62rem] text-muted">{samples.length} total</span>
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  'virall-samples.csv',
                  samples.map((sample) => ({
                    sample: sample.id,
                    flight: sample.flight,
                    replicate: sample.replicate,
                    treatment: sample.pma ? 'PMA' : 'untreated',
                    virus_types: sample.richness ?? '',
                    shannon: sample.shannon ?? '',
                    spots: sample.spots,
                    bases: sample.bases,
                  })),
                )
              }
              className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-1 text-[0.6rem] text-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              <Download className="size-3" /> CSV
            </button>
          </div>
        </div>
        <SampleBrowser samples={samples} selectedId={selected.id} onSelect={select} />
      </div>

      <div className="panel-flat order-first overflow-hidden lg:order-none" ref={detailRef}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {flightLabel(selected.flight)} · {selected.replicate}
              </h2>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em]',
                  selected.pma ? 'bg-blue/12 text-blue' : 'bg-orange/12 text-orange',
                )}
              >
                {selected.pma ? 'PMA' : 'Untreated'}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.62rem] text-muted">{selected.name}</p>
          </div>
          {selected.pair && (
            <span className="chip">Pair {selected.pair}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
          {[
            { label: 'Virus types', value: selected.richness === null ? 'None' : formatNumber(selected.richness) },
            { label: 'Shannon', value: selected.shannon === null ? '—' : selected.shannon.toFixed(2) },
            { label: 'Spots', value: formatCompact(selected.spots) },
            { label: 'Bases', value: formatCompact(selected.bases) },
          ].map((item) => (
            <div key={item.label} className="bg-surface-solid px-4 py-3">
              <p className="label-mono text-[0.58rem]">{item.label}</p>
              <p className="mono-num mt-1 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          {selected.richness === null ? (
            <Callout variant="caveat" title="No viral signal">
              This PMA-treated sample had no detectable viruses. It is plotted as zero in the
              paired comparison.
            </Callout>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold">Most abundant species</h3>
                <span className="font-mono text-[0.62rem] text-muted">TPM</span>
              </div>
              <ol className="mt-3 space-y-2.5">
                {topSpecies.map((entry, index) => (
                  <li key={entry.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="mono-num w-4 shrink-0 text-[0.6rem] text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate text-[0.78rem]" title={entry.name}>
                          {entry.name}
                        </span>
                        <span className="hidden shrink-0 rounded bg-border/50 px-1 py-0.5 text-[0.55rem] uppercase tracking-[0.06em] text-muted sm:inline">
                          {entry.group}
                        </span>
                      </span>
                      <span className="mono-num shrink-0 text-[0.65rem] text-muted">
                        {formatTpm(entry.value)}
                      </span>
                    </div>
                    <div className="ml-6 mt-1 h-1.5 overflow-hidden rounded-full bg-border/50">
                      <div
                        className="h-full rounded-full bg-teal/80"
                        style={{ width: `${Math.max(2, (entry.value / maxTpm) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {sampleComposition && (
            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="label-mono mb-2">Viral group share</p>
              <div className="flex h-2 overflow-hidden rounded-full bg-border/50">
                <div style={{ width: `${(sampleComposition.Caudoviricetes / sampleComposition.total) * 100}%`, background: 'var(--teal)' }} />
                <div style={{ width: `${(sampleComposition.Megaviricetes / sampleComposition.total) * 100}%`, background: 'var(--blue)' }} />
                <div style={{ width: `${(sampleComposition.Other / sampleComposition.total) * 100}%`, background: 'var(--purple)' }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-muted">
                <span>Bacterial: {formatShare(sampleComposition.Caudoviricetes, sampleComposition.total)}</span>
                <span>Giant: {formatShare(sampleComposition.Megaviricetes, sampleComposition.total)}</span>
                <span>Other: {formatShare(sampleComposition.Other, sampleComposition.total)}</span>
              </div>
            </div>
          )}

          <p className="mt-5 flex items-start gap-2 text-[0.7rem] leading-snug text-muted">
            <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" />
            Read depth varies between samples; richness comparisons should account for sequencing
            depth.
          </p>
        </div>
      </div>
    </div>
  );
}
