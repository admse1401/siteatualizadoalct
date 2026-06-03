import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const data = [
  { value: 25, suffix: '+', label: 'Anos de Experiência' },
  { value: 330, suffix: '+', label: 'Veículos Modernos' },
  { value: 5, suffix: '', label: 'Estados de Atuação' },
  { value: 9001, suffix: ':2015', label: 'Certificação ISO', prefix: 'ISO ' }
];

export default function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const cards = gsap.utils.toArray('.stat-card') as HTMLElement[];
    const counters = gsap.utils.toArray('.stat-number') as HTMLElement[];

    // Reveal Cards
    gsap.from(cards, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // Animate Counters
    counters.forEach((counter, i) => {
      const targetVal = data[i].value;
      const initialVal = targetVal > 100 ? targetVal - 100 : 0; // Simple initial trick
      
      const obj = { val: initialVal };
      
      gsap.to(obj, {
        val: targetVal,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        onUpdate: () => {
          if (counter) {
            counter.innerText = Math.round(obj.val).toString();
          }
        }
      });
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-accent-red-base relative z-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-white/10">
          
          {data.map((item, index) => (
            <div key={index} className="stat-card flex flex-col items-center justify-center text-center px-4">
              <h3 className="text-4xl md:text-5xl font-montserrat font-bold text-accent-red mb-2 flex items-center">
                {item.prefix && <span className="text-2xl mr-1">{item.prefix}</span>}
                <span className="stat-number">{item.value}</span>
                <span>{item.suffix}</span>
              </h3>
              <p className="text-sm md:text-base text-brand-gray font-medium uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
