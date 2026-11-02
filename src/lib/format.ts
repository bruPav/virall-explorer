export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatShare(value: number, total: number, digits = 0): string {
  if (!total) return '—';
  return `${((value / total) * 100).toFixed(digits)}%`;
}

export function formatTpm(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1000) return formatCompact(value);
  if (value >= 10) return value.toFixed(0);
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

export function formatBp(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} Mb`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} kb`;
  return `${value} bp`;
}

export function flightLabel(flight: string): string {
  return `Flight ${flight.replace('F', '')}`;
}

export function sampleLabel(sample: { flight: string; replicate: string; pma: boolean }): string {
  return `${sample.flight} · ${sample.replicate} · ${sample.pma ? 'PMA' : 'Untreated'}`;
}

export function compareFlights(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true });
}
