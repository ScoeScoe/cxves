import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Mail, Calendar, Github, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import Image from 'next/image';

// GSAP matrix rain configuration
const matrixConfig = {
  chars: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  columnWidth: 25,
  dropSpeed: { min: 2, max: 8 },
  fadeSpeed: 0.05,
  brightness: 0.15,
  splashParticles: 50
};

// Matrix Rain Class for GSAP implementation
class MatrixRain {
  constructor(container) {
    this.container = container;
    this.columns = [];
    this.timeline = null;
    this.splashTimeline = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined' || !window.gsap) return;
    
    const containerWidth = this.container.offsetWidth;
    const numColumns = Math.floor(containerWidth / matrixConfig.columnWidth);
    
    // Create columns
    for (let i = 0; i < numColumns; i++) {
      this.createColumn(i);
    }
    
    // Set up scroll trigger
    this.setupScrollTrigger();
  }

  createColumn(index) {
    const column = {
      x: index * matrixConfig.columnWidth + matrixConfig.columnWidth / 2,
      chars: [],
      speed: window.gsap.utils.random(matrixConfig.dropSpeed.min, matrixConfig.dropSpeed.max)
    };
    
    // Create initial characters for the column
    const numChars = Math.floor(window.innerHeight / 25) + 10;
    for (let i = 0; i < numChars; i++) {
      const char = this.createChar(column.x, -i * 25);
      column.chars.push(char);
    }
    
    this.columns.push(column);
    this.animateColumn(column);
  }

  createChar(x, y) {
    const char = document.createElement('span');
    char.className = 'code-char';
    char.textContent = matrixConfig.chars[Math.floor(Math.random() * matrixConfig.chars.length)];
    char.style.cssText = `
      position: absolute;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 20px;
      color: #237A6D;
      text-shadow: 0 0 5px #237A6D;
      opacity: 0;
      user-select: none;
      left: ${x}px;
      top: ${y}px;
    `;
    
    // Randomly make some characters brighter
    if (Math.random() < matrixConfig.brightness) {
      char.style.color = '#3AD6C4';
      char.style.textShadow = '0 0 10px #3AD6C4, 0 0 20px #237A6D';
    }
    
    this.container.appendChild(char);
    return char;
  }

  animateColumn(column) {
    if (!window.gsap) return;
    
    const tl = window.gsap.timeline({ repeat: -1 });
    
    column.chars.forEach((char, i) => {
      const delay = i * 0.1;
      
      tl.to(char, {
        y: window.innerHeight + 100,
        duration: column.speed,
        ease: "none",
        onStart: () => {
          // Change character randomly
          char.textContent = matrixConfig.chars[Math.floor(Math.random() * matrixConfig.chars.length)];
          window.gsap.set(char, { opacity: 1 });
        },
        onComplete: () => {
          // Reset position and fade out
          window.gsap.set(char, { y: -50 });
          window.gsap.to(char, { opacity: 0, duration: 0.5 });
        }
      }, delay);
    });
    
    column.timeline = tl;
  }

  setupScrollTrigger() {
    if (!window.gsap || !window.ScrollTrigger) return;
    
    const section = this.container.closest('section');
    
    // Create splash particles
    const splashParticles = [];
    for (let i = 0; i < matrixConfig.splashParticles; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #237A6D;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        box-shadow: 0 0 6px #237A6D;
      `;
      if (Math.random() < 0.3) {
        particle.style.background = '#B0793E';
        particle.style.boxShadow = '0 0 10px #B0793E';
      }
      this.container.appendChild(particle);
      splashParticles.push(particle);
    }
    
    // Main scroll trigger for rain intensity
    window.ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Adjust rain speed based on scroll
        this.columns.forEach(column => {
          if (column.timeline) {
            column.timeline.timeScale(0.5 + progress * 1.5);
          }
        });
        
        // Adjust opacity based on scroll
        window.gsap.to(this.container, {
          opacity: 0.2 + progress * 0.3,
          duration: 0.3
        });
      }
    });
    
    // Splash effect at section boundaries
    window.ScrollTrigger.create({
      trigger: section,
      start: "bottom bottom",
      onEnter: () => this.triggerSplash(splashParticles, section),
    });
    
    window.ScrollTrigger.create({
      trigger: section,
      start: "top top",
      onLeaveBack: () => this.triggerSplash(splashParticles, section),
    });
  }

  triggerSplash(particles, section) {
    if (!window.gsap) return;
    
    const centerX = section.offsetWidth / 2;
    const centerY = section.offsetHeight / 2;
    
    particles.forEach((particle, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const distance = window.gsap.utils.random(100, 400);
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      window.gsap.set(particle, {
        x: centerX,
        y: centerY,
        scale: 0,
        opacity: 1
      });
      
      window.gsap.to(particle, {
        x: endX,
        y: endY,
        scale: window.gsap.utils.random(1, 3),
        opacity: 0,
        duration: window.gsap.utils.random(0.8, 1.5),
        ease: "power2.out",
        delay: i * 0.01
      });
    });
    
    // Flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(35, 122, 109, 0.3), transparent 70%);
      pointer-events: none;
    `;
    section.appendChild(flash);
    
    window.gsap.fromTo(flash, 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => flash.remove()
      }
    );
  }
}

const CxvesLanding = () => {
  const [email, setEmail] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const matrixRefs = useRef([]);
  const matrixInstances = useRef([]);

  // Load GSAP scripts
  useEffect(() => {
    const loadGSAP = async () => {
      if (typeof window !== 'undefined' && !window.gsap) {
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        document.head.appendChild(gsapScript);
        
        const scrollTriggerScript = document.createElement('script');
        scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
        document.head.appendChild(scrollTriggerScript);
        
        await new Promise((resolve) => {
          scrollTriggerScript.onload = resolve;
        });
        
        if (window.gsap && window.ScrollTrigger) {
          window.gsap.registerPlugin(window.ScrollTrigger);
        }
      }
    };
    
    loadGSAP();
  }, []);

  // Matrix rain effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((scrolled / maxScroll) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize GSAP Matrix rain for each section
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.gsap && window.ScrollTrigger) {
        matrixRefs.current.forEach((container, index) => {
          if (container && !matrixInstances.current[index]) {
            matrixInstances.current[index] = new MatrixRain(container);
          }
        });
      }
    }, 500); // Wait for GSAP to load

    return () => {
      clearTimeout(timer);
      // Cleanup matrix instances
      matrixInstances.current.forEach(instance => {
        if (instance && instance.container) {
          instance.container.innerHTML = '';
        }
      });
    };
  }, []);

  const handleSubmit = () => {
    console.log('Email submitted:', email);
    // Handle email submission
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F2E8D4] overflow-x-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#0B0A09] z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#237A6D] to-[#B0793E] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div 
          ref={el => matrixRefs.current[0] = el}
          className="absolute inset-0 opacity-20 pointer-events-none"
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-8 opacity-90">
            <div className="w-48 h-48 mx-auto rounded-full flex items-center justify-center mb-6 relative">
              {/* Cxves Logo PNG */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#B0793E] to-[#237A6D] rounded-full opacity-20 animate-pulse"></div>
              <div className="relative w-32 h-32">
                <Image
                  src="/cxves-logo.png"
                  alt="Cxves Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#F2E8D4] to-[#B0793E] bg-clip-text text-transparent">
              Cxves
            </h1>
          </div>
          <p className="text-2xl md:text-3xl mb-12 font-light">
            AI deployment without the chaos.
          </p>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
            AI deployment, compliance & creation houses—welcome to Cxves.
          </p>
          <ChevronDown className="mx-auto mt-20 animate-bounce opacity-60" size={32} />
        </div>
      </section>

      {/* What We Ship Today */}
      <section className="relative min-h-screen py-20 px-6">
        <div 
          ref={el => matrixRefs.current[1] = el}
          className="absolute inset-0 opacity-10 pointer-events-none"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            What We Ship Today
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Readiness Audit",
                description: "Comprehensive assessment of your organization's AI maturity and deployment readiness.",
                icon: "🔍",
                features: ["Tech stack analysis", "Team capability assessment", "Infrastructure evaluation"]
              },
              {
                title: "Agent Orchestration",
                description: "Design and implement multi-agent systems that work seamlessly with your existing infrastructure.",
                icon: "🤖",
                features: ["Multi-agent coordination", "API integration", "Performance monitoring"]
              },
              {
                title: "Compliance Roadmaps",
                description: "Navigate AI regulations with custom compliance strategies tailored to your industry.",
                icon: "📋",
                features: ["Regulatory mapping", "Risk assessment", "Implementation guidance"]
              }
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-[#0B0A09] border border-[#237A6D] rounded-lg p-8 hover:border-[#B0793E] transition-all duration-300 hover:shadow-2xl hover:shadow-[#237A6D]/20 transform hover:-translate-y-2 group"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-[#B0793E]">{item.title}</h3>
                <p className="opacity-80 mb-6">{item.description}</p>
                <ul className="space-y-2 text-sm opacity-60 group-hover:opacity-80 transition-opacity">
                  {item.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="text-[#237A6D]">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Next / Our Coves */}
      <section className="relative min-h-screen py-20 px-6 bg-[#0B0A09]">
        <div 
          ref={el => matrixRefs.current[2] = el}
          className="absolute inset-0 opacity-10 pointer-events-none"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            What We're Incubating
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Micro-SaaS Acquisitions",
                description: "Building a portfolio of AI-enhanced vertical SaaS products.",
                status: "2025 Q2",
                progress: 65
              },
              {
                title: "Open-Source Tooling",
                description: "Contributing to the AI ecosystem with enterprise-grade tools.",
                status: "2025 Q3",
                progress: 40
              },
              {
                title: "Creative Robotics Lab",
                description: "Exploring the intersection of AI, robotics, and creative expression.",
                status: "2025 Q4",
                progress: 25
              }
            ].map((item, i) => (
              <div 
                key={i}
                className="bg-black/50 border border-[#237A6D]/30 rounded-lg p-8 hover:border-[#237A6D] transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#237A6D]">{item.title}</h3>
                  <span className="text-sm opacity-60 bg-[#237A6D]/20 px-2 py-1 rounded">{item.status}</span>
                </div>
                <p className="opacity-70 mb-6">{item.description}</p>
                <div className="w-full bg-[#0B0A09] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#237A6D] to-[#B0793E] transition-all duration-500 group-hover:opacity-100 opacity-70"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventures Grid - Future Acquisitions Placeholder */}
      <section className="relative py-20 px-6 bg-black/30">
        <div 
          ref={el => matrixRefs.current[3] = el}
          className="absolute inset-0 opacity-10 pointer-events-none"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            Our Coves Portfolio
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div 
                key={i}
                className="aspect-square bg-[#0B0A09]/50 border-2 border-dashed border-[#237A6D]/30 rounded-lg flex items-center justify-center group hover:border-[#B0793E]/50 transition-all duration-300"
              >
                <div className="text-center opacity-40 group-hover:opacity-60 transition-opacity">
                  <div className="text-4xl mb-2">⚬</div>
                  <p className="text-xs">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 opacity-60">
            Strategic acquisitions expanding our AI-first SaaS ecosystem
          </p>
        </div>
      </section>

      {/* Newsletter / Updates */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-[#0B0A09] to-black">
        <div 
          ref={el => matrixRefs.current[4] = el}
          className="absolute inset-0 opacity-5 pointer-events-none"
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Stay Inside the Cxves
          </h2>
          <p className="text-xl mb-12 opacity-80">
            Get weekly updates on our latest ventures, tools, and insights.
          </p>
          
          <div className="max-w-md mx-auto mb-16">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-black/50 border border-[#237A6D] rounded-lg px-6 py-3 text-[#F2E8D4] placeholder-[#F2E8D4]/50 focus:outline-none focus:border-[#B0793E] transition-colors"
                required
              />
              <button
                onClick={handleSubmit}
                className="bg-[#237A6D] hover:bg-[#B0793E] text-[#0B0A09] font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Mail size={20} />
                Subscribe
              </button>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-[#B0793E]">Recent Updates</h3>
            <div className="space-y-4">
              {[
                { date: "2025.05.28", update: "Launched Agent Orchestration v2.0 with multi-modal support", tag: "Product" },
                { date: "2025.05.15", update: "Completed Series A funding round", tag: "Company" },
                { date: "2025.05.01", update: "Released open-source compliance toolkit", tag: "Open Source" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start opacity-80 hover:opacity-100 transition-opacity group cursor-pointer">
                  <span className="text-[#237A6D] font-mono text-sm">{item.date}</span>
                  <div className="flex-1">
                    <p className="group-hover:text-[#B0793E] transition-colors">{item.update}</p>
                    <span className="text-xs bg-[#237A6D]/20 px-2 py-1 rounded mt-1 inline-block">{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#237A6D] to-[#B0793E]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#0B0A09]">
            Ready to Deploy AI the Right Way?
          </h2>
          <button className="bg-[#0B0A09] text-[#F2E8D4] font-bold px-12 py-4 rounded-lg hover:bg-black transition-colors flex items-center gap-3 mx-auto text-lg group">
            <Calendar size={24} />
            Book a 30-min Discovery Call
            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#237A6D] transition-colors">
                <Github size={24} />
              </a>
              <a href="#" className="hover:text-[#237A6D] transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="hover:text-[#237A6D] transition-colors">
                <Linkedin size={24} />
              </a>
            </div>
            <div className="flex gap-6 text-sm opacity-60">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
            </div>
            <p className="text-sm opacity-60">© 2025 Cxves. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CxvesLanding;