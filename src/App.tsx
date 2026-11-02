import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { MobileNav } from './components/MobileNav';

const Overview = lazy(() => import('./pages/Overview'));
const Explore = lazy(() => import('./pages/Explore'));
const Validation = lazy(() => import('./pages/Validation'));
const About = lazy(() => import('./pages/About'));
const QrPage = lazy(() => import('./pages/QrPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
}

function PageFallback() {
  return (
    <div className="container-page flex min-h-[55vh] items-center justify-center py-20" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="size-4 animate-spin rounded-full border-2 border-border border-t-accent" />
        Loading explorer…
      </div>
    </div>
  );
}

export function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-bg-elev focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <SiteHeader />
      <main id="main" className="flex-1 pb-24 md:pb-0">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/about" element={<About />} />
            <Route path="/qr" element={<QrPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
      <MobileNav />
    </div>
  );
}
