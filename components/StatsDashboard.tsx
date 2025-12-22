
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { LotteryTicket } from '../types';

interface StatsDashboardProps {
  tickets: LotteryTicket[];
}

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ tickets }) => {
  const continentData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.continent] = (counts[t.continent] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const stateData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.state] = (counts[t.state] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.country] = (counts[t.country] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500">Ainda não há dados disponíveis para estatísticas, Jorge. Comece a adicionar a sua coleção!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição por Continente</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={continentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {continentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip labelStyle={{ color: '#1e293b' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Países Principais na Coleção</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Itens" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Estado de Conservação</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stateData.map((item, idx) => (
            <div key={item.name} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center">
              <span className="text-2xl font-bold text-indigo-600">{item.value}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1 text-center">{item.name}</span>
            </div>
          ))}
          <div className="p-4 rounded-lg bg-indigo-600 border border-indigo-700 flex flex-col items-center text-white">
            <span className="text-2xl font-bold">{tickets.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter mt-1 opacity-80">Total de Itens</span>
          </div>
        </div>
      </div>
    </div>
  );
};
