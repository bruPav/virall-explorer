import { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Check,
  Copy,
  Download,
  Dna,
  Filter,
  Code2,
  QrCode,
  Search,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Callout } from '@/components/ui/Callout';
import { Reveal } from '@/components/ui/Reveal';
import { SITE } from '@/lib/types';

const STEPS = [
  {
    icon: Filter,
    title: 'Clean',
    body: 'Trim low-quality reads and adapters.',
    color: 'var(--teal)',
  },
  {
    icon: ShieldCheck,
    title: 'Remove human',
    body: 'Discard host reads before assembly.',
    color: 'var(--blue)',
  },
  {
    icon: Wrench,
    title: 'Rebuild',
    body: 'Assemble viral genomes — short, long, or hybrid.',
    color: 'var(--purple)',
  },
  {
    icon: Search,
    title: 'Identify',
    body: 'Classify contigs with Kaiju taxonomy.',
    color: 'var(--orange)',
  },
  {
    icon: Dna,
    title: 'Quality-check',
    body: 'CheckV and geNomad, with merged quality calls.',
    color: 'var(--teal)',
  },
  {
    icon: Calculator,
    title: 'Count',
    body: 'Map reads back for MAPQ-filtered depth and abundance.',
    color: 'var(--blue)',
  },
];

const TEST_COMMAND = 'docker pull pavle17/virall\nnextflow run nextflow/main.nf -profile test';
const RUN_COMMAND =
  'nextflow run nextflow/main.nf \\\n  -params-file my_run.yaml \\\n  -profile docker \\\n  -resume';

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={copy} className="btn btn-ghost px-2.5 py-1.5 text-xs">
      {copied ? <Check className="size-3.5 text-teal" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

export default function About() {
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="label-mono">About Virall</p>
        <h1 className="display mt-2 text-balance text-[2.1rem] sm:text-[2.8rem]">
          One reproducible path from sample to comparable result.
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted sm:text-[0.95rem]">
          Virall is a Nextflow pipeline for viral metagenome analysis: assembly, classification,
          gene prediction, quality assessment, and quantification. It is technology-agnostic by
          design — short reads, long reads, or both; DNA or RNA; bulk or single-cell.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-primary">
            <Code2 className="size-4" /> View on GitHub
          </a>
          <a href={SITE.deck} className="btn btn-ghost" download>
            <Download className="size-4" /> Download ASGSR deck
          </a>
          <Link to="/qr" className="btn btn-ghost">
            <QrCode className="size-4" /> Share this site
          </Link>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="pipeline">
        <Reveal>
          <SectionHeading
            id="pipeline"
            eyebrow="Pipeline"
            title="Six steps. One report."
            description="Why assemble six separate tools when one path can carry the sample from reads to a comparable result?"
          />
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.04}>
              <div className="panel-flat card-hover h-full p-4">
                <div className="flex items-center justify-between">
                  <span
                    className="grid size-9 place-items-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${step.color} 14%, transparent)`, color: step.color }}
                  >
                    <step.icon className="size-4" />
                  </span>
                  <span className="mono-num text-[0.62rem] text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-[1.2fr_1fr]" aria-labelledby="quick-start">
        <div className="panel-flat overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted" />
              <h2 id="quick-start" className="text-sm font-semibold">Quick start</h2>
            </div>
            <CopyButton value={TEST_COMMAND} label="Copy test" />
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="label-mono mb-2">Verify on a minimal PhiX174 dataset</p>
              <pre className="code-block p-3.5">{TEST_COMMAND}</pre>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="label-mono">Run your own samples</p>
                <CopyButton value={RUN_COMMAND} />
              </div>
              <pre className="code-block p-3.5">{RUN_COMMAND}</pre>
            </div>
            <p className="text-[0.7rem] leading-relaxed text-muted">
              Requires Nextflow ≥ 24.10 and Docker or Singularity. All tools and databases are
              bundled in the container.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Callout variant="note" title="What “technology-agnostic” means">
            The same sample sheet accepts Illumina or Ion Torrent short reads, Nanopore or PacBio
            long reads, or a hybrid of both. Virall selects the appropriate assembly path and keeps
            the downstream report comparable.
          </Callout>
          <Callout variant="info" title="What this site shows">
            A snapshot of the ASGSR 2026 ISS surface virome analysis. The explorer is a reading aid,
            not a re-analysis; the deck and GitHub documentation are the authoritative sources.
          </Callout>
          <div className="panel-flat p-5">
            <p className="label-mono">Project</p>
            <div className="mt-3 space-y-2.5 text-sm">
              <a className="flex items-center justify-between gap-3 text-muted transition-colors hover:text-fg" href={SITE.github} target="_blank" rel="noreferrer">
                <span>Source code & docs</span>
                <ArrowRight className="size-4" />
              </a>
              <a className="flex items-center justify-between gap-3 text-muted transition-colors hover:text-fg" href={SITE.deck} download>
                <span>ASGSR 2026 presentation</span>
                <Download className="size-4" />
              </a>
              <Link className="flex items-center justify-between gap-3 text-muted transition-colors hover:text-fg" to="/qr">
                <span>QR to this site</span>
                <QrCode className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="credits">
        <Reveal>
          <SectionHeading
            id="credits"
            eyebrow="Credits"
            title="Built by the Virall team."
            description="Developed at Weill Cornell Medicine. Results presented at ASGSR 2026."
          />
        </Reveal>
        <div className="panel-flat mt-6 grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="label-mono">Authors</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                'Bruno Pavletić',
                'Aurora Britania Diaz Fernandez',
                'Nil Mu',
                'JangKeun Kim',
                'Christopher Mason',
                'Fathi Karouia',
                'Nidia Trovao',
                'Margaret Windy McNerny',
              ].map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-mono">Methods & caveats</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li>PMA is a viability proxy, not proof of infectivity.</li>
              <li>Richness comparisons should account for sequencing depth.</li>
              <li>Validation uses simulated communities; performance on field samples may differ.</li>
              <li>Taxonomy is assigned with Kaiju; abundance is from the TPM matrix.</li>
              <li>The matrix includes six non-viral taxa; the default species view shows viruses only.</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-4 text-[0.68rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Data snapshot generated from the ASGSR analysis tables.</span>
          <span className="font-mono uppercase tracking-[0.1em]">Virall · {new Date().getFullYear()}</span>
        </div>
      </section>
    </div>
  );
}
