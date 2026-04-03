import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Mail, MapPin, Phone, Globe, ExternalLink, Building } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface ImpressumProps {
  onBack: () => void;
}

const Impressum: React.FC<ImpressumProps> = ({ onBack }) => {
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
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-['Fraunces'] tracking-tight">
            {t('legal.impressum.title')}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#00d4ff]" /> {t('contact.name') || 'RealSyncDynamics GmbH'}
              </h2>
              <div className="space-y-4 text-[#94a3b8] leading-relaxed">
                <p className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-white/40 mt-1" />
                  <span>
                    Schwarzburgerstr. 31<br />
                    98724 Neuhaus am Rennweg<br />
                    Germany
                  </span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white/40" />
                  <a href="mailto:RealSyncDynamics@gmail.com" className="hover:text-white transition-colors">
                    RealSyncDynamics@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Represented by</h3>
              <p className="text-lg font-bold">Max Mustermann</p>
              <p className="text-[#94a3b8] text-sm mt-1">Managing Director / Geschäftsführer</p>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Legal Registration</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Registry Court</p>
                  <p className="font-bold">District Court Jena (Amtsgericht Jena)</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Registry Number</p>
                  <p className="font-bold">HRB 123456</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">VAT Identification Number</p>
                  <p className="font-bold">DE 987654321</p>
                </div>
              </div>
            </section>

            <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Online Dispute Resolution</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
                The European Commission provides a platform for online dispute resolution (OS):
              </p>
              <a 
                href="https://ec.europa.eu/consumers/odr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#00d4ff] text-xs font-bold transition-all"
              >
                Visit ODR Platform <ExternalLink className="w-3 h-3" />
              </a>
            </section>
          </div>
        </div>

        <div className="mt-12 p-8 border-t border-white/5 text-[#475569] text-xs leading-relaxed">
          <p>
            Responsible for content according to § 55 Abs. 2 RStV: Max Mustermann, Schwarzburgerstr. 31, 98724 Neuhaus am Rennweg.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Impressum;
