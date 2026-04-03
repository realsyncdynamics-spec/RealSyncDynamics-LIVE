import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, FileText, Video, Activity, CheckCircle2, TrendingUp, ShieldCheck 
} from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SecurityProps {
  takedowns: any[];
  licenses: any[];
  communityStats: any;
  shadowbanData: any;
  insuranceData: any;
  onTakedown: (id: string) => void;
  onAnalyseContract: (id: string) => void;
  onGenerateSecurityVideo: (prompt: string) => void;
  onCheckShadowban: () => void;
}

const Security: React.FC<SecurityProps> = ({
  takedowns,
  licenses,
  communityStats,
  shadowbanData,
  insuranceData,
  onTakedown,
  onAnalyseContract,
  onGenerateSecurityVideo,
  onCheckShadowban
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{t('cb.security.takedowns')}</h3>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="space-y-4">
            {takedowns.map((tk) => (
              <div key={tk.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-xs font-bold truncate max-w-[180px] text-white">{tk.videoTitle}</div>
                    <div className="text-[10px] text-white/40">{tk.platform} · {tk.channel}</div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${tk.status === 'Detected' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {tk.status === 'Detected' ? t('cb.security.status.detected') : t('cb.security.status.sent')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-[10px] font-bold text-[#00d4ff]">{tk.matchPercent}% {t('cb.security.match')}</div>
                  <button 
                    onClick={() => onTakedown(tk.id)}
                    className="px-3 py-1 rounded-lg bg-white text-black text-[10px] font-bold hover:bg-[#00d4ff] transition-all"
                  >
                    {t('cb.security.takedown_btn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{t('cb.security.licensing')}</h3>
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#00d4ff]" />
            </div>
          </div>
          <div className="space-y-4">
            {licenses.map((lic) => (
              <div key={lic.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{lic.content}</div>
                  <div className="text-[10px] text-white/40">{lic.type} · {lic.price}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${lic.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                  {lic.status === 'Active' ? t('cb.security.status.active') : t('cb.security.status.pending')}
                </div>
              </div>
            ))}
            <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-white/40 hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all uppercase tracking-widest">
              {t('cb.security.new_license')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-['Fraunces'] font-black">{t('cb.security.community_defense')}</h3>
            <button 
              onClick={() => onGenerateSecurityVideo(`Community defense report: ${communityStats.stats.hateSpeechBlocked} hate speech blocked, ${communityStats.stats.spamFiltered} spam filtered.`)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#00d4ff] transition-all"
              title="Generate Explanatory Video"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
          {communityStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">{t('cb.security.blocked_hate')}</div>
                  <div className="text-xl font-bold text-red-500">{communityStats.stats.hateSpeechBlocked}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">{t('cb.security.spam_filtered')}</div>
                  <div className="text-xl font-bold text-[#00d4ff]">{communityStats.stats.spamFiltered}</div>
                </div>
              </div>
              <div>
                <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-3">{t('cb.security.active_filters')}</div>
                <div className="flex flex-wrap gap-2">
                  {communityStats.activeFilters.map((f: string) => (
                    <span key={f} className="px-3 py-1 rounded-lg bg-[#39ff6e]/10 text-[#39ff6e] text-[9px] font-bold border border-[#39ff6e]/20 uppercase tracking-widest">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-['Fraunces'] font-black">{t('cb.security.shadowban')}</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          {shadowbanData && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#39ff6e]/10 text-[#39ff6e] rounded-xl border border-[#39ff6e]/20">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('cb.security.status_label')}: {shadowbanData.status}</span>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={shadowbanData.reachTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', fontSize: '10px', color: 'white' }}
                      itemStyle={{ color: '#00d4ff' }}
                    />
                    <Line type="monotone" dataKey="expected" stroke="rgba(255,255,255,0.2)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00d4ff]" /> {t('cb.security.actual_reach')}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/20 border border-dashed border-white/40" /> {t('cb.security.expected')}
                </div>
              </div>
              <button 
                onClick={onCheckShadowban}
                className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 transition-all uppercase tracking-widest"
              >
                {t('cb.security.deep_analysis') || 'Run Deep Analysis'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-[32px] text-black shadow-[0_20px_40px_rgba(0,212,255,0.2)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-black/80" />
              <h3 className="text-2xl font-['Fraunces'] font-black">{t('cb.security.insurance')}</h3>
            </div>
            <p className="text-sm text-black/70 max-w-xl leading-relaxed font-medium">
              {t('cb.security.insurance_desc')}
            </p>
          </div>
          {insuranceData && (
            <div className="bg-black/10 backdrop-blur-md p-6 rounded-2xl border border-black/10 min-w-[240px]">
              <div className="text-[9px] text-black/60 uppercase font-bold tracking-widest mb-1">{t('cb.security.active_policy')}</div>
              <div className="text-lg font-bold mb-4">{insuranceData.provider}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[8px] text-black/50 uppercase font-bold tracking-widest">{t('cb.security.coverage')}</div>
                  <div className="text-xs font-bold">{insuranceData.coverageLimit}</div>
                </div>
                <div>
                  <div className="text-[8px] text-black/50 uppercase font-bold tracking-widest">{t('cb.security.next_payment')}</div>
                  <div className="text-xs font-bold">{insuranceData.nextPayment}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {insuranceData?.legalCases?.length > 0 && (
          <div className="mt-8 pt-8 border-t border-black/10">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4">{t('cb.security.cases_title')}</div>
            <div className="space-y-3">
              {insuranceData.legalCases.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-xs">⚖️</div>
                    <div>
                      <div className="text-xs font-bold">{c.opponent}</div>
                      <div className="text-[10px] text-black/50 font-medium">{c.status}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-green-700 uppercase tracking-widest">{c.result}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Security;
