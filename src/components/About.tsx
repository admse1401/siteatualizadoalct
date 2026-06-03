import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // Text Reveal
    gsap.from('.about-text > *', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // Image Mask Reveal
    gsap.from(imageContainerRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
      },
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 1.2,
      ease: 'power4.inOut'
    });

    // Inner Parallax
    gsap.to(imageRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      },
      yPercent: 20,
      scale: 1.1,
      ease: 'none'
    });

    // Floating Badge
    gsap.to('.iso-badge', {
      y: -15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut'
    });

  }, { scope: sectionRef });

  const features = [
    "Certificação ISO 9001:2015",
    "Compliance Rigoroso",
    "Compromisso Ambiental",
    "Tecnologia de Ponta"
  ];

  return (
    <section id="quem-somos" ref={sectionRef} className="py-32 bg-brand-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column */}
        <div className="about-text">
          <h4 className="text-brand-gray font-bold tracking-widest uppercase mb-4 text-sm flex items-center gap-2">
            <span className="w-8 h-[2px] bg-accent-red"></span> A História
          </h4>
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold mb-6 leading-tight">
            Excelência construída desde <span className="text-brand-light">1998</span>.
          </h2>
          <p className="text-brand-gray text-lg mb-8 font-light leading-relaxed">
            A Aliança Tur nasceu do compromisso inabalável com a segurança e a pontualidade no transporte corporativo. Ao longo de mais de duas décadas, evoluímos para atender as operações mais complexas do Brasil, garantindo que o maior ativo de nossos clientes — suas equipes — chegue ao destino com o mais alto padrão de conforto.
          </p>
          
          <ul className="space-y-4 mb-10">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-4 text-gray-200">
                <CheckCircle2 className="text-accent-red flex-shrink-0" size={24} />
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="bg-white/5 border border-white/20 text-brand-light hover:bg-white/10 hover:border-white/30 backdrop-blur-sm px-8 py-4 rounded-sm transition-all text-sm font-bold tracking-wide">
            Nossa Trajetória
          </button>
        </div>

        {/* Right Column (Images) */}
        <div className="relative h-[600px] w-full" ref={imageContainerRef} style={{ clipPath: 'inset(0% 0% 0% 0%)' }}>
          <div className="w-full h-full overflow-hidden rounded-sm relative">
            <img 
              ref={imageRef}
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop" 
              alt="Frota Aliança Tur" 
              className="absolute -top-[10%] left-0 w-full h-[120%] object-cover origin-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-base/90 via-brand-base/20 to-transparent"></div>
          </div>
          
          {/* ISO Badge */}
          <div className="iso-badge absolute -bottom-6 -left-6 bg-white p-6 rounded-sm shadow-xl border border-gray-100 flex items-center gap-4 z-10 w-64 max-w-[calc(100vw-3rem)]">
            <div className="bg-accent-red/20 p-3 rounded-sm text-accent-red">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-xs text-brand-gray/60 font-bold uppercase tracking-wider">Certificada</p>
              <p className="text-brand-dark font-montserrat font-bold text-lg leading-none mt-1">ISO 9001:2015</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
