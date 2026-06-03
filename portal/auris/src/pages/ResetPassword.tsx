import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Background } from '../components/layout/Background';
import { CheckCircle } from 'lucide-react';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Erro ao redefinir senha.');
        return;
      }
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2045 100%)', color: '#fff' }}>
        <Background />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Link inválido ou expirado.</div>
          <Link to="/forgot-password" style={{ color: '#60a5fa', fontSize: 14 }}>Solicitar novo link</Link>
        </div>
      </div>
    );
  }

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
          {!done ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Nova senha
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  Defina sua nova senha de acesso ao portal.
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                    Nova senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      background: 'rgba(0,0,0,0.25)', border: '0.5px solid rgba(255,255,255,0.12)',
                      color: '#fff', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.6)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Repita a senha"
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
                  {loading ? 'Salvando...' : 'Redefinir senha'}
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
                Senha redefinida!
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
                Redirecionando para o login...
              </div>
              <Link
                to="/login"
                style={{
                  display: 'inline-block', padding: '10px 24px', borderRadius: 10, fontSize: 13,
                  fontWeight: 600, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
                  border: '0.5px solid rgba(255,255,255,0.13)', textDecoration: 'none',
                }}
              >
                Ir para o login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
