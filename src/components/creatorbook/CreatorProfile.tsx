import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Youtube, Instagram, Music, Twitter, Shield, Video, ChevronLeft, Star, Globe, MapPin, Calendar, ExternalLink, MessageSquare, Plus } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import FeedPost from './FeedPost';

interface CreatorProfileProps {
  creator: any;
  posts: any[];
  onBack: () => void;
  onInquiry: (creator: any) => void;
  onBooking: (creator: any) => void;
}

export default function CreatorProfile({ creator, posts, onBack, onInquiry, onBooking }: CreatorProfileProps) {
  const { t } = useTranslation();
  const { user, profile } = useFirebase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#00d4ff] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Marketplace
      </button>

      {/* Profile Header */}
      <div className="relative h-64 rounded-[40px] overflow-hidden border border-white/10">
        <img src={creator.banner || `https://picsum.photos/seed/banner-${creator.id}/1200/400`} className="w-full h-full object-cover" alt="Banner" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
      </div>
      
      <div className="px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-[#00d4ff] to-purple-500 p-[2px] shadow-2xl">
            <div className="w-full h-full rounded-[30px] bg-[#050510] p-1">
              <img src={creator.avatar || `https://picsum.photos/seed/${creator.id}/100/100`} className="w-full h-full rounded-[26px] object-cover" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black font-['Fraunces']">{creator.name}</h2>
              {creator.verified && <CheckCircle2 className="w-6 h-6 text-[#00d4ff]" />}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 font-bold tracking-tight">{creator.handle}</span>
              <div className="flex gap-3">
                {['youtube', 'instagram', 'tiktok', 'x'].map(platform => {
                  const isConnected = creator.platforms?.includes(platform.charAt(0).toUpperCase() + platform.slice(1));
                  const Icon = platform === 'youtube' ? Youtube : platform === 'instagram' ? Instagram : platform === 'tiktok' ? Music : platform === 'x' ? Twitter : null;
                  if (!Icon) return null;
                  return (
                    <div 
                      key={platform}
                      className={`transition-all ${isConnected ? 'text-white' : 'text-white/10'}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pb-2">
            <button 
              onClick={() => onInquiry(creator)}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
            >
              Send Inquiry
            </button>
            <button 
              onClick={() => onBooking(creator)}
              className="px-6 py-2.5 bg-[#00d4ff] text-black rounded-xl text-xs font-black shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Trust Score</div>
            <div className="text-2xl font-black text-[#00d4ff]">{creator.trustScore}%</div>
            <div className="text-[9px] font-bold text-[#39ff6e] uppercase tracking-widest mt-1">Verified</div>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Followers</div>
            <div className="text-2xl font-black">{creator.followers}</div>
            <div className="text-[9px] font-bold text-[#39ff6e] uppercase tracking-widest mt-1">+1.2k this week</div>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Engagement</div>
            <div className="text-2xl font-black">4.8%</div>
            <div className="text-[9px] font-bold text-[#39ff6e] uppercase tracking-widest mt-1">Above Average</div>
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Avg. Price</div>
            <div className="text-2xl font-black">{creator.price}</div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Per Video</div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">About</h3>
              <p className="text-sm text-white/80 leading-relaxed">{creator.bio}</p>
            </div>

            {/* Recent Posts */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Recent Posts</h3>
              {posts.length > 0 ? (
                posts.map(post => (
                  <FeedPost key={post.id} post={post} />
                ))
              ) : (
                <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
                  <p className="text-white/20 text-sm">No recent posts found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md space-y-6">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#00d4ff]" />
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Language</div>
                  <div className="text-sm font-bold">{creator.language || 'English'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#00d4ff]" />
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</div>
                  <div className="text-sm font-bold">{creator.country || 'USA'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#00d4ff]" />
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Joined</div>
                  <div className="text-sm font-bold">March 2024</div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Services</h3>
              <div className="space-y-4">
                {[
                  { name: 'Dedicated Video', price: '€500' },
                  { name: 'Shoutout', price: '€150' },
                  { name: 'Product Review', price: '€750' }
                ].map(service => (
                  <div key={service.name} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs font-bold">{service.name}</span>
                    <span className="text-xs font-black text-[#00d4ff]">{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
