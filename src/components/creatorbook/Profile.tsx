import React from 'react';
import { 
  CheckCircle2, Youtube, Instagram, Music, Twitter 
} from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import FeedPost from './FeedPost';
import MetricCard from './MetricCard';

interface ProfileProps {
  user: any;
  profile: any;
  socials: any;
  posts: any[];
  trustScore: number;
  onEditProfile: () => void;
  onShareProfile: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  profile,
  socials,
  posts,
  trustScore,
  onEditProfile,
  onShareProfile
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-64 rounded-[40px] overflow-hidden border border-white/10">
        <img src="https://picsum.photos/seed/profile-banner/1200/400" className="w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
      </div>
      
      <div className="px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-[#00d4ff] to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-[30px] bg-[#050510] p-1">
              <img src={profile?.avatar || user?.photoURL || "https://picsum.photos/seed/max/100/100"} className="w-full h-full rounded-[26px] object-cover" alt="Avatar" />
            </div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black font-['Fraunces']">{profile?.name || user?.displayName || 'Max Creator'}</h2>
              {profile?.verified && <CheckCircle2 className="w-6 h-6 text-[#00d4ff]" />}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 font-bold tracking-tight">{profile?.handle || '@max_creator'}</span>
              <div className="flex gap-3">
                {['youtube', 'instagram', 'tiktok', 'x'].map(platform => {
                  const isConnected = socials?.[platform]?.connected;
                  const link = socials?.[platform]?.link;
                  const Icon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : platform === 'tiktok' ? Music : platform === 'x' ? Twitter : null;
                  if (!Icon) return null;
                  return (
                    <a 
                      key={platform}
                      href={link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      className={`transition-all ${isConnected ? 'text-white hover:text-[#00d4ff] hover:scale-110' : 'text-white/10 cursor-not-allowed'}`}
                      onClick={(e) => !isConnected && e.preventDefault()}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            <button 
              onClick={onEditProfile}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
            >
              {t('cb.profile.edit')}
            </button>
            <button 
              onClick={onShareProfile}
              className="px-6 py-2.5 bg-[#00d4ff] text-black rounded-xl text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform"
            >
              {t('cb.profile.share')}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <MetricCard label={t('cb.stats.trust_score')} value={trustScore.toString()} sub={t('cb.stats.verified')} subColor="text-[#39ff6e]" valueColor="text-[#00d4ff]" />
          <MetricCard label={t('cb.stats.followers')} value="125k" sub={`+1.2k ${t('cb.stats.week_growth')}`} subColor="text-[#39ff6e]" />
          <MetricCard label={t('cb.stats.engagement')} value="4.8%" sub={t('cb.stats.above_avg')} subColor="text-[#39ff6e]" />
          <MetricCard label={t('cb.stats.content_score')} value="94" sub={t('cb.stats.top_percent')} subColor="text-[#39ff6e]" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">{t('cb.profile.recent_posts')}</h3>
            <div className="space-y-6">
              {posts.filter(p => p.authorId === user?.uid).map(post => (
                <FeedPost key={post.id} post={post} />
              ))}
              {posts.filter(p => p.authorId === user?.uid).length === 0 && (
                <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
                  <p className="text-white/20 text-sm">{t('cb.profile.no_posts')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">About</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Tech enthusiast and content creator exploring the intersection of AI, design, and the future of work. Building the next generation of creative tools.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">Connected Platforms</h3>
              <div className="space-y-3">
                {Object.entries(socials).map(([id, data]: [string, any]) => (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.connected ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'bg-white/5 text-white/20'}`}>
                        {id === 'youtube' && <Youtube className="w-4 h-4" />}
                        {id === 'instagram' && <Instagram className="w-4 h-4" />}
                        {id === 'tiktok' && <Music className="w-4 h-4" />}
                        {id === 'x' && <Twitter className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-bold capitalize">{id}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${data.connected ? 'text-[#39ff6e]' : 'text-white/20'}`}>
                      {data.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
