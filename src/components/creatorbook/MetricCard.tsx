import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  valueColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, subColor = "text-white/20", valueColor = "text-white" }) => (
  <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md">
    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{label}</div>
    <div className={`text-2xl font-black ${valueColor}`}>{value}</div>
    <div className={`text-[10px] font-bold ${subColor} mt-1`}>{sub}</div>
  </div>
);

export default MetricCard;
