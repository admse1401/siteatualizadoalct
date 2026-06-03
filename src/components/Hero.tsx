/* 
 ================================================================================
 ARQUITETURA DE ASSETS GLOBAIS (COLOQUE SEUS ARQUIVOS REAIS NESTES CAMINHOS):
 - VÍDEO DO HERO:  /public/videos/hero-video.mp4
 - POSTER/FALLBACK: /public/images/hero/fallback.jpg
 - LOGOS CLIENTES: /public/logos/ (ex: vale.svg, petrobras.svg)
 - FOTOS DA FROTA: /public/images/fleet/
 - FOTOS DA EMPRESA: /public/images/about/ /public/images/operations/
 ================================================================================
*/
import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Hero() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const fullText = "Gerando valor sendo referência no que faz.";
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let isTyping = true;
    let i = 0;
    let currentString = "";
    
    const typeNextChar = () => {
      if (!isTyping) return;
      if (i < fullText.length) {
        currentString += fullText.charAt(i);
        setTypedText(currentString);
        i++;
        
        // Artificial human-like typing delays (corporate/smooth)
        let delay = 35 + Math.random() * 45; 
        if (fullText.charAt(i - 1) === ' ') delay += 20; // Pause slightly at spaces
        if (fullText.charAt(i - 1) === 'a' && fullText.charAt(i-2) === 'i') delay += 50; 
        
        setTimeout(typeNextChar, delay);
      } else {
        setIsTypingComplete(true);
      }
    };

    // Começa o typewriter de forma elegante apenas após as entradas principais.
    // 2.5s preloader + 0.8s entrance = ~3.3s
    const timeout = setTimeout(typeNextChar, 3400);

    return () => { 
      isTyping = false; 
      clearTimeout(timeout);
    };
  }, []);

  useGSAP(() => {
    // Typography Reveal
    if (h1Ref.current) {
      const split = new SplitType(h1Ref.current, { types: 'lines,words' });
      
      const tl = gsap.timeline({ delay: 2.5 }); // Preloader wait
      
      tl.from(split.words, {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      })
      .from('.hero-corporate-line', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out'
      }, "-=0.6")
      .from('.hero-cta', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      }, "-=0.4")
      .from('.hero-card', {
        opacity: 0,
        x: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      }, "-=0.6");
    }
  });

  return (
    <section className="hero-section relative w-full h-screen flex items-center overflow-hidden bg-brand-base">
      
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark navy overlay */}
      <div className="absolute inset-0 z-10" style={{
        background: 'linear-gradient(180deg, rgba(5,11,20,0.75) 0%, rgba(10,34,64,0.88) 100%)'
      }}></div>

      <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-24">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
          
          {/* Left Content */}
          <div className="w-full lg:w-[65%]">
            <div className="flex items-center gap-3 mb-6 opacity-80 backdrop-blur-sm bg-white/5 border border-white/10 w-max px-4 py-2 rounded-sm">
               <ShieldCheck size={16} className="text-accent-red" />
               <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-light">Compromisso com Segurança e Tecnologia</span>
            </div>
            
            <h1 
              ref={h1Ref} 
              className="text-5xl md:text-6xl lg:text-[5.5rem] font-montserrat font-bold leading-[1.05] tracking-tight mb-6 text-brand-light"
            >
              Excelência logística<br />para operações<br />críticas.
            </h1>
            
            {/* Cinema Typewriter */}
            <div className="mb-8 min-h-[4rem] md:min-h-[5rem] text-2xl md:text-4xl font-montserrat font-medium tracking-wide text-brand-light">
              {typedText}
              <span className={`text-accent-red ml-1 ${isTypingComplete ? 'animate-pulse' : ''}`}>_</span>
            </div>

            {/* Institutional Line */}
            <div className="hero-corporate-line flex flex-wrap items-center gap-3 md:gap-4 text-[0.65rem] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-gray mb-10 w-max bg-brand-dark/30 py-2 px-4 rounded-sm border border-white/5 backdrop-blur-md">
              <span>Desde 1998</span>
              <span className="text-accent-red/50">•</span>
              <span>ISO 9001:2015</span>
              <span className="text-accent-red/50">•</span>
              <span>Operação Interestadual</span>
            </div>

            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-6">
              {/* Primary Glass Button */}
              <a href="/portal/auris/login" className="hero-cta w-full sm:w-auto relative overflow-hidden bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-brand-light font-bold px-10 py-5 transition-all duration-300 group">
                <span className="relative z-10 flex items-center gap-3 tracking-wide">
                  Portal do Colaborador
                  <ArrowRight size={18} className="text-accent-red group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-accent-red -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              </a>
              
              <button className="hero-cta text-sm font-semibold tracking-wide text-brand-light hover:text-accent-gold transition-colors flex items-center gap-2">
                Conheça a Operação
              </button>
            </div>
          </div>

          {/* Right Floating Metrics */}
          <div ref={cardsRef} className="w-full lg:w-[30%] flex flex-col gap-4">
            
            <div className="hero-card bg-brand-dark/60 backdrop-blur-xl border border-white/5 p-6 border-l-4 border-l-accent-red relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-4xl font-montserrat font-bold text-brand-light mb-1 relative z-10">330+</h4>
              <p className="text-sm text-brand-gray font-medium uppercase tracking-wider relative z-10">Veículos Modernos</p>
            </div>

            <div className="hero-card bg-brand-dark/60 backdrop-blur-xl border border-white/5 p-6 border-l-4 border-l-accent-gold relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-4xl font-montserrat font-bold text-brand-light mb-1 relative z-10">25 Anos</h4>
              <p className="text-sm text-brand-gray font-medium uppercase tracking-wider relative z-10">De Experiência Sólida</p>
            </div>
            
            <div className="hero-card bg-brand-dark/60 backdrop-blur-xl border border-white/5 p-6 border-l-4 border-l-brand-gray/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-4xl font-montserrat font-bold text-brand-light mb-1 relative z-10">Milhares</h4>
              <p className="text-sm text-brand-gray font-medium uppercase tracking-wider relative z-10">De Vidas Transportadas</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
