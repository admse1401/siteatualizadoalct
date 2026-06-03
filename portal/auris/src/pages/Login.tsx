import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { Background } from '../components/layout/Background';
import { useAuthStore } from '../stores/authStore';

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [identifier, setIdentifier] = useState('admin@aliancatur.com.br');
  const [password, setPassword]     = useState('Admin@123');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Credenciais inválidas');
        return;
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/');
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
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 13, marginBottom: 14,
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
              fontSize: 20, fontWeight: 800, color: '#fff',
            }}>
              A
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Auris Toolbox
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Portal do Colaborador — Aliança Tur
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                E-mail ou Matrícula
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                placeholder="seu@email.com ou matrícula"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(0,0,0,0.25)', border: `0.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#fff', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.6)'; }}
                onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
                  Senha
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(0,0,0,0.25)', border: `0.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  color: '#fff', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(37,99,235,0.6)'; }}
                onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'; }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 12, color: '#fca5a5', padding: '9px 13px',
                  background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)',
                  borderRadius: 8,
                }}
              >
                {error}
              </motion.div>
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
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
