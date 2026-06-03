import { useRef, useState, ChangeEvent, FormEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Briefcase, CheckCircle, AlertCircle, Loader2, Users, Award, TrendingUp, Heart } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface JobForm {
  nome: string;
  email: string;
  tel: string;
  cidade: string;
  cargo: string;
  cnh: string;
  experiencia: string;
  apresentacao: string;
}

const INITIAL: JobForm = { nome: '', email: '', tel: '', cidade: '', cargo: '', cnh: '', experiencia: '', apresentacao: '' };

const beneficios = [
  { icon: <Award size={22} />,      title: 'Plano de carreira',     desc: 'Crescimento estruturado e meritocrático.' },
  { icon: <Heart size={22} />,      title: 'Plano de saúde',        desc: 'Cobertura para você e sua família.'       },
  { icon: <TrendingUp size={22} />, title: 'Treinamento contínuo',  desc: 'Capacitações técnicas e comportamentais.' },
  { icon: <Users size={22} />,      title: 'Equipe unida',          desc: 'Ambiente colaborativo e respeitoso.'      },
];

export default function TrabalheConosco() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [data, setData]   = useState<JobForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<JobForm>>({});

  useGSAP(() => {
    gsap.from('.jobs-benefit', {
      scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    });
    gsap.from('.jobs-heading > *', {
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
    });
    if (formRef.current) {
      gsap.from(formRef.current.querySelectorAll('.job-input-group'), {
        scrollTrigger: { trigger: formRef.current, start: 'top 75%' },
        y: 30, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
      });
    }
  }, { scope: sectionRef });

  const validate = (): boolean => {
    const e: Partial<JobForm> = {};
    if (!data.nome.trim())    e.nome    = 'Campo obrigatório';
    if (!data.email.trim())   e.email   = 'Campo obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'E-mail inválido';
    if (!data.tel.trim())     e.tel     = 'Campo obrigatório';
    if (!data.cidade.trim())  e.cidade  = 'Campo obrigatório';
    if (!data.cargo)          e.cargo   = 'Selecione um cargo';
    if (!data.apresentacao.trim()) e.apresentacao = 'Campo obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormState('loading');
    console.log('[TrabalheConosco] Enviando candidatura:', data);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status} — ${body.error ?? 'sem detalhe'}`);
      }
      console.log('[TrabalheConosco] ✅ Candidatura enviada com sucesso');
      setFormState('success');
      setData(INITIAL);
    } catch (err) {
      console.error('[TrabalheConosco] ❌ Falha ao enviar candidatura:', err);
      setFormState('error');
    }
  };

  const inputBase = (id: keyof JobForm) =>
    `w-full bg-transparent border-b ${errors[id] ? 'border-red-400' : 'border-white/20'} py-3 text-brand-light placeholder-transparent focus:outline-none focus:border-transparent peer transition-colors`;

  const labelClass = 'absolute left-0 top-3 text-brand-gray/60 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent-gold peer-valid:-top-4 peer-valid:text-xs peer-valid:text-accent-gold pointer-events-none';
  const lineClass  = 'absolute bottom-0 left-1/2 w-0 h-[2px] bg-accent-gold transition-all duration-300 peer-focus:w-full peer-focus:left-0';

  return (
    <section id="trabalhe-conosco" ref={sectionRef} className="py-32 bg-brand-secondary relative border-t border-white/5 overflow-hidden">

      {/* Grid background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* Header */}
        <div className="jobs-heading text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold tracking-[0.25em] uppercase px-5 py-2 rounded-full mb-6">
            <Briefcase size={14} /> Faça Parte do Time
          </div>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-brand-light mb-6">
            Trabalhe <span className="text-accent-gold">Conosco</span>
          </h2>
          <p className="text-brand-gray max-w-2xl mx-auto text-lg font-light leading-relaxed">
            A Aliança Tur cresce com pessoas comprometidas com excelência. Se você tem paixão pelo que faz e quer fazer parte de uma empresa sólida, envie sua candidatura.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {beneficios.map(({ icon, title, desc }, i) => (
            <div key={i} className="jobs-benefit bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-accent-gold/30 hover:bg-white/8 transition-all duration-300 group">
              <div className="text-accent-gold mb-3 flex justify-center group-hover:scale-110 transition-transform duration-300">{icon}</div>
              <h5 className="font-montserrat font-bold text-brand-light text-sm mb-2">{title}</h5>
              <p className="text-brand-gray/70 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto bg-brand-overlay/80 backdrop-blur-sm border border-white/8 rounded-3xl p-8 lg:p-14 shadow-2xl">
          <h3 className="font-montserrat font-bold text-brand-light text-2xl mb-2">Envie sua Candidatura</h3>
          <p className="text-brand-gray/70 text-sm mb-10">Campos marcados com * são obrigatórios.</p>

          {formState === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-accent-gold/10 p-6 rounded-full mb-6">
                <CheckCircle className="text-accent-gold" size={56} />
              </div>
              <h3 className="text-2xl font-montserrat font-bold text-brand-light mb-3">Candidatura Enviada!</h3>
              <p className="text-brand-gray mb-8 max-w-sm">Recebemos seu perfil. Se houver vaga compatível, entraremos em contato.</p>
              <button onClick={() => setFormState('idle')} className="text-accent-gold underline underline-offset-4 text-sm hover:opacity-80 transition-opacity">
                Enviar nova candidatura
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">

              <div className="grid md:grid-cols-2 gap-8">
                <div className="job-input-group relative">
                  <input value={data.nome} onChange={handleChange} type="text" id="nome" required placeholder=" " className={inputBase('nome')} />
                  <label htmlFor="nome" className={labelClass}>Nome Completo *</label>
                  <span className={lineClass}></span>
                  {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
                </div>
                <div className="job-input-group relative">
                  <input value={data.email} onChange={handleChange} type="email" id="email" required placeholder=" " className={inputBase('email')} />
                  <label htmlFor="email" className={labelClass}>E-mail *</label>
                  <span className={lineClass}></span>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="job-input-group relative">
                  <input value={data.tel} onChange={handleChange} type="tel" id="tel" required placeholder=" " className={inputBase('tel')} />
                  <label htmlFor="tel" className={labelClass}>Telefone / WhatsApp *</label>
                  <span className={lineClass}></span>
                  {errors.tel && <p className="text-red-400 text-xs mt-1">{errors.tel}</p>}
                </div>
                <div className="job-input-group relative">
                  <input value={data.cidade} onChange={handleChange} type="text" id="cidade" required placeholder=" " className={inputBase('cidade')} />
                  <label htmlFor="cidade" className={labelClass}>Cidade / Estado *</label>
                  <span className={lineClass}></span>
                  {errors.cidade && <p className="text-red-400 text-xs mt-1">{errors.cidade}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="job-input-group relative">
                  <select value={data.cargo} onChange={handleChange} id="cargo" required className={`${inputBase('cargo')} appearance-none`}>
                    <option value="" disabled className="text-gray-900">Cargo de Interesse *</option>
                    <option value="Motorista de Ônibus"       className="text-gray-900">Motorista de Ônibus</option>
                    <option value="Motorista de Micro-ônibus" className="text-gray-900">Motorista de Micro-ônibus</option>
                    <option value="Motorista de Van"          className="text-gray-900">Motorista de Van</option>
                    <option value="Auxiliar de Operações"     className="text-gray-900">Auxiliar de Operações</option>
                    <option value="Gestor de Frotas"          className="text-gray-900">Gestor de Frotas</option>
                    <option value="Administrativo / RH"       className="text-gray-900">Administrativo / RH</option>
                    <option value="Tecnologia e Inovação"     className="text-gray-900">Tecnologia e Inovação</option>
                    <option value="Outro"                     className="text-gray-900">Outro</option>
                  </select>
                  <span className={lineClass}></span>
                  <div className="absolute right-0 top-4 pointer-events-none text-brand-gray/60 text-xs">▼</div>
                  {errors.cargo && <p className="text-red-400 text-xs mt-1">{errors.cargo}</p>}
                </div>
                <div className="job-input-group relative">
                  <select value={data.cnh} onChange={handleChange} id="cnh" className={`${inputBase('cnh')} appearance-none`}>
                    <option value="" disabled className="text-gray-900">Categoria CNH</option>
                    <option value="Não possuo" className="text-gray-900">Não possuo</option>
                    <option value="A"          className="text-gray-900">A</option>
                    <option value="B"          className="text-gray-900">B</option>
                    <option value="AB"         className="text-gray-900">AB</option>
                    <option value="C"          className="text-gray-900">C</option>
                    <option value="D"          className="text-gray-900">D</option>
                    <option value="E"          className="text-gray-900">E</option>
                  </select>
                  <span className={lineClass}></span>
                  <div className="absolute right-0 top-4 pointer-events-none text-brand-gray/60 text-xs">▼</div>
                </div>
              </div>

              <div className="job-input-group relative">
                <select value={data.experiencia} onChange={handleChange} id="experiencia" className={`${inputBase('experiencia')} appearance-none`}>
                  <option value="" disabled className="text-gray-900">Tempo de Experiência na Área</option>
                  <option value="Menos de 1 ano"  className="text-gray-900">Menos de 1 ano</option>
                  <option value="1 a 3 anos"      className="text-gray-900">1 a 3 anos</option>
                  <option value="3 a 5 anos"      className="text-gray-900">3 a 5 anos</option>
                  <option value="5 a 10 anos"     className="text-gray-900">5 a 10 anos</option>
                  <option value="Mais de 10 anos" className="text-gray-900">Mais de 10 anos</option>
                </select>
                <span className={lineClass}></span>
                <div className="absolute right-0 top-4 pointer-events-none text-brand-gray/60 text-xs">▼</div>
              </div>

              <div className="job-input-group relative">
                <textarea value={data.apresentacao} onChange={handleChange} id="apresentacao" required rows={5} placeholder=" " className={`${inputBase('apresentacao')} resize-none`}></textarea>
                <label htmlFor="apresentacao" className={labelClass}>Por que deseja trabalhar na Aliança Tur? *</label>
                <span className={lineClass}></span>
                {errors.apresentacao && <p className="text-red-400 text-xs mt-1">{errors.apresentacao}</p>}
              </div>

              {formState === 'error' && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>Ocorreu um erro ao enviar. Tente novamente.</span>
                </div>
              )}

              <button type="submit" disabled={formState === 'loading'} className="w-full bg-accent-gold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-brand-dark font-bold text-lg px-8 py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(198,169,105,0.15)] hover:shadow-[0_0_35px_rgba(198,169,105,0.35)] flex items-center justify-center gap-3">
                {formState === 'loading'
                  ? <><Loader2 size={20} className="animate-spin" /> Enviando candidatura...</>
                  : <><Briefcase size={20} /> Enviar Candidatura</>}
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
