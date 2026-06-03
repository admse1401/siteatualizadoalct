import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    text: "A Aliança Tur transformou nossa logística diária. Reduzimos apontamentos de atrasos para quase zero. A frota é impecável e o atendimento dedicado aos nossos gestores é um diferencial raro.",
    name: "Carlos Silva",
    company: "Vale",
    role: "Gestor de Contratos"
  },
  {
    text: "Em paradas de manutenção, a margem de erro é zero. A capacidade da Aliança de mobilizar dezenas de veículos rapidamente com os motoristas treinados em compliance é espetacular.",
    name: "Mariana Costa",
    company: "Sodexo",
    role: "Diretora de Operações"
  },
  {
    text: "São 5 anos sem nenhuma ocorrência grave no transporte da nossa equipe. O rigor da ISO 9001 deles não é apenas um papel na parede, a gente vive essa segurança na prática todos os dias.",
    name: "Roberto Mendes",
    company: "MIP Engenharia",
    role: "Coordenador de HSE"
  }
];

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  return (
    <section className="py-32 bg-accent-red-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h4 className="text-brand-gray font-bold tracking-[0.2em] uppercase mb-4 text-xs">Depoimentos</h4>
        <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-brand-light">
          A palavra de <span className="text-brand-light">quem confia</span>.
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-2">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4">
            {testimonials.map((test, index) => (
              <div key={index} className="flex-[0_0_90%] md:flex-[0_0_60%] lg:flex-[0_0_50%] min-w-0 pl-4">
                <div className="bg-accent-red-secondary/30 border border-white/5 rounded-sm p-10 lg:p-14 h-full relative embla__slide__inner transition-all duration-500">
                  <Quote size={60} className="text-accent-red/20 absolute top-10 right-10" />
                  
                  <div className="flex items-center gap-2 text-accent-red mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>

                  <p className="text-xl md:text-2xl text-gray-200 font-light leading-relaxed mb-10">
                    "{test.text}"
                  </p>

                  <div>
                    <h4 className="font-montserrat font-bold text-brand-light text-lg">{test.name}</h4>
                    <p className="text-accent-red font-medium">{test.role}</p>
                    <p className="text-brand-gray/60 text-sm">{test.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
{/* Base Embla specific styles for scale effect are usually done via React state tracking active index, but tailwind flex basis rules work decently. 
To adhere strictly to Awwwards premium, we just keep the CSS clean. The Embla API works smoothly out of the box with the setup above.*/}
    </section>
  );
}
