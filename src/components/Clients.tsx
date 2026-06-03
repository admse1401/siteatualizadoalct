/* 
 ================================================================================
 ARQUITETURA DE ASSETS:
 - LOGOS CLIENTES: /public/logos/ (ex: vale.svg, petrobras.svg, etc.)
 ================================================================================
*/
import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

// Definindo os parceiros reais e seus links. Adicione as logos reais na pasta /public/logos/
const CLIENT_LOGOS = [
  { name: "Vale", file: "/logos/vale.svg", link: "https://vale.com" },
  { name: "Petrobras", file: "/logos/petrobras.svg", link: "https://petrobras.com.br" },
  { name: "Sodexo", file: "/logos/sodexo.svg", link: "https://br.sodexo.com" },
  { name: "MIP Engenharia", file: "/logos/mip.svg", link: "https://mip.com.br" },
  { name: "Milplan", file: "/logos/milplan.svg", link: "https://milplan.com.br" },
];

export default function Clients() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ playOnInit: true, stopOnInteraction: false, speed: 1.5 })
  ]);

  const onMouseEnter = useCallback(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins().autoScroll;
    if (autoScroll) autoScroll.stop();
  }, [emblaApi]);

  const onMouseLeave = useCallback(() => {
    if (!emblaApi) return;
    const autoScroll = emblaApi.plugins().autoScroll;
    if (autoScroll) autoScroll.play();
  }, [emblaApi]);

  return (
    <section id="clientes" className="py-24 bg-brand-dark border-t border-white/5 overflow-hidden">
      <div className="text-center mb-16 px-6">
        <h3 className="font-montserrat font-bold text-xs uppercase tracking-[0.2em] text-brand-gray mb-3">
          Parceiros de Longa Data
        </h3>
        <p className="text-brand-light font-montserrat text-xl sm:text-2xl font-bold max-w-xl mx-auto">
          As maiores indústrias confiam na nossa operação diariamente.
        </p>
      </div>
      
      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute top-0 left-0 w-24 md:w-48 h-full bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-24 md:w-48 h-full bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none"></div>

        {/* Embla Carousel Viewport */}
        <div 
          className="overflow-hidden" 
          ref={emblaRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="flex items-center select-none">
            {/* Duplicate the array multiple times to ensure the carousel always has enough items to scroll smoothly across wide screens */}
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS, ...CLIENT_LOGOS].map((client, idx) => (
              <div key={idx} className="flex-[0_0_auto] min-w-[200px] md:min-w-[280px] flex items-center justify-center px-4">
                <a 
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                  // Prevents dragging from triggering a click
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="w-full flex justify-center items-center h-20 filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    {/* Imagem Real. O onError garante que apareça um texto fallback caso a logo não exista na pasta */}
                    <img 
                      src={client.file} 
                      alt={client.name} 
                      className="max-h-12 w-auto object-contain cursor-grab active:cursor-grabbing"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <h4 className="hidden text-3xl font-black font-montserrat uppercase text-brand-gray group-hover:text-brand-light transition-colors cursor-grab active:cursor-grabbing">
                      {client.name}
                    </h4>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
