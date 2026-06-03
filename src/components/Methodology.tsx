import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Layers, RefreshCcw, ShieldCheck, FileCheck } from 'lucide-react';

const methods = [
  { 
    id: 1, 
    title: '5S & 5W2H', 
    summary: 'Organização e implantação operacional.',
    expanded: 'Estruturação de operações com padronização, controle de processos e integração eficiente de novos contratos corporativos.',
    icon: Layers 
  },
  { 
    id: 2, 
    title: 'Ciclo PDCA', 
    summary: 'Melhoria contínua operacional.',
    expanded: 'Monitoramento contínuo de rotas, indicadores e performance operacional com ajustes preventivos em tempo real.',
    icon: RefreshCcw 
  },
  { 
    id: 3, 
    title: 'S.G.Q.', 
    summary: 'Gestão certificada de qualidade.',
    expanded: 'Processos auditáveis com rastreabilidade, padronização e conformidade validada pela ISO 9001:2015.',
    icon: ShieldCheck 
  },
  { 
    id: 4, 
    title: 'Compliance', 
    summary: 'Conformidade e segurança operacional.',
    expanded: 'Políticas preventivas, auditorias internas e controle rigoroso para operações críticas de transporte corporativo.',
    icon: FileCheck 
  },
];

export default function Methodology() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.method-card', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      },
      y: 30,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: sectionRef });

  return (
    <section id="metodologia" ref={sectionRef} className="py-32 bg-brand-secondary/10 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h4 className="text-brand-gray font-bold tracking-[0.2em] uppercase mb-4 text-xs">Governança Industrial</h4>
            <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-brand-light mb-6">
              A ciência por trás da <span className="text-brand-gray">pontualidade</span>.
            </h2>
          </div>
          <p className="text-brand-gray/80 max-w-sm font-light leading-relaxed">
            Não apostamos na sorte. Nossa operação é governada por metodologias de classe mundial para mitigar qualquer risco sistêmico.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methods.map((item) => (
            <div 
              key={item.id}
              className="method-card group/card relative bg-brand-dark border border-white/5 p-8 rounded-sm overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:bg-brand-dark/95 hover:border-white/10 hover:shadow-[inset_0_0_80px_rgba(18,59,104,0.15)] flex flex-col justify-start h-[340px]"
            >
              {/* Soft blue glow on hover */}
              <div className="absolute inset-0 bg-brand-secondary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <item.icon size={28} strokeWidth={1.5} className="text-brand-gray group-hover/card:text-brand-light transition-colors duration-500 mb-6 relative z-10" />
              
              <h3 className="text-2xl font-montserrat font-bold mb-3 text-brand-light relative z-10 text-center w-full">{item.title}</h3>
              
              <p className="text-brand-gray/90 text-sm relative z-10 font-light leading-relaxed group-hover/card:text-brand-light transition-colors duration-500">
                {item.summary}
              </p>

              {/* Reveal expanded text - CSS Grid trick for smooth height transition pushing up */}
              <div className="mt-auto relative z-10 w-full">
                <div className="w-0 h-[1px] bg-accent-red group-hover/card:w-full transition-all duration-700 ease-out opacity-0 group-hover/card:opacity-100 mb-0 group-hover/card:mb-4"></div>
                <div className="grid grid-rows-[0fr] group-hover/card:grid-rows-[1fr] transition-all duration-500 ease-out">
                  <div className="overflow-hidden">
                    <p className="text-sm text-brand-gray/80 font-light leading-relaxed pb-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                      {item.expanded}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
