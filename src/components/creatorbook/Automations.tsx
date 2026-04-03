import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Globe, Plus, Trash2, ChevronRight, RefreshCw, Activity, Youtube, Instagram, Video, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { toast } from 'sonner';

interface AutomationsProps {
  workflows: any[];
  webhooks: any[];
  onToggleWorkflow: (id: string, status: string) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleWebhook: (id: string, active: boolean) => void;
  onDeleteWebhook: (id: string) => void;
  onCreateWorkflow: (workflow: any) => void;
  onCreateWebhook: (webhook: any) => void;
  onCreatePost?: (content: string) => void;
}

export default function Automations({ 
  workflows, 
  webhooks, 
  onToggleWorkflow, 
  onDeleteWorkflow, 
  onToggleWebhook, 
  onDeleteWebhook,
  onCreateWorkflow,
  onCreateWebhook,
  onCreatePost
}: AutomationsProps) {
  const { t } = useTranslation();
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', trigger: 'New Follower', action: 'Send Welcome DM' });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: ['booking.created'] });

  // Social Sync State
  const [syncContent, setSyncContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'instagram']);
  const [isCrossPosting, setIsCrossPosting] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    youtube: true,
    instagram: true,
    tiktok: false
  });

  const handleTogglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleConnectPlatform = (platform: keyof typeof connectedPlatforms) => {
    setConnectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
    if (!connectedPlatforms[platform]) {
      const platformName = String(platform);
      toast.success(`Successfully connected to ${platformName.charAt(0).toUpperCase() + platformName.slice(1)}`);
      setSelectedPlatforms(prev => [...prev, platform]);
    } else {
      const platformName = String(platform);
      toast.info(`Disconnected from ${platformName.charAt(0).toUpperCase() + platformName.slice(1)}`);
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    }
  };

  const handleCrossPost = async () => {
    if (!syncContent.trim()) {
      toast.error('Please enter some content to post.');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform to cross-post.');
      return;
    }

    setIsCrossPosting(true);
    
    // Simulate API calls to selected platforms
    for (const platform of selectedPlatforms) {
      toast.loading(`Posting to ${platform}...`, { id: `post-${platform}` });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      toast.success(`Successfully posted to ${platform}!`, { id: `post-${platform}` });
    }

    // Post to CreatorBook feed if the function is provided
    if (onCreatePost) {
      onCreatePost(syncContent);
      toast.success('Posted to CreatorBook Feed!');
    }

    setIsCrossPosting(false);
    setSyncContent('');
  };

  return (
    <div className="space-y-10">
      {/* Social Sync Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-['Fraunces'] font-black">Social Sync</h2>
          </div>
          <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Cross-Platform Posting</div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Connected Accounts */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Connected Accounts</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">YouTube</span>
                </div>
                <button 
                  onClick={() => handleConnectPlatform('youtube')}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${connectedPlatforms.youtube ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                >
                  {connectedPlatforms.youtube ? 'Connected' : 'Connect'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">Instagram</span>
                </div>
                <button 
                  onClick={() => handleConnectPlatform('instagram')}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${connectedPlatforms.instagram ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                >
                  {connectedPlatforms.instagram ? 'Connected' : 'Connect'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">TikTok</span>
                </div>
                <button 
                  onClick={() => handleConnectPlatform('tiktok')}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${connectedPlatforms.tiktok ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                >
                  {connectedPlatforms.tiktok ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Cross-Post Composer */}
          <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Compose Cross-Post</h3>
            
            <textarea
              value={syncContent}
              onChange={(e) => setSyncContent(e.target.value)}
              placeholder="What do you want to share across your platforms?"
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-pink-500/50 transition-colors mb-4"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest mr-2">Post to:</span>
                
                <button 
                  disabled={!connectedPlatforms.youtube}
                  onClick={() => handleTogglePlatform('youtube')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${!connectedPlatforms.youtube ? 'opacity-20 cursor-not-allowed' : selectedPlatforms.includes('youtube') ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <Youtube className="w-4 h-4" />
                </button>
                
                <button 
                  disabled={!connectedPlatforms.instagram}
                  onClick={() => handleTogglePlatform('instagram')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${!connectedPlatforms.instagram ? 'opacity-20 cursor-not-allowed' : selectedPlatforms.includes('instagram') ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <Instagram className="w-4 h-4" />
                </button>
                
                <button 
                  disabled={!connectedPlatforms.tiktok}
                  onClick={() => handleTogglePlatform('tiktok')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${!connectedPlatforms.tiktok ? 'opacity-20 cursor-not-allowed' : selectedPlatforms.includes('tiktok') ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => setShowSyncConfirm(true)}
                disabled={isCrossPosting || !syncContent.trim() || selectedPlatforms.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                {isCrossPosting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isCrossPosting ? 'Syncing...' : 'Cross-Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff]">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-['Fraunces'] font-black">Workflows</h2>
          </div>
          <button 
            onClick={() => setShowWorkflowModal(true)}
            className="px-4 py-2 bg-[#00d4ff] text-black text-xs font-black rounded-xl uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {workflows.map(flow => (
            <div key={flow.id} className="p-6 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-between group hover:border-[#00d4ff]/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{flow.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40 uppercase tracking-widest font-bold">{flow.trigger}</span>
                    <ChevronRight className="w-3 h-3 text-white/20" />
                    <span className="text-xs text-[#00d4ff] uppercase tracking-widest font-bold">{flow.action}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleWorkflow(flow.id, flow.status)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${flow.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/10 text-white/40 border-white/10'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${flow.status === 'Active' ? 'bg-green-400' : 'bg-white/40'}`} />
                  {flow.status}
                </button>
                <button 
                  onClick={() => onDeleteWorkflow(flow.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {workflows.length === 0 && (
            <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
              <p className="text-white/40 text-sm">No workflows configured yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-['Fraunces'] font-black">Webhooks</h2>
          </div>
          <button 
            onClick={() => setShowWebhookModal(true)}
            className="px-4 py-2 bg-purple-500 text-white text-xs font-black rounded-xl uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> New Webhook
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {webhooks.map(hook => (
            <div key={hook.id} className="p-6 bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-between group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{hook.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40 font-mono truncate max-w-xs">{hook.url}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {hook.events.map((evt: string) => (
                      <span key={evt} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60 font-bold uppercase tracking-widest">{evt}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleWebhook(hook.id, hook.isActive)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${hook.isActive ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-white/10 text-white/40 border-white/10'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${hook.isActive ? 'bg-green-400' : 'bg-white/40'}`} />
                  {hook.isActive ? 'Active' : 'Inactive'}
                </button>
                <button 
                  onClick={() => onDeleteWebhook(hook.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {webhooks.length === 0 && (
            <div className="p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-[32px] text-center">
              <p className="text-white/40 text-sm">No webhooks configured yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWorkflowModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black font-['Fraunces'] mb-6">Create Workflow</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Workflow Name</label>
                <input 
                  type="text" 
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40"
                  placeholder="e.g. Welcome New Followers"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trigger</label>
                  <select 
                    value={newWorkflow.trigger}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-xs font-bold focus:outline-none focus:border-[#00d4ff]/40 appearance-none"
                  >
                    <option value="New Follower">New Follower</option>
                    <option value="New Booking">New Booking</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Message Received">Message Received</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Action</label>
                  <select 
                    value={newWorkflow.action}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, action: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-xs font-bold focus:outline-none focus:border-[#00d4ff]/40 appearance-none"
                  >
                    <option value="Send Welcome DM">Send Welcome DM</option>
                    <option value="Send Email">Send Email</option>
                    <option value="Update Trust Score">Update Trust Score</option>
                    <option value="Notify Team">Notify Team</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={() => {
                  onCreateWorkflow(newWorkflow);
                  setShowWorkflowModal(false);
                  setNewWorkflow({ name: '', trigger: 'New Follower', action: 'Send Welcome DM' });
                }}
                className="w-full py-4 bg-[#00d4ff] text-black font-black rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Create Workflow
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWebhookModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black font-['Fraunces'] mb-6">Register Webhook</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Webhook Name</label>
                <input 
                  type="text" 
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-purple-500/40"
                  placeholder="e.g. Production API"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Endpoint URL</label>
                <input 
                  type="url" 
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-mono focus:outline-none focus:border-purple-500/40"
                  placeholder="https://api.yourdomain.com/webhooks"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {['booking.created', 'booking.updated', 'payment.succeeded', 'user.verified'].map(evt => (
                    <button 
                      key={evt}
                      onClick={() => {
                        const events = newWebhook.events.includes(evt)
                          ? newWebhook.events.filter(e => e !== evt)
                          : [...newWebhook.events, evt];
                        setNewWebhook({ ...newWebhook, events });
                      }}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold border transition-all ${newWebhook.events.includes(evt) ? 'bg-purple-500 text-white border-purple-500' : 'bg-white/5 text-white/40 border-white/10'}`}
                    >
                      {evt}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => {
                  onCreateWebhook(newWebhook);
                  setShowWebhookModal(false);
                  setNewWebhook({ name: '', url: '', events: ['booking.created'] });
                }}
                className="w-full py-4 bg-purple-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" /> Register Webhook
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sync Confirmation Modal */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSyncConfirm(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mx-auto mb-6">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black font-['Fraunces'] mb-4">Confirm Cross-Post</h3>
            <p className="text-[#94a3b8] mb-8">Are you sure you want to cross-post this content to selected platforms?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowSyncConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSyncConfirm(false);
                  handleCrossPost();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform"
              >
                Yes, post
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
