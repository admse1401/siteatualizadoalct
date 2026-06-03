import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Phone, Menu, X } from 'lucide-react';

export default function Header() {
  const headerRef   = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (headerRef.current) {
        if (currentScrollY > 50) {
          headerRef.current.classList.add('bg-brand-secondary/80', 'backdrop-blur-md', 'shadow-lg', 'py-1', 'lg:py-2');
          headerRef.current.classList.remove('py-2', 'lg:py-3');
        } else {
          headerRef.current.classList.remove('bg-brand-secondary/80', 'backdrop-blur-md', 'shadow-lg', 'py-1', 'lg:py-2');
          headerRef.current.classList.add('py-2', 'lg:py-3');
        }

        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          gsap.to(headerRef.current, { yPercent: -120, duration: 0.3, ease: 'power2.inOut' });
        } else {
          gsap.to(headerRef.current, { yPercent: 0, duration: 0.3, ease: 'power2.inOut' });
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const portalLoginUrl = '/portal/auris/login';

  const links = [
    { label: 'Quem Somos',     href: '#quem-somos'   },
    { label: 'Serviços',       href: '#serviços'      },
    { label: 'Frota',          href: '#frota'         },
    { label: 'Metodologia',    href: '#metodologia'   },
    { label: 'Atuação',        href: '#atuação'       },
    { label: 'Clientes',       href: '#clientes'      },
    { label: 'Trabalhe Conosco', href: '#trabalhe-conosco' },
  ];

  const handleMobileNav = (href: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 transition-colors duration-300 px-6 py-2 lg:px-16 lg:py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center group">
            <img
              src="/images/logos/ALCT.png"
              alt="Aliança Tur"
              className="h-16 md:h-24 w-auto mix-blend-screen"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-base font-medium text-brand-light/90 hover:text-brand-light transition-colors relative group whitespace-nowrap"
              >
                {label}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-accent-red transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="tel:+557932178404" className="flex items-center gap-2 text-base font-bold text-brand-light/90 hover:text-brand-light transition-colors">
              <Phone size={16} className="text-accent-red" />
              (79) 3217-8404
            </a>
            <a href={portalLoginUrl} className="relative overflow-hidden bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-brand-light font-semibold px-6 py-2.5 rounded-sm transition-all duration-300 group">
              <span className="relative z-10 text-base tracking-wide">Portal do Colaborador</span>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-red -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-red translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="lg:hidden p-2 text-brand-light hover:text-accent-red transition-colors"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-brand-dark/95 backdrop-blur-lg flex flex-col justify-center items-center transition-all duration-500 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {links.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => handleMobileNav(href)}
              className="text-2xl font-montserrat font-semibold text-brand-light/80 hover:text-accent-red transition-colors tracking-wide"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-12 flex flex-col items-center gap-4">
          <a href="tel:+557932178404" className="flex items-center gap-2 text-brand-gray hover:text-brand-light transition-colors">
            <Phone size={16} className="text-accent-red" />
            (79) 3217-8404
          </a>
          <a href={portalLoginUrl} className="bg-accent-red text-white font-bold px-8 py-3 rounded-sm text-sm tracking-wide hover:bg-accent-red-light transition-colors">
            Portal do Colaborador
          </a>
        </div>
      </div>
    </>
  );
}
