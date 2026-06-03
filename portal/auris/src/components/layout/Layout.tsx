import { useState } from 'react';
import type { ElementType } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Bot, User, Image, Lock, Settings, LogOut, ShieldCheck, FileSignature, CalendarDays, Users } from 'lucide-react';
import { Header } from './Header';
import { Background } from './Background';
import { useAuthStore } from '../../stores/authStore';

type ModuleKey = '/claims' | '/signer' | '/calendar' | '/admin';

const moduleInfo: Record<ModuleKey, { name: string; Icon: ElementType; iconColor: string; reminder: string }> = {
  '/claims':   { name: 'Auris Claims',   Icon: ShieldCheck,    iconColor: '#93c5fd', reminder: 'Sinistro #0041 aguarda sua análise' },
  '/signer':   { name: 'Auris Signer',   Icon: FileSignature,  iconColor: '#a5b4fc', reminder: '3 documentos aguardam sua assinatura' },
  '/calendar': { name: 'Auris Calendar', Icon: CalendarDays,   iconColor: '#5eead4', reminder: 'Reunião de operações às 14h — Sala B' },
  '/admin':    { name: 'Auris Admin',    Icon: Users,          iconColor: '#d8b4fe', reminder: 'Painel de administração do sistema' },
};

function getModuleKey(pathname: string): ModuleKey | null {
  for (const key of Object.keys(moduleInfo) as ModuleKey[]) {
    if (pathname.startsWith(key)) return key;
  }
  return null;
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aiOpen, setAiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();

  const displayName = user?.name ?? 'Usuário';
  const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const subtitle = [user?.jobTitle, user?.department].filter(Boolean).join(' · ') || 'Portal do Colaborador';

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const isDashboard = location.pathname === '/';
  const moduleKey = getModuleKey(location.pathname);
  const currentModule = moduleKey ? moduleInfo[moduleKey] : null;

  function toggleAI() {
    setAiOpen(v => !v);
    setProfileOpen(false);
  }
  function toggleProfile() {
    setProfileOpen(v => !v);
    setAiOpen(false);
  }
  function closeAll() {
    setAiOpen(false);
    setProfileOpen(false);
  }

  return (
    <div
      className="min-h-screen font-sans text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2045 50%, #0a1a3a 100%)' }}
      onClick={closeAll}
    >
      <Background />

      <div className="relative z-10 flex flex-col h-screen">
        <div onClick={e => e.stopPropagation()}>
          <Header onToggleAI={toggleAI} onToggleProfile={toggleProfile} />
        </div>

        {/* Floating panels */}
        <AnimatePresence>
          {aiOpen && (
            <motion.div
              key="ai-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-4 z-[300]"
              style={{ top: 62, width: 270, padding: 18, borderRadius: 14, backdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.13)', background: 'rgba(13,32,69,0.95)' }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Bot className="w-3.5 h-3.5 text-white/70" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Assistente Auris</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>IA corporativa — em breve</div>
              <div style={{ fontSize: 12, padding: '10px 12px', borderRadius: 10, lineHeight: 1.5, marginBottom: 12, background: 'rgba(59,130,246,0.15)', color: 'rgba(255,255,255,0.82)', border: '0.5px solid rgba(59,130,246,0.2)' }}>
                Olá, João! Como posso ajudar você hoje?
              </div>
              <div className="flex gap-2 items-center">
                <input
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#fff', outline: 'none' }}
                  placeholder="Digite sua pergunta..."
                />
                <button
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 28, height: 28, background: '#2563eb', border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer' }}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}

          {profileOpen && (
            <motion.div
              key="profile-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-4 z-[300]"
              style={{ top: 62, width: 210, borderRadius: 14, overflow: 'hidden', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.13)', background: 'rgba(13,32,69,0.95)' }}
            >
              <div className="flex items-center gap-2.5" style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', fontSize: 11, fontWeight: 700, color: '#fff' }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{subtitle}</div>
                </div>
              </div>
              <div style={{ padding: '6px 0' }}>
                {[
                  { Icon: User,     label: 'Meu perfil' },
                  { Icon: Image,    label: 'Foto de perfil' },
                  { Icon: Lock,     label: 'Alterar senha' },
                  { Icon: Settings, label: 'Preferências' },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-2.5 hover:bg-white/[0.07] transition-colors hover:text-white"
                    style={{ padding: '8px 14px', fontSize: 12, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left' }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </button>
                ))}
                <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
                <button
                  className="w-full flex items-center gap-2.5 hover:bg-white/[0.07] transition-colors"
                  style={{ padding: '8px 14px', fontSize: 12, color: 'rgba(239,68,68,0.75)', cursor: 'pointer', border: 'none', background: 'transparent', textAlign: 'left' }}
                  onClick={handleLogout}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.75)')}
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* App greeting bar */}
          <AnimatePresence initial={false}>
            {!isDashboard && currentModule && (
              <motion.div
                key="greeting-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-shrink-0 flex items-center justify-between"
                style={{ padding: '20px 24px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex flex-col gap-0.5">
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    Olá, <span style={{ color: '#60a5fa' }}>{displayName.split(' ')[0]}</span> 👋
                  </div>
                  <div
                    className="flex items-center gap-1.5 mt-1.5"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '0.5px solid rgba(59,130,246,0.22)', borderRadius: 8, padding: '6px 11px', fontSize: 11, color: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', maxWidth: 280 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] flex-shrink-0" />
                    <span>{currentModule.reminder}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 transition-all hover:bg-white/10 hover:text-white"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', padding: '5px 9px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Voltar
                  </button>
                  <div
                    className="flex items-center gap-2"
                    style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20 }}
                  >
                    <currentModule.Icon className="w-3.5 h-3.5" style={{ color: currentModule.iconColor }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{currentModule.name}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Route content */}
          <div
            className="flex-1 overflow-auto"
            style={!isDashboard ? { background: 'rgba(10,22,40,0.55)', backdropFilter: 'blur(2px)' } : {}}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
