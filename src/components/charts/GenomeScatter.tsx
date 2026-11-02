import { useMemo, useState } from 'react';
import { scaleLinear, scaleLog } from 'd3-scale';
import type { Genome } from '@/lib/types';
import { useMeasure } from '@/lib/hooks';
import { compareFlights, formatBp, formatNumber } from '@/lib/format';

const FLIGHT_COLOR: Record<string, string> = {
  F9: 'var(--teal)',
  F10: 'var(--blue)',
  F11: 'var(--purple)',
};

export function GenomeScatter({
  genomes,
  selected,
  onSelect,
}: {
  genomes: Genome[];
  selected?: string | null;
  onSelect?: (genome: Genome) => void;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<Genome | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const height = 320;
  const margin = { top: 18, right: 18, bottom: 42, left: 48 };
  const innerWidth = Math.max(180, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;

  const x = scaleLinear().domain([84, 101]).range([0, innerWidth]);
  const y = scaleLog().domain([5, 150]).range([innerHeight, 0]);
  const flights = useMemo(
    () => Array.from(new Set(genomes.map((genome) => genome.flight))).sort(compareFlights),
    [genomes],
  );

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
          aria-label="Genome completeness versus genome size for high-quality viral genomes, coloured by flight."
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {[10, 20, 50, 100].map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line x1={0} x2={innerWidth} stroke="var(--grid)" />
                <text
                  x={-10}
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
            {[85, 90, 95, 100].map((tick) => (
              <g key={tick} transform={`translate(${x(tick)},0)`}>
                <line y1={0} y2={innerHeight} stroke="var(--grid)" />
                <text
                  y={innerHeight + 18}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                >
                  {tick}%
                </text>
              </g>
            ))}
            <line
              x1={x(90)}
              x2={x(90)}
              y1={0}
              y2={innerHeight}
              stroke="var(--border-strong)"
              strokeDasharray="4 4"
            />
            <text x={x(90) + 5} y={12} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)">
              90% complete
            </text>

            {genomes.map((genome) => {
              const isActive = active?.contig === genome.contig || selected === genome.contig;
              return (
                <g
                  key={`${genome.contig}-${genome.sample}`}
                  transform={`translate(${x(genome.completeness)},${y(genome.length / 1000)})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${genome.contig}, ${genome.completeness}% complete, ${formatBp(genome.length)}, flight ${genome.flight}`}
                  onMouseEnter={() => setActive(genome)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(genome)}
                  onBlur={() => setActive(null)}
                  onClick={() => onSelect?.(genome)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect?.(genome);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <circle r={14} fill="transparent" />
                  <circle
                    r={isActive ? 6.5 : 5}
                    fill={FLIGHT_COLOR[genome.flight] ?? 'var(--fg)'}
                    stroke="var(--bg-elev)"
                    strokeWidth={1.4}
                    opacity={isActive ? 1 : 0.88}
                  />
                  {genome.completeness < 90 && (
                    <text
                      x={8}
                      y={-7}
                      fill="var(--muted)"
                      fontSize={8.5}
                      fontFamily="var(--font-mono)"
                    >
                      {genome.completeness.toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}

            <text
              transform={`translate(-38, ${innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Genome size (kb)
            </text>
            <text
              x={innerWidth}
              y={innerHeight + 36}
              textAnchor="end"
              fill="var(--muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Completeness
            </text>
          </g>
        </svg>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
        {flights.map((flight) => (
          <span key={flight} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: FLIGHT_COLOR[flight] }} aria-hidden />
            Flight {flight.replace('F', '')}
          </span>
        ))}
        <span className="text-[0.7rem]">Click a genome for details</span>
      </div>

      {active && (
        <div
          className="pointer-events-none absolute z-20 min-w-48 rounded-lg border border-border bg-bg-elev p-3 text-xs shadow-xl"
          style={{
            left: Math.min(Math.max(cursor.x, 110), Math.max(width - 110, 110)),
            top: Math.max(cursor.y - 12, 8),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-medium">{active.contig}</p>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-muted">
            <span>Completeness</span>
            <span className="mono-num text-right text-fg">{active.completeness.toFixed(1)}%</span>
            <span>Size</span>
            <span className="mono-num text-right text-fg">{formatBp(active.length)}</span>
            <span>Sample</span>
            <span className="mono-num text-right text-fg">{active.sample}</span>
            <span>Genes</span>
            <span className="mono-num text-right text-fg">{formatNumber(active.viralGenes)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
