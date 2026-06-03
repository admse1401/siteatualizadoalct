import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { CertificateInfo } from '../types';
import forge from 'node-forge';

interface WindowsCert {
  thumbprint: string;
  commonName: string;
  displayName: string;
  cpf?: string;
  issuer: string;
  notAfter: string;
  friendlyName?: string;
}

interface CertificateValidatorProps {
  certFile:    File | null;
  onValidated: (info: CertificateInfo) => void;
  onBack:      () => void;
}

// ─── File mode (P12 upload) ──────────────────────────────────────────────────

const FileMode: React.FC<{ certFile: File; onValidated: (i: CertificateInfo) => void; onBack: () => void }> = ({ certFile, onValidated, onBack }) => {
  const [password,     setPassword]     = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!password) { setError('A senha é obrigatória.'); return; }
    setIsValidating(true);
    try {
      const buf    = await certFile.arrayBuffer();
      const binary = forge.util.createBuffer(buf);
      try {
        const p12Asn1  = forge.asn1.fromDer(binary);
        const p12      = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
        if (!certBags?.length) throw new Error('Certificado inválido.');
        const certObj = certBags[0].cert!;
        const subject = certObj.subject.attributes;
        onValidated({
          commonName:  subject.find((a: any) => a.shortName === 'CN')?.value || 'Desconhecido',
          issuer:      certObj.issuer.attributes.find((a: any) => a.shortName === 'CN')?.value || 'AC',
          expiryDate:  new Date(certObj.validity.notAfter),
          p12Buffer:   buf,
          p12Password: password,
        });
      } catch {
        throw new Error('Senha incorreta para este certificado.');
      }
    } catch (err: any) {
      setError(err.message); setIsValidating(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: error ? '0.5px solid rgba(239,68,68,0.5)' : '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
  };

  return (
    <div className="p-8 space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(37,99,235,0.08)', border: '0.5px solid rgba(37,99,235,0.2)' }}>
        <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#60a5fa' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} className="truncate">{certFile.name}</span>
      </div>
      <form onSubmit={handleValidate} className="space-y-4">
        <div className="space-y-1.5">
          <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.4px' }}>
            Senha do Certificado
          </label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }} placeholder="••••••••" autoFocus />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', fontSize: 11, color: 'rgba(239,68,68,0.9)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}
        <div className="space-y-2 pt-1">
          <button type="submit" disabled={isValidating}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: '#2563eb', color: '#fff' }}>
            {isValidating
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processando...</span>
              : 'Validar e Prosseguir'}
          </button>
          <button type="button" onClick={onBack}
            className="w-full py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors hover:text-white"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Windows mode ────────────────────────────────────────────────────────────

const WindowsMode: React.FC<{ onValidated: (i: CertificateInfo) => void; onBack: () => void }> = ({ onValidated, onBack }) => {
  const [certs,    setCerts]    = useState<WindowsCert[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [selected, setSelected] = useState<WindowsCert | null>(null);

  useEffect(() => {
    fetch('/api/signer/certs')
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e?.message || 'Erro')))
      .then((data: WindowsCert[]) => { setCerts(data); setLoading(false); })
      .catch((err: any) => { setError(String(err)); setLoading(false); });
  }, []);

  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return iso; } };
  const expired = (d: string) => new Date(d) < new Date();

  return (
    <div className="p-5">
      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#60a5fa' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Lendo certificados...</p>
        </div>
      )}
      {!loading && error && (
        <div className="flex items-start gap-2 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', fontSize: 12, color: 'rgba(239,68,68,0.9)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {!loading && !error && certs.length === 0 && (
        <div className="text-center py-8">
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Nenhum certificado com chave privada encontrado.</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Importe seu certificado A1 no certmgr.msc.</p>
        </div>
      )}
      {!loading && !error && certs.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {certs.map(cert => {
            const exp    = expired(cert.notAfter);
            const active = selected?.thumbprint === cert.thumbprint;
            return (
              <button key={cert.thumbprint} disabled={exp}
                onClick={() => !exp && setSelected(cert)}
                className="w-full text-left rounded-xl p-3.5 transition-all"
                style={{
                  background: active ? 'rgba(37,99,235,0.18)' : 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${active ? 'rgba(37,99,235,0.5)' : exp ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  opacity: exp ? 0.45 : 1, cursor: exp ? 'not-allowed' : 'pointer',
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }} className="truncate">
                      {cert.friendlyName || cert.displayName}
                    </div>
                    {cert.cpf && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>CPF: {cert.cpf}</div>}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }} className="truncate">{cert.issuer}</div>
                    <span style={{
                      fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px',
                      display: 'inline-block', marginTop: 6, padding: '2px 6px', borderRadius: 4,
                      background: exp ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)',
                      color: exp ? 'rgba(239,68,68,0.8)' : '#34d399',
                      border: `0.5px solid ${exp ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}`,
                    }}>
                      {exp ? 'Expirado' : `Válido até ${fmtDate(cert.notAfter)}`}
                    </span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#60a5fa' }} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-3 mt-4">
        <button onClick={onBack}
          className="py-2.5 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:text-white"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          Voltar
        </button>
        <button onClick={() => selected && onValidated({ commonName: selected.commonName, issuer: selected.issuer, expiryDate: new Date(selected.notAfter), thumbprint: selected.thumbprint })}
          disabled={!selected}
          className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: '#2563eb', color: '#fff' }}>
          Prosseguir{selected ? ` com ${(selected.friendlyName || selected.displayName).split(' ')[0]}` : ''}
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const CertificateValidator: React.FC<CertificateValidatorProps> = ({ certFile, onValidated, onBack }) => (
  <div className="max-w-md mx-auto">
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.13)', backdropFilter: 'blur(12px)' }}>
      <div className="p-6 text-center" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(37,99,235,0.2)', border: '0.5px solid rgba(37,99,235,0.4)' }}>
          <ShieldCheck className="w-6 h-6" style={{ color: '#60a5fa' }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Identidade Auris</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.4px', marginTop: 4 }}>
          {certFile ? 'Arquivo .p12 / .pfx' : 'Certificados do Windows'}
        </div>
      </div>
      {certFile
        ? <FileMode certFile={certFile} onValidated={onValidated} onBack={onBack} />
        : <WindowsMode onValidated={onValidated} onBack={onBack} />
      }
    </div>
  </div>
);

export default CertificateValidator;
