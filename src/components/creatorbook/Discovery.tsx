import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ShieldCheck, Star, Globe, Zap, ExternalLink, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface DiscoveryProps {
  creators: any[];
  onSelectCreator: (creator: any) => void;
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (val: boolean) => void;
  minFollowers: string;
  onMinFollowersChange: (val: string) => void;
  language: string;
  onLanguageChange: (val: string) => void;
  country: string;
  onCountryChange: (val: string) => void;
  platform: string;
  onPlatformChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (val: boolean) => void;
}

export default function Discovery({ 
  creators, 
  onSelectCreator,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  minFollowers,
  onMinFollowersChange,
  language,
  onLanguageChange,
  country,
  onCountryChange,
  platform,
  onPlatformChange,
  sortBy,
  onSortByChange,
  showFilters,
  onShowFiltersChange
}: DiscoveryProps) {
  const { t } = useTranslation();

  const filteredCreators = creators
    .filter(c => {
      const matchesSearch = (c.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (c.handle?.toLowerCase() || '').includes(search.toLowerCase());
      const matchesCategory = category === 'All' || c.category === category;
      const matchesVerified = !verifiedOnly || c.verified;
      const matchesLanguage = language === 'All' || c.language === language;
      const matchesCountry = country === 'All' || c.country === country;
      const matchesPlatform = platform === 'All' || (c.platforms && c.platforms.includes(platform));
      
      let matchesFollowers = true;
      if (minFollowers !== 'All') {
        const followersStr = c.followers || '0';
        const count = parseFloat(followersStr.replace(/[^0-9.]/g, ''));
        const multiplier = followersStr.includes('M') ? 1000000 : (followersStr.includes('k') ? 1000 : 1);
        const total = count * multiplier;
        if (minFollowers === '100k+') matchesFollowers = total >= 100000;
        if (minFollowers === '500k+') matchesFollowers = total >= 500000;
        if (minFollowers === '1M+') matchesFollowers = total >= 1000000;
      }
      
      return matchesSearch && matchesCategory && matchesVerified && matchesFollowers && matchesLanguage && matchesCountry && matchesPlatform;
    })
    .sort((a, b) => {
      if (sortBy === 'reach') {
        const getCount = (s: string) => {
          const count = parseFloat(s.replace(/[^0-9.]/g, ''));
          const multiplier = s.includes('M') ? 1000000 : (s.includes('k') ? 1000 : 1);
          return count * multiplier;
        };
        return getCount(b.followers || '0') - getCount(a.followers || '0');
      }
      if (sortBy === 'trust') return (b.trustScore || 0) - (a.trustScore || 0);
      if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text" 
            placeholder={t('cb.market.search_placeholder') || "Search creators, niches, or keywords..."}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => onShowFiltersChange(!showFilters)}
            className={`flex-1 md:flex-none px-6 py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-sm font-bold ${showFilters ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
          >
            <Filter className="w-4 h-4" /> {t('cb.market.filters')}
          </button>
          <select 
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold focus:outline-none hover:bg-white/10 transition-all"
          >
            <option value="relevance">{t('cb.market.sort.relevance')}</option>
            <option value="reach">{t('cb.market.sort.reach')}</option>
            <option value="trust">{t('cb.market.sort.trust')}</option>
            <option value="newest">{t('cb.market.sort.newest')}</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden"
        >
          <FilterSelect label="Category" value={category} onChange={onCategoryChange} options={['All', 'Tech', 'Lifestyle', 'Gaming', 'Fashion', 'Finance', 'Education']} />
          <FilterSelect label="Platform" value={platform} onChange={onPlatformChange} options={['All', 'YouTube', 'Instagram', 'TikTok', 'X', 'Twitch']} />
          <FilterSelect label="Min. Followers" value={minFollowers} onChange={onMinFollowersChange} options={['All', '10k+', '100k+', '500k+', '1M+']} />
          <FilterSelect label="Language" value={language} onChange={onLanguageChange} options={['All', 'English', 'German', 'Spanish', 'French', 'Japanese']} />
          <FilterSelect label="Country" value={country} onChange={onCountryChange} options={['All', 'USA', 'Germany', 'UK', 'France', 'Japan', 'India']} />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verification</label>
            <button 
              onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
              className={`h-11 rounded-xl border text-xs font-bold transition-all ${verifiedOnly ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              Verified Only
            </button>
          </div>
        </motion.div>
      )}

      {/* Creator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreators.map((creator) => (
          <motion.div 
            key={creator.id}
            whileHover={{ y: -5 }}
            onClick={() => onSelectCreator(creator)}
            className="group bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden hover:border-[#00d4ff]/30 transition-all cursor-pointer relative"
          >
            <div className="h-32 bg-gradient-to-br from-white/5 to-transparent relative">
              <div className="absolute top-4 right-4 flex gap-2">
                {creator.verified && (
                  <div className="w-8 h-8 rounded-lg bg-[#00d4ff] flex items-center justify-center text-black shadow-lg shadow-[#00d4ff]/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
                <div className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/60 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {creator.trustScore}%
                </div>
              </div>
            </div>
            
            <div className="px-6 pb-6 -mt-12">
              <div className="flex items-end justify-between mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-purple-500 p-[2px] shadow-xl">
                  <div className="w-full h-full rounded-[14px] bg-[#050510] p-1">
                    <img src={creator.avatar || `https://picsum.photos/seed/${creator.id}/100/100`} className="w-full h-full rounded-[10px] object-cover" alt={creator.name} referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Starting from</div>
                  <div className="text-lg font-black text-[#00d4ff]">{creator.price || '€0+'}</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold group-hover:text-[#00d4ff] transition-colors">{creator.name}</h3>
                <p className="text-xs text-white/40 font-bold tracking-tight">{creator.handle}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest">{creator.category}</span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest">{creator.followers} Reach</span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> {creator.language || 'EN'}
                </span>
              </div>

              <button className="w-full py-3 bg-white/5 group-hover:bg-[#00d4ff] group-hover:text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                View Profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCreators.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/20">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">No creators found</h3>
          <p className="text-white/40 text-sm">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-bold focus:outline-none focus:border-[#00d4ff]/40 transition-all appearance-none"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
