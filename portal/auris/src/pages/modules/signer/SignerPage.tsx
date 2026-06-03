import { useState } from 'react';
import { Upload, ShieldCheck, FileSignature, CheckCircle2, FileText, Download, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';
import { AppStep, CertificateInfo } from './types';
import FileUploader from './components/FileUploader';
import CertificateValidator from './components/CertificateValidator';
import PdfSigner from './components/PdfSigner';

const STEPS = [
  { step: AppStep.FILE_SELECTION,         Icon: Upload,        label: 'Origem' },
  { step: AppStep.CERTIFICATE_VALIDATION, Icon: ShieldCheck,   label: 'Identidade' },
  { step: AppStep.PDF_VIEWER_SIGNING,     Icon: FileSignature, label: 'Assinatura' },
  { step: AppStep.COMPLETED,              Icon: CheckCircle2,  label: 'Concluído' },
];

export function SignerPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.FILE_SELECTION);
  const [pdfFiles, setPdfFiles]       = useState<File[]>([]);
  const [certFile, setCertFile]       = useState<File | null>(null);
  const [rubricFile, setRubricFile]   = useState<File | null>(null);
  const [certInfo, setCertInfo]       = useState<CertificateInfo | null>(null);
  const [signedResults, setSignedResults] = useState<{ name: string; url: string; blob: Blob }[]>([]);
  const [isZipping, setIsZipping]     = useState(false);

  const handleFilesSelected = (pdfs: File[], cert: File | null, rubric: File | null) => {
    setPdfFiles(pdfs); setCertFile(cert); setRubricFile(rubric);
    setCurrentStep(AppStep.CERTIFICATE_VALIDATION);
  };

  const handleCertValidated = (info: CertificateInfo) => {
    setCertInfo(info);
    setCurrentStep(AppStep.PDF_VIEWER_SIGNING);
  };

  const handleSigningComplete = (results: { name: string; url: string; blob: Blob }[]) => {
    setSignedResults(results);
    setCurrentStep(AppStep.COMPLETED);
  };

  const reset = () => {
    signedResults.forEach(r => URL.revokeObjectURL(r.url));
    setPdfFiles([]); setCertFile(null); setRubricFile(null);
    setCertInfo(null); setSignedResults([]);
    setCurrentStep(AppStep.FILE_SELECTION);
  };

  const downloadAll = async () => {
    if (signedResults.length === 1) {
      const a = document.createElement('a');
      a.href = signedResults[0].url;
      a.download = signedResults[0].name;
      a.click();
      return;
    }
    setIsZipping(true);
    try {
      const zip = new JSZip();
      signedResults.forEach(r => zip.file(r.name, r.blob));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'documentos_assinados.zip'; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsZipping(false); }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8 relative max-w-lg mx-auto w-full">
        <div className="absolute top-5 left-0 w-full h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div
          className="absolute top-5 left-0 h-px transition-all duration-700"
          style={{ width: `${(currentStep / 3) * 100}%`, background: 'rgba(37,99,235,0.6)' }}
        />
        {STEPS.map(({ step, Icon, label }) => {
          const done   = currentStep > step;
          const active = currentStep === step;
          return (
            <div key={step} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: done || active ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.05)',
                  border: done || active ? '0.5px solid rgba(37,99,235,0.6)' : '0.5px solid rgba(255,255,255,0.13)',
                }}
              >
                <Icon className="w-5 h-5" style={{ color: done || active ? '#60a5fa' : 'rgba(255,255,255,0.3)' }} />
              </div>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest mt-2"
                style={{ color: done || active ? '#60a5fa' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1">
        {currentStep === AppStep.FILE_SELECTION && (
          <FileUploader onFilesSelected={handleFilesSelected} />
        )}

        {currentStep === AppStep.CERTIFICATE_VALIDATION && (
          <CertificateValidator
            certFile={certFile}
            onValidated={handleCertValidated}
            onBack={() => setCurrentStep(AppStep.FILE_SELECTION)}
          />
        )}

        {currentStep === AppStep.PDF_VIEWER_SIGNING && pdfFiles.length > 0 && certInfo && (
          <PdfSigner
            pdfFiles={pdfFiles}
            certInfo={certInfo}
            rubricFile={rubricFile}
            onComplete={handleSigningComplete}
            onBack={() => setCurrentStep(AppStep.CERTIFICATE_VALIDATION)}
          />
        )}

        {currentStep === AppStep.COMPLETED && signedResults.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-8"
              style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)' }}
            >
              {/* Success icon */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '0.5px solid rgba(16,185,129,0.25)' }}
                >
                  <CheckCircle2 className="w-6 h-6" style={{ color: '#6ee7b7' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Documentos assinados</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                    {signedResults.length} arquivo{signedResults.length > 1 ? 's' : ''} processado{signedResults.length > 1 ? 's' : ''} com sucesso
                  </div>
                </div>
              </div>

              {/* File list */}
              <div className="space-y-2 mb-6">
                {signedResults.map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4" style={{ color: '#60a5fa' }} />
                      <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }} className="truncate max-w-xs">{res.name}</span>
                    </div>
                    <a
                      href={res.url}
                      download={res.name}
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10"
                      style={{ border: '0.5px solid rgba(255,255,255,0.13)' }}
                    >
                      <Download className="w-3.5 h-3.5 text-white/70" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {signedResults.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={isZipping}
                    className="flex-1 py-3 rounded-xl font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#2563eb', color: '#fff', fontSize: 13 }}
                  >
                    {isZipping ? 'Compactando...' : 'Baixar todos (.zip)'}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Novo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
