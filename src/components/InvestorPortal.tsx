import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Globe, Shield, Zap, LayoutDashboard, FileText, PieChart, Activity, Settings, Bell, Search, Plus, ChevronRight, ArrowUpRight, DollarSign, BarChart3, Briefcase, Share2 } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { toast } from 'sonner';

export default function InvestorPortal() {
  const { t } = useTranslation();

  const handleShare = async () => {
    const shareData = {
      title: 'CreatorBook Investor Pitch',
      text: 'Check out the future of the Creator Economy with CreatorBook.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('cb.post.share_success'));
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex bg-[#050510] text-white font-['Space_Grotesk'] overflow-hidden"
    >
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 h-full bg-[#0a0a1a]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col p-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#ff8c00] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <Briefcase className="w-5 h-5 text-black" />
          </div>
          <span className="hidden lg:block font-['Fraunces'] font-black text-lg tracking-tight">{t('inv.title')}</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SideNavButton active icon={<LayoutDashboard className="w-5 h-5" />} label={t('inv.nav.pitch')} />
          <SideNavButton icon={<BarChart3 className="w-5 h-5" />} label={t('inv.nav.financials')} />
          <SideNavButton icon={<PieChart className="w-5 h-5" />} label={t('inv.nav.cap')} />
          <SideNavButton icon={<FileText className="w-5 h-5" />} label={t('inv.nav.data')} />
          <SideNavButton icon={<Activity className="w-5 h-5" />} label={t('inv.nav.roadmap')} />
        </nav>

        <div className="mt-auto">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-bold">{t('inv.nav.settings')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,215,0,0.05),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 py-8 relative z-10">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-['Fraunces'] font-black">{t('inv.header.title')}</h1>
              <p className="text-sm text-white/40 font-medium">{t('inv.header.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-[#ffd700] transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="px-6 py-2 bg-[#ffd700] text-black text-xs font-black rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(255,215,0,0.2)]">{t('inv.header.btn')}</button>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Card */}
              <div className="bg-gradient-to-br from-[#ffd700] to-[#ff8c00] rounded-[32px] p-8 text-black shadow-[0_20px_40px_rgba(255,215,0,0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrendingUp className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-black/10">
                    {t('inv.hero.badge')}
                  </div>
                  <h2 className="text-4xl font-['Fraunces'] font-black mb-4 leading-tight">{t('inv.hero.title')}</h2>
                  <p className="text-sm font-medium opacity-80 mb-8 max-w-lg">{t('inv.hero.desc')}</p>
                  <div className="flex gap-4">
                    <button className="px-8 py-4 bg-black text-white text-xs font-black rounded-2xl uppercase tracking-widest flex items-center gap-2">
                      {t('inv.hero.watch')} <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-8 py-4 bg-white/20 backdrop-blur-md text-black text-xs font-black rounded-2xl uppercase tracking-widest border border-black/10 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> {t('cb.post.share')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label={t('inv.stats.target')} value="€2.5M" sub="Series Seed" icon={<DollarSign className="w-4 h-4" />} />
                <StatCard label={t('inv.stats.valuation')} value="€12M" sub={t('inv.stats.pre')} icon={<TrendingUp className="w-4 h-4" />} />
                <StatCard label={t('inv.stats.tam')} value="€500B" sub="Creator Economy" icon={<Globe className="w-4 h-4" />} />
                <StatCard label={t('inv.stats.burn')} value="€45k" sub={t('inv.stats.monthly')} icon={<Activity className="w-4 h-4" />} />
              </div>

              {/* Market Opportunity */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">{t('inv.problem.title')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ProblemCard 
                    title={t('inv.problem.1.title')} 
                    desc={t('inv.problem.1.desc')} 
                    icon={<Shield className="w-5 h-5" />}
                  />
                  <ProblemCard 
                    title={t('inv.problem.2.title')} 
                    desc={t('inv.problem.2.desc')} 
                    icon={<Zap className="w-5 h-5" />}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Financial Summary */}
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">{t('inv.financials.title')}</h3>
                <div className="space-y-6">
                  <FinancialItem label={t('inv.financials.revenue')} value="€1.2M" trend="+42%" />
                  <FinancialItem label={t('inv.financials.margin')} value="82%" trend="+5%" />
                  <FinancialItem label={t('inv.financials.cac')} value="€120" trend="-12%" />
                  <FinancialItem label={t('inv.financials.ltv')} value="€1,800" trend="+18%" />
                </div>
                <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  {t('inv.financials.btn')} <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Team Section */}
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">{t('inv.team.title')}</h3>
                <div className="space-y-4">
                  <TeamMember name="Max Mustermann" role={t('inv.team.ceo')} avatar="https://picsum.photos/seed/max/100/100" />
                  <TeamMember name="Sarah Miller" role={t('inv.team.cto')} avatar="https://picsum.photos/seed/sarah/100/100" />
                  <TeamMember name="David Chen" role={t('inv.team.coo')} avatar="https://picsum.photos/seed/david/100/100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

function SideNavButton({ active, icon, label }: { active?: boolean, icon: React.ReactNode, label: string }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="hidden md:block text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/40 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-[#ffd700] font-medium">{sub}</div>
    </div>
  );
}

function ProblemCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-[#ffd700]/40 transition-all group cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ffd700] mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-sm font-bold mb-2">{title}</h4>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

function FinancialItem({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
      <div className="text-xs font-bold text-[#39ff6e] bg-[#39ff6e]/10 px-2 py-1 rounded-lg border border-[#39ff6e]/20">
        {trend}
      </div>
    </div>
  );
}

function TeamMember({ name, role, avatar }: { name: string, role: string, avatar: string }) {
  return (
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-xl border border-white/10" />
      <div>
        <div className="text-xs font-bold">{name}</div>
        <div className="text-[10px] text-white/40 font-medium">{role}</div>
      </div>
    </div>
  );
}
