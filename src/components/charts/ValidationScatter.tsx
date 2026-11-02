import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { ValidationPoint } from '@/lib/types';
import { useMeasure } from '@/lib/hooks';

const MOCK_COLOR: Record<string, string> = {
  DNA: 'var(--teal)',
  RNA: 'var(--orange)',
};

export function ValidationScatter({ points }: { points: ValidationPoint[] }) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [active, setActive] = useState<ValidationPoint | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const height = 340;
  const margin = { top: 18, right: 22, bottom: 44, left: 50 };
  const innerWidth = Math.max(180, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;

  const x = scaleLinear().domain([0, 1]).range([0, innerWidth]);
  const y = scaleLinear().domain([0, 1]).range([innerHeight, 0]);

  const counts = useMemo(() => {
    return points.reduce<Record<string, number>>((accumulator, point) => {
      accumulator[point.mock] = (accumulator[point.mock] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [points]);

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
          aria-label="Known versus measured relative abundance for Virall across 48 simulated communities."
          className="overflow-visible"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <g key={tick}>
                <line x1={0} x2={innerWidth} y1={y(tick)} y2={y(tick)} stroke="var(--grid)" />
                <line x1={x(tick)} x2={x(tick)} y1={0} y2={innerHeight} stroke="var(--grid)" />
                <text
                  x={-10}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  fill="var(--muted)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
                <text
                  x={x(tick)}
                  y={innerHeight + 18}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                >
                  {tick}
                </text>
              </g>
            ))}
            <line
              x1={x(0)}
              y1={y(0)}
              x2={x(1)}
              y2={y(1)}
              stroke="var(--border-strong)"
              strokeDasharray="5 5"
            />
            <text x={x(0.62)} y={y(0.62) - 8} fill="var(--muted)" fontSize={9} fontFamily="var(--font-mono)">
              perfect agreement
            </text>

            {points.map((point, index) => {
              const isActive =
                active?.condition === point.condition && active?.true === point.true;
              return (
                <g
                  key={`${point.condition}-${point.true}-${index}`}
                  transform={`translate(${x(point.true)},${y(point.measured)})`}
                  onMouseEnter={() => setActive(point)}
                  onMouseLeave={() => setActive(null)}
                  className="cursor-crosshair"
                >
                  <circle r={9} fill="transparent" />
                  <circle
                    r={isActive ? 4.5 : 3}
                    fill={MOCK_COLOR[point.mock] ?? 'var(--fg)'}
                    fillOpacity={isActive ? 1 : 0.62}
                    stroke={isActive ? 'var(--fg)' : 'none'}
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            <text
              transform={`translate(-37, ${innerHeight / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Measured abundance
            </text>
            <text
              x={innerWidth}
              y={innerHeight + 38}
              textAnchor="end"
              fill="var(--muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              Known abundance
            </text>
          </g>
        </svg>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
        {Object.entries(counts).map(([mock, count]) => (
          <span key={mock} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: MOCK_COLOR[mock] }} aria-hidden />
            {mock} viruses ({count} points)
          </span>
        ))}
      </div>

      {active && (
        <div
          className="pointer-events-none absolute z-20 min-w-52 rounded-lg border border-border bg-bg-elev p-3 text-xs shadow-xl"
          style={{
            left: Math.min(Math.max(cursor.x, 120), Math.max(width - 120, 120)),
            top: Math.max(cursor.y - 12, 8),
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
            {active.condition}
          </p>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-muted">
            <span>Known</span>
            <span className="mono-num text-right text-fg">{active.true.toFixed(4)}</span>
            <span>Measured</span>
            <span className="mono-num text-right text-fg">{active.measured.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
