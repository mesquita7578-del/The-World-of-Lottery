
import React from 'react';
import { LotteryTicket } from '../types';
import { MapPin, Calendar, Maximize, Landmark } from 'lucide-react';

interface LotteryCardProps {
  ticket: LotteryTicket;
  onClick?: (ticket: LotteryTicket) => void;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({ ticket, onClick }) => {
  return (
    <div 
      onClick={() => onClick?.(ticket)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
        <img 
          src={ticket.imageUrl} 
          alt={ticket.extractionNo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-bold text-indigo-600 shadow-sm border border-indigo-100">
            {ticket.autoId}
          </span>
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-sm ${
            ticket.state === 'Amostra' ? 'bg-amber-500' : 
            ticket.state === 'Specimen' ? 'bg-indigo-500' : 'bg-emerald-500'
          }`}>
            {ticket.state}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 text-sm truncate w-2/3" title={ticket.entity}>
            {ticket.entity}
          </h3>
          <span className="text-indigo-600 font-bold text-xs">
            {ticket.value}
          </span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center text-xs text-slate-500">
            <MapPin size={12} className="mr-1.5 text-slate-400" />
            {ticket.country} ({ticket.continent})
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <Calendar size={12} className="mr-1.5 text-slate-400" />
            {ticket.drawDate || 'N/A'}
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <Maximize size={12} className="mr-1.5 text-slate-400" />
            {ticket.dimensions || 'Unknown dimensions'}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {ticket.type}
          </span>
          <span className="text-[10px] text-slate-400">
            #{ticket.extractionNo}
          </span>
        </div>
      </div>
    </div>
  );
};

// Lucide Icons Mock (simplified for standard React import)
const Icons = {
  MapPin: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Calendar: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  Maximize: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m15 3 6 6M9 21l-6-6M21 3v6h-6M3 21v-6h6M21 3l-9 9M3 21l9-9"/>
    </svg>
  ),
  Landmark: ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7 12 2"/>
    </svg>
  )
};
