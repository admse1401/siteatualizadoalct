import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cursiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    if (cursiveRef.current) {
      gsap.set(cursiveRef.current, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' });
      
      tl.to(cursiveRef.current, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 1.5,
        ease: "power2.inOut",
      });
    }

    if (textRef.current) {
      tl.to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.2");
    }

    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      delay: 0.5,
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-base w-screen h-screen overflow-hidden">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent-red/20 blur-3xl rounded-full scale-[2]"></div>

        {/* Logo ALCT */}
        <div
          ref={cursiveRef}
          className="relative z-10 will-change-transform"
        >
          <img
            src="/images/logos/ALCT.png"
            alt="Aliança Tur"
            className="w-72 md:w-[500px] h-auto mix-blend-screen"
          />
        </div>
      </div>
    </div>
  );
}
