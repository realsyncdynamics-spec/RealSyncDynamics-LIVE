import React from 'react';
import { Mail, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface InquiriesProps {
  myInquiries: any[];
  marketCreators: any[];
  onBrowseMarket: () => void;
}

const Inquiries: React.FC<InquiriesProps> = ({ myInquiries, marketCreators, onBrowseMarket }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black font-['Fraunces'] mb-2">My <span className="text-[#00d4ff]">Inquiries</span></h1>
        <p className="text-white/60 text-sm">Track your messages sent to creators.</p>
      </div>

      <div className="grid gap-4">
        {myInquiries.map((inquiry) => {
          const creator = marketCreators.find(c => c.id === inquiry.receiverId);
          return (
            <div key={inquiry.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                  <img src={creator?.avatar || "https://picsum.photos/seed/creator/100/100"} alt={creator?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-lg">{creator?.name || 'Unknown Creator'}</div>
                  <div className="text-white/40 text-xs">{inquiry.createdAt?.toDate?.().toLocaleDateString() || inquiry.time}</div>
                </div>
              </div>
              <div className="flex-1 px-8">
                <p className="text-sm text-white/60 line-clamp-1 italic">"{inquiry.message}"</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  inquiry.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  inquiry.status === 'responded' ? 'bg-[#39ff6e]/20 text-[#39ff6e]' :
                  'bg-white/10 text-white/40'
                }`}>
                  {inquiry.status}
                </span>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {myInquiries.length === 0 && (
          <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
            <Mail className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-bold">No inquiries sent yet.</p>
            <button onClick={onBrowseMarket} className="mt-4 text-[#00d4ff] text-sm font-bold hover:underline">Browse Market</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
