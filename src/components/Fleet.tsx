import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const vehicles = [
  {
    name: "Ônibus Executivo e Leito",
    desc: "O máximo de conforto para viagens longas. Poltronas reclináveis, ar-condicionado digital, Wi-Fi e tomadas USB.",
  },
  {
    name: "Micro-ônibus",
    desc: "Agilidade e economia para trajetos curtos e médios, sem perder o padrão rodoviário de conforto.",
  },
  {
    name: "Vans Executivas",
    desc: "Perfeitas para traslados VIP, diretores e pequenas equipes. Bancos em couro e máxima discrição.",
  }
];

export default function Fleet() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scroller = containerRef.current;
    if (!scroller) return;

    // Fake Horizontal Scroll
    const amountToScroll = scroller.scrollWidth - window.innerWidth;

    gsap.to(scroller, {
      x: -amountToScroll,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${amountToScroll}`,
        pin: true,
        scrub: 1, // Smooth scrub
        invalidateOnRefresh: true,
      }
    });

    // Parallax images inside cards
    const images = gsap.utils.toArray('.fleet-img') as HTMLImageElement[];
    images.forEach(img => {
      gsap.to(img, {
        x: 100, // moves right slightly while scrolling left
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${amountToScroll}`,
          scrub: 1,
        }
      });
    });

  }, { scope: sectionRef });

  return (
    <section id="frota" ref={sectionRef} className="h-screen bg-brand-base overflow-hidden relative border-t border-white/5">
      
      {/* Absolute intro text block */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 lg:left-12 z-20 w-[400px]">
        <h4 className="text-brand-gray font-bold tracking-[0.2em] uppercase mb-4 text-xs">Nossa Frota</h4>
        <h2 className="text-5xl font-montserrat font-bold text-brand-light mb-6">
          Veículos modernos, inspecionados rigorosamente.
        </h2>
        <p className="text-brand-gray/80 mb-8">Role para explorar nossa frota premium. Cada unidade obedece ao nosso padrão ISO 9001.</p>
        <button className="flex justify-center items-center gap-2 border border-white/30 hover:bg-white hover:text-black py-4 px-8 rounded-sm text-brand-light font-bold transition-all">
          Tour Virtual 360°
        </button>
      </div>

      {/* Scrub Container */}
      <div ref={containerRef} className="h-full flex items-center pt-24 pl-[100vw] lg:pl-[40vw]">
        <div className="flex gap-8 px-12 pr-[10vw]">
          {vehicles.map((v, i) => (
            <div key={i} className="relative w-[300px] md:w-[600px] h-[50vh] md:h-[60vh] rounded-sm overflow-hidden group bg-brand-dark/70">
              <img 
                src={`/images/fleet/vehicle-${i + 1}.jpg`} 
                alt={v.name} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="fleet-img absolute top-0 -left-[10%] w-[120%] h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-3xl font-montserrat font-bold text-brand-light mb-2">{v.name}</h3>
                <p className="text-brand-gray text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
