import { forwardRef } from 'react';

interface CertProps {
  data: {
    name: string;
    idNum: string;
    role: string;
    email: string;
    dateStr: string;
    pct: string;
    modLabel: string;
    sig: string;
    photo?: string;
  };
}

export const CertificadoDigital = forwardRef<HTMLDivElement, CertProps>(({ data }, ref) => (
  <div
    ref={ref}
    style={{
      width: 794,
      padding: '48px 56px',
      background: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
    }}
  >
    {/* Border frame */}
    <div style={{
      border: '3px solid #1e3a5f',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2447, #1e3a5f)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 4 }}>
            Aliança Tur — SIPAT 2026
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
            Certificado de Conclusão
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '6px 14px',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
        }}>
          Treinamento Obrigatório
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 32px 28px' }}>
        <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 28 }}>
          Certificamos que{' '}
          <strong style={{ color: '#0f172a', fontSize: 15 }}>{data.name}</strong>
          {data.role && (
            <>, atuante no cargo de <strong style={{ color: '#0f172a' }}>{data.role}</strong>,</>
          )}{' '}
          concluiu com êxito o treinamento:
        </div>

        {/* Training title */}
        <div style={{
          background: '#f1f5f9', borderLeft: '4px solid #1e3a5f',
          borderRadius: '0 8px 8px 0', padding: '14px 20px', marginBottom: 28,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
            {data.modLabel}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 24px', marginBottom: 32 }}>
          {([
            ['Matrícula / CPF', data.idNum],
            ['Progresso Assistido', data.pct],
            ['Data de Conclusão', data.dateStr],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Signatures row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          {/* Collaborator signature */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            {data.sig && (
              <img
                src={data.sig}
                alt="Assinatura do colaborador"
                style={{ maxWidth: 200, height: 70, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }}
              />
            )}
            <div style={{ borderTop: '1.5px solid #94a3b8', paddingTop: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{data.name}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Colaborador</div>
            </div>
          </div>

          {/* Photo */}
          {data.photo && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={data.photo}
                alt="Foto do colaborador"
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0', display: 'block', marginBottom: 6 }}
              />
              <div style={{ fontSize: 9, color: '#94a3b8' }}>Registro fotográfico</div>
            </div>
          )}

          {/* SESMT signature */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 70, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} />
            <div style={{ borderTop: '1.5px solid #94a3b8', paddingTop: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Responsável SESMT</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Aliança Tur</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#f8fafc', borderTop: '1px solid #e2e8f0',
        padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Auris Training · Aliança Tur · sesmt@aliancatur.com
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Documento gerado automaticamente — SIPAT 2026
        </div>
      </div>
    </div>
  </div>
));

CertificadoDigital.displayName = 'CertificadoDigital';
