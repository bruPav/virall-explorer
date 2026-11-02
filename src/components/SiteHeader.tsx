import { Code2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SITE } from '@/lib/types';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/validation', label: 'Validation' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/75 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-[0.82rem] font-medium text-muted transition-colors hover:bg-accent/10 hover:text-fg',
                  isActive && 'bg-accent/12 text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="hidden size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-fg sm:grid"
            aria-label="Virall on GitHub"
          >
            <Code2 className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
