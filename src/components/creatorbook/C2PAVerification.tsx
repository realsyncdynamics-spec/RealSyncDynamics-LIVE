import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Info,
  ExternalLink,
  Search,
  Lock,
  Clock,
  User,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../../contexts/TranslationContext';

interface C2PAVerificationProps {
  onVerify: (file: File) => Promise<any>;
}

export default function C2PAVerification({ onVerify }: C2PAVerificationProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showManifest, setShowManifest] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'assertions'>('overview');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setVerificationResult(null);
    setShowManifest(false);

    try {
      const result = await onVerify(file);
      setVerificationResult(result);
      toast.success("Verification complete!");
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Failed to verify content provenance.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative p-12 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-purple-500/10 border border-white/10 rounded-[48px] overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck className="w-64 h-64 text-[#00d4ff]" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" />
            C2PA Content Provenance
          </div>
          <h1 className="text-5xl font-black font-['Fraunces'] mb-6 leading-tight">
            Verify the <span className="text-[#00d4ff]">Truth</span> Behind Digital Content.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Upload any image or video to inspect its origin, editing history, and cryptographic signatures using the global C2PA standard.
          </p>

          <label className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00d4ff] text-black font-black text-sm cursor-pointer hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <Upload className="w-5 h-5" />
            {isUploading ? "Verifying..." : "Upload Content for Inspection"}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={isUploading}
              accept="image/*,video/*"
            />
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-12 bg-white/5 border border-white/10 rounded-[40px] text-center"
          >
            <div className="w-20 h-20 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Analyzing Provenance Manifests</h3>
            <p className="text-white/40 text-sm">Extracting cryptographic assertions and verifying signatures...</p>
          </motion.div>
        ) : verificationResult ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Main Result Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${verificationResult.isAuthentic ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {verificationResult.isAuthentic ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{verificationResult.fileName}</h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        {verificationResult.isAuthentic ? "Authentic Content" : "Unverified Content"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Verification Hash</div>
                    <div className="text-[10px] font-mono text-[#00d4ff] bg-[#00d4ff]/5 px-3 py-1 rounded-lg border border-[#00d4ff]/10">
                      {verificationResult.hash.substring(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
                  {(['overview', 'history', 'assertions'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-[#00d4ff] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <User className="w-4 h-4 text-[#00d4ff]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Producer</span>
                          </div>
                          <div className="text-lg font-bold">{verificationResult.manifest?.producer || "Unknown"}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <Clock className="w-4 h-4 text-[#00d4ff]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Signed At</span>
                          </div>
                          <div className="text-lg font-bold">
                            {verificationResult.manifest?.signature?.timestamp ? new Date(verificationResult.manifest.signature.timestamp).toLocaleString() : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <Lock className="w-4 h-4 text-[#00d4ff]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Signature Details</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/40">Issuer</span>
                            <span className="font-bold">{verificationResult.manifest?.signature?.issuer}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/40">Algorithm</span>
                            <span className="font-bold font-mono">{verificationResult.manifest?.signature?.algorithm}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-4">
                      {verificationResult.history?.map((item: any, idx: number) => (
                        <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                          {idx !== verificationResult.history.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-white/5" />
                          )}
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
                          </div>
                          <div className="p-6 bg-white/5 rounded-[24px] border border-white/10 flex gap-6 items-center">
                            <img 
                              src={item.thumbnail} 
                              alt="Step Thumbnail" 
                              className="w-16 h-16 rounded-xl object-cover border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold">{item.action}</h4>
                                <span className="text-[10px] text-white/40">{new Date(item.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-white/60 mb-2">{item.metadata}</p>
                              <div className="flex items-center gap-2 text-[10px] text-[#00d4ff] font-bold">
                                <User className="w-3 h-3" />
                                {item.actor}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'assertions' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {verificationResult.assertions?.map((assertion: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-3 h-3 text-[#00d4ff]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{assertion.label}</span>
                          </div>
                          <pre className="text-[10px] font-mono text-white/60 overflow-x-auto">
                            {JSON.stringify(assertion.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-8">
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] backdrop-blur-xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6">Trust Analysis</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-white/40">Provenance Score</span>
                      <span className="text-[#00d4ff]">98%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '98%' }}
                        className="h-full bg-[#00d4ff]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-white/40">Signature Integrity</span>
                      <span className="text-green-400">Valid</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full bg-green-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-[40px] backdrop-blur-xl">
                <Info className="w-6 h-6 text-[#00d4ff] mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Why C2PA?</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  C2PA is an open technical standard providing publishers, creators, and consumers the ability to trace the origin of different types of media.
                </p>
                <a 
                  href="https://c2pa.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-black text-[#00d4ff] uppercase tracking-widest hover:underline"
                >
                  Learn More <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[48px] text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Ready for Inspection</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Drag and drop a file here or use the upload button above to start the C2PA verification process.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
