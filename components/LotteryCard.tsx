
import React from 'react';
import { LotteryTicket } from '../types';
import { Maximize2 } from 'lucide-react';

interface LotteryCardProps {
  ticket: LotteryTicket;
  onClick?: (ticket: LotteryTicket) => void;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({ ticket, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden"
    >
      <div 
        className="aspect-[3/2] w-full overflow-hidden bg-slate-50 relative cursor-zoom-in"
        onClick={() => onClick?.(ticket)}
      >
        <img 
          src={ticket.imageUrl} 
          alt={ticket.extractionNo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300" size={20} />
        </div>

        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
           <span className="px-1.5 py-0.5 bg-white/80 backdrop-blur-sm rounded text-[9px] font-bold text-slate-600 shadow-sm border border-slate-100">
            {ticket.autoId}
          </span>
        </div>
        <div className="absolute top-1.5 right-1.5 pointer-events-none">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm ${
            ticket.state === 'Amostra' ? 'bg-amber-500' : 
            ticket.state === 'Specimen' ? 'bg-indigo-500' : 
            ticket.state.includes('cs') ? 'bg-rose-400' : 'bg-emerald-500'
          }`}>
            {ticket.state.split(' ')[0]}
          </span>
        </div>
      </div>
      
      <div className="p-2.5 space-y-1.5">
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-semibold text-slate-800 text-[11px] leading-tight truncate flex-1" title={ticket.entity}>
            {ticket.entity}
          </h3>
          <span className="text-indigo-600 font-bold text-[10px] whitespace-nowrap">
            {ticket.value}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
          <div className="flex items-center">
            <Icons.MapPin size={10} className="mr-1 text-slate-300" />
            {ticket.country}
          </div>
          <div className="flex items-center">
            <Icons.Calendar size={10} className="mr-1 text-slate-300" />
            {ticket.drawDate?.split('-')[0] || 'N/A'}
          </div>
        </div>
        
        <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter truncate max-w-[60%]">
            {ticket.type}
          </span>
          <span className="text-[9px] text-slate-300 font-mono">
            #{ticket.extractionNo}
          </span>
        </div>
      </div>
    </div>
  );
};

const Icons = {
  MapPin: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Calendar: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
};
