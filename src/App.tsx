import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Components
import Preloader from './components/Preloader';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Services from './components/Services';
import Fleet from './components/Fleet';
import Methodology from './components/Methodology';
import Geography from './components/Geography';
import Clients from './components/Clients';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import TrabalheConosco from './components/TrabalheConosco';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function App() {
  // Global Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-brand-base text-brand-light selection:bg-accent-red selection:text-white uppercase-selection overflow-hidden">
      <Preloader />
      <Header />
      
      <main>
        <Hero />
        <Stats />
        <About />
        <Services />
        <Fleet />
        <Methodology />
        <Geography />
        <Clients />
        <Testimonials />
        <Contact />
        <TrabalheConosco />
      </main>

      <Footer />
    </div>
  );
}
