import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { Sample } from '@/lib/types';
import { useMeasure } from '@/lib/hooks';
import { flightLabel, formatNumber } from '@/lib/format';

interface Pair {
  pair: string;
  flight: string;
  replicate: string;
  untreated: Sample;
  pma: Sample;
}

export function PmaSlope({ samples }: { samples: Sample[] }) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const pairs = useMemo<Pair[]>(() => {
    const untreated = samples.filter((sample) => !sample.pma);
    return untreated
      .map((sample) => {
        const pma = samples.find((candidate) => candidate.pma && candidate.pair === sample.pair);
        if (!pma) return null;
        return {
          pair: sample.pair,
          flight: sample.flight,
          replicate: sample.replicate,
          untreated: sample,
          pma,
        };
      })
      .filter((pair): pair is Pair => pair !== null)
      .sort((a, b) => a.flight.localeCompare(b.flight) || a.replicate.localeCompare(b.replicate));
  }, [samples]);

  const height = 330;
  const margin = { top: 16, right: 24, bottom: 38, left: 46 };
  const innerWidth = Math.max(180, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;

  const yMax = 520;
  const y = scaleLinear().domain([0, yMax]).range([innerHeight, 0]);
  const xPad = 24;
  const x = (index: 0 | 1) => (index === 0 ? xPad : innerWidth - xPad);

  const activePair = pairs.find((pair) => pair.pair === active);
  const maxValue = Math.max(...pairs.map((pair) => pair.untreated.richness ?? 0));

  return (
    <div
      className="relative"
      ref={ref}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setCursor({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
      }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Paired richness of virus types per sample before and after PMA treatment."
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {[0, 100, 200, 300, 400, 500].map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line x1={0} x2={innerWidth} stroke="var(--grid)" strokeWidth={1} />
                <text
                  x={-10}
                  y={0}
                  dy="0.32em"
                  textAnchor="end"
                  fill="var(--muted)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
              </g>
            ))}

            {pairs.map((pair) => {
              const untreatedValue = pair.untreated.richness ?? 0;
              const pmaValue = pair.pma.richness ?? 0;
              const isActive = active === pair.pair;
              const noDetection = pair.pma.richness === null;
              return (
                <g
                  key={pair.pair}
                  onMouseEnter={() => setActive(pair.pair)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(pair.pair)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${flightLabel(pair.flight)}, replicate ${pair.replicate}: ${formatNumber(pair.untreated.richness)} untreated, ${noDetection ? 'no detection' : formatNumber(pair.pma.richness)} after PMA`}
                  className="cursor-default outline-none"
                >
                  <line
                    x1={x(0)}
                    x2={x(1)}
                    y1={y(untreatedValue)}
                    y2={y(pmaValue)}
                    stroke={isActive ? 'var(--fg)' : 'var(--border-strong)'}
                    strokeWidth={isActive ? 1.6 : 1}
                    strokeDasharray={noDetection ? '4 4' : undefined}
                    opacity={isActive ? 0.9 : 0.55}
                  />
                  <circle
                    cx={x(0)}
                    cy={y(untreatedValue)}
                    r={isActive ? 5 : 3.5}
                    fill="var(--orange)"
                    stroke="var(--bg-elev)"
                    strokeWidth={1.2}
                  />
                  {noDetection ? (
                    <circle
                      cx={x(1)}
                      cy={y(pmaValue)}
                      r={isActive ? 4.5 : 3.2}
                      fill="var(--bg-elev)"
                      stroke="var(--blue)"
                      strokeWidth={1.6}
                    />
                  ) : (
                    <circle
                      cx={x(1)}
                      cy={y(pmaValue)}
                      r={isActive ? 5 : 3.5}
                      fill="var(--blue)"
                      stroke="var(--bg-elev)"
                      strokeWidth={1.2}
                    />
                  )}
                  <line x1={x(0)} x2={x(1)} y1={y(untreatedValue)} y2={y(pmaValue)} stroke="transparent" strokeWidth={14} />
                </g>
              );
            })}

            <line x1={x(0)} x2={x(0)} y1={0} y2={innerHeight} stroke="var(--border)" strokeWidth={1} />
            <line x1={x(1)} x2={x(1)} y1={0} y2={innerHeight} stroke="var(--border)" strokeWidth={1} />

            <text x={x(0)} y={innerHeight + 26} textAnchor="middle" fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)">
              Untreated
            </text>
            <text x={x(1)} y={innerHeight + 26} textAnchor="middle" fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)">
              PMA
            </text>
            <text
              transform={`translate(-33, ${innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Virus types
            </text>
          </g>
        </svg>
      )}

      {activePair && (
        <div
          className="pointer-events-none absolute z-20 min-w-44 rounded-lg border border-border bg-bg-elev p-3 text-xs shadow-xl"
          style={{
            left: Math.min(Math.max(cursor.x, 100), Math.max(width - 100, 100)),
            top: Math.max(cursor.y - 12, 8),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
            {flightLabel(activePair.flight)} · {activePair.replicate}
          </p>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <span className="text-muted">Untreated</span>
            <span className="mono-num text-right">{formatNumber(activePair.untreated.richness)}</span>
            <span className="text-muted">PMA</span>
            <span className="mono-num text-right">
              {activePair.pma.richness === null ? 'No detection' : formatNumber(activePair.pma.richness)}
            </span>
          </div>
        </div>
      )}

      <p className="mt-1 text-xs text-muted">
        {pairs.length} paired swabs. Dashed lines end at zero when no virus was detected after PMA.
        Highest untreated sample: {formatNumber(maxValue)} virus types.
      </p>
    </div>
  );
}
