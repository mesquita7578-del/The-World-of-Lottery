
import React from 'react';
import { X, ExternalLink, Sparkles, Globe, History, Info } from 'lucide-react';

interface ResearchModalProps {
  data: { text: string; sources: any[] } | null;
  onClose: () => void;
  isLoading: boolean;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({ data, onClose, isLoading }) => {
  if (!data && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <h3 className="font-bold text-sm uppercase tracking-widest">Dossiê de Investigação da Geni</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-500 font-medium animate-pulse">Jorge, estou a consultar arquivos mundiais...</p>
            </div>
          ) : (
            <>
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
                {data?.text}
              </div>

              {data?.sources && data.sources.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Globe size={12} /> Fontes e Referências
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.sources.map((source, idx) => (
                      source.web?.uri && (
                        <a 
                          key={idx} 
                          href={source.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                        >
                          <ExternalLink size={10} />
                          {source.web.title || 'Ver Fonte'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">
            Informação gerada com auxílio de Inteligência Artificial e Pesquisa Google
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-600 transition-colors"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  );
};
