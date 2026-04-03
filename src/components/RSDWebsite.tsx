import React, { useEffect, useRef, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Globe, Zap, Server, Users, Mail, ArrowRight, CheckCircle2, Building, LayoutGrid, FileText, MessageSquare, MapPin, X } from 'lucide-react';
import { AppId } from '../App';
import { useTranslation } from '../contexts/TranslationContext';

interface RSDWebsiteProps {
  onNavigate: (id: AppId) => void;
  activeSection: 'rsd' | 'solutions' | 'products' | 'about' | 'contact';
}

const RSDWebsite: React.FC<RSDWebsiteProps> = ({ onNavigate, activeSection }) => {
  const { t } = useTranslation();
  const [legalView, setLegalView] = useState<'impressum' | 'privacy' | 'compliance' | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = {
    rsd: useRef<HTMLElement>(null),
    solutions: useRef<HTMLElement>(null),
    products: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    if (activeSection && sectionsRef[activeSection]?.current) {
      sectionsRef[activeSection].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

  return (
    <motion.div 
      ref={scrollContainerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#060612] scroll-smooth selection:bg-[#00d4ff] selection:text-black"
    >
      {/* 1. HERO SECTION */}
      <section 
        ref={sectionsRef.rsd}
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(0,212,255,0.08),transparent_70%)] pointer-events-none" />
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-['Fraunces'] font-black text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05] tracking-tight mb-8 max-w-5xl drop-shadow-[0_0_30px_rgba(0,212,255,0.2)]"
        >
          {t('hero.title').split('–')[0]} – <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#10b981]">{t('hero.title').split('–')[1]}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-[#94a3b8] max-w-3xl mx-auto mb-12 font-light leading-relaxed tracking-wide"
        >
          {t('hero.subline')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <button 
            onClick={() => onNavigate('pricing')}
            className="px-10 py-5 rounded-2xl text-sm font-black bg-gradient-to-r from-[#00d4ff] to-[#10b981] text-[#060612] hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all flex items-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
            <span className="relative z-10">{t('hero.cta1')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
          </button>
          <button 
            onClick={() => onNavigate('inv')} 
            className="px-10 py-5 rounded-2xl text-sm font-black bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all backdrop-blur-xl"
          >
            {t('hero.cta2')}
          </button>
        </motion.div>

        {/* 2. VERTRAUENSBLOCK */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-24 flex flex-col items-center gap-4 border-t border-white/5 pt-12 w-full max-w-5xl"
        >
          <div className="text-white font-bold text-sm md:text-base tracking-wide">
            {t('trust.badge')}
          </div>
          <div className="text-[#475569] text-xs md:text-sm uppercase tracking-widest">
            {t('trust.sub')}
          </div>
        </motion.div>
      </section>

      {/* 3. LEISTUNGEN (Lösungen) */}
      <section 
        ref={sectionsRef.solutions}
        className="px-6 py-32 max-w-7xl mx-auto"
      >
        <div className="text-center mb-20">
          <h2 className="font-['Fraunces'] font-black text-4xl md:text-5xl mb-6">{t('solutions.title')}</h2>
          <p className="text-[#94a3b8] max-w-2xl mx-auto">{t('solutions.desc')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <ServiceCard 
            icon={<CheckCircle2 className="w-6 h-6 text-[#00d4ff]" />}
            title={t('solutions.1.title')}
            desc={t('solutions.1.desc')}
          />
          <ServiceCard 
            icon={<Shield className="w-6 h-6 text-[#10b981]" />}
            title={t('solutions.2.title')}
            desc={t('solutions.2.desc')}
          />
          <ServiceCard 
            icon={<Building className="w-6 h-6 text-purple-400" />}
            title={t('solutions.3.title')}
            desc={t('solutions.3.desc')}
          />
        </div>
      </section>

      {/* 4. PRODUKTE */}
      <section 
        ref={sectionsRef.products}
        className="px-6 py-32 bg-white/[0.02] border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
              <h2 className="font-['Fraunces'] font-black text-4xl md:text-5xl mb-6">{t('products.title')}</h2>
              <p className="text-[#94a3b8] max-w-xl">{t('products.desc')}</p>
            </div>
            <button onClick={() => onNavigate('products')} className="text-[#00d4ff] font-bold text-sm flex items-center gap-2 hover:underline">
              {t('products.all')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <ProductCard 
              id="cb"
              title="CreatorBook"
              tagline="Trust for Creators"
              desc={t('products.cb.desc')}
              onNavigate={onNavigate}
            />
            <ProductCard 
              id="verify"
              title="RSD AI Suite"
              tagline="Security & Analysis"
              desc={t('products.ai.desc')}
              onNavigate={onNavigate}
            />
            <ProductCard 
              id="smart"
              title="RSD Smart World"
              tagline="Connected Infrastructure"
              desc={t('products.smart.desc')}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </section>

      {/* 5. ZIELGRUPPEN */}
      <section className="px-6 py-32 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12">
          <TargetGroup 
            icon={<Users className="w-8 h-8" />}
            title={t('target.1.title')}
            desc={t('target.1.desc')}
          />
          <TargetGroup 
            icon={<Building className="w-8 h-8" />}
            title={t('target.2.title')}
            desc={t('target.2.desc')}
          />
          <TargetGroup 
            icon={<Globe className="w-8 h-8" />}
            title={t('target.3.title')}
            desc={t('target.3.desc')}
          />
        </div>
      </section>

      {/* 6. ÜBER UNS */}
      <section 
        ref={sectionsRef.about}
        className="px-6 py-32 max-w-5xl mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#10b981] flex items-center justify-center mx-auto mb-12 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
          <Shield className="w-8 h-8 text-[#060612]" />
        </div>
        <h2 className="font-['Fraunces'] font-black text-4xl md:text-5xl mb-8">{t('about.title')}</h2>
        <p className="text-xl md:text-2xl text-[#b8c4e0] font-light leading-relaxed">
          {t('about.desc')}
        </p>
      </section>

      {/* 7. KONTAKT / CTA */}
      <section 
        ref={sectionsRef.contact}
        className="px-6 py-32 mb-20"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 bg-gradient-to-br from-[#00d4ff]/10 to-purple-500/10 border border-white/10 rounded-[40px] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="font-['Fraunces'] font-black text-4xl md:text-6xl mb-8">{t('cta.title')}</h2>
            <p className="text-[#94a3b8] text-lg mb-12 max-w-2xl leading-relaxed">
              {t('cta.desc')}
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('contact.email_label') || 'Email'}</div>
                  <div className="text-white font-bold">{t('contact.email')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('contact.address_label') || 'Office'}</div>
                  <div className="text-white font-bold">{t('contact.address')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t('contact.form.name') || 'Name'}</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t('contact.form.email') || 'Email'}</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t('contact.form.subject') || 'Subject'}</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all" placeholder="Partnership Inquiry" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{t('contact.form.message') || 'Message'}</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#00d4ff] outline-none transition-all resize-none" placeholder="Tell us about your project..." required />
              </div>
              <button type="submit" className="w-full py-4 rounded-xl bg-[#00d4ff] text-[#060612] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all">
                {t('contact.form.submit') || 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-white/5 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#00d4ff]" />
              <span className="font-black text-xl text-white tracking-tighter">{t('contact.name')}</span>
            </div>
            <div className="space-y-2 text-[#94a3b8] text-sm">
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/40" />
                {t('contact.address')}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/40" />
                <a href={`mailto:${t('contact.email')}`} className="hover:text-white transition-colors">
                  {t('contact.email')}
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-col md:items-end justify-center gap-6">
            <div className="flex gap-8 text-[#475569] text-[10px] font-black uppercase tracking-[0.2em]">
              <button onClick={() => onNavigate('impressum')} className="hover:text-[#00d4ff] transition-all">{t('footer.impressum')}</button>
              <button onClick={() => onNavigate('datenschutz')} className="hover:text-[#00d4ff] transition-all">{t('footer.privacy')}</button>
              <button onClick={() => setLegalView('compliance')} className="hover:text-[#00d4ff] transition-all">{t('footer.compliance')}</button>
            </div>
            <div className="text-[#475569] text-[10px] uppercase tracking-[0.2em]">
              RealSyncDynamics © 2026 · {t('trust.badge').split('·')[0]}
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Overlay */}
      <AnimatePresence>
        {legalView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a16] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{t(`legal.${legalView}.title`)}</h3>
                <button 
                  onClick={() => setLegalView(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white/60" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto text-[#94a3b8] leading-relaxed whitespace-pre-wrap text-sm">
                {t(`legal.${legalView}.content`)}
              </div>
              <div className="p-6 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setLegalView(null)}
                  className="px-6 py-2 rounded-xl bg-[#00d4ff] text-[#060612] text-sm font-bold hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-white/10 transition-all group">
      <div className="mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ProductCard({ id, title, tagline, desc, onNavigate }: { id: AppId, title: string, tagline: string, desc: string, onNavigate: (id: AppId) => void }) {
  const { t } = useTranslation();
  return (
    <div className="p-8 bg-[#0a0a16] border border-white/5 rounded-[32px] flex flex-col h-full hover:border-[#00d4ff]/30 transition-all group">
      <div className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-[2px] mb-2">{tagline}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-[#94a3b8] text-sm mb-8 flex-1 leading-relaxed">{desc}</p>
      <button 
        onClick={() => onNavigate(id)}
        className="w-full py-3 rounded-xl bg-white/5 text-white text-xs font-bold border border-white/10 group-hover:bg-[#00d4ff] group-hover:text-[#060612] group-hover:border-transparent transition-all"
      >
        {t('products.btn.open')}
      </button>
    </div>
  );
}

function TargetGroup({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/60">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default RSDWebsite;
