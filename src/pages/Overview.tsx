import { ArrowRight, Download, Code2, Microscope, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import Aurora from '@/components/reactbits/Aurora/Aurora';
import BlurText from '@/components/reactbits/BlurText/BlurText';
import GradientText from '@/components/reactbits/GradientText/GradientText';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { PmaSlope } from '@/components/charts/PmaSlope';
import { CompositionBars } from '@/components/charts/CompositionBars';
import { CoreBars } from '@/components/charts/CoreBars';
import { PrevalenceList } from '@/components/charts/PrevalenceList';
import { SampleMatrix } from '@/components/charts/SampleMatrix';
import { ChartFrame, LegendDot } from '@/components/ui/ChartFrame';
import { Callout } from '@/components/ui/Callout';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stat } from '@/components/ui/Stat';
import { useTheme } from '@/lib/theme';
import { useMediaQuery } from '@/lib/hooks';
import { formatNumber } from '@/lib/format';
import { SITE, type CompositionEntry, type CoreStats, type Genome, type Sample, type Viability } from '@/lib/types';
import samplesData from '@/data/samples.json';
import compositionData from '@/data/composition.json';
import coreData from '@/data/core.json';
import viabilityData from '@/data/viability.json';
import genomesData from '@/data/genomes.json';
import highlightsData from '@/data/highlights.json';
import metaData from '@/data/meta.json';

const samples = samplesData as Sample[];
const composition = compositionData as CompositionEntry[];
const core = coreData as CoreStats;
const viability = viabilityData as Viability;
const genomes = genomesData as Genome[];
const meta = metaData as { counts: { species: number; viralSpecies: number; nonViralTaxa: number } };
const highlights = highlightsData as {
  topPhages: Array<{ name: string; prevalence: number; total: number; family: string | null }>;
  topGiants: Array<{ name: string; prevalence: number; total: number; family: string | null }>;
};

const phages = highlights.topPhages.map((entry) => ({
  ...entry,
  group: 'phage' as const,
  kingdom: 'Viruses',
  class: 'Caudoviricetes',
  genus: null,
  order: null,
  phylum: null,
  values: [] as [number, number][],
}));
const giants = highlights.topGiants.map((entry) => ({
  ...entry,
  group: 'giant' as const,
  kingdom: 'Viruses',
  class: 'Megaviricetes',
  genus: null,
  order: null,
  phylum: null,
  values: [] as [number, number][],
}));

function HeroBackdrop() {
  const { theme } = useTheme();
  const wide = useMediaQuery('(min-width: 900px)');
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const showAurora = wide && !reduce;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(50rem 24rem at 12% 0%, rgba(53,201,195,0.18), transparent 65%), radial-gradient(40rem 22rem at 90% 8%, rgba(179,157,255,0.16), transparent 62%)'
              : 'radial-gradient(46rem 24rem at 12% 0%, rgba(14,124,134,0.14), transparent 65%), radial-gradient(38rem 22rem at 90% 8%, rgba(123,94,167,0.12), transparent 62%)',
        }}
      />
      {showAurora && (
        <div className="absolute inset-0 opacity-60 dark:opacity-70">
          <Aurora
          colorStops={
            theme === 'dark'
              ? ['#0a2a33', '#0e7c86', '#2e86ab', '#6d4fb0']
              : ['#d9f2f0', '#cfe7f4', '#e7e0fa', '#f3d9c4']
          }
          amplitude={0.8}
          blend={0.62}
          speed={0.25}
          scale={1.1}
          glow={0.8}
          brightness={theme === 'dark' ? 0.7 : 1}
          mouseInteraction={false}
            intro
            lightMode={theme === 'light'}
            dpr={0.8}
            layers={2}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/25 to-bg" />
      <div className="absolute inset-0 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
    </div>
  );
}

export default function Overview() {
  const { theme } = useTheme();
  const wide = useMediaQuery('(min-width: 900px)');
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const spotlightStyle = {
    '--spotlight-card-surface': 'var(--surface-solid)',
    '--spotlight-card-border': 'var(--border)',
    '--spotlight-card-shadow': 'var(--shadow)',
    padding: 0,
  } as CSSProperties;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <HeroBackdrop />
        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">ASGSR 2026</span>
                <span className="chip">ISS surface virome</span>
                <span className="chip">Weill Cornell Medicine</span>
              </div>

              <h1 className="display mt-5 text-balance text-[2.65rem] leading-[0.98] sm:text-6xl lg:text-[4.15rem]">
                The ISS surface virome,{' '}
                {wide && !reduce ? (
                  <GradientText
                    colors={
                      theme === 'dark'
                        ? ['#35c9c3', '#6aabff', '#b39dff']
                        : ['#0b6d76', '#266f92', '#6247a6']
                    }
                    animationSpeed={7}
                    className="inline-block"
                  >
                    made explorable.
                  </GradientText>
                ) : (
                  <span className="text-gradient">made explorable.</span>
                )}
              </h1>

              <div className="mt-5 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-muted sm:text-base">
                <BlurText
                  text="Twenty-six swabs from three flights. PMA to separate intact virus from relic DNA. One reproducible pipeline from sample to comparable result."
                  animateBy="words"
                  direction="bottom"
                  effect="blur"
                  delay={25}
                  className="leading-relaxed"
                />
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link to="/explore" className="btn btn-primary">
                  Explore the virome <ArrowRight className="size-4" />
                </Link>
                <a href={SITE.deck} className="btn btn-ghost" download>
                  <Download className="size-4" /> Read the deck
                </a>
                <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  <Code2 className="size-4" /> Code
                </a>
              </div>

              <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-border/70 pt-5">
                {[
                  { value: '26', label: 'samples' },
                  { value: '3', label: 'flights' },
                  { value: String(meta.counts.species), label: 'species' },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="mono-num text-xl font-semibold">{item.value}</dt>
                    <dd className="mt-0.5 text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Reveal delay={0.15}>
              <SpotlightCard
                theme={theme}
                spotlightColor={theme === 'dark' ? 'rgba(53,201,195,0.22)' : 'rgba(11,109,118,0.14)'}
                intensity={0.8}
                shape="beam"
                className="rounded-2xl"
                style={spotlightStyle}
              >
                <SampleMatrix samples={samples} />
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page -mt-px py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Samples" value={26} note="13 untreated + 13 PMA" accent="teal" />
          <Stat
            label="Species in matrix"
            value={meta.counts.species}
            note={`${meta.counts.viralSpecies} viral + ${meta.counts.nonViralTaxa} non-viral taxa`}
            accent="blue"
          />
          <Stat label="Core species" value={core.coreSpecies} note="Detected with and without PMA" accent="purple" />
          <Stat
            label="High-quality genomes"
            value={genomes.length}
            note="Unique genomes passing quality filters"
            accent="orange"
          />
        </div>
      </section>

      <section className="container-page py-10 sm:py-14" aria-labelledby="viability">
        <Reveal>
          <SectionHeading
            id="viability"
            eyebrow="01 · Viability"
            title="Most viral DNA on these surfaces was not intact virus."
            description="PMA binds DNA inside damaged particles and blocks it from sequencing. Compare paired swabs: what remains after PMA is a much smaller, more plausible set of intact viruses."
          />
        </Reveal>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <Reveal>
            <ChartFrame
              title="Virus types per sample, before and after PMA"
              subtitle="Each line is one paired swab. Dashed = no detection after PMA."
              legend={
                <>
                  <LegendDot color="var(--orange)" label="Untreated" />
                  <LegendDot color="var(--blue)" label="PMA" />
                </>
              }
            >
              <PmaSlope samples={samples} />
            </ChartFrame>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="panel-flat h-full p-5 sm:p-6">
              <p className="label-mono">Virus types per sample</p>
              <div className="mt-3 flex items-end gap-3">
                <span className="stat-value text-[2.6rem] text-orange">{viability.untreatedMin}–{viability.untreatedMax}</span>
                <ArrowRight className="mb-2 size-5 text-muted" />
                <span className="stat-value text-[2.6rem] text-blue">{viability.pmaMin}–{viability.pmaMax}</span>
              </div>
              <p className="mt-2 text-xs text-muted">Untreated → after PMA</p>

              <div className="mt-5 space-y-3 border-t border-border/70 pt-4 text-sm leading-relaxed text-muted">
                <p>
                  Untreated swabs carried up to <strong className="text-fg">{formatNumber(viability.untreatedMax)}</strong>{' '}
                  virus types. After PMA, the maximum fell to{' '}
                  <strong className="text-fg">{formatNumber(viability.pmaMax)}</strong>.
                </p>
                <p>
                  Two PMA-treated samples had no detectable viral signal at all. Across the 13 pairs,
                  this points to a large pool of free or relic DNA rather than infectious virus.
                </p>
              </div>

              <Callout variant="note" className="mt-5" title="Read this carefully">
                PMA is a viability proxy, not proof of infectivity. It filters out DNA in damaged
                particles; intact virions are unaffected.
              </Callout>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14" aria-labelledby="core">
        <Reveal>
          <SectionHeading
            id="core"
            eyebrow="02 · The core"
            title="A persistent bacterial-virus core remains."
            description="Species detected both with and without PMA form the core. Many survive in two flights, but none were found in PMA-treated samples from all three."
          />
        </Reveal>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <ChartFrame
              title="Viral group composition"
              subtitle="Share of viral abundance, aggregated across samples"
              legend={
                <>
                  <LegendDot color="var(--teal)" label="Bacterial viruses" />
                  <LegendDot color="var(--blue)" label="Giant viruses" />
                  <LegendDot color="var(--purple)" label="Other" />
                </>
              }
            >
              <CompositionBars composition={composition} />
            </ChartFrame>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="panel-flat flex h-full flex-col p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="label-mono">Core species</p>
                  <p className="stat-value mt-2 text-[2.4rem] text-teal">{core.coreSpecies}</p>
                </div>
                <div>
                  <p className="label-mono">In 2 flights</p>
                  <p className="stat-value mt-2 text-[2.4rem] text-blue">{core.byFlights['2']}</p>
                </div>
              </div>
              <div className="mt-6 border-t border-border/70 pt-5">
                <p className="label-mono mb-3">Persistence across flights</p>
                <CoreBars core={core} />
              </div>
              <Link to="/explore?tab=taxonomy" className="btn btn-ghost mt-auto pt-3">
                Open the taxonomy explorer <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14" aria-labelledby="who">
        <Reveal>
          <SectionHeading
            id="who"
            eyebrow="03 · Who is there"
            title="The same viruses keep returning."
            description="Prevalence is the number of samples with detection. Several prevalent phages infect human-associated bacteria; giant viruses are mostly algal and amoeba viruses."
            action={
              <Link to="/explore?tab=species" className="btn btn-ghost">
                All 819 species <ArrowRight className="size-4" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <ChartFrame title="Top bacterial viruses" subtitle="Prevalence across 24 samples with viral signal">
              <PrevalenceList species={phages} group="phage" limit={6} />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.06}>
            <ChartFrame title="Top giant viruses" subtitle="Mostly algal and amoeba viruses">
              <PrevalenceList species={giants} group="giant" limit={6} />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="panel-flat flex h-full flex-col p-5 sm:p-6">
              <p className="label-mono">Genome recovery</p>
              <p className="stat-value mt-3 text-[2.8rem] text-purple">{genomes.length}</p>
              <p className="mt-1 text-sm text-muted">unique high-quality viral genomes</p>
              <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm text-muted">
                {['F9', 'F10', 'F11'].map((flight) => {
                  const count = genomes.filter((genome) => genome.flight === flight).length;
                  return (
                    <div key={flight} className="flex items-center justify-between">
                      <span>Flight {flight.replace('F', '')}</span>
                      <span className="mono-num text-fg">{count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                All high-quality records came from untreated samples;{' '}
                {genomes.filter((genome) => genome.sample === 'F10_D1_NO_PMA').length} of{' '}
                {genomes.length} came from one deep F10 sample.
              </p>
              <Link to="/explore?tab=genomes" className="btn btn-ghost mt-auto">
                Explore genomes <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page pb-4 pt-10 sm:pt-14">
        <Reveal>
          <div className="panel relative overflow-hidden p-6 sm:p-10">
            <div className="absolute -right-20 -top-24 size-72 rounded-full bg-accent/10 blur-3xl" aria-hidden />
            <div className="relative grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
              <div>
                <p className="label-mono">Explore further</p>
                <h2 className="display mt-2 text-balance text-3xl sm:text-4xl">
                  Every sample, species, genome, and benchmark.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                  Filter by flight, switch between untreated and PMA, drill into taxonomy, and
                  inspect the 48-community validation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 md:justify-end">
                <Link to="/explore" className="btn btn-primary">
                  <Microscope className="size-4" /> Open explorer
                </Link>
                <Link to="/qr" className="btn btn-ghost">
                  <QrCode className="size-4" /> Share
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
