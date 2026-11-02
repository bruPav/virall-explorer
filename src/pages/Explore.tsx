import { useSearchParams } from 'react-router-dom';
import { Boxes, Dna, Layers3, Table2 } from 'lucide-react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { SamplesPanel } from './explore/SamplesPanel';
import { SpeciesPanel } from './explore/SpeciesPanel';
import { GenomesPanel } from './explore/GenomesPanel';
import { TaxonomyPanel } from './explore/TaxonomyPanel';
import type { CompositionEntry, Genome, Sample, SpeciesData } from '@/lib/types';
import samplesData from '@/data/samples.json';
import speciesData from '@/data/species.json';
import genomesData from '@/data/genomes.json';
import compositionData from '@/data/composition.json';
import metaData from '@/data/meta.json';

const samples = samplesData as Sample[];
const species = speciesData as SpeciesData;
const genomes = genomesData as Genome[];
const composition = compositionData as CompositionEntry[];
const meta = metaData as { generatedAt: string; counts: { species: number; genomes: number } };

const TABS: TabItem[] = [
  { id: 'samples', label: 'Samples', icon: <Table2 className="size-3.5" />, count: samples.length },
  { id: 'species', label: 'Species', icon: <Dna className="size-3.5" />, count: species.species.length },
  { id: 'genomes', label: 'Genomes', icon: <Boxes className="size-3.5" />, count: genomes.length },
  { id: 'taxonomy', label: 'Taxonomy', icon: <Layers3 className="size-3.5" /> },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'samples';

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="label-mono">Data explorer</p>
        <h1 className="display mt-2 text-balance text-[2.1rem] sm:text-[2.7rem]">
          Follow the viruses from swab to genome.
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted sm:text-[0.95rem]">
          Start with the 26 ISS samples, move through 819 species assignments, inspect the 22
          high-quality genomes, or zoom into the taxonomy. Every view is linkable.
        </p>
      </div>

      <div className="mt-6">
        <Tabs items={TABS} value={tab} onChange={setTab} label="Explorer sections" />
      </div>

      <div className="mt-6">
        {tab === 'samples' && (
          <div role="tabpanel" id="panel-samples" aria-labelledby="tab-samples">
            <SamplesPanel samples={samples} species={species} composition={composition} />
          </div>
        )}
        {tab === 'species' && (
          <div role="tabpanel" id="panel-species" aria-labelledby="tab-species">
            <SpeciesPanel species={species} samples={samples} />
          </div>
        )}
        {tab === 'genomes' && (
          <div role="tabpanel" id="panel-genomes" aria-labelledby="tab-genomes">
            <GenomesPanel genomes={genomes} />
          </div>
        )}
        {tab === 'taxonomy' && (
          <div role="tabpanel" id="panel-taxonomy" aria-labelledby="tab-taxonomy">
            <TaxonomyPanel species={species} samples={samples} />
          </div>
        )}
      </div>

      <p className="mt-8 text-[0.68rem] leading-relaxed text-muted">
        Data snapshot: {new Date(meta.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.{' '}
        {meta.counts.species.toLocaleString()} species, {meta.counts.genomes} genomes. Raw tables are
        derived from the ASGSR 2026 analysis; see About for methods and caveats.
      </p>
    </div>
  );
}
