# Virall · Virome Explorer

An interactive companion site for the [Virall](https://github.com/bruPav/Virall) viral
biosurveillance pipeline and its ASGSR 2026 ISS surface virome analysis.

**Live:** https://virall-explorer.pages.dev

## What's here

- **Overview** — the PMA viability story, the persistent viral core, top viruses, and genome
  recovery.
- **Explore** — filter 26 samples, search 819 species assignments, inspect 22 high-quality
  genomes, and zoom a taxonomy sunburst weighted by abundance.
- **Validation** — 48 simulated communities across four sequencing platforms, filterable by
  DNA/RNA and platform.
- **About** — pipeline, quick start, downloads, credits, and caveats.
- **QR** — a runtime QR code that always points at the current site address.

Everything is static; there is no backend and no tracking. The only network requests are for
the site's own assets.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · d3-scale / d3-shape / d3-hierarchy ·
`motion` · qrcode

The site is deployed on Cloudflare Pages (free plan).

## Data

The JSON in `src/data/` is generated from the ASGSR result tables:

```bash
python3 scripts/export_data.py
```

Source defaults:

- `/mnt/ADdrive/Virall_results_ASGSR` (ISS results)
- `/home/bruno/analysis/paper/competitors/results` (48-community validation)

Override with `VIRALL_RESULTS` and `VIRALL_VALIDATION`. The exporter writes compact sparse JSON
plus source checksums in `meta.json`. The species matrix contains six bacterial/archaeal taxa;
they are flagged as `nonviral` and excluded from the default species and taxonomy views.

The numbers and claims are a snapshot of the ASGSR 2026 analysis. The presentation and the
Virall repository are the authoritative sources.

## Develop

```bash
npm install
npm run dev
npm run build
npm run preview
```

Regenerate the QR code and social image:

```bash
node scripts/make_qr.mjs https://virall-explorer.pages.dev
python3 scripts/make_og.py
```

Update the deck PDF in `public/files/` when the presentation changes.

## Deploy

Cloudflare Pages, static output:

```bash
npm run deploy
```

The `deploy` script builds and publishes `dist/` to the `virall-explorer` Pages project.

`public/_redirects` provides the SPA fallback; `public/_headers` sets CSP, cache, and security
headers.

## Credits

- Virall: Bruno Pavletić, Aurora Britania Diaz Fernandez, Nil Mu, JangKeun Kim, Christopher
  Mason, Fathi Karouia, Nidia Trovao, Margaret Windy McNerny. Developed at Weill Cornell
  Medicine.
- React Bits components ([David Haz](https://github.com/DavidHDev/react-bits), MIT + Commons
  Clause) are vendored in `src/components/reactbits/`: BlurText, CountUp, SpotlightCard,
  GradientText, and Aurora.
- Logo and talk content belong to the Virall authors.

## License

Site code is MIT. See the Virall repository for the pipeline license and data terms.
