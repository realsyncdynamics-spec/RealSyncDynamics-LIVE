import React from 'react';
import { Shield, CheckCircle2, AlertCircle, ExternalLink, Key, Database, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminSetupGuide() {
  const env = import.meta.env;
  const [serverStatus, setServerStatus] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(setServerStatus)
      .catch(console.error);
  }, []);

  const steps = [
    {
      id: 'stripe-keys',
      title: 'Stripe API Keys',
      description: 'Hinterlegen Sie Ihren Publishable Key (Client) und Secret Key (Server).',
      status: (env.VITE_STRIPE_PUBLISHABLE_KEY && serverStatus?.STRIPE_SECRET_KEY) ? 'success' : 'warning',
      link: 'https://dashboard.stripe.com/apikeys',
      varNames: ['VITE_STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'],
      serverVars: ['STRIPE_SECRET_KEY']
    },
    {
      id: 'stripe-webhook',
      title: 'Stripe Webhook Secret',
      description: 'Hinterlegen Sie das Webhook-Geheimnis für Echtzeit-Guthaben-Updates.',
      status: serverStatus?.STRIPE_WEBHOOK_SECRET ? 'success' : 'warning',
      link: 'https://dashboard.stripe.com/webhooks',
      varNames: ['STRIPE_WEBHOOK_SECRET'],
      serverVars: ['STRIPE_WEBHOOK_SECRET']
    },
    {
      id: 'stripe-prices',
      title: 'Stripe Price IDs',
      description: 'Erstellen Sie Produkte in Stripe und kopieren Sie die Preis-IDs.',
      status: env.VITE_STRIPE_PRICE_BRONZE && env.VITE_STRIPE_PRICE_SILVER && env.VITE_STRIPE_PRICE_GOLD && env.VITE_STRIPE_PRICE_PLATINUM && env.VITE_STRIPE_PRICE_DIAMOND ? 'success' : 'warning',
      link: 'https://dashboard.stripe.com/products',
      varNames: ['VITE_STRIPE_PRICE_BRONZE', 'VITE_STRIPE_PRICE_SILVER', 'VITE_STRIPE_PRICE_GOLD', 'VITE_STRIPE_PRICE_PLATINUM', 'VITE_STRIPE_PRICE_DIAMOND']
    },
    {
      id: 'gemini-key',
      title: 'Gemini AI API Key',
      description: 'Hinterlegen Sie Ihren Gemini API Key für KI-Sicherheits-Audits und Creator-Tools.',
      status: serverStatus?.GEMINI_API_KEY ? 'success' : 'warning',
      link: 'https://aistudio.google.com/app/apikey',
      varNames: ['GEMINI_API_KEY'],
      serverVars: ['GEMINI_API_KEY']
    },
    {
      id: 'firebase-auth',
      title: 'Firebase Auth Domains',
      description: 'Fügen Sie Ihre Domain zu den autorisierten Domains hinzu.',
      status: 'info',
      link: 'https://console.firebase.google.com/project/_/authentication/settings',
    },
    {
      id: 'google-oauth',
      title: 'Google OAuth Redirects',
      description: 'Konfigurieren Sie die Redirect-URIs in der Google Cloud Console.',
      status: 'info',
      link: 'https://console.cloud.google.com/apis/credentials',
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-[#050510] text-white rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[80vh]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#10b981] flex items-center justify-center">
          <Shield className="w-6 h-6 text-[#050510]" />
        </div>
        <div>
          <h2 className="text-2xl font-black font-['Fraunces']">Go-Live Assistent</h2>
          <p className="text-white/40 text-sm">Status-Check für RealSyncDynamics Produktion</p>
        </div>
      </div>

      <div className="grid gap-4">
        {steps.map((step) => (
          <motion.div 
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4"
          >
            <div className={`mt-1 ${
              step.status === 'success' ? 'text-green-400' : 
              step.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
            }`}>
              {step.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{step.title}</h3>
              <p className="text-white/60 text-sm mb-4">{step.description}</p>
              
              {step.varNames && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {step.varNames.map(v => {
                    const isServer = step.serverVars?.includes(v);
                    const isSet = isServer ? serverStatus?.[v] : env[v];
                    return (
                      <div key={v} className="flex items-center gap-1">
                        <code className="text-[10px] bg-black/40 px-2 py-1 rounded text-[#00d4ff]">{v}</code>
                        <span className="text-[10px] text-white/30">{isSet ? '✅' : '❌'}</span>
                        {isServer && <span className="text-[8px] text-white/20 uppercase">Server</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              <a 
                href={step.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold"
              >
                Konsole öffnen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#00d4ff]/10 to-transparent border border-[#00d4ff]/20">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00d4ff]" /> Nächste Schritte
        </h4>
        <ol className="text-sm text-white/60 space-y-2 list-decimal ml-4">
          <li>Gehen Sie in AI Studio auf <b>Settings &rarr; Environment Variables</b>.</li>
          <li>Tragen Sie alle oben rot markierten (❌) Variablen ein.</li>
          <li>Klicken Sie auf <b>Save</b>.</li>
          <li>Die App lädt neu und der Status wird grün (✅).</li>
        </ol>
      </div>
    </div>
  );
}
