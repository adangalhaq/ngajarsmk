import React, { useEffect, useState } from 'react';
import { LineChart, BarChart2, TrendingUp } from 'lucide-react';
import { Journal } from '../types';

export function Statistics() {
  const [journals, setJournals] = useState<Journal[]>([]);

  useEffect(() => {
    fetch('/api/journals')
      .then(res => res.json())
      .then(data => setJournals(data))
      .catch(console.error);
  }, []);

  const totalSesi = journals.length;
  const verifiedSesi = journals.filter(j => j.status === 'Diverifikasi').length;
  const pendingSesi = journals.filter(j => j.status !== 'Diverifikasi').length;

  return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 -mx-4 -mt-4 px-4 pt-6 pb-12 rounded-b-[2rem] shadow-md mb-4 text-white relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Statistik Pembelajaran</h2>
            <p className="text-xs text-blue-100 mt-1 opacity-90">Overview keterlaksanaan sekolah</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <LineChart size={24} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 -mt-10 relative z-10">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-blue-600">
            <BarChart2 size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Total Sesi</p>
            <p className="text-2xl font-bold tracking-tight text-slate-800">{totalSesi}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-2">
          <div className="bg-emerald-50 w-8 h-8 rounded-full flex items-center justify-center text-emerald-600">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium font-sans">Diverifikasi</p>
            <p className="text-2xl font-bold tracking-tight text-slate-800">{verifiedSesi}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Status Jurnal Terakhir</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-600">Diverifikasi</span>
              <span className="text-xs font-bold text-emerald-600">{verifiedSesi}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full" 
                style={{ width: `${totalSesi ? (verifiedSesi / totalSesi) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-600">Menunggu Validasi</span>
              <span className="text-xs font-bold text-amber-600">{pendingSesi}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full" 
                style={{ width: `${totalSesi ? (pendingSesi / totalSesi) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
