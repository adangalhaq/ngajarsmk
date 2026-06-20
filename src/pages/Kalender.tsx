import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Map, Target, Plus, X, Save, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const EVENT_TYPES = [
  { id: 'pendidikan', label: 'Pendidikan', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: BookOpen },
  { id: 'ujian', label: 'Jadwal Ujian', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: Target },
  { id: 'libur', label: 'Libur Nasional', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Map },
  { id: 'kegiatan', label: 'Kegiatan Sekolah', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: GraduationCap },
];

export function Kalender() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', dateStr: '', type: 'kegiatan' });

  const fetchEvents = () => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    // JS dates are Sun=0, Mon=1... We want Mon=0, Sun=6
    return day === 0 ? 6 : day - 1;
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dateStr) return;
    
    // Parse YYYY-MM-DD from input and normalize into YYYY-M-D format used by renderer
    const parts = formData.dateStr.split('-');
    if (parts.length === 3) {
      const normalizedDateStr = `${parseInt(parts[0])}-${parseInt(parts[1])}-${parseInt(parts[2])}`;
      
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dateStr: normalizedDateStr })
      });
      fetchEvents();
      setIsModalOpen(false);
      setFormData({ title: '', dateStr: '', type: 'kegiatan' });
    }
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const renderDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
       const dateStr = `${currentYear}-${currentMonth + 1}-${i}`;
       // We can have multiple events per day
       const dayEvents = events.filter(e => e.dateStr === dateStr);
       const visibleEvents = activeFilter ? dayEvents.filter(e => e.type === activeFilter) : dayEvents;
       
       let evClass = "";
       if (visibleEvents.length > 0) {
          const typeDef = EVENT_TYPES.find(t => t.id === visibleEvents[0].type);
          if (typeDef) evClass = `border-2 ${typeDef.color} font-bold`;
       }

       days.push(
         <div key={i} className={cn("aspect-square p-1 sm:p-2 border border-slate-100 bg-white relative flex flex-col hover:bg-slate-50 transition-colors rounded hover:shadow-sm", visibleEvents.length === 0 ? "text-slate-600 font-medium" : evClass)}>
           <span className="text-[10px] sm:text-xs z-10 flex justify-between w-full">
             <span>{i}</span>
           </span>
           <div className="flex-1 mt-1 flex flex-col gap-0.5 overflow-visible">
             {visibleEvents.map((ev, idx) => {
                const isHidden = activeFilter && ev.type !== activeFilter;
                if (isHidden) return null;
                const typeDef = EVENT_TYPES.find(t => t.id === ev.type);
                return (
                  <div key={idx} className={cn("relative group text-[8px] sm:text-[9px] truncate leading-tight font-semibold px-1 py-0.5 rounded flex items-center justify-between cursor-default", typeDef?.color || "bg-slate-100 text-slate-700")}>
                    <span className="truncate relative z-10">{ev.title}</span>
                    <button onClick={() => deleteEvent(ev.id)} className="block md:hidden group-hover:block ml-1 opacity-50 hover:opacity-100 relative z-10">
                      <X size={8} />
                    </button>
                    {/* Tooltip for long text */}
                    <div className="absolute hidden group-hover:block bg-slate-800 text-white p-2 rounded-lg top-full left-1/2 -translate-x-1/2 mt-1 z-50 w-32 shadow-xl border border-slate-700 pointer-events-none whitespace-normal text-center">
                       <span className="block font-bold leading-tight mb-1">{ev.title}</span>
                       <span className="block text-[8px] text-slate-300 px-1.5 py-0.5 bg-slate-700 rounded-full inline-block">{typeDef?.label}</span>
                       <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-700"></div>
                    </div>
                  </div>
                );
             })}
           </div>
         </div>
       );
    }
    return days;
  };

  return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">Kalender Akademik</h2>
          <p className="text-xs text-slate-500 mt-1">{monthNames[currentMonth]} {currentYear}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-sm"
          >
            <Plus size={14} /> Tambah Kegiatan
          </button>
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200">
             <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-l-xl"><ChevronLeft size={18} /></button>
             <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-r-xl border-l border-slate-200"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button 
          onClick={() => setActiveFilter(null)}
          className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors", !activeFilter ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
        >
          Semua Kegiatan
        </button>
        {EVENT_TYPES.map(type => (
          <button 
            key={type.id}
            onClick={() => setActiveFilter(activeFilter === type.id ? null : type.id)}
            className={cn("whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 transition-colors", activeFilter === type.id ? type.color : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            <type.icon size={12} /> {type.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-2 p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
           <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div className="text-rose-400">Sab</div><div className="text-rose-400">Min</div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
           {Array.from({ length: offset }).map((_, idx) => (
             <div key={`offset-${idx}`} className="aspect-square bg-slate-50/50 rounded border border-slate-100/50"></div>
           ))}
           {renderDays()}
        </div>
      </div>

      {/* Agenda/List Events per Month */}
      {(() => {
        const currentMonthEvents = events.filter(e => {
          const parts = e.dateStr.split('-');
          if (parts.length === 3) {
            const eYear = parseInt(parts[0]);
            const eMonth = parseInt(parts[1]) - 1; // back to 0-based
            return eYear === currentYear && eMonth === currentMonth;
          }
          return false;
        }).sort((a, b) => {
          return parseInt(a.dateStr.split('-')[2]) - parseInt(b.dateStr.split('-')[2]);
        });

        if (currentMonthEvents.length === 0) return null;

        return (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" />
              Keterangan Libur Nasional & Kegiatan ({monthNames[currentMonth]} {currentYear})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentMonthEvents.map(ev => {
                 const day = ev.dateStr.split('-')[2];
                 const typeDef = EVENT_TYPES.find(t => t.id === ev.type);
                 return (
                   <div key={ev.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group">
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-105", typeDef?.color || "bg-slate-100 text-slate-600")}>
                       {day}
                     </div>
                     <div className="flex-1 pt-1">
                       <div className="text-xs font-bold text-slate-800 leading-tight">{ev.title}</div>
                       <div className="text-[10px] items-center flex gap-1 mt-1.5 text-slate-500 font-medium">
                         {typeDef?.icon && <typeDef.icon size={12} className="opacity-70" />}
                         {typeDef?.label}
                       </div>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        );
      })()}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-5 w-full max-w-sm border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Tambah Kegiatan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Kegiatan</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Libur Nasional"
                  className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300 transition-colors bg-slate-50" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tanggal</label>
                <input 
                  type="date" 
                  required 
                  value={formData.dateStr} 
                  onChange={e => setFormData({ ...formData, dateStr: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300 transition-colors bg-slate-50" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Jenis Kegiatan</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300 transition-colors bg-slate-50"
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
                  <Save size={14} /> Simpan Kegiatan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
