import { useState, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, Lock, Download, Mail,
  Camera, X, RotateCcw, GraduationCap,
} from 'lucide-react';
import { useSignature } from './hooks/useSignature';
import { CertificadoDigital } from './components/CertificadoDigital';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ─── Config ────────────────────────────────────────────────────────────────────
const CONFIG = {
  moduloNumero: 'Módulo 1',
  moduloTema: 'Mais Conhecimentos, Menos Conflitos: Segurança no Trabalho',
  videoSrc: '/videos/modulo1.mp4',
  minPct: 75,
  sesmtEmail: 'sesmt@aliancatur.com',
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
type Step = 'video' | 'sign' | 'cert';

interface CertData {
  name: string;
  idNum: string;
  role: string;
  email: string;
  pct: string;
  dateStr: string;
  modLabel: string;
  sig: string;
  photo?: string;
}

// ─── Design token ──────────────────────────────────────────────────────────────
const glass = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '0.5px solid rgba(255,255,255,0.13)',
  borderRadius: 16,
} as const;

// ─── StepIndicator ─────────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string }[] = [
  { id: 'video', label: 'Conteúdo' },
  { id: 'sign',  label: 'Assinatura' },
  { id: 'cert',  label: 'Certificado' },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {STEPS.map((s, i) => (
        <Fragment key={s.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <motion.div
              animate={{
                background: i <= idx ? '#2563eb' : 'rgba(255,255,255,0.08)',
                borderColor: i <= idx ? '#2563eb' : 'rgba(255,255,255,0.18)',
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 26, height: 26, borderRadius: '50%', border: '1.5px solid',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >
              {i < idx ? '✓' : i + 1}
            </motion.div>
            <span style={{
              fontSize: 12, fontWeight: 500,
              color: i <= idx ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.28)',
              transition: 'color 0.3s',
            }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <motion.div
              animate={{ background: i < idx ? '#2563eb' : 'rgba(255,255,255,0.1)' }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, height: 1, margin: '0 10px' }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function TrainingPage() {
  const [step, setStep]       = useState<Step>('video');
  const [pct, setPct]         = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [skipWarn, setSkipWarn] = useState(false);
  const [form, setForm]       = useState({ name: '', idNum: '', role: '', declared: false });
  const [certData, setCertData] = useState<CertData | null>(null);
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const maxWatchedRef  = useRef(0);
  const certRef        = useRef<HTMLDivElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasSnapRef  = useRef<HTMLCanvasElement>(null);

  const sig = useSignature();

  // ── Video progress tracking ──────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const cur = video.currentTime;

    if (cur > maxWatchedRef.current + 2) {
      video.currentTime = maxWatchedRef.current;
      setSkipWarn(true);
      setTimeout(() => setSkipWarn(false), 2500);
    } else if (cur > maxWatchedRef.current) {
      maxWatchedRef.current = cur;
    }

    const p = Math.min(100, Math.round((maxWatchedRef.current / video.duration) * 100)) || 0;
    setPct(p);
    if (p >= CONFIG.minPct && !unlocked) setUnlocked(true);
  };

  // ── Camera ───────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }
    } catch {
      setShowCamera(false);
      alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const snapPhoto = () => {
    const video = videoPreviewRef.current;
    const canvas = canvasSnapRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setPhotoSrc(canvas.toDataURL('image/jpeg', 0.85));
    closeCamera();
  };

  // ── Submit → cert ────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.name.trim() || !form.idNum.trim() || !form.declared || !sig.hasSig) {
      alert('Preencha todos os campos obrigatórios, aceite a declaração e assine.');
      return;
    }
    setCertData({
      name: form.name,
      idNum: form.idNum,
      role: form.role,
      email: '',
      pct: `${pct}%`,
      dateStr: new Date().toLocaleString('pt-BR'),
      modLabel: CONFIG.moduloTema,
      sig: sig.canvasRef.current?.toDataURL('image/png') ?? '',
      photo: photoSrc ?? undefined,
    });
    setStep('cert');
    window.scrollTo(0, 0);
  };

  // ── PDF download ─────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!certRef.current || !certData) return;
    setPdfLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await (html2canvas as any)(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      }) as HTMLCanvasElement;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const props = pdf.getImageProperties(imgData);
      const imgH  = (props.height * pageW) / props.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, imgH);
      pdf.save(`Certificado_SIPAT_${certData.name.replace(/\s+/g, '_')}.pdf`);
    } catch {
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'rgba(16,185,129,0.15)', border: '0.5px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={16} style={{ color: '#6ee7b7' }} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.3px', textTransform: 'uppercase' }}>
            Auris Training · SIPAT 2026
          </div>
          <div style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(245,158,11,0.12)', color: '#fcd34d',
            border: '0.5px solid rgba(245,158,11,0.22)', flexShrink: 0,
          }}>
            Obrigatório
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
          {CONFIG.moduloTema}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>
          {CONFIG.moduloNumero}
        </div>
      </motion.div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">

        {/* ── VIDEO STEP ─────────────────────────────────────────────────────── */}
        {step === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ ...glass, padding: 20 }}>
              {/* Player */}
              <div style={{
                position: 'relative', borderRadius: 10, overflow: 'hidden',
                background: '#000', aspectRatio: '16/9', marginBottom: 18,
              }}>
                <video
                  ref={videoRef}
                  onTimeUpdate={handleTimeUpdate}
                  controls
                  controlsList="nodownload"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  <source src={CONFIG.videoSrc} type="video/mp4" />
                </video>
                <AnimatePresence>
                  {skipWarn && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(220,38,38,0.9)', color: '#fff',
                        padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', pointerEvents: 'none',
                      }}
                    >
                      ⚠ Avançar no vídeo não é permitido
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Progresso assistido</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: pct >= CONFIG.minPct ? '#34d399' : '#60a5fa', transition: 'color 0.3s' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'visible', marginBottom: 28 }}>
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ ease: 'easeOut', duration: 0.4 }}
                  style={{
                    height: '100%', borderRadius: 999,
                    background: pct >= CONFIG.minPct
                      ? 'linear-gradient(90deg, #1d4ed8, #34d399)'
                      : 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
                    transition: 'background 0.5s',
                  }}
                />
                {/* 75% marker */}
                <div style={{
                  position: 'absolute', left: `${CONFIG.minPct}%`, top: -5, bottom: -5,
                  width: 1.5, background: 'rgba(255,255,255,0.3)', borderRadius: 1,
                }}>
                  <div style={{
                    position: 'absolute', bottom: -19, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 9, color: 'rgba(255,255,255,0.32)', whiteSpace: 'nowrap',
                  }}>
                    {CONFIG.minPct}%
                  </div>
                </div>
              </div>

              {/* Advance button */}
              <motion.button
                animate={{
                  background: unlocked
                    ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                    : 'rgba(255,255,255,0.05)',
                }}
                transition={{ duration: 0.3 }}
                whileHover={unlocked ? { scale: 1.01 } : {}}
                whileTap={unlocked ? { scale: 0.97 } : {}}
                onClick={() => unlocked && setStep('sign')}
                style={{
                  width: '100%', padding: '13px 0', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  color: unlocked ? '#fff' : 'rgba(255,255,255,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  transition: 'color 0.3s',
                }}
              >
                {unlocked ? (
                  <>Avançar para Assinatura <span>→</span></>
                ) : (
                  <><Lock size={13} /> Assista {CONFIG.minPct}% do vídeo para avançar ({pct}/{CONFIG.minPct}%)</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── SIGN STEP ──────────────────────────────────────────────────────── */}
        {step === 'sign' && (
          <motion.div
            key="sign"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ ...glass, padding: 24 }}>

              {/* Form fields */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
                  Dados para o certificado
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                        background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.14)',
                        color: '#fff', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>
                        Matrícula / CPF *
                      </label>
                      <input
                        type="text"
                        value={form.idNum}
                        onChange={e => setForm(f => ({ ...f, idNum: e.target.value }))}
                        placeholder="000.000.000-00"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                          background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.14)',
                          color: '#fff', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        placeholder="Seu cargo"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
                          background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.14)',
                          color: '#fff', outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                marginBottom: 22, padding: '11px 13px',
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
              }}>
                <input
                  type="checkbox"
                  checked={form.declared}
                  onChange={e => setForm(f => ({ ...f, declared: e.target.checked }))}
                  style={{ marginTop: 2, accentColor: '#2563eb', flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.58)', lineHeight: 1.55 }}>
                  Declaro que assisti e compreendi o conteúdo do treinamento e que as informações fornecidas são verdadeiras.
                </span>
              </label>

              {/* Signature canvas */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Assinatura Digital *</div>
                  <button
                    onClick={sig.clear}
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RotateCcw size={11} /> Limpar
                  </button>
                </div>
                <div style={{
                  borderRadius: 9, overflow: 'hidden',
                  border: `1px solid ${sig.hasSig ? 'rgba(37,99,235,0.45)' : 'rgba(255,255,255,0.12)'}`,
                  background: 'rgba(248,250,255,0.97)',
                  transition: 'border-color 0.25s',
                }}>
                  <canvas
                    ref={sig.canvasRef}
                    width={680}
                    height={130}
                    style={{ display: 'block', width: '100%', height: 130, cursor: 'crosshair', touchAction: 'none' }}
                    onMouseDown={sig.startDrawing}
                    onMouseMove={sig.draw}
                    onMouseUp={sig.stopDrawing}
                    onMouseLeave={sig.stopDrawing}
                    onTouchStart={e => { e.preventDefault(); sig.startDrawing(e); }}
                    onTouchMove={e => { e.preventDefault(); sig.draw(e); }}
                    onTouchEnd={sig.stopDrawing}
                  />
                </div>
                {!sig.hasSig && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5, textAlign: 'center' }}>
                    Assine acima com o mouse ou toque
                  </div>
                )}
              </div>

              {/* Optional photo */}
              <div style={{
                marginBottom: 22, padding: 14,
                background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 9 }}>
                  Foto de Registro{' '}
                  <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.28)' }}>(opcional)</span>
                </div>
                {photoSrc ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={photoSrc}
                      alt="Foto registrada"
                      style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                    <div>
                      <div style={{ fontSize: 11, color: '#34d399', marginBottom: 5 }}>✓ Foto registrada</div>
                      <button
                        onClick={() => setPhotoSrc(null)}
                        style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openCamera}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, color: '#60a5fa', background: 'none',
                      border: '0.5px solid rgba(96,165,250,0.3)', borderRadius: 7,
                      padding: '7px 14px', cursor: 'pointer',
                    }}
                  >
                    <Camera size={13} /> Registrar foto
                  </button>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileHover={sig.hasSig ? { scale: 1.01 } : {}}
                whileTap={sig.hasSig ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                style={{
                  width: '100%', padding: '13px 0', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                  background: sig.hasSig ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(255,255,255,0.05)',
                  color: sig.hasSig ? '#fff' : 'rgba(255,255,255,0.2)',
                  cursor: sig.hasSig ? 'pointer' : 'not-allowed',
                }}
              >
                Gerar Certificado →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── CERT STEP ──────────────────────────────────────────────────────── */}
        {step === 'cert' && certData && (
          <motion.div
            key="cert"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ ...glass, padding: 24 }}>
              {/* Success banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22,
                padding: '13px 16px',
                background: 'rgba(52,211,153,0.08)', border: '0.5px solid rgba(52,211,153,0.22)',
                borderRadius: 10,
              }}>
                <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>
                    Treinamento Concluído!
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>
                    Certificado gerado em {certData.dateStr}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.09)',
                borderRadius: 10, padding: '16px 18px', marginBottom: 20,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12,
                }}>
                  Resumo do Certificado
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {([
                    ['Colaborador',       certData.name],
                    ['Matrícula / CPF',   certData.idNum],
                    ['Cargo',             certData.role || '—'],
                    ['Progresso',         certData.pct],
                    ['Data de Conclusão', certData.dateStr],
                    ['Treinamento',       certData.modLabel],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
                    </div>
                  ))}
                </div>
                {certData.photo && (
                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <img
                      src={certData.photo}
                      alt="Foto"
                      style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                    <span style={{ fontSize: 11, color: '#34d399' }}>✓ Foto de registro incluída</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={downloadPDF}
                  disabled={pdfLoading}
                  style={{
                    flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: pdfLoading ? 'wait' : 'pointer',
                  }}
                >
                  <Download size={14} />
                  {pdfLoading ? 'Gerando...' : 'Baixar Certificado'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.62)',
                    border: '0.5px solid rgba(255,255,255,0.13)',
                    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Mail size={14} />
                  Enviar ao SESMT
                </motion.button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center' }}>
                Envio para: {CONFIG.sesmtEmail}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(2,8,22,0.9)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.93, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
              style={{ ...glass, padding: 24, maxWidth: 460, width: '100%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Registrar Foto</div>
                <button onClick={closeCamera} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.42)', cursor: 'pointer', lineHeight: 0 }}>
                  <X size={18} />
                </button>
              </div>
              <video
                ref={videoPreviewRef}
                autoPlay playsInline muted
                style={{ width: '100%', borderRadius: 10, background: '#000', display: 'block' }}
              />
              <canvas ref={canvasSnapRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  onClick={snapPhoto}
                  style={{
                    flex: 1, padding: '11px 0',
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Camera size={14} /> Capturar
                </button>
                <button
                  onClick={closeCamera}
                  style={{
                    padding: '11px 16px',
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.52)',
                    border: '0.5px solid rgba(255,255,255,0.13)', borderRadius: 10,
                    fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Off-screen certificate for PDF capture */}
      {certData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: 794 }}>
          <CertificadoDigital ref={certRef} data={certData} />
        </div>
      )}
    </div>
  );
}
