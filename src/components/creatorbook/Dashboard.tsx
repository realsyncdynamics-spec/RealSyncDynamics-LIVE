import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Plus, TrendingUp, ShieldCheck, Zap, Activity, MessageSquare, Users, History, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import FeedPost from './FeedPost';

interface DashboardProps {
  stories: any[];
  feedPosts: any[];
  onFollow: (id: string) => void;
  onReport: (id: string, type: 'post' | 'user', reason: string) => void;
  onBlock: (id: string) => void;
  onPost: (content: string) => void;
  onAnalyze?: (post: any) => void;
}

export default function Dashboard({ stories, feedPosts, onFollow, onReport, onBlock, onPost, onAnalyze }: DashboardProps) {
  const { t } = useTranslation();
  const { user, profile } = useFirebase();
  const [newPostContent, setNewPostContent] = React.useState('');
  const [tasks, setTasks] = React.useState([
    { id: '1', text: 'Upload new YouTube video', completed: false },
    { id: '2', text: 'Reply to community comments', completed: true },
    { id: '3', text: 'Schedule Instagram post', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    onPost(newPostContent);
    setNewPostContent('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {stories.map(story => (
            <motion.div 
              key={story.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className={`w-16 h-16 rounded-2xl p-[2px] ${story.active ? 'bg-gradient-to-br from-[#00d4ff] to-purple-500' : 'bg-white/10'}`}>
                <div className="w-full h-full rounded-[14px] bg-[#050510] p-1">
                  <img src={story.avatar} className="w-full h-full rounded-[10px] object-cover" alt={story.name} referrerPolicy="no-referrer" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors">{story.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Create Post */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
          <div className="flex gap-4">
            <img src={profile?.avatar || user?.photoURL || 'https://picsum.photos/seed/user/100/100'} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" referrerPolicy="no-referrer" />
            <div className="flex-1 space-y-4">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={t('cb.post.placeholder') || "What's happening in your studio?"}
                className="w-full bg-transparent border-none text-sm focus:outline-none resize-none min-h-[80px]"
              />
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-[#00d4ff] transition-all">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-[#39ff6e] transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!newPostContent.trim()}
                  className="px-6 py-2 bg-[#00d4ff] text-black text-xs font-black rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {feedPosts.map(post => (
            <FeedPost 
              key={post.id} 
              post={post} 
              onFollow={onFollow} 
              onReport={onReport} 
              onBlock={onBlock} 
              onAnalyze={onAnalyze}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block space-y-8">
        {/* Studio Stats */}
        <div className="p-8 bg-gradient-to-br from-[#00d4ff]/10 to-transparent border border-[#00d4ff]/20 rounded-[32px] backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#00d4ff]/20 text-[#00d4ff] text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-[#00d4ff]/20">
            Sample Data
          </div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff]">Studio Stats</h3>
            <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Reach</p>
                <p className="text-2xl font-black">1.2M</p>
              </div>
              <div className="text-[10px] font-bold text-[#39ff6e] bg-[#39ff6e]/10 px-2 py-1 rounded-lg">+12%</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Trust Score</p>
                <p className="text-2xl font-black">94</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#00d4ff]" />
            </div>
          </div>
        </div>

        {/* Studio Tasks */}
        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Studio Tasks</h3>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md">Sample</span>
          </div>
          <div className="space-y-4">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all"
              >
                <div className="relative flex items-center justify-center">
                  <Circle className={`w-5 h-5 ${task.completed ? 'text-[#39ff6e] opacity-20' : 'text-white/20'} transition-colors`} />
                  <AnimatePresence>
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: -45 }}
                        className="absolute"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#39ff6e]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative flex-1">
                  <span className={`text-xs font-bold transition-all duration-500 ${task.completed ? 'text-white/20' : 'text-white/80'}`}>
                    {task.text}
                  </span>
                  <motion.div 
                    initial={false}
                    animate={{ width: task.completed ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#39ff6e]/40 pointer-events-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Creators */}
        <div className="space-y-6 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Suggested Creators</h3>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md">Sample</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <img src={`https://picsum.photos/seed/creator${i}/100/100`} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <p className="text-xs font-bold group-hover:text-[#00d4ff] transition-colors">Sample Creator {i}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">@sample_handle_{i}</p>
                </div>
                <button className="p-2 hover:bg-[#00d4ff] hover:text-black rounded-lg text-white/20 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
