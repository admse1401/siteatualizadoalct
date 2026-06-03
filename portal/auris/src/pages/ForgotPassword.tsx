import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Background } from '../components/layout/Background';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.message ?? 'Ocorreu um erro. Tente novamente.');
      }
    } catch {
      setError('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans text-white"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2045 50%, #0a1a3a 100%)' }}>
      <Background />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
        style={{ padding: '0 20px' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: 24 }}
          >
            <ArrowLeft size={13} /> Voltar ao login
          </Link>

          {!sent ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Esqueci minha senha
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Informe seu e-mail corporativo e enviaremos um link para redefinir sua senha.
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                    E-mail corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="seu@aliancatur.com.br"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      background: 'rgba(0,0,0,0.25)', border: '0.5px solid rgba(255,255,255,0.12)',
                      color: '#fff', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.6)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  />
                </div>

                {error && (
                  <div style={{ fontSize: 12, color: '#fca5a5', padding: '9px 13px', background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{
                    width: '100%', padding: '13px 0', marginTop: 4, borderRadius: 11, border: 'none',
                    background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.35)',
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '8px 0' }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 52, height: 52, borderRadius: '50%', marginBottom: 16,
                background: 'rgba(52,211,153,0.1)', border: '0.5px solid rgba(52,211,153,0.25)',
              }}>
                <CheckCircle size={24} style={{ color: '#34d399' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Link enviado!
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 24 }}>
                Se o e-mail <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong> estiver cadastrado,
                você receberá as instruções em breve. Verifique também a pasta de spam.
              </div>
              <Link
                to="/login"
                style={{
                  display: 'inline-block', padding: '10px 24px', borderRadius: 10, fontSize: 13,
                  fontWeight: 600, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.13)', textDecoration: 'none',
                }}
              >
                Voltar ao login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
