
import React, { useState } from 'react';
import { X, Download, Trash2, FlipHorizontal, Square, AlignLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { LotteryTicket } from '../types';

interface ImageZoomModalProps {
  ticket: LotteryTicket;
  onClose: () => void;
  onDelete: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ ticket, onClose, onDelete }) => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [isZoomed, setIsZoomed] = useState(false);
  const currentImage = side === 'front' ? ticket.frontImageUrl : (ticket.backImageUrl || ticket.frontImageUrl);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-2 md:p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-7xl flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Actions */}
        <div className="w-full flex justify-between items-center text-white pt-2 px-2 md:px-0">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-serif font-bold leading-tight">{ticket.entity}</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-mono tracking-wider">
              ID: {ticket.autoId} • EXTRAÇÃO: #{ticket.extractionNo} • {ticket.country.toUpperCase()}
            </p>
          </div>
          
          <div className="flex items-center gap-1 md:gap-3">
            {ticket.backImageUrl && (
              <button 
                onClick={() => setSide(side === 'front' ? 'back' : 'front')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                <FlipHorizontal size={14} />
                <span className="hidden sm:inline">Ver {side === 'front' ? 'Verso' : 'Frente'}</span>
                <span className="sm:hidden">{side === 'front' ? 'Verso' : 'Frente'}</span>
              </button>
            )}
            
            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
            
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
              title={isZoomed ? "Ajustar ao Quadro" : "Zoom Real"}
            >
              {isZoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
            </button>

            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentImage;
                link.download = `lottery-${ticket.autoId}-${side}.png`;
                link.click();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
              title="Download"
            >
              <Download size={22} />
            </button>

            <button 
              onClick={onDelete}
              className="p-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-500 rounded-full transition-colors group"
              title="Eliminar"
            >
              <Trash2 size={22} />
            </button>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              title="Fechar"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Image Display Area - Adjusted to vision frame */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          <div 
            className={`relative transition-all duration-500 ease-out flex items-center justify-center
              ${isZoomed ? 'w-auto h-auto cursor-zoom-out' : 'w-full h-full cursor-zoom-in'}
            `}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img 
              src={currentImage} 
              alt={ticket.entity} 
              className={`max-w-full transition-all duration-500 select-none shadow-2xl rounded-sm
                ${isZoomed ? 'scale-125 md:scale-150 shadow-indigo-500/10' : 'max-h-[75vh] object-contain'}
              `}
            />
            
            {/* Indicator of current side */}
            <div className="absolute top-4 left-4 pointer-events-none">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
                 <div className={`w-2 h-2 rounded-full ${side === 'front' ? 'bg-indigo-400' : 'bg-amber-400'} animate-pulse`}></div>
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">
                   {side === 'front' ? 'Frente' : 'Verso'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer Info - Always visible but compact */}
        <div className="w-full max-w-4xl pb-4 animate-in slide-in-from-bottom-4 duration-500 px-2 md:px-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white shadow-2xl">
            <div className="space-y-0.5">
              <span className="block text-slate-500 text-[9px] font-black uppercase tracking-widest">País</span>
              <span className="text-xs md:text-sm font-semibold text-indigo-200">{ticket.country}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-slate-500 text-[9px] font-black uppercase tracking-widest">Sorteio</span>
              <span className="text-xs md:text-sm font-semibold">{ticket.drawDate || 'Data Não Registada'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-slate-500 text-[9px] font-black uppercase tracking-widest">Valor</span>
              <span className="text-xs md:text-sm font-semibold text-amber-300">{ticket.value}</span>
            </div>
            <div className="space-y-0.5">
              <span className="block text-slate-500 text-[9px] font-black uppercase tracking-widest">Medidas</span>
              <span className="text-xs md:text-sm font-semibold text-slate-300">{ticket.dimensions || 'N/A'}</span>
            </div>
          </div>

          {ticket.notes && (
            <div className="mt-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <AlignLeft size={14} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Notas do Colecionador</span>
              </div>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic font-light">
                {ticket.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
