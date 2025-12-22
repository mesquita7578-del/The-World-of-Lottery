
import React, { useState } from 'react';
import { X, Download, Trash2, FlipHorizontal, Square, AlignLeft } from 'lucide-react';
import { LotteryTicket } from '../types';

interface ImageZoomModalProps {
  ticket: LotteryTicket;
  onClose: () => void;
  onDelete: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ ticket, onClose, onDelete }) => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const currentImage = side === 'front' ? ticket.frontImageUrl : (ticket.backImageUrl || ticket.frontImageUrl);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl w-full max-h-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Actions */}
        <div className="w-full flex justify-between items-center text-white mb-2">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">{ticket.entity}</h2>
            <p className="text-xs text-slate-400 font-mono">ID: {ticket.autoId} • Extração: #{ticket.extractionNo}</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            {ticket.backImageUrl && (
              <button 
                onClick={() => setSide(side === 'front' ? 'back' : 'front')}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors mr-2"
              >
                <FlipHorizontal size={14} />
                Ver {side === 'front' ? 'Verso' : 'Frente'}
              </button>
            )}
            
            <button 
              onClick={onDelete}
              className="p-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-500 rounded-full transition-colors group"
              title="Eliminar Registo"
            >
              <Trash2 size={20} className="group-active:scale-90 transition-transform" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentImage;
                link.download = `lottery-${ticket.autoId}-${side}.png`;
                link.click();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Download Imagem Atual"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Fechar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative group w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black shadow-2xl transition-all duration-500">
          <img 
            src={currentImage} 
            alt={ticket.entity} 
            className="max-w-full max-h-[60vh] object-contain select-none cursor-zoom-out animate-in zoom-in-95 duration-300"
            onClick={onClose}
          />
          <div className="absolute top-4 left-4">
             <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
               {side === 'front' ? 'Frente' : 'Verso'}
             </span>
          </div>
        </div>

        {/* Info Grid & Notes */}
        <div className="w-full space-y-4">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10 text-white text-xs">
            <div>
              <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">País</span>
              <span className="font-medium">{ticket.country}</span>
            </div>
            <div>
              <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Data Sorteio</span>
              <span className="font-medium">{ticket.drawDate || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Valor</span>
              <span className="font-medium">{ticket.value}</span>
            </div>
            <div>
              <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Dimensões</span>
              <span className="font-medium">{ticket.dimensions || 'N/A'}</span>
            </div>
          </div>

          {ticket.notes && (
            <div className="w-full bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <AlignLeft size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">"{ticket.notes}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
