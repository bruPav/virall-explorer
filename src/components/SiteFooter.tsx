import { ArrowUpRight, Download, Code2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { SITE } from '@/lib/types';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="container-page pt-10 pb-24 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo compact />
            <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted">
              An interactive view of the ISS surface virome and the Virall pipeline for
              technology-agnostic viral biosurveillance.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <Code2 className="size-4" /> GitHub
              </a>
              <a href={SITE.deck} className="btn btn-ghost" download>
                <Download className="size-4" /> ASGSR deck
              </a>
            </div>
          </div>

          <div>
            <h2 className="label-mono">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-muted transition-colors hover:text-fg" to="/">Overview</Link></li>
              <li><Link className="text-muted transition-colors hover:text-fg" to="/explore">Virome explorer</Link></li>
              <li><Link className="text-muted transition-colors hover:text-fg" to="/validation">Validation</Link></li>
              <li><Link className="text-muted transition-colors hover:text-fg" to="/about">Pipeline & credits</Link></li>
              <li>
                <Link className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg" to="/qr">
                  <QrCode className="size-3.5" /> Share this site
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="label-mono">Project</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg" href={SITE.github} target="_blank" rel="noreferrer">
                  Virall on GitHub <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg" href={SITE.docs} target="_blank" rel="noreferrer">
                  Documentation <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg" href="https://asgsr.org" target="_blank" rel="noreferrer">
                  ASGSR 2026 <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Virall is developed at Weill Cornell Medicine. Results shown from the ASGSR 2026
            presentation; see the deck for methods and caveats.
          </p>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em]">
            Built for the scan · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
