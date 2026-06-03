import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Bus, Map, Network } from 'lucide-react';

const services = [
  {
    id: 1,
    title: "Fretamento Contínuo",
    desc: "Transporte logístico de colaboradores diário com pontualidade suíça e rotas otimizadas.",
    icon: Bus,
    benefits: ["Rastreamento 24h", "Telemetria Avançada", "Veículos Reserva"]
  },
  {
    id: 2,
    title: "Projetos Especiais",
    desc: "Logística desenhada para paradas de manutenção, grandes obras e eventos corporativos.",
    icon: Network,
    benefits: ["Planejamento Dedicado", "Gestores In Loco", "Flexibilidade de Frota"]
  },
  {
    id: 3,
    title: "Gestão de Transporte",
    desc: "Terceirização completa e inteligente 360º de toda sua operação de mobilidade.",
    icon: Map,
    benefits: ["Redução de Custos", "Dashboard em Tempo Real", "Auditoria de Rotas"]
  }
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.service-card', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      },
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out'
    });
  }, { scope: sectionRef });

  return (
    <section id="serviços" ref={sectionRef} className="py-32 bg-brand-base relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h4 className="text-brand-gray font-bold tracking-[0.2em] uppercase mb-4 text-xs">O Que Fazemos</h4>
          <h2 className="text-4xl md:text-6xl font-montserrat font-bold text-brand-light">
            Soluções de Nível Global
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((srv) => (
            <div 
              key={srv.id}
              className="service-card group relative bg-brand-secondary/20 border border-white/5 rounded-sm p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-accent-red/50 hover:bg-brand-secondary/40 hover:shadow-2xl"
            >
              
              <div className="relative z-10">
                <div className="bg-brand-dark w-16 h-16 rounded-sm flex items-center justify-center mb-8 border border-white/10 text-brand-light group-hover:text-accent-red group-hover:border-accent-red/30 transition-colors duration-500">
                  <srv.icon size={32} />
                </div>
                
                <h3 className="text-2xl font-montserrat font-bold mb-4">{srv.title}</h3>
                <p className="text-brand-gray/80 mb-8 min-h-[4rem] group-hover:text-brand-light transition-colors">
                  {srv.desc}
                </p>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <ul className="space-y-3">
                    {srv.benefits.map((ben, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-brand-gray group-hover:text-brand-light/90 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-sm bg-accent-red"></div>
                        {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
