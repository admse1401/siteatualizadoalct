import { useRef, useState, ChangeEvent, FormEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  nome: string;
  empresa: string;
  email: string;
  tel: string;
  servico: string;
  detalhes: string;
}

const INITIAL: FormData = { nome: '', empresa: '', email: '', tel: '', servico: '', detalhes: '' };

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [data, setData]   = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useGSAP(() => {
    if (formRef.current) {
      gsap.from(formRef.current.querySelectorAll('.input-group'), {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      });
    }
    gsap.from('.contact-info > *', {
      scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
      x: -30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    });
  }, { scope: sectionRef });

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!data.nome.trim())     e.nome    = 'Campo obrigatório';
    if (!data.email.trim())    e.email   = 'Campo obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'E-mail inválido';
    if (!data.tel.trim())      e.tel     = 'Campo obrigatório';
    if (!data.servico)         e.servico = 'Selecione um serviço';
    if (!data.detalhes.trim()) e.detalhes = 'Campo obrigatório';
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
    console.log('[Contact] Enviando formulário:', data);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status} — ${body.error ?? 'sem detalhe'}`);
      }
      console.log('[Contact] ✅ Formulário enviado com sucesso');
      setFormState('success');
      setData(INITIAL);
    } catch (err) {
      console.error('[Contact] ❌ Falha ao enviar formulário:', err);
      setFormState('error');
    }
  };

  const field = (id: keyof FormData) =>
    `w-full bg-transparent border-b ${errors[id] ? 'border-red-400' : 'border-gray-600'} py-3 text-brand-light focus:outline-none focus:border-transparent peer transition-colors`;

  const labelClass = 'absolute left-0 top-3 text-brand-gray/60 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent-red peer-valid:-top-4 peer-valid:text-xs peer-valid:text-accent-red pointer-events-none';
  const lineClass  = 'absolute bottom-0 left-1/2 w-0 h-[2px] bg-accent-red transition-all duration-300 peer-focus:w-full peer-focus:left-0';

  return (
    <section id="contato" ref={sectionRef} className="py-32 bg-accent-red-base relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid xl:grid-cols-2 gap-20">

        {/* Info */}
        <div className="contact-info">
          <h4 className="text-brand-gray font-bold tracking-[0.2em] uppercase mb-4 text-xs">Fale Conosco</h4>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-brand-light mb-6">
            Prontos para <span className="text-accent-red">mover</span> sua operação.
          </h2>
          <p className="text-brand-gray mb-12 max-w-md">
            Entre em contato com nossos consultores corporativos. Dimensionamos o projeto ideal para suas necessidades em até 24h úteis.
          </p>

          <div className="space-y-8">
            {[
              { icon: <MapPin size={24} />, title: 'Matriz & Base de Operações', content: <>Av. Monteiro Lobato, 734<br />Bairro Atalaia, Aracaju – SE<br />CEP: 49035-020</> },
              { icon: <Phone size={24} />, title: 'Linha Direta (Logística)',     content: <>(79) 3217-8404<br />(79) 3223-1006</> },
              { icon: <Mail size={24} />, title: 'E-mail Corporativo',            content: <>faleconosco@aliancatur.com</> },
              { icon: <Clock size={24} />, title: 'Atendimento Admin.',           content: <>Seg – Sex: 08:00 às 18:00<br />Plantão Operacional: 24h</> },
            ].map(({ icon, title, content }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="bg-accent-red/10 p-3 rounded-sm text-accent-red">{icon}</div>
                <div>
                  <h5 className="font-montserrat font-bold text-brand-light mb-1">{title}</h5>
                  <p className="text-brand-gray/80 text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-accent-red-secondary/30 p-10 lg:p-16 rounded-3xl border border-white/5 shadow-2xl">
          {formState === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-green-500/10 p-6 rounded-full mb-6">
                <CheckCircle className="text-green-400" size={56} />
              </div>
              <h3 className="text-2xl font-montserrat font-bold text-brand-light mb-3">Mensagem Enviada!</h3>
              <p className="text-brand-gray mb-8 max-w-xs">Recebemos sua solicitação. Nossa equipe retornará em até 24h úteis.</p>
              <button onClick={() => setFormState('idle')} className="text-accent-red underline underline-offset-4 text-sm hover:text-accent-red-light transition-colors">
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">

              <div className="grid md:grid-cols-2 gap-8">
                <div className="input-group relative">
                  <input value={data.nome} onChange={handleChange} type="text" id="nome" required placeholder=" " className={field('nome')} />
                  <label htmlFor="nome" className={labelClass}>Seu Nome *</label>
                  <span className={lineClass}></span>
                  {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
                </div>
                <div className="input-group relative">
                  <input value={data.empresa} onChange={handleChange} type="text" id="empresa" placeholder=" " className={field('empresa')} />
                  <label htmlFor="empresa" className={labelClass}>Nome da Empresa</label>
                  <span className={lineClass}></span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="input-group relative">
                  <input value={data.email} onChange={handleChange} type="email" id="email" required placeholder=" " className={field('email')} />
                  <label htmlFor="email" className={labelClass}>E-mail Corporativo *</label>
                  <span className={lineClass}></span>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="input-group relative">
                  <input value={data.tel} onChange={handleChange} type="tel" id="tel" required placeholder=" " className={field('tel')} />
                  <label htmlFor="tel" className={labelClass}>Telefone *</label>
                  <span className={lineClass}></span>
                  {errors.tel && <p className="text-red-400 text-xs mt-1">{errors.tel}</p>}
                </div>
              </div>

              <div className="input-group relative">
                <select value={data.servico} onChange={handleChange} id="servico" required className={`${field('servico')} appearance-none`}>
                  <option value="" disabled className="text-gray-900">Selecione o Serviço de Interesse *</option>
                  <option value="Fretamento Contínuo"             className="text-gray-900">Fretamento Contínuo</option>
                  <option value="Projetos Especiais (Paradas, Obras)" className="text-gray-900">Projetos Especiais (Paradas, Obras)</option>
                  <option value="Gestão de Transporte 360°"       className="text-gray-900">Gestão de Transporte 360°</option>
                  <option value="Outros"                          className="text-gray-900">Outros</option>
                </select>
                <span className={lineClass}></span>
                <div className="absolute right-0 top-4 pointer-events-none text-brand-gray/60">▼</div>
                {errors.servico && <p className="text-red-400 text-xs mt-1">{errors.servico}</p>}
              </div>

              <div className="input-group relative">
                <textarea value={data.detalhes} onChange={handleChange} id="detalhes" required rows={4} placeholder=" " className={`${field('detalhes')} resize-none`}></textarea>
                <label htmlFor="detalhes" className={labelClass}>Detalhes da Demanda (Rotas, Volume) *</label>
                <span className={lineClass}></span>
                {errors.detalhes && <p className="text-red-400 text-xs mt-1">{errors.detalhes}</p>}
              </div>

              {formState === 'error' && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>Erro ao enviar. Tente novamente ou ligue para (79) 3217-8404.</span>
                </div>
              )}

              <button type="submit" disabled={formState === 'loading'} className="w-full bg-accent-red hover:bg-accent-red-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-5 rounded-xl transition-all shadow-[0_0_15px_rgba(193,18,31,0.2)] hover:shadow-[0_0_30px_rgba(193,18,31,0.4)] flex items-center justify-center gap-3">
                {formState === 'loading' ? <><Loader2 size={20} className="animate-spin" /> Enviando...</> : 'Enviar Solicitação'}
              </button>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
