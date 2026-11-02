import { BarChart3, Dna, Home, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

const ITEMS = [
  { to: '/', label: 'Overview', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Dna },
  { to: '/validation', label: 'Validation', icon: BarChart3 },
  { to: '/about', label: 'About', icon: Info },
];

export function MobileNav() {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-bg/90 backdrop-blur-xl md:hidden"
      aria-label="Mobile"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pt-1.5">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[0.62rem] font-medium text-muted transition-colors',
                isActive && 'text-accent',
              )
            }
          >
            <Icon className="size-[1.15rem]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
