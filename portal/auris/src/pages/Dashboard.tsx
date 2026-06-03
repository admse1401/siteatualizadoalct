import { useState } from 'react';
import { ShieldCheck, FileSignature, CalendarDays, Users, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useAuthStore } from '../stores/authStore';

type BadgeStyle = 'live' | 'new' | 'admin';

interface AppModule {
  path: string;
  name: string;
  description: string;
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  badge: string;
  badgeStyle: BadgeStyle;
}

const modules: AppModule[] = [
  {
    path: '/claims',
    name: 'Auris Claims',
    description: 'Gestão de sinistros e ocorrências',
    Icon: ShieldCheck,
    iconBg: 'rgba(59,130,246,0.2)',
    iconColor: '#93c5fd',
    iconBorder: 'rgba(59,130,246,0.25)',
    badge: 'Ativo',
    badgeStyle: 'live',
  },
  {
    path: '/signer',
    name: 'Auris Signer',
    description: 'Assinatura de documentos em lote',
    Icon: FileSignature,
    iconBg: 'rgba(99,102,241,0.2)',
    iconColor: '#a5b4fc',
    iconBorder: 'rgba(99,102,241,0.25)',
    badge: 'Ativo',
    badgeStyle: 'live',
  },
  {
    path: '/calendar',
    name: 'Auris Calendar',
    description: 'Calendário corporativo automatizado',
    Icon: CalendarDays,
    iconBg: 'rgba(20,184,166,0.18)',
    iconColor: '#5eead4',
    iconBorder: 'rgba(20,184,166,0.25)',
    badge: 'Novo',
    badgeStyle: 'new',
  },
  {
    path: '/admin',
    name: 'Auris Admin',
    description: 'Gestão de usuários e permissões',
    Icon: Users,
    iconBg: 'rgba(168,85,247,0.2)',
    iconColor: '#d8b4fe',
    iconBorder: 'rgba(168,85,247,0.25)',
    badge: 'Admin',
    badgeStyle: 'admin',
  },
  {
    path: '/training',
    name: 'Auris Training',
    description: 'Treinamentos corporativos e certificados',
    Icon: GraduationCap,
    iconBg: 'rgba(16,185,129,0.18)',
    iconColor: '#6ee7b7',
    iconBorder: 'rgba(16,185,129,0.25)',
    badge: 'Novo',
    badgeStyle: 'new',
  },
];

const badgeStyles: Record<BadgeStyle, CSSProperties> = {
  live:  { background: 'rgba(16,185,129,0.15)',  color: '#6ee7b7', border: '0.5px solid rgba(16,185,129,0.25)' },
  new:   { background: 'rgba(99,102,241,0.2)',   color: '#a5b4fc', border: '0.5px solid rgba(99,102,241,0.3)' },
  admin: { background: 'rgba(168,85,247,0.15)',  color: '#d8b4fe', border: '0.5px solid rgba(168,85,247,0.25)' },
};

function AppCard({ mod, index }: { mod: AppModule; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { Icon } = mod;

  return (
    <Link to={mod.path} className="block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.07, duration: 0.3 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="relative overflow-hidden flex flex-col gap-2.5 cursor-pointer"
        style={{
          background: hovered ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)',
          border: `0.5px solid ${hovered ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.13)'}`,
          borderRadius: 16,
          padding: '18px 14px 16px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {/* Top shine line */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
        />

        {/* Icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, borderRadius: 11, background: mod.iconBg, border: `0.5px solid ${mod.iconBorder}` }}
        >
          <Icon size={20} style={{ color: mod.iconColor }} />
        </div>

        {/* Name */}
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{mod.name}</div>

        {/* Description */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{mod.description}</div>

        {/* Badge */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            display: 'inline-flex',
            alignSelf: 'flex-start',
            ...badgeStyles[mod.badgeStyle],
          }}
        >
          {mod.badge}
        </div>
      </motion.div>
    </Link>
  );
}

const ADMIN_ROLES = new Set(['MASTER', 'ADMIN']);

export function Dashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Colaborador';

  const visibleModules = modules.filter(mod =>
    mod.path !== '/admin' || ADMIN_ROLES.has(user?.role ?? '')
  );

  return (
    <div className="flex flex-col h-full" style={{ padding: '28px 24px 20px' }}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0 mb-6"
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.3px', textTransform: 'uppercase', marginBottom: 5 }}>
          Portal do Colaborador
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
          Olá, <span style={{ color: '#60a5fa' }}>{firstName}</span> 👋
        </div>
      </motion.div>

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-shrink-0"
        style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 14 }}
      >
        Seus aplicativos
      </motion.div>

      {/* Apps grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {visibleModules.map((mod, i) => (
          <AppCard key={mod.path} mod={mod} index={i} />
        ))}
      </div>
    </div>
  );
}
