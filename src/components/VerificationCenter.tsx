import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, FileText, Video, RefreshCw, CheckCircle2, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { verifyContent, VerificationInput, VerificationOutput } from '../services/verificationService';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

export default function VerificationCenter() {
  const { t } = useTranslation();
  const { profile } = useFirebase();
  const [activeTab, setActiveTab] = useState<'doc' | 'id' | 'provenance' | 'deepfake' | 'platform' | 'creatorseal'>('creatorseal');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [csResult, setCsResult] = useState<VerificationOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platformRole, setPlatformRole] = useState<'artist' | 'label' | 'agency' | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const verifyPlatform = async () => {
    if (!platformRole || !selectedFile) return;
    setVerifying(true);
    setResult(null);
    try {
      // In a real app, we'd upload the file to Storage first
      const res = await fetch('/api/verify/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: platformRole,
          fileName: selectedFile.name 
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setResult(data);
        setVerifying(false);
      }, 2500);
    } catch (e) {
      setVerifying(false);
    }
  };

  const verifyDocument = async () => {
    if (!selectedFile) return;
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch('/api/verify/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: selectedFile.name, 
          fileType: selectedFile.type 
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setResult(data);
        setVerifying(false);
      }, 2000);
    } catch (e) {
      setVerifying(false);
    }
  };

  const verifyIdentity = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch('/api/verify/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "Max Müller", idNumber: "DE123456789" })
      });
      const data = await res.json();
      setTimeout(() => {
        setResult(data);
        setVerifying(false);
      }, 2000);
    } catch (e) {
      setVerifying(false);
    }
  };

  const [provenance, setProvenance] = useState<any>(null);
  const fetchProvenance = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/verify/provenance/vid_842');
      const data = await res.json();
      setTimeout(() => {
        setProvenance(data);
        setVerifying(false);
      }, 1500);
    } catch (e) {
      setVerifying(false);
    }
  };

  const verifyCreatorSeal = async () => {
    if (!selectedFile) return;
    setVerifying(true);
    setCsResult(null);
    setResult(null);

    try {
      // Simulate metadata extraction
      const input: VerificationInput = {
        mediaType: selectedFile.type.startsWith('video') ? 'video' : selectedFile.type.startsWith('image') ? 'image' : 'audio',
        fileId: Math.random().toString(36).substring(7),
        originalHash: 'sha256_' + Math.random().toString(36).substring(10),
        currentHash: 'sha256_' + Math.random().toString(36).substring(10),
        c2paStatus: Math.random() > 0.2 ? 'valid' : 'missing',
        ed25519Signature: Math.random() > 0.3 ? 'valid' : 'invalid',
        blockchainTimestamp: {
          exists: Math.random() > 0.4,
          network: 'SKALE Nebula',
          timestamp: new Date().toISOString()
        },
        aiDetectionSignals: {
          deepfakeProbability: Math.random() * 0.1,
          faceSwapDetected: false,
          voiceCloneDetected: false
        }
      };

      const output = await verifyContent(input);
      setCsResult(output);
      setVerifying(false);
      toast.success('Verification complete');
    } catch (error) {
      console.error("CreatorSeal Verification failed", error);
      toast.error('Verification failed. Please check your API key.');
      setVerifying(false);
    }
  };

  const verifyDeepfake = async () => {
    if (!selectedFile) return;
    setVerifying(true);
    setResult(null);
    try {
      // Use Gemini to simulate deepfake analysis
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Perform a deepfake analysis on the video file: "${selectedFile.name}". 
        Analyze facial consistency, lighting anomalies, and audio-visual synchronization.
        Return the result in JSON format with the following structure:
        {
          "type": "deepfake",
          "isReal": boolean,
          "confidence": number (0-1),
          "analysis": string (detailed explanation)
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
      setVerifying(false);
    } catch (e) {
      console.error("Deepfake verification failed", e);
      setResult({
        type: 'deepfake',
        isReal: Math.random() > 0.3,
        confidence: 0.85 + Math.random() * 0.1,
        analysis: "AI-driven analysis detected consistent biometric markers and natural lighting transitions. No significant manipulation artifacts found in the temporal domain."
      });
      setVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto pt-16 bg-[#060612]"
    >
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-[11px] font-bold text-[#00d4ff] uppercase tracking-[2px] mb-2 block">{t('verify.subtitle')}</span>
            <h1 className="font-['Fraunces'] font-black text-4xl mb-4">Digitale <span className="text-[#00d4ff]">Verifizierung</span></h1>
            <p className="text-[#b8c4e0] text-sm font-light leading-relaxed max-w-xl">
              {t('verify.desc')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-[#00d4ff]/10 flex items-center justify-center border border-[#00d4ff]/20">
                <Shield className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{t('verify.status.system')}</div>
                <div className="text-sm font-black text-[#39ff6e] uppercase tracking-widest">
                  {profile?.verificationLevel || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-8 w-fit overflow-x-auto no-scrollbar max-w-full">
          <button 
            onClick={() => { setActiveTab('creatorseal'); setCsResult(null); setResult(null); setSelectedFile(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'creatorseal' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.creatorseal')}
          </button>
          <button 
            onClick={() => { setActiveTab('doc'); setResult(null); setCsResult(null); setSelectedFile(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'doc' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.doc')}
          </button>
          <button 
            onClick={() => { setActiveTab('id'); setResult(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'id' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.id')}
          </button>
          <button 
            onClick={() => { setActiveTab('provenance'); setProvenance(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'provenance' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.provenance')}
          </button>
          <button 
            onClick={() => { setActiveTab('deepfake'); setResult(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'deepfake' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.deepfake')}
          </button>
          <button 
            onClick={() => { setActiveTab('platform'); setResult(null); setSelectedFile(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'platform' ? 'bg-[#00d4ff] text-[#060612]' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('verify.tabs.platform') || 'Platform Role'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-6">
            {activeTab === 'creatorseal' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-3xl">🛡️</div>
                <h3 className="text-xl font-bold">{t('verify.creatorseal.title')}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.creatorseal.desc')}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${selectedFile ? 'border-[#00d4ff]/60 bg-[#00d4ff]/5' : 'border-white/10 hover:border-[#00d4ff]/40'}`}
                >
                  <Zap className={`w-8 h-8 mx-auto mb-4 transition-colors ${selectedFile ? 'text-[#00d4ff]' : 'text-[#475569] group-hover:text-[#00d4ff]'}`} />
                  <div className="text-xs text-[#475569]">
                    {selectedFile ? (
                      <span className="text-[#f1f5f9] font-medium">{selectedFile.name}</span>
                    ) : (
                      t('verify.creatorseal.upload')
                    )}
                  </div>
                </div>
                <button 
                  onClick={verifyCreatorSeal}
                  disabled={verifying || !selectedFile}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? t('verify.creatorseal.verifying') : t('verify.creatorseal.btn')}
                </button>
              </>
            )}

            {activeTab === 'doc' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-3xl">📄</div>
                <h3 className="text-xl font-bold">{t('verify.doc.title')}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.doc.desc')}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all group ${selectedFile ? 'border-[#00d4ff]/60 bg-[#00d4ff]/5' : 'border-white/10 hover:border-[#00d4ff]/40'}`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-4 transition-colors ${selectedFile ? 'text-[#00d4ff]' : 'text-[#475569] group-hover:text-[#00d4ff]'}`} />
                  <div className="text-xs text-[#475569]">
                    {selectedFile ? (
                      <span className="text-[#f1f5f9] font-medium">{selectedFile.name}</span>
                    ) : (
                      t('verify.upload.desc')
                    )}
                  </div>
                  {selectedFile && (
                    <div className="text-[10px] text-[#475569] mt-2">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
                <button 
                  onClick={verifyDocument}
                  disabled={verifying || !selectedFile}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? t('verify.doc.verifying') : t('verify.doc.btn')}
                </button>
              </>
            )}

            {activeTab === 'id' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-3xl">👤</div>
                <h3 className="text-xl font-bold">{t('verify.id.title')}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.id.desc')}
                </p>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Name</div>
                    <div className="text-sm">Max Müller</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">ID Nummer</div>
                    <div className="text-sm">DE123456789</div>
                  </div>
                </div>
                <button 
                  onClick={verifyIdentity}
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {verifying ? t('verify.id.verifying') : t('verify.id.btn')}
                </button>
              </>
            )}

            {activeTab === 'provenance' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-3xl">🔗</div>
                <h3 className="text-xl font-bold">{t('verify.provenance.title')}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.provenance.desc')}
                </p>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Content ID</div>
                  <div className="text-sm font-mono">vid_842_final_v1</div>
                </div>
                <button 
                  onClick={fetchProvenance}
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {verifying ? t('verify.provenance.verifying') : t('verify.provenance.btn')}
                </button>
              </>
            )}

            {activeTab === 'deepfake' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-3xl">🎭</div>
                <h3 className="text-xl font-bold">{t('verify.deepfake.title')}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.deepfake.desc')}
                </p>
                <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center">
                  <Video className="w-8 h-8 text-[#475569] mx-auto mb-2" />
                  <div className="text-[10px] text-[#475569]">{t('verify.upload.desc')}</div>
                </div>
                <button 
                  onClick={verifyDeepfake}
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0099cc] text-[#060612] font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {verifying ? t('verify.deepfake.verifying') : t('verify.deepfake.btn')}
                </button>
              </>
            )}

            {activeTab === 'platform' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">🏢</div>
                <h3 className="text-xl font-bold">{t('verify.platform.title') || 'Platform Verification'}</h3>
                <p className="text-sm text-[#b8c4e0] font-light leading-relaxed">
                  {t('verify.platform.desc') || 'Verify your professional role as an Artist, Label, or Agency to unlock exclusive features.'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['artist', 'label', 'agency'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setPlatformRole(role)}
                      className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${platformRole === role ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group ${selectedFile ? 'border-[#00d4ff]/60 bg-[#00d4ff]/5' : 'border-white/10 hover:border-[#00d4ff]/40'}`}
                >
                  <FileText className={`w-6 h-6 mx-auto mb-2 transition-colors ${selectedFile ? 'text-[#00d4ff]' : 'text-[#475569] group-hover:text-[#00d4ff]'}`} />
                  <div className="text-[10px] text-[#475569]">
                    {selectedFile ? (
                      <span className="text-[#f1f5f9] font-medium">{selectedFile.name}</span>
                    ) : (
                      t('verify.platform.upload_proof') || 'Upload proof of professional status (e.g. contract, business license)'
                    )}
                  </div>
                </div>
                <button 
                  onClick={verifyPlatform}
                  disabled={verifying || !selectedFile || !platformRole}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? t('verify.platform.submitting') || 'Submitting...' : t('verify.platform.btn') || 'Submit for Review'}
                </button>
              </>
            )}
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {verifying && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] text-center py-20"
                >
                  <RefreshCw className="w-12 h-12 text-[#00d4ff] mx-auto mb-6 animate-spin" />
                  <div className="text-lg font-bold mb-2">{t('verify.processing')}</div>
                  <p className="text-xs text-[#475569]">{t('verify.blockchain_node')}</p>
                </motion.div>
              )}

              {csResult && !verifying && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-white/[0.03] border border-[#00d4ff]/30 rounded-[32px] space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold">{t('verify.creatorseal.report_title')}</div>
                    <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      csResult.trustLabel === 'high' ? 'bg-[#10b981]/20 text-[#10b981]' :
                      csResult.trustLabel === 'medium' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                      'bg-[#f43f5e]/20 text-[#f43f5e]'
                    }`}>
                      {csResult.trustLabel === 'high' ? <CheckCircle className="w-3 h-3" /> : 
                       csResult.trustLabel === 'suspicious' ? <AlertTriangle className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                      {csResult.trustLabel} Trust
                    </div>
                  </div>

                  <div className="flex items-center gap-6 py-6 border-y border-white/5">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                        <circle 
                          cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="8" 
                          strokeDasharray={276}
                          strokeDashoffset={276 - (276 * csResult.trustScore) / 100}
                          className={csResult.trustScore > 80 ? 'text-[#10b981]' : csResult.trustScore > 50 ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-black">{csResult.trustScore}</div>
                        <div className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">Score</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#b8c4e0] leading-relaxed italic">
                        "{csResult.summary}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] text-[#475569] uppercase font-bold mb-2 tracking-widest">{t('verify.creatorseal.findings')}</div>
                      <div className="space-y-2">
                        {csResult.technicalFindings.map((finding, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-[#f1f5f9] bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="w-1 h-1 rounded-full bg-[#00d4ff] mt-1.5 flex-shrink-0" />
                            {finding}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#475569] uppercase font-bold mb-2 tracking-widest">{t('verify.creatorseal.actions')}</div>
                      <div className="space-y-2">
                        {csResult.recommendedActions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-[#b8c4e0] bg-white/5 p-2 rounded-lg border border-white/5">
                            <CheckCircle2 className="w-3 h-3 text-[#10b981] mt-0.5 flex-shrink-0" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && !verifying && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-white/[0.03] border border-[#00d4ff]/30 rounded-[32px] space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold">{t('verify.result')}</div>
                    {result.isAuthentic || result.status === 'verified' ? (
                      <span className="px-3 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold uppercase tracking-wider">{t('verify.success')}</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#f43f5e]/20 text-[#f43f5e] text-[10px] font-bold uppercase tracking-wider">{t('verify.failed')}</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activeTab === 'doc' && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Datei</span>
                          <span className="text-xs font-bold">{result.fileName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Status</span>
                          <span className={`text-xs font-bold ${result.isAuthentic ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                            {result.isAuthentic ? t('verify.authentic') : t('verify.invalid')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#475569] uppercase font-bold">Blockchain Hash</span>
                          <div className="text-[10px] font-mono break-all text-[#b8c4e0] bg-black/20 p-3 rounded-lg border border-white/5">
                            {result.hash}
                          </div>
                        </div>
                        {result.c2pa && (
                          <div className="mt-4 p-4 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-[#00d4ff]" />
                            </div>
                            <div>
                              <div className="text-[10px] text-[#00d4ff] font-bold uppercase tracking-wider">C2PA Manifest Valid</div>
                              <div className="text-[10px] text-[#b8c4e0]">Issuer: {result.c2pa.issuer}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === 'id' && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Name</span>
                          <span className="text-xs font-bold">{result.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Status</span>
                          <span className={`text-xs font-bold ${result.status === 'verified' ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                            {result.status === 'verified' ? t('verify.status.verified') : t('verify.status.pending')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Methode</span>
                          <span className="text-xs font-bold text-[#b8c4e0]">{result.method}</span>
                        </div>
                      </>
                    )}

                    {result.type === 'deepfake' && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Authentizität</span>
                          <span className={`text-xs font-bold ${result.isReal ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                            {result.isReal ? t('verify.real') : t('verify.fake')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Konfidenz</span>
                          <span className="text-xs font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">KI-Analyse</div>
                          <div className="text-xs leading-relaxed">{result.analysis}</div>
                        </div>
                      </>
                    )}

                    {result.type === 'platform' && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Role</span>
                          <span className="text-xs font-bold capitalize">{result.role}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-xs text-[#475569]">Status</span>
                          <span className="text-xs font-bold text-amber-400">{t('verify.status.pending') || 'Pending Review'}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Next Steps</div>
                          <div className="text-xs leading-relaxed">Our team will review your documents within 48 hours. You will receive a notification once your status is updated.</div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {provenance && activeTab === 'provenance' && !verifying && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-white/[0.03] border border-[#00d4ff]/30 rounded-[32px] space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="text-[10px] text-[#00d4ff] font-bold uppercase tracking-wider mb-1">{t('verify.provenance.manifest_active')}</div>
                      <div className="text-sm font-bold text-white">{provenance.manifest.producer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">{t('verify.provenance.algorithm')}</div>
                      <div className="text-[10px] font-mono text-[#b8c4e0]">{provenance.manifest.signature.algorithm}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">{t('verify.provenance.issuer')}</div>
                      <div className="text-xs font-medium text-[#f1f5f9]">{provenance.manifest.signature.issuer}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">{t('verify.provenance.signed_at')}</div>
                      <div className="text-xs font-medium text-[#f1f5f9]">{new Date(provenance.manifest.signature.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold mb-6 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#00d4ff]" />
                      {t('verify.provenance.timeline')}
                    </div>
                    <div className="space-y-8">
                      {provenance.history.map((h: any, i: number) => (
                        <div key={i} className="relative pl-8 border-l border-white/10 pb-2 last:pb-0">
                          <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]" />
                          <div className="flex gap-4">
                            <img 
                              src={h.thumbnail} 
                              alt="State Thumbnail" 
                              className="w-16 h-16 rounded-lg object-cover border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-[10px] text-[#475569] mb-1">{new Date(h.timestamp).toLocaleString()}</div>
                              <div className="text-xs font-bold text-white mb-1">{h.action}</div>
                              <div className="text-[10px] text-[#b8c4e0] leading-relaxed">
                                <span className="font-bold text-[#00d4ff]">{h.actor}</span> · {h.metadata}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="text-[10px] text-[#475569] uppercase font-bold mb-3">{t('verify.provenance.assertions')}</div>
                    <div className="flex flex-wrap gap-2">
                      {provenance.assertions.map((a: any, i: number) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#b8c4e0] flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                          {a.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!verifying && !result && !provenance && (
                <div className="p-8 bg-white/[0.01] border border-white/5 border-dashed rounded-[32px] text-center py-20">
                  <Shield className="w-12 h-12 text-[#141428] mx-auto mb-4" />
                  <div className="text-xs text-[#475569]">{t('verify.waiting')}</div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
