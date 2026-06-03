import { ShieldCheck, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-accent-red-dark pt-20 pb-10 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center group mb-6">
              <img
                src="/images/logos/ALCT.png"
                alt="Aliança Tur"
                className="h-20 w-auto mix-blend-screen"
              />
            </a>
            <p className="text-brand-gray/80 text-sm leading-relaxed mb-6">
              Há 25 anos entregando pontualidade, segurança e excelência em transporte corporativo pesado em todo o território nacional.
            </p>
            {/* ISO Badge small */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 w-max px-4 py-2 rounded-sm">
              <ShieldCheck className="text-accent-red" size={20} />
              <span className="text-xs text-brand-light font-montserrat tracking-widest font-bold">ISO 9001:2015</span>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-montserrat font-bold text-brand-light mb-6 uppercase tracking-wider text-sm">Institucional</h4>
            <ul className="space-y-3">
              {['Quem Somos', 'Serviços', 'Frota', 'Metodologia', 'Atuação', 'Trabalhe Conosco', 'Política de Privacidade'].map((item, i) => (
                <li key={i}>
                  <a href={`#${item.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '')}`} className="text-brand-gray/80 hover:text-brand-light text-sm transition-colors border-b border-transparent hover:border-brand-gray/30 pb-0.5 inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-montserrat font-bold text-brand-light mb-6 uppercase tracking-wider text-sm">Especialidades</h4>
            <ul className="space-y-3 text-sm text-brand-gray/80">
              <li>Fretamento Contínuo</li>
              <li>Paradas de Manutenção</li>
              <li>Obras de Engenharia</li>
              <li>Gestão 360º</li>
              <li>Logística Integrada</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-montserrat font-bold text-brand-light mb-6 uppercase tracking-wider text-sm">Portal do Colaborador</h4>
            <p className="text-brand-gray/80 text-sm mb-4">Acesso restrito para funcionários e parceiros integrados.</p>
            
            <button className="relative overflow-hidden bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-brand-light font-semibold px-6 py-3 w-full rounded-sm transition-all duration-300 group">
              <span className="relative z-10 text-sm tracking-wide">Acessar Portal</span>
              {/* Sliding Line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-red -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            </button>
            
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-brand-gray/60 text-sm text-center md:text-left flex flex-col gap-1">
            <p>{new Date().getFullYear()} © Aliança Tur Transporte Corporativo. Todos os direitos reservados.</p>
            <p className="text-xs opacity-60">Desenvolvido por Auris Data</p>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center justify-center w-12 h-12 rounded-sm border border-white/10 text-brand-gray/80 hover:text-brand-light hover:border-brand-gray/30 transition-all hover:-translate-y-1"
          >
            <ArrowUp size={20} />
          </button>
        </div>

      </div>
    </footer>
  );
}
