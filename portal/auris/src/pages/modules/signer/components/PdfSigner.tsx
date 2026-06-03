import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Maximize2, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { CertificateInfo } from '../types';

declare const pdfjsLib: any;

interface PdfSignerProps {
  pdfFiles:   File[];
  certInfo:   CertificateInfo;
  rubricFile: File | null;
  onComplete: (results: { name: string; url: string; blob: Blob }[]) => void;
  onBack:     () => void;
}

interface Rect { x: number; y: number; w: number; h: number; }
type DrawMode = 'move' | 'resize' | 'draw';

const PdfSigner: React.FC<PdfSignerProps> = ({ pdfFiles, certInfo, rubricFile, onComplete, onBack }) => {
  const [sigRect,         setSigRect]         = useState<Rect | null>(null);
  const [rubRect,         setRubRect]         = useState<Rect | null>(null);
  const [isSigning,       setIsSigning]       = useState(false);
  const [isLoadingPdf,    setIsLoadingPdf]    = useState(true);
  const [signingError,    setSigningError]    = useState<string | null>(null);
  const [activeElement,   setActiveElement]   = useState<'sig' | 'rub' | null>(null);
  const [interactionMode, setInteractionMode] = useState<DrawMode | null>(null);
  const [dragStart,       setDragStart]       = useState({ x: 0, y: 0 });
  const [drawOrigin,      setDrawOrigin]      = useState<{ x: number; y: number } | null>(null);
  const [pdfNaturalSize,  setPdfNaturalSize]  = useState<{ w: number; h: number } | null>(null);
  const [rubricUrl,       setRubricUrl]       = useState<string | null>(null);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const canvasBcrRef = useRef<DOMRect | null>(null);

  // PDF preview
  useEffect(() => {
    const render = async () => {
      setIsLoadingPdf(true);
      try {
        const buf = await pdfFiles[0].arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdf      = await pdfjsLib.getDocument({ data: buf }).promise;
        const page     = await pdf.getPage(1);
        const vp1      = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas   = canvasRef.current;
        if (canvas) {
          canvas.height = viewport.height;
          canvas.width  = viewport.width;
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
        }
        setPdfNaturalSize({ w: vp1.width, h: vp1.height });
      } catch (err) { console.error(err); }
      finally { setIsLoadingPdf(false); }
    };
    render();
  }, [pdfFiles]);

  // Rubric object URL
  useEffect(() => {
    if (!rubricFile) { setRubricUrl(null); return; }
    const url = URL.createObjectURL(rubricFile);
    setRubricUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [rubricFile]);

  // ── Draw-on-mousedown ───────────────────────────────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeElement || isLoadingPdf) return;
    e.preventDefault();
    const bcr = canvasRef.current!.getBoundingClientRect();
    canvasBcrRef.current = bcr;
    const x = e.clientX - bcr.left;
    const y = e.clientY - bcr.top;

    if (!sigRect) {
      setSigRect({ x, y, w: 0, h: 0 });
      setActiveElement('sig');
      setInteractionMode('draw');
      setDrawOrigin({ x, y });
    } else if (rubricFile && !rubRect) {
      setRubRect({ x, y, w: 0, h: 0 });
      setActiveElement('rub');
      setInteractionMode('draw');
      setDrawOrigin({ x, y });
    }
  };

  // ── Move / resize existing elements ─────────────────────────────────────────
  const startInteraction = (e: React.MouseEvent, el: 'sig' | 'rub', mode: 'move' | 'resize') => {
    e.preventDefault(); e.stopPropagation();
    canvasBcrRef.current = canvasRef.current!.getBoundingClientRect();
    setActiveElement(el); setInteractionMode(mode);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!activeElement || !interactionMode) return;

      if (interactionMode === 'draw' && drawOrigin && canvasBcrRef.current) {
        const bcr    = canvasBcrRef.current;
        const currX  = e.clientX - bcr.left;
        const currY  = e.clientY - bcr.top;
        const setter = activeElement === 'sig' ? setSigRect : setRubRect;
        setter({
          x: Math.min(drawOrigin.x, currX),
          y: Math.min(drawOrigin.y, currY),
          w: Math.max(1, Math.abs(currX - drawOrigin.x)),
          h: Math.max(1, Math.abs(currY - drawOrigin.y)),
        });
        return;
      }

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const setter  = activeElement === 'sig' ? setSigRect : setRubRect;
      const current = activeElement === 'sig' ? sigRect    : rubRect;
      if (current) {
        setter(interactionMode === 'move'
          ? { ...current, x: current.x + dx, y: current.y + dy }
          : { ...current, w: Math.max(40, current.w + dx), h: Math.max(30, current.h + dy) },
        );
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const onUp = () => {
      if (interactionMode === 'draw') {
        // Snap to minimum size if user just clicked without dragging
        if (activeElement === 'sig') {
          setSigRect(r => r && (r.w < 30 || r.h < 20) ? { ...r, w: 220, h: 75 } : r);
        } else if (activeElement === 'rub') {
          setRubRect(r => r && (r.w < 30 || r.h < 20) ? { ...r, w: 90, h: 90 } : r);
        }
        setDrawOrigin(null);
      }
      setActiveElement(null);
      setInteractionMode(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [activeElement, interactionMode, sigRect, rubRect, dragStart, drawOrigin]);

  // ── Sign ────────────────────────────────────────────────────────────────────
  const handleFinalize = async () => {
    if (!sigRect || !canvasRef.current || !pdfNaturalSize) return;
    setIsSigning(true); setSigningError(null);

    try {
      const canvas = canvasRef.current;
      const scaleX = pdfNaturalSize.w / canvas.clientWidth;
      const scaleY = pdfNaturalSize.h / canvas.clientHeight;
      const pdfH   = pdfNaturalSize.h;

      const sx = sigRect.x * scaleX, sw = sigRect.w * scaleX, sh = sigRect.h * scaleY;
      const sy = pdfH - (sigRect.y * scaleY) - sh;

      let rubricBase64: string | undefined;
      let rubricRect: [number, number, number, number] | undefined;
      if (rubricFile && rubRect) {
        rubricBase64 = Buffer.from(await rubricFile.arrayBuffer()).toString('base64');
        const rx = rubRect.x * scaleX, rw = rubRect.w * scaleX, rh = rubRect.h * scaleY;
        const ry = pdfH - (rubRect.y * scaleY) - rh;
        rubricRect = [rx, ry, rx+rw, ry+rh];
      }

      const signerName = certInfo.commonName.split(':')[0].trim().toUpperCase();
      const cpf        = certInfo.commonName.split(':')[1]?.trim() || '';
      const results: { name: string; url: string; blob: Blob }[] = [];

      for (const file of pdfFiles) {
        const body: Record<string, unknown> = {
          pdfBase64:  Buffer.from(await file.arrayBuffer()).toString('base64'),
          signerName, cpf,
          issuer:     certInfo.issuer,
          widgetRect: [sx, sy, sx+sw, sy+sh],
          rubricBase64, rubricRect,
        };
        if (certInfo.thumbprint) {
          body.thumbprint = certInfo.thumbprint;
        } else {
          body.p12Base64  = Buffer.from(certInfo.p12Buffer!).toString('base64');
          body.p12Password = certInfo.p12Password!;
        }

        const res = await fetch('/api/signer/sign', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body:   JSON.stringify(body),
        });

        if (!res.ok) {
          let msg = res.statusText;
          try { const j = await res.json(); msg = j?.message || msg; } catch { /* ignore */ }
          throw new Error(`Erro ao assinar "${file.name}": ${msg}`);
        }

        const blob = new Blob([await res.arrayBuffer()], { type: 'application/pdf' });
        results.push({ name: file.name.replace(/\.pdf$/i, '_assinado.pdf'), url: URL.createObjectURL(blob), blob });
      }
      onComplete(results);
    } catch (err: any) {
      console.error(err);
      setSigningError(err?.message || 'Erro desconhecido ao assinar.');
      setIsSigning(false);
    }
  };

  const nome = certInfo.commonName.split(':')[0].trim();
  const cpf  = certInfo.commonName.split(':')[1]?.trim() || '';

  // Font sizes scale with box height
  const sigH     = sigRect?.h ?? 75;
  const nameSize = Math.max(7, Math.min(20, sigH * 0.13));
  const detSize  = Math.max(5, Math.min(14, sigH * 0.095));
  const divSize  = Math.max(3, sigH * 0.05);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden"
      style={{ height: '75vh', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)' }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              Auris <span style={{ color: '#60a5fa' }}>Signer</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
              {pdfFiles.length} arquivo{pdfFiles.length > 1 ? 's' : ''} ·{' '}
              {!sigRect ? 'Arraste no PDF para definir a área da assinatura' :
               rubricFile && !rubRect ? 'Arraste para definir a área da rubrica' :
               'Arraste os elementos para reposicionar'}
            </div>
          </div>
        </div>
        <button onClick={handleFinalize} disabled={!sigRect || isSigning || !pdfNaturalSize}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30"
          style={{ background: '#2563eb', color: '#fff' }}>
          {isSigning
            ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Assinando...</span>
            : `Assinar ${pdfFiles.length > 1 ? `(${pdfFiles.length})` : 'Documento'}`}
        </button>
      </div>

      {signingError && (
        <div className="flex items-center gap-2 px-5 py-2.5 flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '0.5px solid rgba(239,68,68,0.25)', fontSize: 12, color: 'rgba(239,68,68,0.9)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{signingError}</span>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex">
        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex justify-center p-8"
          style={{ background: 'rgba(10,22,40,0.4)' }}>
          <div
            className="relative select-none"
            style={{ height: 'fit-content', cursor: !sigRect || (rubricFile && !rubRect) ? 'crosshair' : 'default' }}
            onMouseDown={handleCanvasMouseDown}
          >
            {isLoadingPdf && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-50"
                style={{ background: 'rgba(10,22,40,0.8)' }}>
                <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: '#60a5fa' }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Preparando PDF...</p>
              </div>
            )}

            <canvas ref={canvasRef} className="shadow-2xl"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />

            {/* Signature overlay */}
            {sigRect && sigRect.w > 0 && sigRect.h > 0 && (
              <div className="absolute z-30"
                style={{
                  left: sigRect.x, top: sigRect.y, width: sigRect.w, height: sigRect.h,
                  border: '2px solid #2563eb',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.88)',
                  boxShadow: '0 0 0 1px rgba(37,99,235,0.35), 0 2px 10px rgba(0,0,0,0.35)',
                  overflow: 'hidden',
                }}>
                {/* move area */}
                <div className="absolute inset-0" style={{ cursor: 'move', zIndex: 1 }}
                  onMouseDown={e => startInteraction(e, 'sig', 'move')} />

                {/* preview content — scaled fonts */}
                <div className="absolute inset-0 flex pointer-events-none overflow-hidden"
                  style={{ padding: `${divSize}px ${divSize + 1}px`, zIndex: 2 }}>
                  {/* left col: name + cpf */}
                  <div className="flex flex-col justify-center leading-tight"
                    style={{ width: '44%', paddingRight: divSize, fontSize: nameSize, color: '#111' }}>
                    <p className="font-bold truncate uppercase" style={{ fontSize: nameSize }}>{nome}</p>
                    {cpf && <p style={{ fontSize: detSize, color: '#555', marginTop: divSize * 0.4 }}>{cpf}</p>}
                  </div>
                  {/* divider */}
                  <div className="self-stretch flex-shrink-0"
                    style={{ width: 0.5, background: 'rgba(37,99,235,0.35)', margin: `${divSize}px 0` }} />
                  {/* right col: legal text */}
                  <div className="flex-1 flex flex-col justify-center leading-tight"
                    style={{ paddingLeft: divSize, fontSize: detSize, color: '#333' }}>
                    <p>Assinado digitalmente</p>
                    <p style={{ marginTop: detSize * 0.3 }}>por: {nome.split(' ')[0]}</p>
                    <p style={{ marginTop: detSize * 0.3 }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                {/* resize handle */}
                <div className="absolute bottom-0 right-0 flex items-center justify-center cursor-nwse-resize"
                  style={{ width: 16, height: 16, background: '#2563eb', borderRadius: '2px 0 3px 0', zIndex: 3 }}
                  onMouseDown={e => startInteraction(e, 'sig', 'resize')}>
                  <Maximize2 style={{ width: 9, height: 9, color: '#fff' }} />
                </div>
              </div>
            )}

            {/* Rubric overlay */}
            {rubricFile && rubRect && rubRect.w > 0 && rubRect.h > 0 && (
              <div className="absolute z-20"
                style={{
                  left: rubRect.x, top: rubRect.y, width: rubRect.w, height: rubRect.h,
                  border: '2px dashed rgba(20,184,166,0.8)',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.08)',
                }}>
                <div className="absolute inset-0" style={{ cursor: 'move', zIndex: 1 }}
                  onMouseDown={e => startInteraction(e, 'rub', 'move')} />
                {rubricUrl && (
                  <img src={rubricUrl} alt="rubrica"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ objectFit: 'contain', zIndex: 2 }} />
                )}
                <div className="absolute bottom-0 right-0 flex items-center justify-center cursor-nwse-resize"
                  style={{ width: 16, height: 16, background: 'rgba(20,184,166,0.85)', borderRadius: '2px 0 3px 0', zIndex: 3 }}
                  onMouseDown={e => startInteraction(e, 'rub', 'resize')}>
                  <Maximize2 style={{ width: 9, height: 9, color: '#fff' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 p-4 overflow-auto"
          style={{ borderLeft: '0.5px solid rgba(255,255,255,0.08)' }}>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(37,99,235,0.12)', border: '0.5px solid rgba(37,99,235,0.25)' }}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#60a5fa' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1px' }}>Certificado</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }} className="truncate">{nome}</p>
            {cpf && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{cpf}</p>}
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }} className="truncate">{certInfo.issuer}</p>
            {certInfo.thumbprint && (
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2 }} className="truncate font-mono">
                {certInfo.thumbprint.substring(0, 20)}…
              </p>
            )}
            <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', border: '0.5px solid rgba(16,185,129,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: '#34d399' }}>PAdES · Cadeia + TSA</span>
            </div>
          </div>

          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Como usar</p>
            {[
              { n: 1, t: 'Arraste no PDF para definir a área da assinatura' },
              ...(rubricFile ? [{ n: 2, t: 'Arraste novamente para definir a rubrica' }] : []),
              { n: rubricFile ? 3 : 2, t: 'Arraste o elemento para mover; use o canto para redimensionar' },
              { n: rubricFile ? 4 : 3, t: 'Clique em "Assinar" para finalizar' },
            ].map(({ n, t }) => (
              <div key={n} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(37,99,235,0.2)', fontSize: 9, fontWeight: 700, color: '#60a5fa' }}>{n}</div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{t}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 text-center"
            style={{
              background: sigRect && (!rubricFile || rubRect) ? 'rgba(16,185,129,0.08)' : 'rgba(37,99,235,0.08)',
              border: `0.5px solid ${sigRect && (!rubricFile || rubRect) ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.2)'}`,
            }}>
            <p style={{ fontSize: 11, color: sigRect && (!rubricFile || rubRect) ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
              {!sigRect ? 'Arraste no PDF para posicionar' :
               rubricFile && !rubRect ? 'Agora arraste a rubrica' :
               'Pronto para assinar ✓'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSigner;
