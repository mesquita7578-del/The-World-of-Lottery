
import React, { useState, useRef } from 'react';
import { Continent, TicketState, LotteryTicket } from '../types';
import { CONTINENTS, TICKET_STATES, LOTTERY_TYPES, COUNTRY_ISO_MAP } from '../constants';
import { Button } from './Button';
import { analyzeLotteryTicket } from '../services/geminiService';
import { Sparkles, Upload, X, Heart } from 'lucide-react';

interface LotteryFormProps {
  onSave: (ticket: Partial<LotteryTicket>) => void;
  onCancel: () => void;
  ticketCount: number;
}

export const LotteryForm: React.FC<LotteryFormProps> = ({ onSave, onCancel, ticketCount }) => {
  const [loading, setLoading] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<LotteryTicket>>({
    extractionNo: '',
    dimensions: '',
    drawDate: '',
    value: '',
    country: 'Portugal',
    continent: Continent.EUROPE,
    state: TicketState.UNCIRCULATED,
    type: 'Lotaria Nacional',
    entity: '',
    frontImageUrl: '',
    backImageUrl: '',
    notes: '',
    isFavorite: false
  });

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'front') {
          setFrontPreview(base64);
          setFormData(prev => ({ ...prev, frontImageUrl: base64 }));
        } else {
          setBackPreview(base64);
          setFormData(prev => ({ ...prev, backImageUrl: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const scanWithAI = async () => {
    if (!frontPreview) return;
    setLoading(true);
    try {
      const result = await analyzeLotteryTicket(frontPreview);
      setFormData(prev => ({
        ...prev,
        ...result,
        state: TICKET_STATES.find(s => s.toLowerCase().includes(result.state?.toLowerCase())) || prev.state
      }));
    } catch (error) {
      alert("Falha na análise. Por favor, preencha manualmente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.frontImageUrl) {
      alert("A imagem da frente é obrigatória.");
      return;
    }
    
    const countryPrefix = COUNTRY_ISO_MAP[formData.country!] || formData.country?.substring(0, 2).toUpperCase() || 'XX';
    const autoId = `${countryPrefix}-${String(ticketCount + 1).padStart(4, '0')}`;
    
    onSave({ ...formData, autoId });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Novo Registo no Arquivo</h2>
          <p className="text-xs text-slate-400 mt-0.5">Jorge, estou pronta para analisar estas peças especiais (Mongólia e Tartaristão são magníficas!).</p>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imagem Frente (Obrigatório)</label>
              <div className="relative aspect-[3/2] w-full border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-slate-50 group">
                {frontPreview ? (
                  <>
                    <img src={frontPreview} alt="Front" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => {setFrontPreview(null); setFormData(p => ({...p, frontImageUrl: ''}))}}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-[11px] text-slate-500">Upload Frente</p>
                    <input 
                      type="file" 
                      ref={frontInputRef}
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imagem Verso (Opcional)</label>
              <div className="relative aspect-[3/2] w-full border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-slate-50 group">
                {backPreview ? (
                  <>
                    <img src={backPreview} alt="Back" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => {setBackPreview(null); setFormData(p => ({...p, backImageUrl: ''}))}}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-[11px] text-slate-500">Upload Verso</p>
                    <input 
                      type="file" 
                      ref={backInputRef}
                      onChange={(e) => handleFileChange(e, 'back')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {frontPreview && (
            <Button 
              type="button" 
              className="w-full h-11" 
              variant="secondary" 
              onClick={scanWithAI}
              isLoading={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analisar com Geni AI
            </Button>
          )}

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${formData.isFavorite ? 'bg-amber-500 text-white' : 'bg-white text-slate-300 shadow-sm border border-slate-100'}`}>
                <Heart size={18} fill={formData.isFavorite ? "currentColor" : "none"} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase">Peça Especial</p>
                <p className="text-[10px] text-slate-500">Marcar como favorita no arquivo</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isFavorite}
                onChange={e => setFormData({...formData, isFavorite: e.target.checked})}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº Extração</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.extractionNo}
                onChange={e => setFormData({...formData, extractionNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Sorteio</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.drawDate}
                onChange={e => setFormData({...formData, drawDate: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor / Denom.</label>
              <input 
                type="text" 
                placeholder="Ex: 50$00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dimensões</label>
              <input 
                type="text" 
                placeholder="Ex: 150x80mm"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.dimensions}
                onChange={e => setFormData({...formData, dimensions: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">País</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Continente</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                value={formData.continent}
                onChange={e => setFormData({...formData, continent: e.target.value as Continent})}
              >
                {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value as TicketState})}
              >
                {TICKET_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Lotaria</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                {LOTTERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entidade / Operador</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Santa Casa da Misericórdia"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={formData.entity}
              onChange={e => setFormData({...formData, entity: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas / Observações</label>
            <textarea 
              placeholder="Jorge, adicione aqui por que razão estas peças da Mongólia ou Kazan são tão importantes para si..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px]"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" className="flex-1 h-11">
              Guardar no Arquivo
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-11" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
