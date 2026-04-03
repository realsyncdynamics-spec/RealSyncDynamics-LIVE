import React from 'react';
import { motion } from 'motion/react';
import { Home, Shield, Zap, Lock, MapPin, Activity, Settings, Bell, Search, Plus, ChevronRight, Thermometer, Droplets, Wind, Power } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

export default function SmartWorld() {
  const { t } = useTranslation();
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39ff6e] to-[#0099cc] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,110,0.3)]">
            <Home className="w-5 h-5 text-black" />
          </div>
          <span className="hidden lg:block font-['Fraunces'] font-black text-lg tracking-tight">SmartWorld</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SideNavButton active icon={<Home className="w-5 h-5" />} label={t('smart.nav.overview')} />
          <SideNavButton icon={<Shield className="w-5 h-5" />} label={t('smart.nav.security')} />
          <SideNavButton icon={<Zap className="w-5 h-5" />} label={t('smart.nav.energy')} />
          <SideNavButton icon={<MapPin className="w-5 h-5" />} label={t('smart.nav.devices')} />
          <SideNavButton icon={<Activity className="w-5 h-5" />} label={t('smart.nav.analytics')} />
        </nav>

        <div className="mt-auto">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-bold">{t('smart.nav.settings')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(57,255,110,0.05),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 py-8 relative z-10">
          <header className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-['Fraunces'] font-black">{t('smart.header.title')}</h1>
              <p className="text-sm text-white/40 font-medium">{t('smart.header.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text" 
                  placeholder={t('smart.header.search')} 
                  className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#39ff6e]/40 w-64"
                />
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative">
                <Bell className="w-5 h-5 text-white/60" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#39ff6e] rounded-full border-2 border-[#050510]" />
              </button>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusCard icon={<Thermometer className="w-4 h-4" />} label={t('smart.stats.temp')} value="21.5°C" sub="Indoor" />
                <StatusCard icon={<Droplets className="w-4 h-4" />} label={t('smart.stats.humidity')} value="45%" sub="Optimal" />
                <StatusCard icon={<Wind className="w-4 h-4" />} label={t('smart.stats.air')} value="Good" sub="98 AQI" />
                <StatusCard icon={<Power className="w-4 h-4" />} label={t('smart.stats.energy')} value="1.2 kW" sub="Current" />
              </div>

              {/* Main Control Card */}
              <div className="bg-gradient-to-br from-[#39ff6e] to-[#0099cc] rounded-[32px] p-8 text-black shadow-[0_20px_40px_rgba(57,255,110,0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Home className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-['Fraunces'] font-black mb-2">{t('smart.welcome')}</h2>
                  <p className="text-sm font-medium opacity-80 mb-8">{t('smart.eco_mode')}</p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-black text-white text-xs font-black rounded-xl uppercase tracking-widest">{t('smart.btn.arriving')}</button>
                    <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-black text-xs font-black rounded-xl uppercase tracking-widest border border-black/10">{t('smart.btn.leaving')}</button>
                  </div>
                </div>
              </div>

              {/* Device Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">{t('smart.devices.active')}</h3>
                  <button className="text-[10px] font-bold text-[#39ff6e] hover:underline uppercase tracking-widest">{t('smart.devices.add')}</button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <DeviceItem name={t('smart.devices.lock')} room={t('smart.rooms.entrance')} status={t('smart.status.locked')} icon={<Lock className="w-5 h-5" />} active />
                  <DeviceItem name={t('smart.devices.ac')} room={t('smart.rooms.living')} status="22°C" icon={<Thermometer className="w-5 h-5" />} active />
                  <DeviceItem name={t('smart.devices.lights')} room={t('smart.rooms.kitchen')} status={t('smart.status.off')} icon={<Zap className="w-5 h-5" />} />
                  <DeviceItem name={t('smart.devices.garage')} room={t('smart.rooms.garage')} status={t('smart.status.closed')} icon={<Lock className="w-5 h-5" />} active />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Security Status */}
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">{t('smart.security.status')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#39ff6e]/5 border border-[#39ff6e]/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#39ff6e]" />
                      <span className="text-sm font-bold">{t('smart.security.armed')}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#39ff6e] animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <SecurityLog time="21:42" event={t('smart.security.log.locked')} />
                    <SecurityLog time="20:15" event={t('smart.security.log.motion')} />
                    <SecurityLog time="18:30" event={t('smart.security.log.armed')} />
                  </div>
                </div>
              </div>

              {/* Energy Usage */}
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">{t('smart.energy.title')}</h3>
                <div className="h-32 flex items-end justify-between gap-2 mb-4">
                  {[40, 65, 45, 90, 55, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group">
                      <div 
                        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#39ff6e] to-[#00d4ff] rounded-t-lg transition-all duration-500" 
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <span>{t('smart.days.mon')}</span>
                  <span>{t('smart.days.sun')}</span>
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
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-[#39ff6e]/10 text-[#39ff6e] border border-[#39ff6e]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      {icon}
      <span className="hidden md:block text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

function StatusCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/40 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-white/20 font-medium">{sub}</div>
    </div>
  );
}

function DeviceItem({ name, room, status, icon, active }: { name: string, room: string, status: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${active ? 'bg-white/5 border-[#39ff6e]/30' : 'bg-white/[0.02] border-white/10'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-[#39ff6e]/10 text-[#39ff6e]' : 'bg-white/5 text-white/20'}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold">{name}</div>
          <div className="text-[10px] text-white/40 font-medium">{room}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#39ff6e]' : 'text-white/20'}`}>{status}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-[#39ff6e]' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
        </div>
      </div>
    </div>
  );
}

function SecurityLog({ time, event }: { time: string, event: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-bold text-white/20">{time}</span>
      <span className="text-xs text-white/60">{event}</span>
    </div>
  );
}
