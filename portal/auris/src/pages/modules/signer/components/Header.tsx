
import React, { useState } from 'react';
import { Shield, HelpCircle, X } from 'lucide-react';

const Header: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Auris <span className="text-blue-600">Signer</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Plataforma de Assinatura Digital</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-4">
          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Como funciona
          </button>
        </nav>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 text-blue-600 mr-2" />
              Como utilizar o Auris Signer
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">1</span>
                <p>Selecione o arquivo <strong>PDF</strong> que deseja assinar e o seu certificado digital <strong>A1 (.p12 ou .pfx)</strong>.</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">2</span>
                <p>Informe a <strong>senha do certificado</strong> para validar sua identidade digital de forma segura.</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">3</span>
                <p>No visualizador, <strong>clique no local exato</strong> onde deseja que o selo da assinatura apareça no documento.</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5">4</span>
                <p>Clique em <strong>Finalizar</strong> para processar e baixar seu documento assinado com validade jurídica.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
