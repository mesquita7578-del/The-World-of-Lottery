
import React from 'react';
import { X, Download, Maximize2 } from 'lucide-react';
import { LotteryTicket } from '../types';

interface ImageZoomModalProps {
  ticket: LotteryTicket;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ ticket, onClose }) => {
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
            <p className="text-xs text-slate-400 font-mono">ID: {ticket.autoId} • Extraction: #{ticket.extractionNo}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = ticket.imageUrl;
                link.download = `lottery-${ticket.autoId}.png`;
                link.click();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Download Image"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative group w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black shadow-2xl">
          <img 
            src={ticket.imageUrl} 
            alt={ticket.entity} 
            className="max-w-full max-h-[80vh] object-contain select-none cursor-zoom-out"
            onClick={onClose}
          />
        </div>

        {/* Footer Details */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10 text-white text-xs">
          <div>
            <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Country</span>
            <span className="font-medium">{ticket.country}</span>
          </div>
          <div>
            <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Draw Date</span>
            <span className="font-medium">{ticket.drawDate || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Value</span>
            <span className="font-medium">{ticket.value}</span>
          </div>
          <div>
            <span className="block text-slate-400 uppercase font-bold tracking-tighter mb-1">Dimensions</span>
            <span className="font-medium">{ticket.dimensions || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
