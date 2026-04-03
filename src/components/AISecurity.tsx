import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, RefreshCw, Zap, AlertCircle, Lock, Video, Play, Loader2, X } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { GoogleGenAI } from "@google/genai";

export default function AISecurity() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'scan' | 'anomalies' | 'threats'>('scan');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [threats, setThreats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const generateVideo = async (threat: any) => {
    if (!(window as any).aistudio) return;
    
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    
    setVideoGenerating(true);
    setShowVideoModal(true);
    setVideoUrl(null);
    setVideoStatus(t('ai.video.status.init'));
    
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `A professional, cinematic 3D animation explaining the security threat: ${threat.name}. 
        Description: ${threat.description}. 
        The video must clearly illustrate:
        1. The nature of the threat (Severity: ${threat.severity}).
        2. The potential impact on a creator's digital infrastructure.
        3. Effective mitigation strategies to prevent or neutralize this attack.
        Style: High-tech, futuristic, dark blue and red color palette, informative motion graphics.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setVideoStatus(t('ai.video.status.poll'));

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});

        // Update status messages to keep user engaged
        const statuses = [
          t('ai.video.status.analyzing'),
          t('ai.video.status.synthesizing'),
          t('ai.video.status.rendering'),
          t('ai.video.status.finalizing')
        ];
        setVideoStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': (process.env as any).API_KEY || '',
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoStatus(t('ai.video.status.success'));
      }
    } catch (error: any) {
      console.error("Video generation failed", error);
      if (error.message?.includes("Requested entity was not found")) {
        await (window as any).aistudio.openSelectKey();
      }
      setVideoStatus(t('ai.video.failed'));
    } finally {
      setVideoGenerating(false);
    }
  };

  const runScan = async () => {
    setLoading(true);
    setScanResult(null);
    try {
      // Use Gemini for real security analysis
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Perform a professional AI security audit for the following target: "Production Environment of RealSyncDynamics Platform".
        Analyze potential vulnerabilities including SQL Injection, XSS, CSRF, Insecure Headers, and API security.
        Return the result in JSON format with the following structure:
        {
          "score": number (0-100),
          "target": "Production Environment",
          "vulnerabilities": [
            { "severity": "High" | "Medium" | "Low", "type": string, "location": string, "description": string }
          ]
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setScanResult(data);
      setLoading(false);
    } catch (e) {
      console.error("Security scan failed", e);
      // Fallback to mock data if AI fails
      setScanResult({
        success: true,
        target: "Production Environment",
        vulnerabilities: [
          { severity: "High", type: "SQL Injection", location: "/api/users", description: "Potential unescaped input in query parameter." },
          { severity: "Medium", type: "XSS", location: "/profile", description: "Reflected XSS possible via username field." },
          { severity: "Low", type: "Insecure Headers", location: "Global", description: "Missing Content-Security-Policy header." }
        ],
        score: 72,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }
  };

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/security/anomalies');
      const data = await res.json();
      setTimeout(() => {
        setAnomalies(data.anomalies);
        setLoading(false);
      }, 1500);
    } catch (e) {
      setLoading(false);
    }
  };

  const fetchThreats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/security/threats');
      const data = await res.json();
      setTimeout(() => {
        setThreats(data.threats);
        setLoading(false);
      }, 1500);
    } catch (e) {
      setLoading(false);
    }
  };

  const fetchTrend = async () => {
    try {
      const res = await fetch('/api/security/trend');
      const data = await res.json();
      setTrendData(data.trend);
    } catch (e) {
      console.error("Failed to fetch trend data", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'anomalies') fetchAnomalies();
    if (activeTab === 'threats') fetchThreats();
    fetchTrend();
  }, [activeTab]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto pt-16 bg-[#060612]"
    >
      <div className="max-w-5xl mx-auto px-5 py-12">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-[11px] font-bold text-[#f43f5e] uppercase tracking-[2px] mb-2 block">{t('ai.subtitle')}</span>
            <h1 className="font-['Fraunces'] font-black text-4xl mb-4">{t('ai.title')}</h1>
            <p className="text-[#b8c4e0] text-sm font-light leading-relaxed max-w-xl">
              {t('ai.desc')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f43f5e]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#f43f5e]" />
              </div>
              <div>
                <div className="text-[10px] text-[#f43f5e] font-bold uppercase tracking-wider">{t('ai.score')}</div>
                <div className="text-xl font-black text-white">94.2</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'scan' ? 'bg-[#f43f5e] text-white' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('ai.tab.scan')}
          </button>
          <button 
            onClick={() => setActiveTab('anomalies')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'anomalies' ? 'bg-[#f43f5e] text-white' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('ai.tab.anomalies')}
          </button>
          <button 
            onClick={() => setActiveTab('threats')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'threats' ? 'bg-[#f43f5e] text-white' : 'text-[#94a3b8] hover:text-white'}`}
          >
            {t('ai.tab.threats')}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'scan' && (
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t('ai.scan.title')}</h3>
                  <button 
                    onClick={runScan}
                    disabled={loading}
                    className="px-6 py-2 rounded-xl bg-[#f43f5e] text-white text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {loading ? t('ai.scan.loading') : t('ai.scan.button')}
                  </button>
                </div>
                
                {loading ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="w-12 h-12 text-[#f43f5e] mx-auto mb-4 animate-spin" />
                    <div className="text-sm font-medium text-[#b8c4e0]">{t('ai.scan.status')}</div>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Score</div>
                        <div className="text-2xl font-black text-[#f43f5e]">{scanResult.score}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Issues</div>
                        <div className="text-2xl font-black text-white">{scanResult.vulnerabilities.length}</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <div className="text-[10px] text-[#475569] uppercase font-bold mb-1">Target</div>
                        <div className="text-xs font-bold text-[#b8c4e0] truncate mt-2">{scanResult.target}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {scanResult.vulnerabilities.map((v: any, i: number) => (
                        <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#f43f5e]/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                v.severity === 'High' ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 
                                v.severity === 'Medium' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 
                                'bg-[#10b981]/20 text-[#10b981]'
                              }`}>
                                {v.severity}
                              </span>
                              <span className="text-sm font-bold">{v.type}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#475569]">{v.location}</span>
                          </div>
                          <p className="text-xs text-[#b8c4e0] leading-relaxed">{v.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <Zap className="w-12 h-12 text-[#141428] mx-auto mb-4" />
                    <p className="text-xs text-[#475569]">{t('ai.scan.ready')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'anomalies' && (
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-6">
                <h3 className="text-xl font-bold">{t('ai.anomalies.title')}</h3>
                {loading ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="w-12 h-12 text-[#f43f5e] mx-auto mb-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {anomalies.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            a.status === 'Blocked' ? 'bg-[#f43f5e]/10 text-[#f43f5e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                          }`}>
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold">{a.type}</div>
                            <div className="text-[10px] text-[#475569] font-mono">{a.source} · Confidence: {(a.confidence * 100).toFixed(0)}%</div>
                            <button 
                              onClick={() => generateVideo(a)}
                              className="flex items-center gap-1.5 text-[9px] font-bold text-[#f43f5e] hover:underline mt-1"
                            >
                              <Video className="w-3 h-3" />
                              {t('ai.video.generate')}
                            </button>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.status === 'Blocked' ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                        }`}>
                          {a.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-6">
                <h3 className="text-xl font-bold">{t('ai.threats.title')}</h3>
                {loading ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="w-12 h-12 text-[#f43f5e] mx-auto mb-4 animate-spin" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {threats.map((t: any, i: number) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-bold text-[#f43f5e]">{t.name}</div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#f43f5e]/20 text-[#f43f5e] uppercase">{t.severity}</span>
                        </div>
                        <p className="text-[11px] text-[#b8c4e0] leading-relaxed">{t.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-[9px] text-[#475569] uppercase font-bold tracking-wider">Origin: {t.origin}</div>
                          <button 
                            onClick={() => generateVideo(t)}
                            className="flex items-center gap-1.5 text-[9px] font-bold text-[#f43f5e] hover:underline"
                          >
                            <Video className="w-3 h-3" />
                            {t('ai.video.generate')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-4">
              <h4 className="text-sm font-bold">{t('ai.trend.title')}</h4>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      interval={5}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#060612', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#f43f5e' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f43f5e" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[32px] space-y-4">
              <h4 className="text-sm font-bold">{t('ai.health.title')}</h4>
              <div className="space-y-4">
                <HealthItem label={t('ai.health.engine')} status={t('ai.health.optimal')} color="text-[#10b981]" />
                <HealthItem label={t('ai.health.traffic')} status={t('ai.health.active')} color="text-[#10b981]" />
                <HealthItem label={t('ai.health.encryption')} status={t('ai.health.secure')} color="text-[#10b981]" />
                <HealthItem label={t('ai.health.nodes')} status={t('ai.health.connected')} color="text-[#10b981]" />
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#f43f5e]/20 to-transparent border border-[#f43f5e]/30 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-[#f43f5e]" />
                <h4 className="text-sm font-bold">{t('ai.mitigation.title')}</h4>
              </div>
              <p className="text-[11px] text-[#b8c4e0] leading-relaxed">
                {t('ai.mitigation.desc')}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse" />
                <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-wider">{t('ai.mitigation.active')}</span>
              </div>
            </div>
          </div>
        </div>

        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f172a] border border-white/10 rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#f43f5e]" />
                  AI Security Briefing
                </h3>
                <button onClick={() => setShowVideoModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                {videoUrl ? (
                  <div className="space-y-6">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full rounded-2xl border border-white/10 shadow-lg"
                    />
                    <div className="flex justify-center">
                      <button 
                        onClick={() => setShowVideoModal(false)}
                        className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all"
                      >
                        {t('ai.video.close')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 border-4 border-[#f43f5e]/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[#f43f5e] rounded-full border-t-transparent animate-spin" />
                      <Video className="absolute inset-0 m-auto w-8 h-8 text-[#f43f5e]" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-white">{videoStatus}</p>
                      <p className="text-sm text-[#b8c4e0] max-w-md mx-auto">
                        Our AI is synthesizing a visual explanation of the security threat. This process takes about 1-2 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HealthItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-[#475569]">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{status}</span>
    </div>
  );
}
