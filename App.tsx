
import React, { useState, useEffect, useMemo } from 'react';
import { LotteryTicket, Continent } from './types';
import { LotteryCard } from './components/LotteryCard';
import { LotteryForm } from './components/LotteryForm';
import { StatsDashboard } from './components/StatsDashboard';
import { ImageZoomModal } from './components/ImageZoomModal';
import { Button } from './components/Button';
import { Search, Plus, Archive, BarChart3, Globe, Filter, Lock, User, LogOut, ShieldCheck } from 'lucide-react';
import { getAllTicketsDB, saveTicketDB, deleteTicketDB } from './services/dbService';

interface CollectorProfile {
  name: string;
  password: string;
}

const App: React.FC = () => {
  // Collection State
  const [tickets, setTickets] = useState<LotteryTicket[]>([]);
  const [view, setView] = useState<'gallery' | 'stats' | 'add'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [continentFilter, setContinentFilter] = useState<string>('All');
  const [selectedTicket, setSelectedTicket] = useState<LotteryTicket | null>(null);
  
  // Auth State
  const [collector, setCollector] = useState<CollectorProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from DB on mount
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
        console.error("Failed to load archive:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name || !authForm.password) {
      setAuthError('Please fill in all fields');
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
      setAuthError('Invalid password');
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
      
      const matchesContinent = continentFilter === 'All' || t.continent === continentFilter;
      
      return matchesSearch && matchesContinent;
    }).sort((a, b) => {
      return a.extractionNo.localeCompare(b.extractionNo, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
      });
    });
  }, [tickets, searchTerm, continentFilter]);

  const handleSaveTicket = async (ticketData: Partial<LotteryTicket>) => {
    const newTicket: LotteryTicket = {
      ...ticketData as LotteryTicket,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    try {
      await saveTicketDB(newTicket);
      setTickets(prev => [newTicket, ...prev]);
      setView('gallery');
    } catch (err) {
      alert("Failed to save to database.");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm("Are you sure you want to delete this ticket from the archive?")) {
      try {
        await deleteTicketDB(id);
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedTicket(null);
      } catch (err) {
        alert("Failed to delete from database.");
      }
    }
  };

  const continents = ['All', ...Object.values(Continent)];

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
              {authMode === 'register' ? 'Register as a Collector' : 'Access your Private Archive'}
            </p>

            <form onSubmit={authMode === 'register' ? handleRegister : handleLogin} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Collector Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Your Name"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Access Password</label>
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
                {authMode === 'register' ? 'Register Collector' : 'Unlock Archive'}
              </Button>
              
              {collector && (
                <button 
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="w-full text-center text-xs text-indigo-600 font-bold hover:underline mt-4"
                >
                  {authMode === 'login' ? 'Create New Profile' : 'Back to Login'}
                </button>
              )}
            </form>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IndexedDB Storage Enabled (20k+ Capacity)</span>
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
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase flex items-center gap-1">
                <User size={10} className="text-indigo-500" />
                Archive of {collector?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
              <button 
                onClick={() => setView('gallery')}
                className={`p-2 rounded-md transition-all ${view === 'gallery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Gallery View"
              >
                <Globe size={16} />
              </button>
              <button 
                onClick={() => setView('stats')}
                className={`p-2 rounded-md transition-all ${view === 'stats' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Statistics"
              >
                <BarChart3 size={16} />
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setView('add')} className="h-9">
              <Plus size={14} className="mr-1.5" />
              Add Item
            </Button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8">
        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
             <p className="text-slate-500 font-medium">Accessing Archive Database...</p>
          </div>
        ) : view === 'gallery' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search archive..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <Filter size={14} className="text-slate-400 mr-1 flex-shrink-0" />
                {continents.map(c => (
                  <button
                    key={c}
                    onClick={() => setContinentFilter(c)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                      continentFilter === c ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filteredTickets.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {filteredTickets.map(ticket => (
                  <LotteryCard key={ticket.id} ticket={ticket} onClick={(t) => setSelectedTicket(t)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Archive className="h-12 w-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-600">No items found</h3>
                <p className="text-slate-400 mt-1 text-sm text-center">Your collection is empty or filters are too strict.</p>
                <Button variant="outline" className="mt-6" size="sm" onClick={() => setView('add')}>
                  Add your first ticket
                </Button>
              </div>
            )}
          </div>
        ) : view === 'stats' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Archive Insights ({tickets.length} items)</h2>
            <StatsDashboard tickets={tickets} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
            <LotteryForm onSave={handleSaveTicket} onCancel={() => setView('gallery')} ticketCount={tickets.length} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center mt-auto">
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">The World of Lottery &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
