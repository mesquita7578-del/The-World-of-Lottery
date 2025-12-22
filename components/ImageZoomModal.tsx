
import React, { useState } from 'react';
import { X, Download, Trash2, FlipHorizontal, AlignLeft, ZoomIn, ZoomOut } from 'lucide-react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-6xl flex flex-col items-center justify-between gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho de Ações */}
        <div className="w-full flex justify-between items-start text-white">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-serif font-bold leading-tight text-indigo-100">{ticket.entity}</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-mono tracking-widest mt-1">
              {ticket.country.toUpperCase()} • {ticket.autoId} • #{ticket.extractionNo}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {ticket.backImageUrl && (
              <button 
                onClick={() => setSide(side === 'front' ? 'back' : 'front')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                <FlipHorizontal size={14} />
                <span>{side === 'front' ? 'Ver Verso' : 'Ver Frente'}</span>
              </button>
            )}
            
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
              title={isZoomed ? "Reduzir" : "Ampliar"}
            >
              {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
            </button>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white ml-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Área da Imagem - Agora com Redução */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          <div 
            className={`relative transition-all duration-500 ease-in-out flex items-center justify-center
              ${isZoomed ? 'w-full h-full' : 'w-auto h-auto'}
            `}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img 
              src={currentImage} 
              alt={ticket.entity} 
              className={`transition-all duration-500 select-none shadow-2xl rounded-sm border border-white/5
                ${isZoomed ? 'max-h-[85vh] scale-100' : 'max-h-[50vh] scale-95 hover:scale-100 cursor-zoom-in'}
                object-contain
              `}
            />
            
            {/* Indicador de Lado */}
            {!isZoomed && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">
                  Vista de {side === 'front' ? 'Frente' : 'Verso'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Informações Inferior */}
        <div className="w-full max-w-3xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-white">
            <div className="space-y-1">
              <span className="block text-slate-500 text-[8px] font-black uppercase tracking-widest">Sorteio</span>
              <span className="text-xs font-semibold">{ticket.drawDate || '---'}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-slate-500 text-[8px] font-black uppercase tracking-widest">Valor</span>
              <span className="text-xs font-semibold text-amber-400">{ticket.value}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-slate-500 text-[8px] font-black uppercase tracking-widest">Estado</span>
              <span className="text-xs font-semibold text-indigo-300">{ticket.state}</span>
            </div>
            <div className="space-y-1">
              <span className="block text-slate-500 text-[8px] font-black uppercase tracking-widest">Medidas</span>
              <span className="text-xs font-semibold text-slate-400">{ticket.dimensions || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex gap-4">
              <button 
                onClick={onDelete}
                className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                <Trash2 size={14} />
                Eliminar Registo
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = currentImage;
                  link.download = `lottery-${ticket.autoId}.png`;
                  link.click();
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                <Download size={14} />
                Descarregar Imagem
              </button>
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Arquivo Particular Jorge</p>
          </div>
        </div>
      </div>
    </div>
  );
};
