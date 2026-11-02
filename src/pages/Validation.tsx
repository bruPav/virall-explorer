import { useMemo, useState } from 'react';
import { Download, Info } from 'lucide-react';
import { ValidationScatter } from '@/components/charts/ValidationScatter';
import { ChartFrame, LegendDot } from '@/components/ui/ChartFrame';
import { Callout } from '@/components/ui/Callout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stat } from '@/components/ui/Stat';
import { cn } from '@/lib/cn';
import { downloadCsv } from '@/lib/csv';
import { PLATFORM_LABELS, type ValidationData } from '@/lib/types';
import validationData from '@/data/validation.json';

const validation = validationData as ValidationData;

const PLATFORMS = ['all', ...validation.platforms] as const;

export default function Validation() {
  const [mock, setMock] = useState<'all' | 'DNA' | 'RNA'>('all');
  const [platform, setPlatform] = useState<string>('all');

  const summary = useMemo(
    () =>
      validation.summary.filter(
        (row) =>
          (mock === 'all' || row.mock === mock) &&
          (platform === 'all' || row.tech === platform),
      ),
    [mock, platform],
  );

  const points = useMemo(
    () =>
      validation.points.filter(
        (point) =>
          (mock === 'all' || point.mock === mock) &&
          (platform === 'all' || point.tech === platform) &&
          point.detected &&
          point.true > 0,
      ),
    [mock, platform],
  );

  const totals = useMemo(() => {
    const detected = summary.reduce((sum, row) => sum + row.detected, 0);
    const expected = summary.reduce((sum, row) => sum + row.expected, 0);
    const withR2 = summary.filter((row) => row.r2 !== null);
    const withMae = summary.filter((row) => row.mae !== null);
    return {
      recall: expected ? detected / expected : 0,
      detected,
      expected,
      r2: withR2.length ? withR2.reduce((sum, row) => sum + (row.r2 ?? 0), 0) / withR2.length : 0,
      mae: withMae.length ? withMae.reduce((sum, row) => sum + (row.mae ?? 0), 0) / withMae.length : 0,
      conditions: summary.length,
    };
  }, [summary]);

  const dna = validation.summary.filter((row) => row.mock === 'DNA');
  const rna = validation.summary.filter((row) => row.mock === 'RNA');
  const meanR2 = (rows: typeof summary) => {
    const values = rows.filter((row) => row.r2 !== null).map((row) => row.r2 as number);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="label-mono">Benchmark</p>
        <h1 className="display mt-2 text-balance text-[2.1rem] sm:text-[2.7rem]">
          Known in. Measured out.
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted sm:text-[0.95rem]">
          Forty-eight simulated viral communities across four sequencing platforms. Filter by
          mock type and platform to see detection recall and abundance agreement.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {(['all', 'DNA', 'RNA'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMock(option)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-fg',
                mock === option && 'bg-accent/14 text-fg',
              )}
              aria-pressed={mock === option}
            >
              {option === 'all' ? 'All viruses' : `${option} viruses`}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {PLATFORMS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPlatform(option)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent/10 hover:text-fg',
                platform === option && 'bg-accent/14 text-fg',
              )}
              aria-pressed={platform === option}
            >
              {option === 'all' ? 'All platforms' : PLATFORM_LABELS[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Detection recall"
          display={`${(totals.recall * 100).toFixed(0)}%`}
          note={`${totals.detected} of ${totals.expected} expected viruses detected`}
          accent="teal"
        />
        <Stat
          label="Mean R²"
          display={totals.r2.toFixed(2)}
          note="Known vs measured abundance"
          accent="blue"
        />
        <Stat
          label="Mean MAE"
          display={totals.mae.toFixed(3)}
          note="Lower is better"
          accent="orange"
        />
        <Stat
          label="Conditions"
          value={totals.conditions}
          note="6 sample types × 4 platforms × DNA/RNA"
          accent="purple"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ChartFrame
          title="Measured vs known relative abundance"
          subtitle={`${points.length} detected points · Virall only`}
          legend={
            <>
              <LegendDot color="var(--teal)" label="DNA viruses" />
              <LegendDot color="var(--orange)" label="RNA viruses" />
            </>
          }
        >
          <ValidationScatter points={points} />
        </ChartFrame>

        <div className="space-y-4">
          <div className="panel-flat p-5">
            <h2 className="text-sm font-semibold">DNA vs RNA</h2>
            <p className="mt-1 text-xs text-muted">Mean abundance agreement across all platforms</p>
            <div className="mt-4 space-y-4">
              {[
                { label: 'DNA viruses', value: meanR2(dna), color: 'var(--teal)' },
                { label: 'RNA viruses', value: meanR2(rna), color: 'var(--orange)' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted">{row.label}</span>
                    <span className="mono-num font-semibold">R² {row.value.toFixed(2)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border/50">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(1, row.value)) * 100}%`,
                        background: row.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Abundance estimates agree more closely for DNA viruses. RNA viruses show wider
              scatter, especially on long-read platforms.
            </p>
          </div>

          <Callout variant="caveat" title="Read the scatter honestly">
            R² is computed per condition and can be negative when abundance ranking is poor. The
            mean is shown for orientation, not as a single performance score.
          </Callout>
        </div>
      </div>

      <div className="mt-8">
        <SectionHeading
          eyebrow="All conditions"
          title="Condition-level results"
          description="Every simulated community, with detection recall and abundance error."
          action={
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  'virall-validation.csv',
                  summary.map((row) => ({
                    condition: row.condition,
                    mock: row.mock,
                    platform: row.tech,
                    sample_type: row.sample,
                    detection_recall: row.recall,
                    detected: row.detected,
                    expected: row.expected,
                    abundance_r2: row.r2 ?? '',
                    abundance_mae: row.mae ?? '',
                  })),
                )
              }
              className="btn btn-ghost text-xs"
            >
              <Download className="size-3.5" /> Export CSV
            </button>
          }
        />
        <div className="panel-flat mt-4 overflow-hidden">
          <div className="max-h-[30rem] overflow-auto scroll-thin">
            <table className="data-table min-w-[46rem]">
              <thead>
                <tr>
                  <th>Condition</th>
                  <th>Mock</th>
                  <th>Platform</th>
                  <th>Sample type</th>
                  <th className="text-right">Recall</th>
                  <th className="text-right">Detected</th>
                  <th className="text-right">R²</th>
                  <th className="text-right">MAE</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.condition}>
                    <td className="font-mono text-[0.7rem]">{row.condition}</td>
                    <td>{row.mock}</td>
                    <td>{PLATFORM_LABELS[row.tech] ?? row.tech}</td>
                    <td className="capitalize">{row.sample}</td>
                    <td className="mono-num text-right">{(row.recall * 100).toFixed(0)}%</td>
                    <td className="mono-num text-right">
                      {row.detected}/{row.expected}
                    </td>
                    <td className="mono-num text-right">{row.r2 === null ? '—' : row.r2.toFixed(2)}</td>
                    <td className="mono-num text-right">{row.mae === null ? '—' : row.mae.toFixed(3)}</td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted">
                      No conditions match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-muted">
          <Info className="size-3.5" /> Simulated communities include 5 RNA + 4 DNA viruses and
          four platforms; see the ASGSR deck for the full design.
        </p>
      </div>
    </div>
  );
}
