
import React, { useState, useEffect, useMemo } from 'react';
import { LotteryTicket, Continent } from './types';
import { LotteryCard } from './components/LotteryCard';
import { LotteryForm } from './components/LotteryForm';
import { StatsDashboard } from './components/StatsDashboard';
import { ImageZoomModal } from './components/ImageZoomModal';
import { ResearchModal } from './components/ResearchModal';
import { Button } from './components/Button';
import { Search, Plus, Archive, BarChart3, Globe, Lock, User, LogOut, ShieldCheck, Sparkles, AlertCircle, MapPin, Heart } from 'lucide-react';
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
  const [hoveredTicket, setHoveredTicket] = useState<LotteryTicket | null>(null);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Estado para Pesquisa Geni
  const [researchData, setResearchData] = useState<{ text: string; sources: any[] } | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  
  const [collector, setCollector] = useState<CollectorProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTickets = await getAllTicketsDB();
        setTickets(savedTickets);

        const savedProfile = localStorage.getItem('collector_profile');
        if (savedProfile) {
          setCollector(JSON.parse(savedProfile));
          setAuthMode('login');
        } else {
          setAuthMode('register');
        }
      } catch (err) {
        console.error("Falha ao carregar arquivo:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const handleResearch = async (ticket: LotteryTicket) => {
    setIsResearching(true);
    try {
      const infoString = `${ticket.country}, ${ticket.entity}, ${ticket.type}, Data: ${ticket.drawDate}, Valor: ${ticket.value}, Extração: ${ticket.extractionNo}, Notas: ${ticket.notes || ''}`;
      const results = await researchTicketDetails(infoString);
      setResearchData(results);
    } catch (error) {
      alert("Jorge, a Geni teve um pequeno problema na pesquisa. Tente novamente mais tarde.");
    } finally {
      setIsResearching(false);
    }
  };

  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    const groups: Record<string, string[]> = {};

    tickets.forEach(t => {
      const key = `${t.country}|${t.drawDate}|${t.value}|${t.extractionNo}`.toLowerCase().replace(/\s+/g, '');
      if (!groups[key]) groups[key] = [];
      groups[key].push(t.id);
    });

    Object.values(groups).forEach(group => {
      if (group.length > 1) {
        group.forEach(id => ids.add(id));
      }
    });

    return ids;
  }, [tickets]);

  const availableCountries = useMemo(() => {
    const countries = new Set<string>();
    tickets.forEach(t => {
      if (continentFilter === 'Todos' || t.continent === continentFilter) {
        countries.add(t.country);
      }
    });
    return Array.from(countries).sort();
  }, [tickets, continentFilter]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name || !authForm.password) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    const profile = { name: authForm.name, password: authForm.password };
    localStorage.setItem('collector_profile', JSON.stringify(profile));
    setCollector(profile);
    setIsLoggedIn(true);
    setAuthError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (collector && authForm.password === collector.password) {
      setIsLoggedIn(true);
      setAuthError('');
    } else {
      setAuthError('Senha de acesso incorreta.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthForm({ ...authForm, password: '' });
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.extractionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.autoId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesContinent = continentFilter === 'Todos' || t.continent === continentFilter;
      const matchesCountry = countryFilter === 'Todos' || t.country === countryFilter;
      const matchesDuplicateFilter = !showOnlyDuplicates || duplicateIds.has(t.id);
      const matchesFavoriteFilter = !showOnlyFavorites || t.isFavorite;
      
      return matchesSearch && matchesContinent && matchesCountry && matchesDuplicateFilter && matchesFavoriteFilter;
    }).sort((a, b) => {
      const dateA = a.drawDate || '0000-00-00';
      const dateB = b.drawDate || '0000-00-00';
      
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      
      return a.extractionNo.localeCompare(b.extractionNo, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  }, [tickets, searchTerm, continentFilter, countryFilter, showOnlyDuplicates, showOnlyFavorites, duplicateIds]);

  const handleSaveTicket = async (ticketData: Partial<LotteryTicket>) => {
    const newTicket: LotteryTicket = {
      ...ticketData as LotteryTicket,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    try {
      await saveTicketDB(newTicket);
      setTickets(prev => [...prev, newTicket]);
      setView('gallery');
    } catch (err) {
      alert("Erro ao guardar na base de dados.");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm(`Jorge, confirma que deseja apagar este bilhete?`)) {
      try {
        await deleteTicketDB(id);
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedTicket(null);
      } catch (err) {
        alert("Erro ao eliminar da base de dados.");
      }
    }
  };

  const continents = ['Todos', ...Object.values(Continent)];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                <Archive size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-center text-slate-900 mb-2">The World of Lottery</h1>
            <p className="text-slate-500 text-center text-sm mb-8">
              {authMode === 'register' ? 'Jorge, crie o seu perfil de colecionador' : 'Aceda ao seu arquivo particular'}
            </p>

            <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Colecionador</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Ex: Jorge"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>
              </div>

              {authError && (
                <p className="text-rose-500 text-xs font-medium text-center">{authError}</p>
              )}

              <Button type="submit" className="w-full" size="lg">
                {authMode === 'register' ? 'Criar Perfil' : 'Abrir Arquivo'}
              </Button>
            </form>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Geni Safe Storage Ativo</span>
          </div>
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
          onDelete={() => handleDeleteTicket(selectedTicket.id)}
          onResearch={handleResearch}
        />
      )}

      {(researchData || isResearching) && (
        <ResearchModal 
          data={researchData} 
          isLoading={isResearching} 
          onClose={() => setResearchData(null)} 
        />
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Archive size={20} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-tight">The World of Lottery</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase flex items-center gap-1">
                  <User size={10} className="text-indigo-500" />
                  Coleção de {collector?.name}
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={10} />
                  Geni Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
              <button 
                onClick={() => setView('gallery')}
                className={`p-2 rounded-md transition-all ${view === 'gallery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Vista Galeria"
              >
                <Globe size={16} />
              </button>
              <button 
                onClick={() => setView('stats')}
                className={`p-2 rounded-md transition-all ${view === 'stats' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Estatísticas"
              >
                <BarChart3 size={16} />
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setView('add')} className="h-9">
              <Plus size={14} className="mr-1.5" />
              Novo Registo
            </Button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8">
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
             <p className="text-slate-500 font-medium">A abrir o seu arquivo, Jorge...</p>
          </div>
        ) : view === 'gallery' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar no arquivo..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <div className="flex bg-slate-200/50 p-1 rounded-xl">
                      {continents.map(c => (
                        <button
                          key={c}
                          onClick={() => {
                            setContinentFilter(c);
                            setCountryFilter('Todos');
                            setShowOnlyDuplicates(false);
                            setShowOnlyFavorites(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                            continentFilter === c && !showOnlyDuplicates && !showOnlyFavorites ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                   </div>

                   <button
                     onClick={() => {
                       setShowOnlyFavorites(!showOnlyFavorites);
                       setContinentFilter('Todos');
                       setCountryFilter('Todos');
                       setShowOnlyDuplicates(false);
                     }}
                     className={`p-2 rounded-xl transition-all ${
                       showOnlyFavorites ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                     }`}
                     title="Favoritos"
                   >
                     <Heart size={16} fill={showOnlyFavorites ? "currentColor" : "none"} />
                   </button>
                   
                   {duplicateIds.size > 0 && (
                      <button
                        onClick={() => {
                          setShowOnlyDuplicates(!showOnlyDuplicates);
                          setContinentFilter('Todos');
                          setCountryFilter('Todos');
                          setShowOnlyFavorites(false);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          showOnlyDuplicates ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        <AlertCircle size={16} />
                      </button>
                   )}
                </div>
              </div>

              {availableCountries.length > 0 && (
                <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide border-t border-slate-50">
                  <MapPin size={12} className="text-indigo-400 flex-shrink-0" />
                  <button
                    onClick={() => setCountryFilter('Todos')}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                      countryFilter === 'Todos' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Todos de {continentFilter === 'Todos' ? 'Mundo' : continentFilter}
                  </button>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  {availableCountries.map(country => (
                    <button
                      key={country}
                      onClick={() => setCountryFilter(country)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                        countryFilter === country ? 'bg-amber-100 text-amber-700 shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredTickets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {filteredTickets.map(ticket => (
                  <LotteryCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={(t) => setSelectedTicket(t)}
                    onMouseEnter={() => setHoveredTicket(ticket)}
                    onMouseLeave={() => setHoveredTicket(null)}
                    isHighlighted={
                      hoveredTicket !== null && 
                      (ticket.country === hoveredTicket.country || ticket.type === hoveredTicket.type)
                    }
                    isDimmed={
                      hoveredTicket !== null && 
                      ticket.id !== hoveredTicket.id &&
                      ticket.country !== hoveredTicket.country && 
                      ticket.type !== hoveredTicket.type
                    }
                    isPotentialDuplicate={duplicateIds.has(ticket.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Archive className="h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">Nada encontrado</h3>
                <Button variant="outline" className="mt-6" size="sm" onClick={() => {setContinentFilter('Todos'); setCountryFilter('Todos'); setSearchTerm(''); setShowOnlyDuplicates(false); setShowOnlyFavorites(false);}}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        ) : view === 'stats' ? (
          <StatsDashboard tickets={tickets} />
        ) : (
          <LotteryForm onSave={handleSaveTicket} onCancel={() => setView('gallery')} ticketCount={tickets.length} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center mt-auto">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">The World of Lottery &copy; {new Date().getFullYear()} • Geni Intelligence</p>
      </footer>
    </div>
  );
};

export default App;
