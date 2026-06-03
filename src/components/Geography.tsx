import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ComposableMap, Geographies, Geography as Geo, Marker } from 'react-simple-maps';
import { Crosshair, Map as MapIcon, ShieldCheck } from 'lucide-react';

const activeStates = [
  { id: 'SE', name: 'Sergipe', coordinates: [-37.0717, -10.9472], info: 'Matriz e Operações Base' },
  { id: 'PA', name: 'Pará', coordinates: [-52.9221, -3.2048], info: 'Projetos de Mineração' },
  { id: 'PI', name: 'Piauí', coordinates: [-42.8019, -7.7183], info: 'Transporte Contínuo' },
  { id: 'GO', name: 'Goiás', coordinates: [-49.2533, -15.8270], info: 'Logística Agro' },
  { id: 'MA', name: 'Maranhão', coordinates: [-45.2744, -4.9609], info: 'Fretamento Industrial' },
];

export default function Geography() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeInfo, setActiveInfo] = useState(activeStates[0]);

  useGSAP(() => {
    gsap.from('.state-marker', {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
      },
      scale: 0,
      opacity: 0,
      stagger: 0.15,
      ease: "back.out(1.5)"
    });
  }, { scope: sectionRef });

  return (
    <section id="atuação" ref={sectionRef} className="py-32 bg-brand-base relative overflow-hidden border-t border-white/5">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 gap-20 items-center">
        
        <div className="relative z-10 w-full max-w-[600px] aspect-[4/4] mx-auto order-2 lg:order-1">
          {/* Dashboard overlay accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-gray/30"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-gray/30"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-gray/30"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-gray/30"></div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 700, center: [-54, -15] }}
            className="w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          >
            <Geographies geography="/brazil-states.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isActive = activeStates.find(s => s.id === geo.id || (geo.properties && s.id === geo.properties.SIGLA));
                  return (
                    <Geo
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isActive ? 'rgba(18, 59, 104, 0.8)' : 'rgba(5, 11, 20, 0.6)'}
                      stroke={isActive ? '#98A2B3' : '#123B68'}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: 'rgba(18, 59, 104, 1)', outline: 'none', transition: 'all 250ms' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {activeStates.map((state) => (
              <Marker 
                key={state.id} 
                coordinates={state.coordinates as [number, number]}
                onClick={() => setActiveInfo(state)}
                className="state-marker cursor-pointer outline-none group"
              >
                <circle r={4} fill="#F5F7FA" className="group-hover:scale-150 transition-transform origin-center" />
                <circle r={14} fill="none" stroke="#C1121F" strokeWidth={1} className={activeInfo.id === state.id ? 'animate-ping opacity-80' : 'opacity-0'} />
                {activeInfo.id === state.id && (
                  <circle r={8} stroke="#C1121F" strokeWidth={1.5} fill="none" opacity={0.6}/>
                )}
                <text
                  textAnchor="middle"
                  y={-15}
                  style={{ fill: '#F5F7FA', fontSize: '12px', fontWeight: 'bold' }}
                  className="pointer-events-none select-none"
                >
                  {state.id}
                </text>
              </Marker>
            ))}
          </ComposableMap>
        </div>

        <div className="relative z-10 order-1 lg:order-2">
          <div className="flex items-center gap-3 mb-6 opacity-80 backdrop-blur-sm bg-brand-dark border border-white/5 w-max px-3 py-1.5 rounded-sm">
             <Crosshair size={14} className="text-brand-gray" />
             <span className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gray">Malha Operacional</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-brand-light mb-6 leading-tight tracking-tight">
            Nossas rotas cruzam o <span className="text-brand-gray">Brasil</span>.
          </h2>
          <p className="text-lg text-brand-gray/90 mb-12 max-w-lg font-light leading-relaxed">
            Com matriz em Sergipe, expandimos nossa expertise para o Norte, Nordeste e Centro-Oeste através de bases de apoio e logística impecável para indústrias pesadas.
          </p>

          {/* Active Info Card Dashboard Style */}
          <div className="bg-brand-dark/80 backdrop-blur-md border border-white/5 p-8 relative overflow-hidden group">
            {/* Red accent line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-accent-red"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-[0.2em] mb-2">Base Operacional</p>
                <h3 className="text-3xl font-montserrat font-bold text-brand-light">{activeInfo.name}</h3>
              </div>
              <MapIcon size={24} className="text-brand-gray/50" />
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <p className="text-sm font-medium text-brand-gray mb-1">Status de Operação</p>
              <h4 className="text-xl font-montserrat font-medium text-brand-light">{activeInfo.info}</h4>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
