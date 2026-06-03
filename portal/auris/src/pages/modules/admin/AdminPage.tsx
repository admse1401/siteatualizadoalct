import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Edit2, Lock, Loader2, Plus, Trash2, Unlock, X } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  name: string;
  email: string;
  matricula: string | null;
  role: string;
  jobTitle: string | null;
  setor: string | null;
  department: string | null;
  phone: string | null;
  birthDate: string | null;
  obra: string | null;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

interface RoleOption {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{ permission: { key: string; description: string | null } }>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SETOR_OPTIONS   = ['RH', 'SESMT', 'TI', 'DP'];
const DEPT_OPTIONS    = ['Operacional', 'Financeiro', 'Administrativo'];

const MODULE_MAP = [
  { prefix: 'admin',    label: 'Auris Admin'  },
  { prefix: 'training', label: 'Treinamento'  },
  { prefix: 'claims',   label: 'Sinistros'    },
  { prefix: 'calendar', label: 'Calendário'   },
  { prefix: 'signer',   label: 'Assinador'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  MASTER: { bg: 'rgba(168,85,247,0.18)',  color: '#d8b4fe', border: 'rgba(168,85,247,0.4)' },
  ADMIN:  { bg: 'rgba(37,99,235,0.18)',   color: '#93c5fd', border: 'rgba(37,99,235,0.4)'  },
  USER:   { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' },
};

function calcAge(isoDate: string | null): string {
  if (!isoDate) return '';
  const years = Math.floor((Date.now() - new Date(isoDate).getTime()) / 31_557_600_000);
  return `${years} anos`;
}

function getModuleAccess(role: RoleOption | undefined): string[] {
  if (!role) return [];
  const keys = role.permissions.map(p => p.permission.key);
  return MODULE_MAP
    .filter(m => keys.some(k => k.startsWith(m.prefix + '.')))
    .map(m => m.label);
}

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.USER;
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.7px',
      padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
    }}>
      {role}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#fff',
    }}>
      {initials}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13,
  background: 'rgba(0,0,0,0.3)', border: '0.5px solid rgba(255,255,255,0.12)',
  color: '#fff', outline: 'none', boxSizing: 'border-box',
};
const LABEL: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'rgba(255,255,255,0.4)', marginBottom: 5,
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(37,99,235,0.6)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'create' | 'edit';
  target: UserRow | null;
  roles: RoleOption[];
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ mode, target, roles, token, onClose, onSaved }: ModalProps) {
  const [name,       setName]       = useState(target?.name       ?? '');
  const [email,      setEmail]      = useState(target?.email      ?? '');
  const [jobTitle,   setJobTitle]   = useState(target?.jobTitle   ?? '');
  const [setor,      setSetor]      = useState(target?.setor      ?? '');
  const [department, setDepartment] = useState(target?.department ?? '');
  const [phone,      setPhone]      = useState(target?.phone      ?? '');
  const [birthDate,  setBirthDate]  = useState(
    target?.birthDate ? target.birthDate.slice(0, 10) : ''
  );
  const [obra,       setObra]       = useState(target?.obra       ?? '');
  const [role,       setRole]       = useState(target?.role       ?? 'USER');
  const [isActive,   setIsActive]   = useState(target?.isActive   ?? true);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const selectedRole = roles.find(r => r.name === role);
  const modules      = getModuleAccess(selectedRole);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url    = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${target!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const body   = {
        name,
        email,
        jobTitle:   jobTitle   || undefined,
        setor:      setor      || undefined,
        department: department || undefined,
        phone:      phone      || undefined,
        birthDate:  birthDate  || undefined,
        obra:       obra       || undefined,
        role,
        ...(mode === 'edit' && { isActive }),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.message ?? 'Erro ao salvar.');
        return;
      }
      onSaved();
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.18 }}
        style={{ width: 520, maxHeight: '90vh', overflowY: 'auto', borderRadius: 14, background: 'rgba(8,18,36,0.98)', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.13)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 18px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,18,36,0.98)', zIndex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Nome */}
          <div>
            <label style={LABEL}>Nome completo</label>
            <input style={INPUT} value={name} onChange={e => setName(e.target.value)} required onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* E-mail */}
          <div>
            <label style={LABEL}>E-mail corporativo</label>
            <input type="email" style={INPUT} value={email} onChange={e => setEmail(e.target.value)} required onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Cargo + Setor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={LABEL}>Cargo</label>
              <input style={INPUT} value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Ex: Analista de RH" onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={LABEL}>Setor</label>
              <select style={{ ...INPUT, cursor: 'pointer' }} value={setor} onChange={e => setSetor(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                <option value="" style={{ background: '#0d2045' }}>Selecionar...</option>
                {SETOR_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#0d2045' }}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Departamento + Obra */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={LABEL}>Departamento</label>
              <select style={{ ...INPUT, cursor: 'pointer' }} value={department} onChange={e => setDepartment(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                <option value="" style={{ background: '#0d2045' }}>Selecionar...</option>
                {DEPT_OPTIONS.map(d => <option key={d} value={d} style={{ background: '#0d2045' }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Obra</label>
              <input style={INPUT} value={obra} onChange={e => setObra(e.target.value)} placeholder="Ex: Obra São Paulo" onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Celular + Nascimento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={LABEL}>Celular</label>
              <input style={INPUT} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={LABEL}>
                Data de nascimento
                {birthDate && (
                  <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
                    {calcAge(birthDate)}
                  </span>
                )}
              </label>
              <input type="date" style={{ ...INPUT, colorScheme: 'dark' }} value={birthDate} onChange={e => setBirthDate(e.target.value)} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={LABEL}>Perfil de acesso</label>
            <select style={{ ...INPUT, cursor: 'pointer' }} value={role} onChange={e => setRole(e.target.value)} onFocus={onFocus} onBlur={onBlur}>
              {roles.map(r => (
                <option key={r.id} value={r.name} style={{ background: '#0d2045' }}>
                  {r.name}{r.description ? ` — ${r.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Module access chips */}
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 12px', border: '0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
              Módulos acessíveis com este perfil
            </div>
            {modules.length === 0 ? (
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Sem módulos</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {modules.map(m => (
                  <span key={m} style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(37,99,235,0.15)', color: '#93c5fd',
                    border: '0.5px solid rgba(37,99,235,0.35)',
                  }}>
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status (edit only) */}
          {mode === 'edit' && (
            <div>
              <label style={LABEL}>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([{ v: true, label: 'Ativo' }, { v: false, label: 'Bloqueado' }] as const).map(opt => (
                  <button
                    key={String(opt.v)} type="button"
                    onClick={() => setIsActive(opt.v)}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border:      isActive === opt.v ? '0.5px solid rgba(37,99,235,0.6)' : '0.5px solid rgba(255,255,255,0.12)',
                      background:  isActive === opt.v ? 'rgba(37,99,235,0.2)'              : 'rgba(0,0,0,0.25)',
                      color:       isActive === opt.v ? '#93c5fd'                          : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: '#fca5a5', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', borderRadius: 8, display: 'flex', gap: 7, alignItems: 'center' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '0.5px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', border: 'none', background: loading ? 'rgba(37,99,235,0.5)' : '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}>
              {loading && <Loader2 size={13} className="animate-spin" />}
              {mode === 'create' ? 'Criar & Enviar Convite' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const { accessToken } = useAuthStore();

  const [users,      setUsers]      = useState<UserRow[]>([]);
  const [roles,      setRoles]      = useState<RoleOption[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [blockingId,  setBlockingId]  = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  async function loadData() {
    setLoading(true);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const [uRes, rRes] = await Promise.all([
      fetch('/api/admin/users', { headers }),
      fetch('/api/admin/roles', { headers }),
    ]);
    if (uRes.ok) setUsers(await uRes.json());
    if (rRes.ok) setRoles(await rRes.json());
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(userId: string) {
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) { setConfirmDelete(null); await loadData(); }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBlock(userId: string) {
    setBlockingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) await loadData();
    } finally {
      setBlockingId(null);
    }
  }

  const COL = '2fr 2fr 1.5fr 1.2fr 1fr 1fr 100px';

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Usuários</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {loading ? '...' : `${users.length} ${users.length === 1 ? 'colaborador' : 'colaboradores'} cadastrados`}
          </div>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModal('create'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.35)', flexShrink: 0 }}
        >
          <Plus size={14} />
          Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(6,15,30,0.85)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          {['Usuário', 'E-mail', 'Cargo', 'Setor', 'Role', 'Status', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.9px' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Loader2 size={15} className="animate-spin" /> Carregando...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Nenhum usuário cadastrado
          </div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              style={{ display: 'grid', gridTemplateColumns: COL, padding: '12px 16px', alignItems: 'center', borderBottom: i < users.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Avatar name={u.name} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
              </div>

              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.jobTitle ?? '—'}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.setor ?? '—'}</span>

              <RoleBadge role={u.role} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: u.isActive ? '#34d399' : 'rgba(239,68,68,0.65)' }} />
                <span style={{ fontSize: 11, color: u.isActive ? '#6ee7b7' : 'rgba(239,68,68,0.65)' }}>
                  {u.isActive ? 'Ativo' : 'Bloqueado'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  title="Editar"
                  onClick={() => { setEditTarget(u); setModal('edit'); }}
                  style={{ width: 28, height: 28, borderRadius: 7, border: '0.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <Edit2 size={12} />
                </button>
                <button
                  title={u.isActive ? 'Bloquear' : 'Desbloquear'}
                  disabled={blockingId === u.id}
                  onClick={() => handleBlock(u.id)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: `0.5px solid ${u.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.3)'}`, background: u.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.08)', color: u.isActive ? 'rgba(239,68,68,0.7)' : '#6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: blockingId === u.id ? 'wait' : 'pointer', transition: 'all 0.15s' }}
                >
                  {blockingId === u.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : u.isActive ? <Lock size={12} /> : <Unlock size={12} />
                  }
                </button>
                <button
                  title="Excluir"
                  onClick={() => setConfirmDelete(u)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: '0.5px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: 'rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.5)'; }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <UserModal
            key={modal === 'create' ? 'modal-create' : `modal-edit-${editTarget?.id}`}
            mode={modal}
            target={editTarget}
            roles={roles}
            token={accessToken ?? ''}
            onClose={() => { setModal(null); setEditTarget(null); }}
            onSaved={() => { setModal(null); setEditTarget(null); loadData(); }}
          />
        )}

        {confirmDelete && (
          <motion.div
            key="confirm-delete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              style={{ width: 380, borderRadius: 14, background: 'rgba(8,18,36,0.98)', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(239,68,68,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', padding: '22px 22px 18px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Excluir usuário</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
                Tem certeza que deseja excluir <strong style={{ color: '#fff' }}>{confirmDelete.name}</strong>?
                <br />Esta ação não pode ser desfeita.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '0.5px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)' }}
                >
                  Cancelar
                </button>
                <button
                  disabled={deletingId === confirmDelete.id}
                  onClick={() => handleDelete(confirmDelete.id)}
                  style={{ flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: deletingId === confirmDelete.id ? 'wait' : 'pointer', border: 'none', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {deletingId === confirmDelete.id
                    ? <><Loader2 size={13} className="animate-spin" /> Excluindo...</>
                    : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
