import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MessageSquare, Shield, Zap, LayoutGrid, User, AlertCircle, Cpu } from 'lucide-react';
import { AppId } from '../App';
import { useTranslation } from '../contexts/TranslationContext';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'creator' | 'security' | 'smart';
  targetApp: AppId;
  icon: React.ReactNode;
}

const MOCK_DATA: SearchResult[] = [
  // CreatorBook
  { id: 'c1', title: 'Tech Review 2026', description: 'Deep dive into the latest hardware trends.', category: 'creator', targetApp: 'cb', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'c2', title: 'AI Art Gallery', description: 'Exploring the boundaries of generative art.', category: 'creator', targetApp: 'cb', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'c3', title: 'Alex Rivers', description: 'Verified Tech Creator with 2.4M followers.', category: 'creator', targetApp: 'cb', icon: <User className="w-4 h-4" /> },
  { id: 'c4', title: 'Sarah Chen', description: 'Digital Artist and AI Researcher.', category: 'creator', targetApp: 'cb', icon: <User className="w-4 h-4" /> },
  
  // Security
  { id: 's1', title: 'DDoS Attack Blocked', description: 'Mitigated 4.2Tbps attack on edge nodes.', category: 'security', targetApp: 'ai-security', icon: <Shield className="w-4 h-4" /> },
  { id: 's2', title: 'SQL Injection Attempt', description: 'Blocked malicious query from IP 192.168.1.42.', category: 'security', targetApp: 'ai-security', icon: <AlertCircle className="w-4 h-4" /> },
  { id: 's3', title: 'Unauthorized Access', description: 'Failed login attempt from unknown location.', category: 'security', targetApp: 'ai-security', icon: <Shield className="w-4 h-4" /> },
  { id: 's4', title: 'Malware Signature Detected', description: 'Isolated suspicious file in sandbox.', category: 'security', targetApp: 'ai-security', icon: <AlertCircle className="w-4 h-4" /> },
  
  // Smart World
  { id: 'w1', title: 'Living Room Light', description: 'Status: Online | Brightness: 80%', category: 'smart', targetApp: 'smart', icon: <Zap className="w-4 h-4" /> },
  { id: 'w2', title: 'Smart Thermostat', description: 'Current Temp: 22°C | Target: 21°C', category: 'smart', targetApp: 'smart', icon: <Cpu className="w-4 h-4" /> },
  { id: 'w3', title: 'Security Camera', description: 'Recording | Motion detected in Hallway.', category: 'smart', targetApp: 'smart', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'w4', title: 'Kitchen Hub', description: 'Status: Idle | 4 Connected devices.', category: 'smart', targetApp: 'smart', icon: <Zap className="w-4 h-4" /> },
];

export default function GlobalSearch({ onNavigate }: { onNavigate: (id: AppId) => void }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = MOCK_DATA.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.targetApp);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300
        ${isOpen ? 'w-64 md:w-80 bg-white/10 border-[#00d4ff]/50 shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'w-10 md:w-48 bg-white/5 border-white/10 hover:bg-white/10'}
      `}>
        <Search className={`w-4 h-4 ${isOpen ? 'text-[#00d4ff]' : 'text-[#475569]'}`} />
        <input 
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={`
            bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-[#475569]
            ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'}
          `}
        />
        {isOpen && query && (
          <button onClick={() => setQuery('')} className="text-[#475569] hover:text-white">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.length > 0 || results.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 right-0 md:left-auto md:w-[400px] bg-[#0a0a16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[1000]"
          >
            <div className="max-h-[400px] overflow-y-auto p-2 no-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-4 p-2">
                  {['creator', 'security', 'smart'].map(cat => {
                    const catResults = results.filter(r => r.category === cat);
                    if (catResults.length === 0) return null;
                    
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="px-3 py-1 text-[10px] font-bold text-[#475569] uppercase tracking-widest flex items-center gap-2">
                          {cat === 'creator' && <MessageSquare className="w-3 h-3" />}
                          {cat === 'security' && <Shield className="w-3 h-3" />}
                          {cat === 'smart' && <LayoutGrid className="w-3 h-3" />}
                          {cat === 'creator' ? t('search.cat.creator') : cat === 'security' ? t('search.cat.security') : t('search.cat.smart')}
                        </div>
                        {catResults.map(result => (
                          <button 
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#94a3b8] group-hover:text-[#00d4ff] group-hover:bg-[#00d4ff]/10 transition-all">
                              {result.icon}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors">{result.title}</div>
                              <div className="text-[11px] text-[#475569] line-clamp-1">{result.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-[#475569]" />
                  </div>
                  <div className="text-sm font-bold text-[#475569]">{t('search.no_results')} "{query}"</div>
                  <div className="text-[10px] text-[#475569] mt-1">{t('search.hint')}</div>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[9px] text-[#475569]">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white">↑↓</kbd> {t('search.nav.hint')}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-[#475569]">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white">↵</kbd> {t('search.select.hint')}
                </div>
              </div>
              <div className="text-[9px] text-[#475569] font-mono">RealSync Search v1.0</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
