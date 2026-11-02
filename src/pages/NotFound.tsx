import { ArrowLeft, Dna } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-border bg-surface text-accent">
        <Dna className="size-6" />
      </span>
      <p className="label-mono mt-5">404 · no viral signal</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">This page was not detected.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The link may be old or mistyped. Go back to the overview or open the explorer.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn btn-primary">
          <ArrowLeft className="size-4" /> Overview
        </Link>
        <Link to="/explore" className="btn btn-ghost">
          Explore the data
        </Link>
      </div>
    </div>
  );
}
