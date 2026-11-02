export interface Sample {
  run: string;
  id: string;
  name: string;
  flight: string;
  replicate: string;
  pma: boolean;
  pair: string;
  richness: number | null;
  shannon: number | null;
  spots: number;
  bases: number;
}

export interface SpeciesEntry {
  name: string;
  kingdom: string | null;
  class: string | null;
  family: string | null;
  genus: string | null;
  order: string | null;
  phylum: string | null;
  group: 'phage' | 'giant' | 'other' | 'nonviral';
  prevalence: number;
  total: number;
  values: [number, number][];
}

export interface SpeciesData {
  samples: string[];
  species: SpeciesEntry[];
}

export interface CompositionEntry {
  id: string;
  flight: string;
  pma: boolean;
  Caudoviricetes: number;
  Megaviricetes: number;
  Other: number;
  total: number;
}

export interface Genome {
  contig: string;
  sample: string;
  completeness: number;
  contamination: number;
  length: number;
  viralGenes: number;
  hostGenes: number;
  flight: string;
  pma: boolean;
}

export interface CoreStats {
  pmaSpecies: number;
  coreSpecies: number;
  byFlights: Record<'1' | '2' | '3', number>;
}

export interface Viability {
  untreatedMin: number;
  untreatedMax: number;
  pmaMin: number;
  pmaMax: number;
  pmaNoDetection: number;
  pairs: number;
}

export interface ValidationPoint {
  condition: string;
  mock: 'DNA' | 'RNA';
  tech: 'illumina' | 'iontorrent' | 'nanopore' | 'pacbio';
  sample: string;
  measured: number;
  true: number;
  detected: boolean;
}

export interface ValidationSummary {
  condition: string;
  mock: 'DNA' | 'RNA';
  tech: 'illumina' | 'iontorrent' | 'nanopore' | 'pacbio';
  sample: string;
  recall: number;
  detected: number;
  expected: number;
  r2: number | null;
  mae: number | null;
}

export interface ValidationData {
  points: ValidationPoint[];
  summary: ValidationSummary[];
  platforms: string[];
  mockTypes: Array<'DNA' | 'RNA'>;
  sampleTypes: string[];
}

export interface Meta {
  generatedAt: string;
  counts: {
    samples: number;
    flights: number;
    species: number;
    viralSpecies: number;
    nonViralTaxa: number;
    genomes: number;
    validationConditions: number;
    validationPoints: number;
  };
  sources: Array<{ file: string; sha256: string }>;
}

export const PLATFORM_LABELS: Record<string, string> = {
  illumina: 'Illumina',
  iontorrent: 'Ion Torrent',
  nanopore: 'Nanopore',
  pacbio: 'PacBio',
};

export const GROUP_LABELS: Record<string, string> = {
  phage: 'Bacterial virus',
  giant: 'Giant virus',
  other: 'Other virus',
  nonviral: 'Non-viral',
};

export const SITE = {
  name: 'Virall',
  title: 'Virall · Virome Explorer',
  github: 'https://github.com/bruPav/Virall',
  docs: 'https://github.com/bruPav/Virall#readme',
  deck: '/files/virall-asgsr-2026.pdf',
  url: 'https://virall-explorer.pages.dev',
};
