import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Lock, Eye, FileText, Globe, ExternalLink } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface DatenschutzProps {
  onBack: () => void;
}

const Datenschutz: React.FC<DatenschutzProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 overflow-y-auto bg-[#060612] text-white"
    >
      <div className="max-w-4xl mx-auto px-6 py-20">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#00d4ff] font-bold text-sm mb-12 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back') || 'Back'}
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-['Fraunces'] tracking-tight">
            {t('legal.privacy.title')}
          </h1>
        </div>

        <div className="space-y-12">
          <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-5 h-5 text-[#00d4ff]" />
              <h2 className="text-xl font-bold">{t('legal.privacy.title')}</h2>
            </div>
            <div className="text-[#94a3b8] leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {t('legal.privacy.content')}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Data Controller</h3>
              <p className="text-lg font-bold mb-2">RealSyncDynamics GmbH</p>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Schwarzburgerstr. 31<br />
                98724 Neuhaus am Rennweg<br />
                Germany
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Contact</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">
                For any privacy-related inquiries, please contact our data protection officer:
              </p>
              <a 
                href="mailto:RealSyncDynamics@gmail.com" 
                className="inline-flex items-center gap-2 text-[#00d4ff] font-bold hover:underline"
              >
                <FileText className="w-4 h-4" /> RealSyncDynamics@gmail.com
              </a>
            </div>
          </section>

          <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Your Rights</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-bold text-white">Right to Information</p>
                <p className="text-[#94a3b8] text-xs">You have the right to receive information about the origin, recipient and purpose of your stored personal data at any time free of charge.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-white">Right to Rectification</p>
                <p className="text-[#94a3b8] text-xs">You have the right to demand the immediate correction of incorrect personal data concerning you.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-white">Right to Erasure</p>
                <p className="text-[#94a3b8] text-xs">You have the right to demand that personal data concerning you be deleted immediately.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-white">Right to Portability</p>
                <p className="text-[#94a3b8] text-xs">You have the right to have data that we process automatically based on your consent or in fulfillment of a contract handed over to you or to a third party.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 p-8 border-t border-white/5 text-[#475569] text-xs leading-relaxed text-center">
          <p>© 2026 RealSyncDynamics GmbH. All rights reserved. EU Data Sovereignty Guaranteed.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Datenschutz;
