import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Dna, Download, X } from 'lucide-react';
import { GenomeScatter } from '@/components/charts/GenomeScatter';
import { cn } from '@/lib/cn';
import { useScrollToOnChange } from '@/lib/hooks';
import { downloadCsv } from '@/lib/csv';
import { formatBp, formatNumber, formatPercent } from '@/lib/format';
import type { Genome } from '@/lib/types';

export function GenomesPanel({ genomes }: { genomes: Genome[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = genomes.find((genome) => genome.contig === searchParams.get('genome')) ?? null;
  const [flight, setFlight] = useState('all');
  const detailRef = useRef<HTMLDivElement>(null);
  useScrollToOnChange(selected?.contig ?? null, detailRef);

  const visible = genomes.filter((genome) => flight === 'all' || genome.flight === flight);
  const byFlight = ['F9', 'F10', 'F11'].map((code) => ({
    code,
    count: genomes.filter((genome) => genome.flight === code).length,
  }));
  const topSample = [...genomes].reduce<Record<string, number>>((accumulator, genome) => {
    accumulator[genome.sample] = (accumulator[genome.sample] ?? 0) + 1;
    return accumulator;
  }, {});
  const topEntry = Object.entries(topSample).sort((a, b) => b[1] - a[1])[0];

  const select = (genome: Genome | null) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'genomes');
    if (genome) params.set('genome', genome.contig);
    else params.delete('genome');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="space-y-4">
        <div className="panel-flat overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold">High-quality genomes</h2>
              <p className="text-xs text-muted">
                {genomes.length} unique genomes · completeness and size
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'virall-genomes.csv',
                    genomes.map((genome) => ({
                      contig: genome.contig,
                      sample: genome.sample,
                      flight: genome.flight,
                      treatment: genome.pma ? 'PMA' : 'untreated',
                      completeness: genome.completeness,
                      contamination: genome.contamination,
                      length_bp: genome.length,
                      viral_genes: genome.viralGenes,
                      host_genes: genome.hostGenes,
                    })),
                  )
                }
                className="mr-1 inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-1 font-mono text-[0.58rem] text-muted transition-colors hover:border-border-strong hover:text-fg"
              >
                <Download className="size-3" /> CSV
              </button>
              {[{ id: 'all', label: 'All' }, ...byFlight.map((item) => ({ id: item.code, label: item.code }))].map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlight(item.id)}
                    className={cn(
                      'rounded-md px-2 py-1 font-mono text-[0.62rem] text-muted transition-colors hover:bg-accent/10 hover:text-fg',
                      flight === item.id && 'bg-accent/14 text-fg',
                    )}
                    aria-pressed={flight === item.id}
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <GenomeScatter
              genomes={visible}
              selected={selected?.contig}
              onSelect={(genome) => select(genome)}
            />
          </div>
          <div className="border-t border-border/70 px-4 py-3 text-[0.68rem] leading-relaxed text-muted sm:px-5">
            All high-quality records came from untreated samples. {topEntry?.[1] ?? 0} of{' '}
            {genomes.length} genomes came from one deep sample ({topEntry?.[0]}), so genome
            recovery is not evenly distributed across flights.
          </div>
        </div>

        <div className="panel-flat overflow-hidden">
          <div className="border-b border-border/70 px-4 py-3 sm:px-5">
            <h3 className="text-sm font-semibold">Genome list</h3>
          </div>
          <ul className="max-h-[24rem] divide-y divide-border/60 overflow-y-auto scroll-thin">
            {visible.map((genome) => {
              const isSelected = selected?.contig === genome.contig;
              return (
                <li key={`${genome.contig}-${genome.sample}`}>
                  <button
                    type="button"
                    onClick={() => select(genome)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/7',
                      isSelected && 'bg-accent/12',
                    )}
                    aria-pressed={isSelected}
                  >
                    <Dna className="size-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.78rem]">{genome.contig}</span>
                      <span className="mono-num block text-[0.6rem] text-muted">
                        {genome.flight} · {genome.sample} · {formatBp(genome.length)}
                      </span>
                    </span>
                    <span className="mono-num shrink-0 text-[0.68rem] text-muted">
                      {genome.completeness.toFixed(0)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="order-first lg:order-none lg:sticky lg:top-20" ref={detailRef}>
        {selected ? (
          <GenomeDetail genome={selected} onClose={() => select(null)} />
        ) : (
          <div className="panel-flat p-5">
            <p className="label-mono">Genome detail</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Select a point or a row to inspect completeness, contamination, length, and gene
              counts.
            </p>
            <dl className="mt-4 space-y-2 border-t border-border/70 pt-4 text-sm">
              {byFlight.map((item) => (
                <div key={item.code} className="flex items-center justify-between">
                  <dt className="text-muted">Flight {item.code.replace('F', '')}</dt>
                  <dd className="mono-num">{item.count}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/70 pt-2">
                <dt className="text-muted">PMA-treated genomes</dt>
                <dd className="mono-num">{genomes.filter((genome) => genome.pma).length}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function GenomeDetail({ genome, onClose }: { genome: Genome; onClose: () => void }) {
  const quality =
    genome.completeness >= 90 && genome.contamination < 10
      ? 'High quality'
      : genome.completeness >= 90
        ? 'High completeness'
        : 'Partial';

  return (
    <div className="panel-flat overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="label-mono">{quality}</p>
          <h2 className="mt-1 break-words text-base font-semibold">{genome.contig}</h2>
          <p className="mt-1 font-mono text-[0.62rem] text-muted">
            {genome.flight} · {genome.sample} · {genome.pma ? 'PMA' : 'Untreated'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-accent/10 hover:text-fg"
          aria-label="Close genome detail"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="label-mono">Completeness</p>
            <p className="stat-value mt-2 text-[2.4rem] text-teal">
              {formatPercent(genome.completeness / 100)}
            </p>
          </div>
          <span className="mb-1 rounded-full border border-border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted">
            {genome.viralGenes} viral genes
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-teal"
            style={{ width: `${Math.min(100, genome.completeness)}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/60">
          {[
            { label: 'Size', value: formatBp(genome.length) },
            { label: 'Contamination', value: `${genome.contamination.toFixed(1)}%` },
            { label: 'Viral genes', value: formatNumber(genome.viralGenes) },
            { label: 'Host genes', value: formatNumber(genome.hostGenes) },
          ].map((item) => (
            <div key={item.label} className="bg-surface-solid px-3 py-3">
              <dt className="label-mono text-[0.56rem]">{item.label}</dt>
              <dd className="mono-num mt-1 text-sm font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 flex items-start gap-2 text-[0.7rem] leading-relaxed text-muted">
          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" />
          Quality thresholds follow the ASGSR analysis. A high completeness score with elevated
          contamination should be interpreted with care.
        </p>
      </div>
    </div>
  );
}
