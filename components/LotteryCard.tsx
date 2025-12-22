
import React, { useState } from 'react';
import { LotteryTicket } from '../types';
import { Maximize2, Layers, MapPin, Calendar, FlipHorizontal } from 'lucide-react';

interface LotteryCardProps {
  ticket: LotteryTicket;
  onClick?: (ticket: LotteryTicket) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isDimmed?: boolean;
  isHighlighted?: boolean;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({ 
  ticket, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  isDimmed,
  isHighlighted 
}) => {
  const [showBack, setShowBack] = useState(false);
  const hasBack = !!ticket.backImageUrl;
  
  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBack(!showBack);
  };

  return (
    <div 
      className={`group bg-white rounded-lg shadow-sm transition-all duration-300 border border-slate-100 overflow-hidden relative
        ${isDimmed ? 'opacity-30 grayscale-[0.5] scale-[0.98]' : 'opacity-100 grayscale-0'}
        ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-lg z-10 scale-[1.02]' : 'z-0'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div 
        className="aspect-[3/2] w-full overflow-hidden bg-slate-50 relative cursor-zoom-in"
        onClick={() => onClick?.(ticket)}
      >
        <img 
          src={showBack && ticket.backImageUrl ? ticket.backImageUrl : ticket.frontImageUrl} 
          alt={ticket.extractionNo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300" size={20} />
        </div>

        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
           <span className="px-1.5 py-0.5 bg-white/80 backdrop-blur-sm rounded text-[9px] font-bold text-slate-600 shadow-sm border border-slate-100">
            {ticket.autoId}
          </span>
        </div>

        {hasBack && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
             <button 
                onClick={handleFlip}
                className="flex items-center gap-1 px-1.5 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-200 hover:bg-indigo-50 transition-colors group/flip"
                title={showBack ? "Ver Frente" : "Ver Verso"}
             >
                <span className="text-[9px] font-black text-indigo-600">
                  {showBack ? '2/2' : '1/2'}
                </span>
                <FlipHorizontal size={10} className="text-indigo-400 group-hover/flip:text-indigo-600 transition-colors" />
             </button>
          </div>
        )}

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
            <MapPin size={10} className="mr-1 text-slate-300" />
            {ticket.country}
          </div>
          <div className="flex items-center">
            <Calendar size={10} className="mr-1 text-slate-300" />
            {ticket.drawDate?.split('-')[0] || 'N/D'}
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
      
      {/* Label de Conexão (apenas quando em destaque) */}
      {isHighlighted && !isDimmed && (
        <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 py-0.5 px-2 text-center">
           <span className="text-[8px] font-bold text-white uppercase tracking-widest">Item Relacionado</span>
        </div>
      )}
    </div>
  );
};
