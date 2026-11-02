import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Download, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useScrollToOnChange } from '@/lib/hooks';
import { downloadCsv } from '@/lib/csv';
import { formatTpm } from '@/lib/format';
import type { Sample, SpeciesData, SpeciesEntry } from '@/lib/types';

const PAGE_SIZE = 50;

const GROUPS = [
  { id: 'viral', label: 'All viruses' },
  { id: 'phage', label: 'Bacterial viruses' },
  { id: 'giant', label: 'Giant viruses' },
  { id: 'other', label: 'Other viruses' },
  { id: 'nonviral', label: 'Non-viral' },
];

const SORTS = [
  { id: 'prevalence', label: 'Most prevalent' },
  { id: 'abundance', label: 'Most abundant' },
  { id: 'name', label: 'Name A–Z' },
];

export function SpeciesPanel({ species, samples }: { species: SpeciesData; samples: Sample[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedName = searchParams.get('species');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('viral');
  const [sort, setSort] = useState('prevalence');
  const [page, setPage] = useState(0);

  const selected = species.species.find((entry) => entry.name === selectedName) ?? null;
  const detailRef = useRef<HTMLDivElement>(null);
  useScrollToOnChange(selectedName, detailRef);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = species.species.filter((entry) => {
      if (group === 'viral' && entry.group === 'nonviral') return false;
      if (group !== 'viral' && entry.group !== group) return false;
      if (!needle) return true;
      return (
        entry.name.toLowerCase().includes(needle) ||
        (entry.family ?? '').toLowerCase().includes(needle) ||
        (entry.genus ?? '').toLowerCase().includes(needle) ||
        (entry.class ?? '').toLowerCase().includes(needle)
      );
    });
    return rows.sort((a, b) => {
      if (sort === 'abundance') return b.total - a.total;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return b.prevalence - a.prevalence || b.total - a.total;
    });
  }, [species, group, query, sort]);

  useEffect(() => {
    setPage(0);
  }, [group, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const select = (entry: SpeciesEntry | null) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'species');
    if (entry) params.set('species', entry.name);
    else params.delete('species');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <div className="panel-flat overflow-hidden">
        <div className="border-b border-border/70 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search species, family, or class</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${species.species.length} species, families, genera…`}
                  className="w-full rounded-lg border border-border bg-bg-elev/60 py-2 pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-fg"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="rounded-lg border border-border bg-bg-elev/60 px-2.5 py-2 text-xs outline-none focus:border-accent"
                  aria-label="Sort species"
                >
                  {SORTS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'virall-species.csv',
                      filtered.map((entry) => ({
                        name: entry.name,
                        group: entry.group,
                        kingdom: entry.kingdom ?? '',
                        class: entry.class ?? '',
                        family: entry.family ?? '',
                        genus: entry.genus ?? '',
                        samples_detected: entry.prevalence,
                        total_tpm: entry.total,
                      })),
                    )
                  }
                  className="inline-flex h-[2.15rem] items-center gap-1 rounded-lg border border-border px-2 text-[0.62rem] text-muted transition-colors hover:border-border-strong hover:text-fg"
                  aria-label="Download filtered species table as CSV"
                >
                  <Download className="size-3" /> CSV
                </button>
              </div>
            </div>

            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {GROUPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGroup(item.id)}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-fg',
                    group === item.id && 'bg-accent/14 text-fg',
                  )}
                  aria-pressed={group === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {group === 'viral' && (
              <p className="text-[0.65rem] leading-snug text-muted">
                Showing 813 viral assignments. Six bacterial or archaeal taxa detected within viral
                contigs are available under “Non-viral”.
              </p>
            )}
          </div>
        </div>

        <div className="hidden grid-cols-[1.7fr_0.7fr_0.8fr_0.5fr_0.6fr] gap-3 border-b border-border/70 px-4 py-2 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-muted sm:grid">
          <span>Species</span>
          <span>Group</span>
          <span>Family / genus</span>
          <span className="text-right">Samples</span>
          <span className="text-right">Total TPM</span>
        </div>

        <ul className="max-h-[38rem] divide-y divide-border/60 overflow-y-auto scroll-thin">
          {visible.map((entry) => {
            const isSelected = entry.name === selectedName;
            return (
              <li key={entry.name}>
                <button
                  type="button"
                  onClick={() => select(entry)}
                  className={cn(
                    'grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-2.5 text-left transition-colors hover:bg-accent/7 sm:grid-cols-[1.7fr_0.7fr_0.8fr_0.5fr_0.6fr] sm:items-center',
                    isSelected && 'bg-accent/12',
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8rem]" title={entry.name}>
                      {entry.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-muted sm:hidden">
                      {entry.family ?? entry.genus ?? entry.class ?? 'Unclassified'}
                    </span>
                  </span>
                  <span className="hidden text-[0.68rem] text-muted sm:block">
                    {entry.group === 'phage'
                      ? 'Phage'
                      : entry.group === 'giant'
                        ? 'Giant'
                        : entry.group === 'nonviral'
                          ? 'Non-viral'
                          : 'Other'}
                  </span>
                  <span className="hidden truncate text-[0.68rem] text-muted sm:block" title={entry.family ?? entry.genus ?? ''}>
                    {entry.family ?? entry.genus ?? '—'}
                  </span>
                  <span className="mono-num text-right text-[0.68rem] text-muted">
                    {entry.prevalence}/24
                  </span>
                  <span className="mono-num text-right text-[0.68rem] text-muted">
                    {formatTpm(entry.total)}
                  </span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-4 py-12 text-center text-sm text-muted">
              No taxa match “{query}”.
            </li>
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5 text-xs text-muted">
          <span className="mono-num">
            {filtered.length === 0
              ? '0 results'
              : `${current * PAGE_SIZE + 1}–${Math.min((current + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md border border-border p-1.5 disabled:opacity-40"
              disabled={current === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              aria-label="Previous page"
            >
              <ArrowLeft className="size-3.5" />
            </button>
            <span className="mono-num px-2 text-[0.65rem]">
              {current + 1} / {pages}
            </span>
            <button
              type="button"
              className="rounded-md border border-border p-1.5 disabled:opacity-40"
              disabled={current >= pages - 1}
              onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
              aria-label="Next page"
            >
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="order-first lg:order-none lg:sticky lg:top-20" ref={detailRef}>
        {selected ? (
          <SpeciesDetail
            entry={selected}
            samples={samples}
            sampleOrder={species.samples}
            onClose={() => select(null)}
          />
        ) : (
          <div className="panel-flat p-5">
            <p className="label-mono">Species detail</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Select a taxon to see its taxonomy, prevalence, and abundance across samples.
              The default view shows the 813 viral assignments; six bacterial or archaeal taxa in
              the matrix can be inspected separately.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted">Taxa</dt>
                <dd className="mono-num text-lg font-semibold">{species.species.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phages</dt>
                <dd className="mono-num text-lg font-semibold">
                  {species.species.filter((entry) => entry.group === 'phage').length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Giant viruses</dt>
                <dd className="mono-num text-lg font-semibold">
                  {species.species.filter((entry) => entry.group === 'giant').length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Other viruses</dt>
                <dd className="mono-num text-lg font-semibold">
                  {species.species.filter((entry) => entry.group === 'other').length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Non-viral</dt>
                <dd className="mono-num text-lg font-semibold">
                  {species.species.filter((entry) => entry.group === 'nonviral').length}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function SpeciesDetail({
  entry,
  samples,
  sampleOrder,
  onClose,
}: {
  entry: SpeciesEntry;
  samples: Sample[];
  sampleOrder: string[];
  onClose: () => void;
}) {
  const byId = new Map(samples.map((sample) => [sample.id, sample]));
  const rows = entry.values
    .map(([index, value]) => {
      const sample = byId.get(sampleOrder[index]);
      return sample ? { sample, value } : null;
    })
    .filter((row): row is { sample: Sample; value: number } => row !== null)
    .sort((a, b) => b.value - a.value);
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="panel-flat overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="label-mono">
            {entry.group === 'phage'
              ? 'Bacterial virus'
              : entry.group === 'giant'
                ? 'Giant virus'
                : entry.group === 'nonviral'
                  ? 'Non-viral taxon'
                  : 'Other virus'}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug">{entry.name}</h2>
          <p className="mt-1 text-xs text-muted">
            {[entry.kingdom, entry.class, entry.family ?? entry.genus].filter(Boolean).join(' · ') ||
              'Unclassified'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-accent/10 hover:text-fg"
          aria-label="Close species detail"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border/60">
        <div className="bg-surface-solid px-3 py-3">
          <p className="label-mono text-[0.56rem]">Samples</p>
          <p className="mono-num mt-1 text-lg font-semibold">{entry.prevalence}/24</p>
        </div>
        <div className="bg-surface-solid px-3 py-3">
          <p className="label-mono text-[0.56rem]">Total TPM</p>
          <p className="mono-num mt-1 text-lg font-semibold">{formatTpm(entry.total)}</p>
        </div>
        <div className="bg-surface-solid px-3 py-3">
          <p className="label-mono text-[0.56rem]">Flights</p>
          <p className="mono-num mt-1 text-lg font-semibold">
            {new Set(rows.map((row) => row.sample.flight)).size}/3
          </p>
        </div>
      </div>

      <div className="max-h-[23rem] overflow-y-auto p-4 scroll-thin sm:p-5">
        <p className="label-mono mb-3">Abundance by sample</p>
        <ol className="space-y-2.5">
          {rows.map(({ sample, value }) => (
            <li key={sample.id}>
              <div className="flex items-baseline justify-between gap-3 text-[0.7rem]">
                <span className="flex items-center gap-1.5">
                  <span className="mono-num text-muted">{sample.flight}</span>
                  <span>{sample.replicate}</span>
                  <span className={sample.pma ? 'text-blue' : 'text-orange'}>
                    {sample.pma ? 'PMA' : 'Untreated'}
                  </span>
                </span>
                <span className="mono-num text-muted">{formatTpm(value)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/50">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, (value / max) * 100)}%`,
                    background: sample.pma ? 'var(--blue)' : 'var(--orange)',
                    opacity: 0.75,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        {rows.length === 0 && (
          <p className="text-sm text-muted">This species was not detected in the 24-sample matrix.</p>
        )}
      </div>

      <div className="border-t border-border/70 px-4 py-3 text-[0.65rem] leading-relaxed text-muted">
        Prevalence counts samples with TPM &gt; 0 among the 24 samples with viral signal.
        {entry.family ? ` Family: ${entry.family}.` : entry.genus ? ` Genus: ${entry.genus}.` : ''}
      </div>
    </div>
  );
}
