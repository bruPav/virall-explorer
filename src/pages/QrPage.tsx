import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, ExternalLink, Printer, QrCode as QrIcon } from 'lucide-react';
import { SITE } from '@/lib/types';

export default function QrPage() {
  const [url, setUrl] = useState(SITE.url);
  const [svg, setSvg] = useState('');
  const [png, setPng] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const target = window.location.origin;
    setUrl(target);
    const options = {
      errorCorrectionLevel: 'H' as const,
      margin: 2,
      color: { dark: '#0B1F3AFF', light: '#FFFFFFFF' },
    };
    QRCode.toString(target, { ...options, type: 'svg', width: 512 })
      .then(setSvg)
      .catch(() => setSvg(''));
    QRCode.toDataURL(target, { ...options, width: 1024 })
      .then(setPng)
      .catch(() => setPng(''));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const download = (href: string, name: string) => {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="panel-flat p-5 sm:p-6">
          <div className="mx-auto max-w-[18rem] rounded-xl bg-white p-4 shadow-sm">
            {svg ? (
              <div
                className="[&>svg]:h-auto [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
                aria-label={`QR code linking to ${url}`}
              />
            ) : (
              <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
                <QrIcon className="size-8" />
              </div>
            )}
          </div>
          <p className="mt-4 break-all text-center font-mono text-[0.66rem] text-muted">{url}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={copy} className="btn btn-primary text-xs">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            {png && (
              <button
                type="button"
                onClick={() => download(png, 'virall-explorer-qr.png')}
                className="btn btn-ghost text-xs"
              >
                <Download className="size-3.5" /> PNG
              </button>
            )}
            {svg && (
              <button
                type="button"
                onClick={() => download(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, 'virall-explorer-qr.svg')}
                className="btn btn-ghost text-xs"
              >
                <Download className="size-3.5" /> SVG
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="label-mono">Share</p>
          <h1 className="display mt-2 text-balance text-[2rem] sm:text-[2.5rem]">
            Scan. Explore. Reshare.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This QR always points at the address in your browser, so it stays correct whether the
            site is on a preview URL or a custom domain. Download the PNG or SVG for slides,
            posters, or lab doors.
          </p>

          <ol className="mt-6 space-y-3 text-sm">
            {[
              'Print at least 3 cm square, with the white quiet zone intact.',
              'Keep dark modules on a light background; avoid inverted codes.',
              'Test the final print with a phone camera before the session.',
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border font-mono text-[0.62rem] text-muted">
                  {index + 1}
                </span>
                <span className="text-muted">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-ghost text-xs"
            >
              <Printer className="size-3.5" /> Print this page
            </button>
            <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-ghost text-xs">
              <ExternalLink className="size-3.5" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
