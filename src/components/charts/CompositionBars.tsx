import { useMemo } from 'react';
import type { CompositionEntry } from '@/lib/types';
import { formatCompact, formatShare } from '@/lib/format';

const GROUPS = [
  { key: 'Caudoviricetes' as const, label: 'Bacterial viruses', color: 'var(--teal)' },
  { key: 'Megaviricetes' as const, label: 'Giant viruses', color: 'var(--blue)' },
  { key: 'Other' as const, label: 'Other', color: 'var(--purple)' },
];

export function CompositionBars({ composition }: { composition: CompositionEntry[] }) {
  const rows = useMemo(() => {
    return [false, true].map((pma) => {
      const entries = composition.filter((entry) => entry.pma === pma);
      const totals = GROUPS.map((group) => ({
        ...group,
        value: entries.reduce((sum, entry) => sum + entry[group.key], 0),
      }));
      const total = totals.reduce((sum, group) => sum + group.value, 0);
      return { pma, totals, total };
    });
  }, [composition]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        {GROUPS.map((group) => (
          <span key={group.key} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: group.color }} aria-hidden />
            {group.label}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {rows.map((row) => (
          <div key={String(row.pma)}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
                {row.pma ? 'After PMA' : 'Untreated'}
              </span>
              <span className="mono-num text-[0.68rem] text-muted">
                {formatCompact(row.total)} total TPM
              </span>
            </div>
            <div
              className="flex h-7 overflow-hidden rounded-md border border-border/60"
              role="img"
              aria-label={`${row.pma ? 'After PMA' : 'Untreated'}: ${row.totals
                .map((group) => `${group.label} ${formatShare(group.value, row.total, 0)}`)
                .join(', ')}`}
            >
              {row.totals.map((group) => {
                const share = row.total ? (group.value / row.total) * 100 : 0;
                if (share < 0.5) return null;
                return (
                  <div
                    key={group.key}
                    className="flex items-center justify-center overflow-hidden text-[0.62rem] font-semibold"
                    style={{
                      width: `${share}%`,
                      background: group.color,
                      color: group.key === 'Megaviricetes' ? '#fff' : 'var(--accent-fg)',
                    }}
                    title={`${group.label}: ${share.toFixed(1)}%`}
                  >
                    {share >= 9 ? `${Math.round(share)}%` : ''}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-muted">
              {row.totals.map((group) => (
                <span key={group.key} className="mono-num">
                  {group.label}: {formatShare(group.value, row.total, 0)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
