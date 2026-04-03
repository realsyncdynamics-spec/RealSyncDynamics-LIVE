import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Zap, Send, Search, MoreHorizontal, User, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface MessagesProps {
  messages: any[];
  onSendMessage: (text: string) => void;
  currentUser: any;
}

export default function Messages({ messages, onSendMessage, currentUser }: MessagesProps) {
  const { t } = useTranslation();
  const [chatMessage, setChatMessage] = useState('');
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!chatMessage.trim()) return;
    onSendMessage(chatMessage);
    setChatMessage('');
  };

  // Group messages by conversation (sender/receiver)
  // For simplicity in this UI, we'll just show the list of unique users we've chatted with
  const conversations = Array.from(new Set(messages.map(m => m.senderId === currentUser?.uid ? m.receiverId : m.senderId)))
    .map(userId => {
      const lastMsg = [...messages].reverse().find(m => m.senderId === userId || m.receiverId === userId);
      return {
        userId,
        name: lastMsg?.senderId === userId ? lastMsg?.senderName : lastMsg?.receiverName,
        avatar: lastMsg?.senderId === userId ? lastMsg?.senderAvatar : lastMsg?.receiverAvatar,
        lastText: lastMsg?.text,
        time: lastMsg?.createdAt?.toDate ? lastMsg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...',
        unread: false // Mock unread status
      };
    })
    .filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden flex h-[calc(100vh-14rem)] backdrop-blur-md">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-6 border-b border-white/10 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest">{t('cb.chat.title') || 'Messages'}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-[#00d4ff]/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.map(conv => (
            <div key={conv.userId} className="p-4 hover:bg-white/5 cursor-pointer flex gap-3 border-b border-white/5 transition-all group">
              <div className="relative">
                <img src={conv.avatar || 'https://picsum.photos/seed/user/100/100'} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt={conv.name} referrerPolicy="no-referrer" />
                {conv.unread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00d4ff] rounded-full border-2 border-[#050510]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-xs truncate group-hover:text-[#00d4ff] transition-colors">{conv.name}</p>
                  <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{conv.time}</p>
                </div>
                <p className="text-[10px] text-white/40 truncate leading-relaxed">{conv.lastText}</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-white/10">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/[0.01]">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/10">
          <div className="flex items-center gap-4">
            <img src={conversations[0]?.avatar || 'https://picsum.photos/seed/user/100/100'} className="w-10 h-10 rounded-xl object-cover" alt="" referrerPolicy="no-referrer" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">{conversations[0]?.name || 'Select a chat'}</h4>
                <CheckCircle2 className="w-3 h-3 text-[#00d4ff]" />
              </div>
              <p className="text-[10px] text-[#39ff6e] font-bold uppercase tracking-widest">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col gap-6">
          <div className="flex justify-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/20 bg-white/5 px-3 py-1 rounded-full">Today</p>
          </div>
          {messages.map((msg: any) => (
            <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.senderId === currentUser?.uid ? 'self-end flex-row-reverse' : ''}`}>
              <img src={msg.senderAvatar || 'https://picsum.photos/seed/user/100/100'} className="w-8 h-8 rounded-lg self-end border border-white/10" alt="" referrerPolicy="no-referrer" />
              <div className={`p-4 rounded-2xl ${msg.senderId === currentUser?.uid ? 'bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-black font-medium rounded-br-none shadow-lg shadow-[#00d4ff]/10' : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-none'}`}>
                <p className="text-xs leading-relaxed">{msg.text}</p>
                <p className={`text-[8px] mt-1 opacity-60 font-bold uppercase tracking-widest ${msg.senderId === currentUser?.uid ? 'text-black' : 'text-white/40'}`}>
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-20">
              <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center">
                <Zap className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-black font-['Fraunces'] mb-2">Start a Conversation</h3>
                <p className="text-xs max-w-xs mx-auto leading-relaxed">Reach out to creators and brands to start collaborating on amazing projects.</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('cb.chat.placeholder') || "Type your message..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-[#00d4ff]/40 transition-all"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!chatMessage.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00d4ff] text-black rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00d4ff]/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
