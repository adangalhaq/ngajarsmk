import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Journal } from '../types';
import { Plus, Search, Calendar, FileText, CheckCircle2, Clock, X, FileSpreadsheet, Download, Send, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { exportToExcel, exportToPdf } from '../utils/exportUtils';

export function Journals() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

  const isGuru = user?.role === 'GURU';

  const fetchJournals = () => {
    fetch('/api/journals')
      .then(res => res.json())
      .then(data => {
        if (isGuru) {
          setJournals(data.filter((j: Journal) => j.teacherId === user.id));
        } else {
          setJournals(data);
        }
      });
  };

  useEffect(() => {
    fetchJournals();
  }, [isGuru, user?.id]);

  const handleSubmitDraft = async (id: string) => {
    if (window.confirm('Kirim jurnal ini sekarang? Status draft akan berubah menjadi Submit.')) {
      try {
        const res = await fetch(`/api/journals/${id}/submit`, { method: 'PUT' });
        if (res.ok) {
          fetchJournals();
        }
      } catch (error) {
        console.error('Failed to submit draft', error);
      }
    }
  };

  const filteredJournals = journals.filter(j => {
    // Only show user's own journals if they are a regular teacher
    if (isGuru && j.teacherId !== user?.id) return false;
    
    return j.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
           j.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
           j.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24">
      
      {/* Header Area */}
      <div className="sticky top-0 bg-slate-50 z-10 pt-2 pb-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{isGuru ? 'Jurnal Mengajar' : 'Jurnal Masuk'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isGuru ? 'Riwayat kegiatan belajar mengajar.' : 'Daftar jurnal dari para guru.'}
            </p>
          </div>
          
          {isGuru && (
            <Link to="/journals/new" className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
              <Plus size={20} />
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari mapel, kelas, atau guru..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Journal List */}
      <div className="space-y-3">
        {filteredJournals.map((journal) => (
          <div key={journal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
            <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 bg-slate-50 rounded-xl border border-slate-100">
              <Calendar size={16} className="text-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-600 leading-none">
                {journal.date.split('-')[2]}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm text-slate-800 truncate">{journal.subject}</h3>
                <JournalBadge status={journal.status} />
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mb-2">{journal.class} &bull; {isGuru ? journal.materi : journal.teacherName}</p>
              
              <div className="flex gap-2">
                 <button onClick={() => setSelectedJournal(journal)} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors">
                   <FileText size={12} /> Detail Laporan
                 </button>
              </div>
            </div>
          </div>
        ))}

        {filteredJournals.length === 0 && (
          <div className="text-center py-10">
            <FileText size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-500 font-medium">Belum ada jurnal ditemukan.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
            >
                <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-lg">Detail Jurnal</h3>
                    <button onClick={() => setSelectedJournal(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                   {selectedJournal.validatorNotes && (
                       <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4 flex gap-3 text-amber-700 text-xs">
                           <AlertCircle size={16} className="shrink-0" />
                           <div>
                               <p className="font-bold mb-1">Catatan Validator:</p>
                               <p>{selectedJournal.validatorNotes}</p>
                           </div>
                       </div>
                   )}

                   <div>
                     <p className="text-xs text-slate-500 font-medium">Guru</p>
                     <p className="text-sm font-semibold text-slate-800">{selectedJournal.teacherName}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-xs text-slate-500 font-medium">Tanggal</p>
                       <p className="text-sm font-semibold text-slate-800">{selectedJournal.date}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 font-medium">Status</p>
                       <div className="mt-0.5"><JournalBadge status={selectedJournal.status} /></div>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-xs text-slate-500 font-medium">Mata Pelajaran</p>
                       <p className="text-sm font-semibold text-slate-800">{selectedJournal.subject}</p>
                     </div>
                     <div>
                       <p className="text-xs text-slate-500 font-medium">Kelas</p>
                       <p className="text-sm font-semibold text-slate-800">{selectedJournal.class} {selectedJournal.jamPelajaran && <span className="font-normal text-slate-500">({selectedJournal.jamPelajaran})</span>}</p>
                     </div>
                   </div>
                   
                   <div>
                     <p className="text-xs text-slate-500 font-medium">Materi Pembelajaran</p>
                     <div className="mt-1 p-3 bg-slate-50 rounded-xl text-sm text-slate-700 border border-slate-100">
                       <p className="font-semibold text-slate-800 mb-1">{selectedJournal.materi}</p>
                       {selectedJournal.tujuanPembelajaran && <p className="text-xs text-slate-600 mb-1"><span className="font-medium">Tujuan:</span> {selectedJournal.tujuanPembelajaran}</p>}
                       {selectedJournal.capaianPembelajaran && <p className="text-xs text-slate-600 mb-1"><span className="font-medium">CP:</span> {selectedJournal.capaianPembelajaran}</p>}
                       {(selectedJournal.metodePembelajaran || selectedJournal.mediaPembelajaran) && (
                         <div className="text-xs text-slate-600 mt-2 p-2 bg-white rounded border border-slate-200">
                           <p><span className="font-medium">Metode:</span> {selectedJournal.metodePembelajaran || '-'}</p>
                           <p><span className="font-medium">Media:</span> {selectedJournal.mediaPembelajaran || '-'}</p>
                         </div>
                       )}
                     </div>
                   </div>

                   {selectedJournal.absensiSiswa && selectedJournal.absensiSiswa.length > 0 && (
                   <div>
                     <p className="text-xs text-slate-500 font-medium">Rekap Absensi</p>
                     <div className="mt-1 flex gap-2 w-full text-xs text-center border-y border-slate-100 py-2">
                        <div className="flex-1 text-slate-700"><span className="block font-bold text-slate-800">{selectedJournal.absensiSiswa.filter(s => s.status === 'Hadir').length}</span>Hadir</div>
                        <div className="flex-1 text-slate-700"><span className="block font-bold text-amber-600">{selectedJournal.absensiSiswa.filter(s => s.status === 'Sakit').length}</span>Sakit</div>
                        <div className="flex-1 text-slate-700"><span className="block font-bold text-blue-600">{selectedJournal.absensiSiswa.filter(s => s.status === 'Izin').length}</span>Izin</div>
                        <div className="flex-1 text-slate-700"><span className="block font-bold text-rose-600">{selectedJournal.absensiSiswa.filter(s => s.status === 'Alpa').length}</span>Alpa</div>
                        <div className="flex-1 text-slate-700"><span className="block font-bold text-orange-600">{selectedJournal.absensiSiswa.filter(s => s.status === 'Terlambat').length}</span>Telat</div>
                     </div>
                     <div className="mt-2 space-y-1">
                       {selectedJournal.absensiSiswa.filter(s => s.status !== 'Hadir').map(s => (
                         <div key={s.studentId} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs border border-slate-100">
                           <span className="font-semibold text-slate-700">{s.studentName}</span>
                           <span className={`font-bold ${
                             s.status === 'Sakit' ? 'text-amber-600' :
                             s.status === 'Izin' ? 'text-blue-600' :
                             s.status === 'Alpa' ? 'text-rose-600' : 'text-orange-600'
                           }`}>{s.status}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                   )}

                   <div>
                     <p className="text-xs text-slate-500 font-medium">Evaluasi</p>
                     <div className="mt-1 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100 space-y-2">
                       {selectedJournal.refleksi && <p><span className="font-medium block text-slate-800">Refleksi:</span> {selectedJournal.refleksi}</p>}
                       {selectedJournal.kendala && <p><span className="font-medium block text-slate-800">Kendala:</span> {selectedJournal.kendala}</p>}
                       {selectedJournal.tindakLanjut && <p><span className="font-medium block text-slate-800">Tindak Lanjut:</span> {selectedJournal.tindakLanjut}</p>}
                     </div>
                   </div>
                   
                   <div className="pt-4 space-y-3">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Export Laporan</p>
                     <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => exportToPdf(selectedJournal)}
                         className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                       >
                         <FileText size={16} /> PDF Laporan
                       </button>
                       <button 
                         onClick={() => exportToExcel(selectedJournal)}
                         className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 py-2.5 rounded-xl text-xs font-bold transition-colors"
                       >
                         <FileSpreadsheet size={16} /> Excel Export
                       </button>
                     </div>
                   </div>

                   {isGuru && selectedJournal.status === 'Draft' && (
                     <button onClick={() => {
                        handleSubmitDraft(selectedJournal.id);
                        setSelectedJournal(null);
                     }} className="w-full mt-2 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                       <Send size={18} /> Kirim Jurnal Ini
                     </button>
                   )}
                </div>
            </motion.div>
        </div>
      )}

    </div>
  );
}

function JournalBadge({ status }: { status: string }) {
  let bg = "bg-slate-100 text-slate-500";
  if (status === 'Disetujui' || status === 'Diverifikasi') bg = "bg-emerald-100 text-emerald-700";
  if (status === 'Revisi' || status === 'Submit') bg = "bg-amber-100 text-amber-700";
  if (status === 'Ditolak') bg = "bg-rose-100 text-rose-700";
  
  return (
    <span className={cn("text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center w-max gap-1", bg)}>
      {status === 'Disetujui' || status === 'Diverifikasi' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {status}
    </span>
  )
}
