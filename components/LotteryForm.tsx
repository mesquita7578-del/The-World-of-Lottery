
import React, { useState, useRef } from 'react';
import { Continent, TicketState, LotteryTicket } from '../types';
import { CONTINENTS, TICKET_STATES, LOTTERY_TYPES, COUNTRY_ISO_MAP } from '../constants';
import { Button } from './Button';
import { analyzeLotteryTicket } from '../services/geminiService';
import { Sparkles, Upload, X } from 'lucide-react';

interface LotteryFormProps {
  onSave: (ticket: Partial<LotteryTicket>) => void;
  onCancel: () => void;
  ticketCount: number;
}

export const LotteryForm: React.FC<LotteryFormProps> = ({ onSave, onCancel, ticketCount }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LotteryTicket>>({
    extractionNo: '',
    dimensions: '',
    drawDate: '',
    value: '',
    country: 'Portugal',
    continent: Continent.EUROPE,
    state: TicketState.UNCIRCULATED,
    type: 'National Lottery',
    entity: '',
    imageUrl: '',
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const scanWithAI = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const result = await analyzeLotteryTicket(preview);
      setFormData(prev => ({
        ...prev,
        ...result,
        // Basic mapping for common states if returned differently
        state: TICKET_STATES.find(s => s.toLowerCase().includes(result.state?.toLowerCase())) || prev.state
      }));
    } catch (error) {
      alert("Failed to analyze image. Please fill details manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload an image of the ticket");
      return;
    }
    
    // Auto-ID generation
    const countryPrefix = COUNTRY_ISO_MAP[formData.country!] || formData.country?.substring(0, 2).toUpperCase() || 'XX';
    const autoId = `${countryPrefix}-${String(ticketCount + 1).padStart(4, '0')}`;
    
    onSave({ ...formData, autoId });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">New Collection Entry</h2>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Image Upload & Preview */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-slate-50 group">
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => {setPreview(null); setFormData(p => ({...p, imageUrl: ''}))}}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <Upload className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 font-medium">Click to upload ticket image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
              </div>
            )}
          </div>
          
          {preview && (
            <Button 
              type="button" 
              className="w-full" 
              variant="secondary" 
              onClick={scanWithAI}
              isLoading={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Scan with Gemini AI
            </Button>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Extraction No.</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.extractionNo}
                onChange={e => setFormData({...formData, extractionNo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Draw Date</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Value / Denom.</label>
              <input 
                type="text" 
                placeholder="e.g. €2.50"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dimensions</label>
              <input 
                type="text" 
                placeholder="e.g. 150x80mm"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.dimensions}
                onChange={e => setFormData({...formData, dimensions: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Continent</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State / Quality</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value as TicketState})}
              >
                {TICKET_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lottery Type</label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Game Entity / Operator</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Santa Casa da Misericórdia"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={formData.entity}
              onChange={e => setFormData({...formData, entity: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="submit" className="flex-1">
              Save to Archive
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Simplified Lucide replacements
const IconsMock = {
  Sparkles: ({ className }: any) => <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  Upload: ({ className }: any) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  X: ({ className, size }: any) => <svg className={className} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
};
