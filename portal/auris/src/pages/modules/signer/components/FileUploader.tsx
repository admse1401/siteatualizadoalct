import React, { useState, useRef } from 'react';
import { Files, KeyRound, PenTool } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (pdfs: File[], cert: File | null, rubric: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [pdfs,   setPdfs]   = useState<File[]>([]);
  const [cert,   setCert]   = useState<File | null>(null);
  const [rubric, setRubric] = useState<File | null>(null);

  const pdfRef    = useRef<HTMLInputElement>(null);
  const certRef   = useRef<HTMLInputElement>(null);
  const rubricRef = useRef<HTMLInputElement>(null);

  const canContinue = pdfs.length > 0;

  const card = (active: boolean, color: 'blue' | 'teal' = 'blue'): React.CSSProperties => ({
    background: active
      ? (color === 'teal' ? 'rgba(20,184,166,0.12)' : 'rgba(37,99,235,0.12)')
      : 'rgba(255,255,255,0.07)',
    border: `0.5px solid ${active
      ? (color === 'teal' ? 'rgba(20,184,166,0.4)' : 'rgba(37,99,235,0.4)')
      : 'rgba(255,255,255,0.13)'}`,
    borderRadius: 16, padding: '20px 16px', cursor: 'pointer',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    transition: 'all 0.2s', textAlign: 'center' as const,
  });

  const iconBox = (active: boolean, color: 'blue' | 'teal' = 'blue'): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
    background: active
      ? (color === 'teal' ? 'rgba(20,184,166,0.18)' : 'rgba(37,99,235,0.2)')
      : 'rgba(255,255,255,0.05)',
    border: `0.5px solid ${active
      ? (color === 'teal' ? 'rgba(20,184,166,0.4)' : 'rgba(37,99,235,0.4)')
      : 'rgba(255,255,255,0.1)'}`,
    color: active
      ? (color === 'teal' ? '#5eead4' : '#60a5fa')
      : 'rgba(255,255,255,0.3)',
  });

  const lbl = { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: 6 };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="grid grid-cols-3 gap-3">

        {/* PDFs */}
        <div style={card(pdfs.length > 0)} onClick={() => pdfRef.current?.click()}>
          <input ref={pdfRef} type="file" accept=".pdf" multiple hidden
            onChange={e => setPdfs(Array.from(e.target.files || []))} />
          <div style={iconBox(pdfs.length > 0)}><Files className="w-5 h-5" /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>PDFs para Assinar</div>
          <div style={lbl}>Obrigatório</div>
          <div style={{ fontSize: 11, color: pdfs.length > 0 ? '#60a5fa' : 'rgba(255,255,255,0.25)' }}>
            {pdfs.length > 0 ? `${pdfs.length} arquivo${pdfs.length > 1 ? 's' : ''} selecionado${pdfs.length > 1 ? 's' : ''}` : 'Clique para selecionar'}
          </div>
        </div>

        {/* Certificado A1 (opcional — se não selecionar, usa Windows) */}
        <div style={card(cert !== null)} onClick={() => certRef.current?.click()}>
          <input ref={certRef} type="file" accept=".p12,.pfx" hidden
            onChange={e => setCert(e.target.files?.[0] || null)} />
          <div style={iconBox(cert !== null)}><KeyRound className="w-5 h-5" /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Certificado A1</div>
          <div style={lbl}>Opcional · .p12 / .pfx</div>
          {cert
            ? <div style={{ fontSize: 11, color: '#60a5fa' }} className="truncate">{cert.name}</div>
            : <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Usa Windows se vazio</div>
          }
        </div>

        {/* Rubrica */}
        <div style={{ ...card(rubric !== null, 'teal'), border: `0.5px solid ${rubric ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.13)'}` }}
          onClick={() => rubricRef.current?.click()}>
          <input ref={rubricRef} type="file" accept="image/png" hidden
            onChange={e => setRubric(e.target.files?.[0] || null)} />
          <div style={iconBox(rubric !== null, 'teal')}><PenTool className="w-5 h-5" /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Rubrica</div>
          <div style={{ ...lbl, color: rubric ? 'rgba(20,184,166,0.8)' : 'rgba(255,255,255,0.35)' }}>Opcional · PNG transparente</div>
          {rubric
            ? <div style={{ fontSize: 11, color: '#5eead4' }}>Imagem carregada ✓</div>
            : <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>PNG com fundo transparente</div>
          }
        </div>
      </div>

      {/* Hint about auto Windows mode */}
      {!cert && (
        <div className="flex items-start gap-2 p-3 rounded-xl"
          style={{ background: 'rgba(37,99,235,0.07)', border: '0.5px solid rgba(37,99,235,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          <span className="flex-shrink-0">ℹ</span>
          <span>Sem certificado selecionado, o próximo passo listará os certificados instalados no Windows.</span>
        </div>
      )}

      <div className="flex justify-center pt-1">
        <button
          onClick={() => canContinue && onFilesSelected(pdfs, cert, rubric)}
          disabled={!canContinue}
          className="px-12 py-3.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: canContinue ? '#2563eb' : 'rgba(255,255,255,0.07)',
            color: canContinue ? '#fff' : 'rgba(255,255,255,0.3)',
            border: `0.5px solid ${canContinue ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.1)'}`,
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          Continuar para Identidade
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
