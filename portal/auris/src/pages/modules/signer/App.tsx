
import React, { useState } from 'react';
import { 
  ShieldCheck, Upload, CheckCircle2, FileSignature, Download,
  RefreshCw, FileText, Archive, Loader2, Instagram, Linkedin
} from 'lucide-react';
import { AppStep, CertificateInfo, CertMethod } from './types';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import CertificateValidator from './components/CertificateValidator';
import PdfSigner from './components/PdfSigner';

declare const JSZip: any;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.FILE_SELECTION);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certMethod, setCertMethod] = useState<CertMethod>(CertMethod.FILE);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [certInfo, setCertInfo] = useState<CertificateInfo | null>(null);
  const [signedResults, setSignedResults] = useState<{name: string, url: string, blob: Blob}[]>([]);
  const [isZipping, setIsZipping] = useState(false);

  const handleFilesSelected = (pdfs: File[], cert: File | null, rubric: File | null, method: CertMethod) => {
    setPdfFiles(pdfs);
    setCertFile(cert);
    setRubricFile(rubric);
    setCertMethod(method);
    setCurrentStep(AppStep.CERTIFICATE_VALIDATION);
  };

  const handleCertValidated = (info: CertificateInfo) => {
    setCertInfo(info);
    setCurrentStep(AppStep.PDF_VIEWER_SIGNING);
  };

  const handleSigningComplete = (results: {name: string, url: string, blob: Blob}[]) => {
    setSignedResults(results);
    setCurrentStep(AppStep.COMPLETED);
  };

  const reset = () => {
    signedResults.forEach(res => URL.revokeObjectURL(res.url));
    setPdfFiles([]);
    setCertFile(null);
    setRubricFile(null);
    setCertInfo(null);
    setSignedResults([]);
    setCurrentStep(AppStep.FILE_SELECTION);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-700" 
                 style={{ width: `${(currentStep / 3) * 100}%` }}></div>
            
            {[
              { step: AppStep.FILE_SELECTION, icon: Upload, label: 'Origem' },
              { step: AppStep.CERTIFICATE_VALIDATION, icon: ShieldCheck, label: 'Identidade' },
              { step: AppStep.PDF_VIEWER_SIGNING, icon: FileSignature, label: 'Assinatura' },
              { step: AppStep.COMPLETED, icon: CheckCircle2, label: 'Download' }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= item.step ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] uppercase tracking-widest mt-3 font-black ${currentStep >= item.step ? 'text-blue-600' : 'text-gray-300'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {currentStep === AppStep.FILE_SELECTION && (
            <FileUploader onFilesSelected={handleFilesSelected} />
          )}

          {currentStep === AppStep.CERTIFICATE_VALIDATION && (
            <CertificateValidator 
              certFile={certFile} 
              certMethod={certMethod}
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
             <div className="max-w-3xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-50 text-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                   <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Tudo pronto!</h2>
                <p className="text-slate-500 mb-10 text-lg">Seus documentos foram processados com assinaturas digitais válidas.</p>
                
                <div className="space-y-3 mb-12">
                   {signedResults.map((res, i) => (
                     <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <FileText className="w-6 h-6 text-blue-600" />
                           <span className="font-bold text-slate-700 text-sm truncate max-w-xs">{res.name}</span>
                        </div>
                        <a href={res.url} download={res.name} className="p-3 bg-white text-blue-600 rounded-xl border border-slate-100 hover:bg-blue-600 hover:text-white transition-all">
                           <Download className="w-5 h-5" />
                        </a>
                     </div>
                   ))}
                </div>

                <div className="flex gap-4">
                   <button onClick={reset} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all">Novo Assinador</button>
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
