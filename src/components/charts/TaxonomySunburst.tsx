import { useEffect, useMemo, useState } from 'react';
import { arc } from 'd3-shape';
import { hierarchy, partition, type HierarchyRectangularNode } from 'd3-hierarchy';
import { ChevronLeft } from 'lucide-react';
import type { Sample, SpeciesData } from '@/lib/types';
import { useMeasure } from '@/lib/hooks';
import { formatTpm } from '@/lib/format';
import { cn } from '@/lib/cn';

type Kind = 'root' | 'class' | 'family' | 'species';

interface Datum {
  name: string;
  kind: Kind;
  color?: string;
  total?: number;
  prevalence?: number;
  children?: Datum[];
}

const CLASSES = [
  { id: 'phage', name: 'Bacterial viruses', match: 'Caudoviricetes', color: 'var(--teal)' },
  { id: 'giant', name: 'Giant viruses', match: 'Megaviricetes', color: 'var(--blue)' },
  { id: 'other', name: 'Other viruses', match: null, color: 'var(--purple)' },
];

export function TaxonomySunburst({
  data,
  samples,
  pma,
}: {
  data: SpeciesData;
  samples: Sample[];
  pma: boolean;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [focusPath, setFocusPath] = useState<string[]>([]);
  const [hovered, setHovered] = useState<HierarchyRectangularNode<Datum> | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setFocusPath([]);
  }, [pma]);

  const fullRoot = useMemo(() => {
    const sampleById = new Map(samples.map((sample) => [sample.id, sample]));
    const active = new Set(
      data.samples
        .map((id, index) => (sampleById.get(id)?.pma === pma ? index : -1))
        .filter((index) => index >= 0),
    );

    const classMap = new Map<string, Datum>();
    for (const config of CLASSES) {
      classMap.set(config.id, {
        name: config.name,
        kind: 'class',
        color: config.color,
        children: [],
      });
    }

    for (const entry of data.species) {
      if (entry.group === 'nonviral') continue;
      let total = 0;
      let prevalence = 0;
      for (const [index, value] of entry.values) {
        if (active.has(index)) {
          total += value;
          prevalence += 1;
        }
      }
      if (total <= 0) continue;

      const classId =
        entry.class === 'Caudoviricetes'
          ? 'phage'
          : entry.class === 'Megaviricetes'
            ? 'giant'
            : 'other';
      const parent = classMap.get(classId);
      if (!parent) continue;
      const familyName =
        entry.family ??
        entry.genus ??
        `${entry.class ?? 'Unassigned'} (unassigned)`;
      let family = parent.children?.find((child) => child.name === familyName);
      if (!family) {
        family = {
          name: familyName,
          kind: 'family',
          color: parent.color,
          children: [],
        };
        parent.children?.push(family);
      }
      family.children?.push({
        name: entry.name,
        kind: 'species',
        color: parent.color,
        total,
        prevalence,
      });
    }

    // Drop classes with no data.
    for (const [id, klass] of classMap) {
      if (!klass.children || klass.children.length === 0) classMap.delete(id);
    }
    const classes = Array.from(classMap.values());
    const root: Datum = { name: 'All viruses', kind: 'root', children: classes };
    return hierarchy(root)
      .sum((node) => node.total ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [data, samples, pma]);

  const focusRoot = useMemo(() => {
    let node = fullRoot;
    for (const name of focusPath) {
      const next = node.children?.find((child) => child.data.name === name);
      if (!next) break;
      node = next;
    }
    return node;
  }, [fullRoot, focusPath]);

  const radius = Math.max(110, Math.min(width || 360, 440) / 2 - 12);
  const height = radius * 2 + 24;

  const laidOut = useMemo(() => {
    const copy = focusRoot.copy();
    return partition<Datum>()
      .size([2 * Math.PI, radius])
      .padding(0.002)(copy);
  }, [focusRoot, radius]);

  const arcs = useMemo(() => {
    const generator = arc<HierarchyRectangularNode<Datum>>()
      .startAngle((node) => node.x0)
      .endAngle((node) => node.x1)
      .innerRadius((node) => node.y0)
      .outerRadius((node) => node.y1)
      .padAngle((node) => Math.min((node.x1 - node.x0) / 2, 0.004))
      .padRadius(radius / 2);
    return laidOut
      .descendants()
      .filter((node) => node.depth > 0)
      .map((node) => ({
        node,
        path: generator(node),
        centroid: generator.centroid(node),
      }))
      .filter((entry) => entry.path);
  }, [laidOut, radius]);

  const focusTotal = focusRoot.value ?? 0;
  const breadcrumb = ['All viruses', ...focusPath];

  const drill = (node: HierarchyRectangularNode<Datum>) => {
    if (!node.children?.length) return;
    const names = node
      .ancestors()
      .reverse()
      .slice(1)
      .map((ancestor) => ancestor.data.name);
    setFocusPath([...focusPath, ...names]);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFocusPath((path) => path.slice(0, -1))}
          disabled={focusPath.length === 0}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs transition-colors',
            focusPath.length === 0
              ? 'cursor-not-allowed opacity-40'
              : 'text-muted hover:border-border-strong hover:text-fg',
          )}
          aria-label="Zoom out one level"
        >
          <ChevronLeft className="size-3.5" /> Back
        </button>
        <div className="flex flex-wrap items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
          {breadcrumb.map((name, index) => (
            <span key={`${name}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 && <span className="text-border-strong">/</span>}
              <button
                type="button"
                onClick={() => setFocusPath(focusPath.slice(0, index))}
                className={cn(
                  'rounded px-1 py-0.5 transition-colors hover:text-fg',
                  index === breadcrumb.length - 1 && 'text-fg',
                )}
                disabled={index === breadcrumb.length - 1}
              >
                {name}
              </button>
            </span>
          ))}
        </div>
      </div>

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
            aria-label={`Sunburst of viral taxonomy weighted by abundance for ${pma ? 'PMA-treated' : 'untreated'} samples.`}
            className="mx-auto block"
          >
            <g transform={`translate(${width / 2},${height / 2})`}>
              {arcs.map(({ node, path, centroid }) => {
                const isHovered = hovered?.data === node.data;
                const interactive = Boolean(node.children?.length);
                const className = node.data.kind;
                return (
                  <path
                    key={`${node.data.name}-${node.x0}-${node.x1}-${node.y0}`}
                    d={path ?? undefined}
                    fill={node.data.color ?? 'var(--muted)'}
                    fillOpacity={
                      className === 'class' ? 0.95 : className === 'family' ? 0.72 : 0.52
                    }
                    stroke={isHovered ? 'var(--fg)' : 'var(--bg-elev)'}
                    strokeWidth={isHovered ? 1.5 : 0.6}
                    className={interactive ? 'cursor-pointer' : 'cursor-default'}
                    tabIndex={interactive ? 0 : undefined}
                    role={interactive ? 'button' : undefined}
                    aria-label={
                      interactive
                        ? `${node.data.name}, ${formatTpm(node.value ?? 0)} TPM. Activate to zoom in.`
                        : `${node.data.name}, ${formatTpm(node.value ?? 0)} TPM.`
                    }
                    onMouseEnter={() => setHovered(node)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => {
                      setHovered(node);
                      setCursor({
                        x: width / 2 + centroid[0],
                        y: height / 2 + centroid[1],
                      });
                    }}
                    onBlur={() => setHovered(null)}
                    onClick={() => drill(node)}
                    onKeyDown={(event) => {
                      if (interactive && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        drill(node);
                      }
                    }}
                  >
                    <title>
                      {node.data.name}
                      {node.value ? ` · ${formatTpm(node.value)} TPM` : ''}
                    </title>
                  </path>
                );
              })}

              {laidOut
                .descendants()
                .filter(
                  (node) =>
                    node.depth === 1 &&
                    node.x1 - node.x0 > 0.22 &&
                    node.data.name !== 'Unclassified',
                )
                .map((node) => {
                  const generator = arc<HierarchyRectangularNode<Datum>>()
                    .startAngle((item) => item.x0)
                    .endAngle((item) => item.x1)
                    .innerRadius((item) => item.y0)
                    .outerRadius((item) => item.y1);
                  const [cx, cy] = generator.centroid(node);
                  const angle = (node.x0 + node.x1) / 2;
                  const rotate = (angle * 180) / Math.PI - 90;
                  return (
                    <text
                      key={`label-${node.data.name}`}
                      x={cx}
                      y={cy}
                      transform={`rotate(${rotate}, ${cx}, ${cy})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="var(--accent-fg)"
                      fontSize={radius < 170 ? 8 : 9.5}
                      fontFamily="var(--font-mono)"
                      pointerEvents="none"
                    >
                      {node.data.name.replace(' viruses', '')}
                    </text>
                  );
                })}
            </g>
          </svg>
        )}

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-[42%] -translate-x-1/2 -translate-y-1/2 text-center"
          aria-hidden
        >
          <p className="text-[0.62rem] font-medium uppercase leading-tight tracking-[0.08em] text-muted">
            {focusPath.at(-1) ?? 'Total abundance'}
          </p>
          <p className="mono-num mt-1 text-lg font-semibold leading-none">
            {formatTpm(focusTotal)}
          </p>
          <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted">TPM</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          {CLASSES.map((config) => (
            <span key={config.id} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: config.color }} aria-hidden />
              {config.name}
            </span>
          ))}
          <span className="text-[0.68rem]">Click a ring to zoom · hover for details</span>
        </div>

        {hovered && (
          <div
            className="pointer-events-none absolute z-20 min-w-48 rounded-lg border border-border bg-bg-elev p-3 text-xs shadow-xl"
            style={{
              left: Math.min(Math.max(cursor.x, 120), Math.max(width - 120, 120)),
              top: Math.max(cursor.y - 12, 8),
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-medium">{hovered.data.name}</p>
            <div className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-muted">
              <span>Abundance</span>
              <span className="mono-num text-right text-fg">
                {formatTpm(hovered.value ?? 0)} TPM
              </span>
              <span>Share</span>
              <span className="mono-num text-right text-fg">
                {focusTotal ? (((hovered.value ?? 0) / focusTotal) * 100).toFixed(1) : '0'}%
              </span>
              {hovered.data.kind === 'species' && (
                <>
                  <span>Samples</span>
                  <span className="mono-num text-right text-fg">{hovered.data.prevalence}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
