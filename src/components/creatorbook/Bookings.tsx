import React from 'react';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface BookingsProps {
  myBookings: any[];
  marketCreators: any[];
}

const Bookings: React.FC<BookingsProps> = ({ myBookings, marketCreators }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black font-['Fraunces'] mb-2">My <span className="text-[#00d4ff]">Bookings</span></h1>
        <p className="text-white/60 text-sm">Manage your active and past creator bookings.</p>
      </div>

      <div className="grid gap-4">
        {myBookings.map((booking) => {
          const creator = marketCreators.find(c => c.id === booking.creatorId);
          return (
            <div key={booking.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.07] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                  <img src={creator?.avatar || "https://picsum.photos/seed/creator/100/100"} alt={creator?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-lg">{creator?.name || 'Unknown Creator'}</div>
                  <div className="text-white/40 text-xs">{booking.serviceType} • {booking.createdAt?.toDate?.().toLocaleDateString() || booking.time}</div>
                </div>
              </div>
              <div className="flex-1 px-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white/60">Price:</span>
                  <span className="text-sm font-black text-[#39ff6e]">€{booking.price?.toFixed(2)}</span>
                </div>
                <p className="text-xs text-white/40 line-clamp-1">{booking.details}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  booking.status === 'confirmed' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                  booking.status === 'completed' ? 'bg-[#39ff6e]/20 text-[#39ff6e]' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {booking.status}
                </span>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {myBookings.length === 0 && (
          <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[32px]">
            <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-bold">No bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
