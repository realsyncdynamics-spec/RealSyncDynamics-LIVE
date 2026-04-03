import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Lock } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

interface SettingsProps {
  isAdmin: boolean;
  onSeedDemoData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isAdmin, onSeedDemoData }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-black font-['Fraunces']">{t('cb.sidebar.settings')}</h2>
      
      <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4">Admin Tools</h3>
        <p className="text-sm text-white/60 mb-6">These tools are only available to platform administrators.</p>
        
        {isAdmin ? (
          <button 
            onClick={onSeedDemoData}
            className="px-6 py-3 bg-[#00d4ff] text-black font-black rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Seed Demo Data
          </button>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <Lock className="w-5 h-5" /> Access Restricted
          </div>
        )}
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-bold">Email Notifications</p>
              <p className="text-[10px] text-white/40">Receive updates about your account.</p>
            </div>
            <div className="w-12 h-6 bg-[#00d4ff] rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-bold">Two-Factor Authentication</p>
              <p className="text-[10px] text-white/40">Add an extra layer of security.</p>
            </div>
            <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
