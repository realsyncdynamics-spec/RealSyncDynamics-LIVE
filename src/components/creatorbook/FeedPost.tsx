import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Trash2, 
  Bookmark, 
  UserX, 
  Flag, 
  CheckCircle2, 
  Youtube, 
  Instagram, 
  Music, 
  Twitter, 
  Shield, 
  Video, 
  Send,
  Plus,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, collection, addDoc, Timestamp, query, orderBy, onSnapshot, OperationType, handleFirestoreError, deleteDoc, doc, getDoc, updateDoc, setDoc, increment } from '../../lib/firebase';
import { toast } from 'sonner';

interface FeedPostProps {
  post: any;
  onFollow?: (id: string) => void;
  onReport?: (id: string, type: 'post' | 'user', reason: string) => void;
  onBlock?: (id: string) => void;
  onAnalyze?: (post: any) => void;
  key?: string | number;
}

export default function FeedPost({ post, onFollow, onReport, onBlock, onAnalyze }: FeedPostProps) {
  const { t } = useTranslation();
  const { user, profile } = useFirebase();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!post.id || post.id.startsWith('g-')) return;

    // Listen for comments
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `posts/${post.id}/comments`));

    // Check if user has liked
    if (user) {
      const checkLike = async () => {
        const likeDoc = await getDoc(doc(db, 'posts', post.id, 'likes', user.uid));
        setHasLiked(likeDoc.exists());
      };
      checkLike();
    }

    return () => unsubscribe();
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user || isLiking || post.id.startsWith('g-')) return;
    setIsLiking(true);
    try {
      const postRef = doc(db, 'posts', post.id);
      const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);

      if (hasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        setHasLiked(false);
      } else {
        await setDoc(likeRef, { createdAt: Timestamp.now() });
        await updateDoc(postRef, { likes: increment(1) });
        setHasLiked(true);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${post.id}/likes`);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || post.id.startsWith('g-')) return;
    try {
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        authorId: user.uid,
        authorName: profile?.name || user.displayName || 'Anonymous',
        authorAvatar: profile?.avatar || user.photoURL || 'https://picsum.photos/seed/anon/100/100',
        content: newComment,
        createdAt: Timestamp.now()
      });
      await updateDoc(doc(db, 'posts', post.id), { comments: increment(1) });
      setNewComment("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `posts/${post.id}/comments`);
    }
  };

  const isAuthor = user?.uid === post.authorId;

  const handleDelete = async () => {
    if (!isAuthor) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      setShowMenu(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${post.id}`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'CreatorBook Post',
      text: post.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('cb.post.share_success'));
      }
      
      if (post.id && !post.id.startsWith('g-')) {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, {
          shares: increment(1)
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const author = post.author || {
    id: post.authorId,
    name: post.authorName,
    handle: post.authorHandle,
    avatar: post.authorAvatar,
    verified: post.authorVerified,
    trustScore: post.authorTrustScore,
    followers: post.authorFollowers,
    socials: post.authorSocials || [],
    socialLinks: post.authorSocialLinks || {}
  };

  const timeDisplay = post.time || (post.createdAt ? new Date(post.createdAt.toDate ? post.createdAt.toDate() : post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md hover:bg-white/[0.05] transition-all group relative">
      {post.isSample && (
        <div className="absolute top-0 right-12 px-3 py-1 bg-[#00d4ff]/20 text-[#00d4ff] text-[8px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-[#00d4ff]/20 z-10">
          Sample Post
        </div>
      )}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10" referrerPolicy="no-referrer" />
            {author.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00d4ff] rounded-full border-2 border-[#050510] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-black" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{author.name}</span>
              <span className="text-[10px] text-white/40 font-medium">{author.handle}</span>
              <div className="flex gap-2 ml-2">
                {author.socials?.map((s: string) => {
                  const link = author.socialLinks?.[s];
                  const Icon = s === 'youtube' ? Youtube : s === 'instagram' ? Instagram : s === 'tiktok' ? Music : s === 'x' ? Twitter : null;
                  if (!Icon) return null;
                  return (
                    <a 
                      key={s} 
                      href={link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-[#00d4ff] transition-all hover:scale-110"
                      onClick={(e) => !link && e.preventDefault()}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00d4ff]/10 border border-[#00d4ff]/20">
                <Shield className="w-2.5 h-2.5 text-[#00d4ff]" />
                <span className="text-[9px] font-black text-[#00d4ff] uppercase tracking-widest">{author.trustScore} Trust</span>
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{author.followers} Followers</span>
              <span className="text-[10px] text-white/20 font-medium">• {timeDisplay}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthor && (
            <button 
              onClick={() => onFollow?.(post.authorId)}
              className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-[#00d4ff] hover:text-black transition-all"
            >
              {t('cb.post.follow') || 'Follow'}
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 transition-colors rounded-xl ${showMenu ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0a0a15] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-2 space-y-1">
                      {isAuthor ? (
                        <>
                          <button 
                            onClick={() => { onAnalyze?.(post); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-xl transition-all group/item"
                          >
                            <Sparkles className="w-4 h-4 text-[#00d4ff]/40 group-hover/item:text-[#00d4ff]" />
                            {t('cb.post.analyze') || 'Analyze with AI'}
                          </button>
                          <button 
                            onClick={handleDelete}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group/item"
                          >
                            <Trash2 className="w-4 h-4 text-red-400/40 group-hover/item:text-red-400" />
                            {t('common.delete') || 'Delete'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { onAnalyze?.(post); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-xl transition-all group/item"
                          >
                            <Sparkles className="w-4 h-4 text-[#00d4ff]/40 group-hover/item:text-[#00d4ff]" />
                            {t('cb.post.analyze') || 'Analyze with AI'}
                          </button>
                          <button 
                            onClick={() => setShowMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                          >
                            <Bookmark className="w-4 h-4 text-white/40 group-hover/item:text-[#00d4ff]" />
                            {t('cb.post.save')}
                          </button>
                          <button 
                            onClick={() => { handleShare(); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                          >
                            <Share2 className="w-4 h-4 text-white/40 group-hover/item:text-[#39ff6e]" />
                            {t('cb.post.share')}
                          </button>
                          <button 
                            onClick={() => { onBlock?.(post.authorId); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group/item"
                          >
                            <UserX className="w-4 h-4 text-white/40 group-hover/item:text-orange-400" />
                            {t('cb.post.block') || 'Block'}
                          </button>
                          <div className="h-px bg-white/5 mx-2 my-1" />
                          <button 
                            onClick={() => { onReport?.(post.id, 'post', 'Inappropriate content'); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group/item"
                          >
                            <Flag className="w-4 h-4 text-red-400/40 group-hover/item:text-red-400" />
                            {t('cb.post.report')}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <p className="text-sm text-white/80 leading-relaxed">{post.content}</p>
      </div>

      {(post.image || post.videoThumbnail) && (
        <div className="px-6 pb-4">
          <div className="rounded-2xl overflow-hidden border border-white/10 relative group/media">
            <img src={post.image || post.videoThumbnail} alt="Post media" className="w-full h-auto object-cover max-h-[500px]" referrerPolicy="no-referrer" />
            {post.videoThumbnail && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/media:bg-black/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white scale-90 group-hover/media:scale-100 transition-transform">
                  <Video className="w-8 h-8 fill-current" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-2 transition-colors group/btn ${hasLiked ? 'text-red-500' : 'text-white/40 hover:text-red-500'}`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'group-hover/btn:fill-current'}`} />
            <span className="text-xs font-bold">{post.likes || 0}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-white/40 hover:text-[#00d4ff] transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-bold">{post.comments || 0}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-white/40 hover:text-[#39ff6e] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-bold">{post.shares || 0}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-black/20 border-t border-white/5"
          >
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <img src={comment.authorAvatar} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="bg-white/5 rounded-2xl p-3">
                        <p className="text-xs font-bold mb-1">{comment.authorName}</p>
                        <p className="text-xs text-white/70">{comment.content}</p>
                      </div>
                      <p className="text-[8px] text-white/20 mt-1 uppercase tracking-widest font-bold">
                        {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleTimeString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <img src={profile?.avatar || user?.photoURL || 'https://picsum.photos/seed/user/100/100'} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Write a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 pr-10 text-xs focus:outline-none focus:border-[#00d4ff]/40"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00d4ff] hover:scale-110 transition-transform disabled:opacity-30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
