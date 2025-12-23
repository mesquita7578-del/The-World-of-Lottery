
import React, { useState, useEffect, useMemo } from 'react';
import { LotteryTicket, Continent, TicketState } from './types';
import { LotteryCard } from './components/LotteryCard';
import { LotteryForm } from './components/LotteryForm';
import { StatsDashboard } from './components/StatsDashboard';
import { ImageZoomModal } from './components/ImageZoomModal';
import { ResearchModal } from './components/ResearchModal';
import { Button } from './components/Button';
import { Search, Plus, Archive, BarChart3, Globe, Download, LogOut, MonitorSmartphone, Heart, ShieldCheck, Database } from 'lucide-react';
import { getAllTicketsDB, saveTicketDB, deleteTicketDB } from './services/dbService';
import { researchTicketDetails } from './services/geminiService';

interface CollectorProfile {
  name: string;
  password: string;
}

const App: React.FC = () => {
  const [tickets, setTickets] = useState<LotteryTicket[]>([]);
  const [view, setView] = useState<'gallery' | 'stats' | 'add'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [continentFilter, setContinentFilter] = useState<string>('Todos');
  const [countryFilter, setCountryFilter] = useState<string>('Todos');
  const [selectedTicket, setSelectedTicket] = useState<LotteryTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<LotteryTicket | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  const [researchData, setResearchData] = useState<{ text: string; sources: any[] } | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  
  const [collector, setCollector] = useState<CollectorProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Escutar evento de instalação da App no PC
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleExportCollection = () => {
    const dataStr = JSON.stringify(tickets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `arquivo-lotarias-jorge-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      try {
        let savedTickets = await getAllTicketsDB();
        if (savedTickets.length === 0) {
          // Seeding initial data...
          const initial = [
            {
              id: 'mongolia-1981',
              autoId: 'MN-0001',
              extractionNo: '11773',
              dimensions: '145x85mm',
              drawDate: '1981-07-11',
              value: '5 Tögrög',
              country: 'Mongólia',
              continent: Continent.ASIA,
              state: TicketState.UNCIRCULATED,
              type: 'Lotaria Estatal (60º Aniversário)',
              entity: 'República Popular da Mongólia',
              frontImageUrl: 'https://images.unsplash.com/photo-1599408162449-41ca164e287a?q=80&w=1000&auto=format&fit=crop',
              notes: 'Peça rara com estética socialista. Celebra os 60 anos da revolução. Jorge: "Deu muito trabalho a conseguir".',
              createdAt: Date.now(),
              isFavorite: true
            },
            {
              id: 'kazan-2005',
              autoId: 'RU-0001',
              extractionNo: '17477',
              dimensions: '160x70mm',
              drawDate: '2005-08-30',
              value: '50 Rublos',
              country: 'Rússia (Tartaristão)',
              continent: Continent.EUROPE,
              state: TicketState.UNCIRCULATED,
              type: 'Lotaria Comemorativa (1000 Anos de Kazan)',
              entity: 'Ministério das Finanças da RF',
              frontImageUrl: 'https://images.unsplash.com/photo-1555620245-7360098f98ec?q=80&w=1000&auto=format&fit=crop',
              notes: 'Bilhete especial dos 1000 anos de Kazan. Jorge: "Peça que gosto muito".',
              createdAt: Date.now(),
              isFavorite: true
            }
          ];
          for (const t of initial) await saveTicketDB(t as any);
          savedTickets = initial as any;
        }
        setTickets(savedTickets);

        const savedProfile = localStorage.getItem('collector_profile');
        if (savedProfile) {
          setCollector(JSON.parse(savedProfile));
          setAuthMode('login');
        }
      } catch (err) { console.error(err); }
    };
    loadData();
  }, []);

  const handleResearch = async (ticket: LotteryTicket) => {
    setIsResearching(true);
    try {
      const infoString = `${ticket.country}, ${ticket.entity}, ${ticket.type}, Data: ${ticket.drawDate}, Valor: ${ticket.value}`;
      const results = await researchTicketDetails(infoString);
      setResearchData(results);
    } catch (error) {
      alert("Problema na pesquisa.");
    } finally {
      setIsResearching(false);
    }
  };

  const handleEditTicket = (ticket: LotteryTicket) => {
    setEditingTicket(ticket);
    setSelectedTicket(null);
    setView('add');
  };

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    tickets.forEach(t => {
      if (continentFilter === 'Todos' || t.continent === continentFilter) countries.add(t.country);
    });
    return Array.from(countries).sort();
  }, [tickets, continentFilter]);

  const handleSaveTicket = async (ticketData: Partial<LotteryTicket>) => {
    if (editingTicket) {
      const updated = { ...editingTicket, ...ticketData } as LotteryTicket;
      await saveTicketDB(updated);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditingTicket(null);
    } else {
      const newTicket: LotteryTicket = { ...ticketData as LotteryTicket, id: crypto.randomUUID(), createdAt: Date.now() };
      await saveTicketDB(newTicket);
      setTickets(prev => [...prev, newTicket]);
    }
    setView('gallery');
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.autoId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContinent = continentFilter === 'Todos' || t.continent === continentFilter;
      const matchesCountry = countryFilter === 'Todos' || t.country === countryFilter;
      const matchesFavoriteFilter = !showOnlyFavorites || t.isFavorite;
      return matchesSearch && matchesContinent && matchesCountry && matchesFavoriteFilter;
    }).sort((a, b) => (a.drawDate || '').localeCompare(b.drawDate || ''));
  }, [tickets, searchTerm, continentFilter, countryFilter, showOnlyFavorites]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><Archive size={32} /></div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">The World of Lottery</h1>
            <p className="text-slate-500 text-center text-sm mb-8">O seu arquivo particular, pronto para o PC.</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
              <input type="password" placeholder="Sua Senha" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
              <Button type="submit" className="w-full">Abrir Arquivo</Button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {selectedTicket && (
        <ImageZoomModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onDelete={async () => {
            if(confirm("Eliminar?")) {
              await deleteTicketDB(selectedTicket.id);
              setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
              setSelectedTicket(null);
            }
          }}
          onEdit={handleEditTicket}
          onResearch={handleResearch}
        />
      )}
      {(researchData || isResearching) && (
        <ResearchModal data={researchData} isLoading={isResearching} onClose={() => setResearchData(null)} />
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Archive size={20} /></div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-tight">The World of Lottery</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Arquivo Digital de {collector?.name || 'Jorge'}</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] text-emerald-600 font-bold uppercase">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border border-indigo-200"
              >
                <MonitorSmartphone size={14} />
                Instalar no PC
              </button>
            )}
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setView('gallery')} className={`p-2 rounded-md ${view === 'gallery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><Globe size={16} /></button>
              <button onClick={() => setView('stats')} className={`p-2 rounded-md ${view === 'stats' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}><BarChart3 size={16} /></button>
            </div>
            
            <Button variant="secondary" size="sm" onClick={() => {setEditingTicket(null); setView('add');}}><Plus size={14} className="mr-1.5" /> Novo</Button>
            <button onClick={() => setIsLoggedIn(false)} className="p-2 text-slate-400 hover:text-rose-500 ml-1"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8">
        {view === 'gallery' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Procurar no arquivo..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`p-2 rounded-xl transition-all ${showOnlyFavorites ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}><Heart size={16} fill={showOnlyFavorites ? "currentColor" : "none"} /></button>
              </div>
              <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-slate-50">
                <button onClick={() => setCountryFilter('Todos')} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${countryFilter === 'Todos' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Todos os Países</button>
                {availableCountries.map(c => <button key={c} onClick={() => setCountryFilter(c)} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${countryFilter === c ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{c}</button>)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredTickets.map(ticket => (
                <LotteryCard key={ticket.id} ticket={ticket} onClick={setSelectedTicket} onEdit={handleEditTicket} />
              ))}
              {filteredTickets.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-3">
                  <div className="inline-flex p-4 bg-slate-100 rounded-full text-slate-300"><Search size={32} /></div>
                  <p className="text-slate-400 text-sm font-medium">Jorge, não encontrei nada com esses filtros no arquivo.</p>
                </div>
              )}
            </div>
          </div>
        ) : view === 'stats' ? (
          <StatsDashboard tickets={tickets} />
        ) : (
          <LotteryForm onSave={handleSaveTicket} onCancel={() => {setView('gallery'); setEditingTicket(null);}} ticketCount={tickets.length} initialData={editingTicket} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Fixed: removed duplicate onClick and corrected function name */}
            <button 
              onClick={handleExportCollection}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
            >
              <Database size={14} className="text-amber-400" />
              Backup do Arquivo (PC)
            </button>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
               <ShieldCheck size={12} />
               <span className="text-[10px] font-bold uppercase">Base de Dados Encriptada</span>
            </div>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">The World of Lottery &copy; {new Date().getFullYear()} • Edição de Colecionador</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
