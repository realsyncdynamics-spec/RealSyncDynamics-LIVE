import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Globe, Lock, ChevronLeft } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useSubscription } from '../contexts/SubscriptionContext';

interface PricingProps {
  onBack: () => void;
}

export default function Pricing({ onBack }: PricingProps) {
  const { t } = useTranslation();
  const { plan, upgrade } = useSubscription();

  const tiers = [
    {
      name: t('pricing.gratis.name'),
      id: 'gratis',
      price: '0€',
      description: t('pricing.gratis.desc'),
      features: [
        'Basis KI-Analyse',
        '1 Vault-Upload',
        'Community-Zugang'
      ],
      priceId: null,
      color: 'from-white/5 to-transparent'
    },
    {
      name: t('pricing.bronze.name'),
      id: 'bronze',
      price: '9€',
      period: '/mo',
      description: t('pricing.bronze.desc'),
      features: [
        t('pricing.feat.basic_ai'),
        t('pricing.feat.vault_3'),
        t('pricing.feat.community'),
        'Standard Support'
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_BRONZE || 'price_bronze_test',
      color: 'from-orange-500/20 to-transparent'
    },
    {
      name: t('pricing.silver.name'),
      id: 'silver',
      price: '29€',
      period: '/mo',
      description: t('pricing.silver.desc'),
      features: [
        t('pricing.feat.adv_ai'),
        t('pricing.feat.unlimited_vault'),
        t('pricing.feat.biometric'),
        t('pricing.feat.priority')
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_SILVER || 'price_silver_test',
      color: 'from-[#00d4ff]/20 to-transparent',
      featured: true
    },
    {
      name: t('pricing.gold.name'),
      id: 'gold',
      price: '99€',
      period: '/mo',
      description: t('pricing.gold.desc'),
      features: [
        t('pricing.feat.custom_ai'),
        t('pricing.feat.legal'),
        t('pricing.feat.api'),
        t('pricing.feat.manager')
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_GOLD || 'price_gold_test',
      color: 'from-[#00d4ff]/40 to-transparent'
    },
    {
      name: t('pricing.platinum.name'),
      id: 'platinum',
      price: '249€',
      period: '/mo',
      description: t('pricing.platinum.desc'),
      features: [
        'White-label Solution',
        'Unlimited API Calls',
        '24/7 Phone Support',
        'Custom Smart Infrastructure Integration'
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_PLATINUM || 'price_platinum_test',
      color: 'from-purple-500/40 to-transparent'
    },
    {
      name: t('pricing.diamond.name'),
      id: 'diamond',
      price: t('pricing.on_request'),
      description: t('pricing.diamond.desc'),
      features: [
        'Full Ecosystem Integration',
        'On-premise Deployment',
        'Custom Security Audits',
        'Direct Engineering Access'
      ],
      priceId: null,
      color: 'from-blue-200/40 to-transparent'
    }
  ];

  const handleUpgrade = (tier: any) => {
    if (tier.id === 'diamond') {
      window.location.href = `mailto:RealSyncDynamics@gmail.com?subject=Inquiry for Diamond Plan&body=Hello RSD Team, I am interested in the Diamond Plan.`;
      return;
    }
    if (tier.priceId) {
      upgrade(tier.priceId);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-12 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#00d4ff] flex items-center gap-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {t('pricing.back')}
        </button>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-black font-['Fraunces'] mb-4">{t('pricing.title')}</h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-8 rounded-[32px] border ${tier.featured ? 'border-[#00d4ff]/50 bg-white/5' : 'border-white/10 bg-white/[0.03]'} backdrop-blur-md flex flex-col`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#00d4ff] text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                  {t('pricing.most_popular')}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{tier.price}</span>
                  {tier.period && <span className="text-white/40 text-sm">{tier.period}</span>}
                </div>
                <p className="text-sm text-white/60 mt-4">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {tier.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-[#00d4ff]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#00d4ff]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                disabled={plan === tier.id}
                onClick={() => handleUpgrade(tier)}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                  plan === tier.id 
                    ? 'bg-white/10 text-white/40 cursor-default' 
                    : tier.featured 
                      ? 'bg-[#00d4ff] text-black hover:scale-105' 
                      : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {plan === tier.id 
                  ? t('pricing.current_plan') 
                  : tier.id === 'diamond' 
                    ? t('pricing.contact_us') 
                    : tier.priceId 
                      ? t('pricing.upgrade_now') 
                      : t('pricing.get_started')}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <Shield className="w-8 h-8 text-[#00d4ff] mx-auto mb-4" />
            <h4 className="font-bold mb-2">{t('pricing.secure_payments')}</h4>
            <p className="text-xs text-white/40">{t('pricing.secure_payments_desc')}</p>
          </div>
          <div>
            <Zap className="w-8 h-8 text-[#00d4ff] mx-auto mb-4" />
            <h4 className="font-bold mb-2">{t('pricing.instant_activation')}</h4>
            <p className="text-xs text-white/40">{t('pricing.instant_activation_desc')}</p>
          </div>
          <div>
            <Globe className="w-8 h-8 text-[#00d4ff] mx-auto mb-4" />
            <h4 className="font-bold mb-2">{t('pricing.global_support')}</h4>
            <p className="text-xs text-white/40">{t('pricing.global_support_desc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
