import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, Plus, History, ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface WalletProps {
  profile: any;
  transactions: any[];
  myBookings: any[];
  onShowTopUp: () => void;
  onStripeConnect: () => void;
  onStripeDashboard: () => void;
}

export default function Wallet({ profile, transactions, myBookings, onShowTopUp, onStripeConnect, onStripeDashboard }: WalletProps) {
  const { t } = useTranslation();
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const balance = profile?.balance || 0;
  const isCreator = profile?.role === 'creator';
  const stripeConnectStatus = profile?.stripeConnectStatus;
  const isStripeConnected = stripeConnectStatus === 'active';

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-[32px] text-black shadow-[0_20px_40px_rgba(0,212,255,0.2)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <WalletIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mb-2">Available Balance</div>
            <div className="text-5xl font-black font-['Fraunces'] mb-8">€{balance.toFixed(2)}</div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setShowTopUpModal(true)}
                className="px-8 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Top Up
              </button>
              
              {isCreator && (
                <button 
                  onClick={isStripeConnected ? onStripeDashboard : onStripeConnect}
                  className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isStripeConnected ? 'bg-white text-black hover:bg-white/90' : 'bg-black/20 border border-black/20 hover:bg-black/30'}`}
                >
                  <CreditCard className="w-4 h-4" /> 
                  {isStripeConnected ? 'Manage Payouts' : 'Connect Stripe'}
                </button>
              )}

              <button className="px-8 py-3 bg-black/10 border border-black/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black/20 transition-all">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[32px] backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Monthly Spending</div>
            <div className="text-2xl font-bold">€1,240.00</div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Bookings</span>
              <span className="text-xs font-bold text-[#00d4ff]">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pending Payouts</span>
              <span className="text-xs font-bold">€450.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Transaction History</h3>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] hover:underline">
            Download CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Transaction</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'topup' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {tx.type === 'topup' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors">{tx.description}</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{tx.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-xs text-white/60 font-medium">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tx.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-right font-black ${tx.type === 'topup' ? 'text-green-400' : 'text-white'}`}>
                    {tx.type === 'topup' ? '+' : '-'}€{Math.abs(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-white/20 text-sm italic">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTopUpModal(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#0a0a1a] border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black font-['Fraunces'] mb-6">Top Up Balance</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {['20', '50', '100', '250', '500', '1000'].map(amount => (
                  <button 
                    key={amount}
                    onClick={() => setTopUpAmount(amount)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${topUpAmount === amount ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">€</span>
                <input 
                  type="number" 
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-[#00d4ff]/40"
                  placeholder="Custom amount"
                />
              </div>
              <button 
                onClick={() => {
                  onShowTopUp();
                  setShowTopUpModal(false);
                }}
                className="w-full py-4 bg-[#00d4ff] text-black font-black rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Pay with Stripe
              </button>
              <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-bold">
                Secure payment powered by Stripe
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
