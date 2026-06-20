import React, { useEffect, useState } from 'react';
import { Search, Shield, UserCheck, Calendar, X, Save, CheckCircle2, FileText, CheckSquare, Clock, Download } from 'lucide-react';
import { User, Journal } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Supervision() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'akademik' | 'jurnal'>('akademik');
  
  // -- SUPERVISI AKADEMIK STATE --
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchQuerySup, setSearchQuerySup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  
  // Supervisi Form State
  const [dateSup, setDateSup] = useState('');
  const [supervisor, setSupervisor] = useState(user?.name || '');
  const [instrumen, setInstrumen] = useState('');
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState('');
  const [rekomendasi, setRekomendasi] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [supervisions, setSupervisions] = useState<Record<string, any>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // -- VALIDASI JURNAL STATE --
  const [journals, setJournals] = useState<Journal[]>([]);
  const [searchQueryJur, setSearchQueryJur] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [valNotes, setValNotes] = useState('');

  useEffect(() => {
    fetch('/api/teachers').then(res => res.json()).then(data => setTeachers(data));
      
    fetch('/api/supervisions').then(res => res.json()).then(data => {
      const supMap: Record<string, any> = {};
      data.forEach((s: any) => { supMap[s.teacherId] = s; });
      setSupervisions(supMap);
    });

    fetchJournals();
  }, []);

  const fetchJournals = () => {
    fetch('/api/journals').then(res => res.json()).then(data => {
      setJournals(data); // show all or only non-diverifikasi
    });
  };

  // -- SUPERVISI AKADEMIK HANDLERS --
  const handleOpenSupervision = (teacher: User) => {
    setSelectedTeacher(teacher);
    const existing = supervisions[teacher.id];
    if (existing) {
      setScore(existing.score || '');
      setNotes(existing.notes || '');
      setDateSup(existing.date || '');
      setSupervisor(existing.supervisor || user?.name || '');
      setInstrumen(existing.instrumen || '');
      setRekomendasi(existing.rekomendasi || '');
    } else {
      setScore('');
      setNotes('');
      setDateSup(new Date().toISOString().split('T')[0]);
      setSupervisor(user?.name || '');
      setInstrumen('');
      setRekomendasi('');
    }
  };

  const handleSaveSupervision = () => {
    if (!selectedTeacher) return;
    setIsSaving(true);
    
    fetch('/api/supervisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        score, notes, date: dateSup, supervisor, instrumen, rekomendasi
      })
    })
    .then(res => res.json())
    .then(savedSup => {
      setIsSaving(false);
      setSupervisions(prev => ({ ...prev, [selectedTeacher.id]: savedSup }));
      setSelectedTeacher(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    });
  };

  const cetakSupervisi = (teacher: User) => {
    const data = supervisions[teacher.id];
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('HASIL SUPERVISI AKADEMIK', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 30,
      head: [['Keterangan', 'Detail']],
      body: [
        ['Nama Guru', teacher.name],
        ['Tanggal Supervisi', data.date],
        ['Supervisor', data.supervisor || '-'],
        ['Instrumen Penilaian', data.instrumen || '-'],
        ['Nilai Supervisi', data.score],
        ['Catatan Supervisi', data.notes || '-'],
        ['Rekomendasi', data.rekomendasi || '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`Supervisi_${teacher.name.replace(/\s+/g, '_')}.pdf`);
  };

  // -- VALIDASI JURNAL HANDLERS --
  const handleValidate = async (id: string, status: string) => {
      try {
        const res = await fetch(`/api/journals/${id}/validate`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, validatorNotes: valNotes })
        });
        if (res.ok) {
          fetchJournals();
          setSelectedJournal(null);
          setValNotes('');
        }
      } catch (error) {
        console.error('Failed to validate journal', error);
      }
  };


  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchQuerySup.toLowerCase()));
  const filteredJournals = journals.filter(j => 
    (j.subject.toLowerCase().includes(searchQueryJur.toLowerCase()) || 
    j.class.toLowerCase().includes(searchQueryJur.toLowerCase()) ||
    j.teacherName.toLowerCase().includes(searchQueryJur.toLowerCase()))
    && j.status !== 'Draft' // don't show draft to Waka
  );

  return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24 relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 z-50 animate-in slide-in-from-top-4 fade-in">
          <CheckCircle2 size={16} />
          Supervisi berhasil disimpan
        </div>
      )}

      {/* Header Area */}
      <div className="sticky top-0 bg-slate-50 z-10 pt-2 pb-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Supervisi & Validasi</h2>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring pelaksanaan pembelajaran.
            </p>
          </div>
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full shadow-sm">
            <Shield size={20} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-4">
            <button
              onClick={() => setActiveTab('akademik')}
              className={cn("flex-1 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2", activeTab === 'akademik' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
            >
              <UserCheck size={16} /> Supervisi Akademik
            </button>
            <button
              onClick={() => setActiveTab('jurnal')}
              className={cn("flex-1 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2", activeTab === 'jurnal' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50")}
            >
              <CheckSquare size={16} /> Validasi Jurnal
            </button>
        </div>

        {activeTab === 'akademik' ? (
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Cari guru untuk supervisi..." 
                value={searchQuerySup}
                onChange={(e) => setSearchQuerySup(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
            />
            </div>
        ) : (
            <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Cari mapel, kelas, atau guru..." 
                value={searchQueryJur}
                onChange={(e) => setSearchQueryJur(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            />
            </div>
        )}
      </div>

      {activeTab === 'akademik' && (
        <div className="space-y-3">
            {filteredTeachers.map(teacher => {
            const supData = supervisions[teacher.id];
            return (
                <div key={teacher.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg shrink-0">
                        {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{teacher.name}</h3>
                        {supData ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Skor: {supData.score}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                            {supData.date}
                            </span>
                        </div>
                        ) : (
                        <p className="text-[10px] text-slate-400 font-medium mt-1">Belum disupervisi</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleOpenSupervision(teacher)}
                        className={cn(
                        "flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                        supData ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-600" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        )}
                    >
                        <UserCheck size={14} /> {supData ? 'Edit Supervisi' : 'Isi Supervisi'}
                    </button>
                    {supData && (
                    <button 
                        onClick={() => cetakSupervisi(teacher)}
                        className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                    >
                        <Download size={14} /> Cetak PDF
                    </button>
                    )}
                </div>
                </div>
            );
            })}
    
            {filteredTeachers.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm flex flex-col items-center">
                <Calendar size={40} className="text-slate-300 mb-3" />
                Tidak ada data guru.
            </div>
            )}
        </div>
      )}

      {activeTab === 'jurnal' && (
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
                    <p className="text-[10px] text-slate-500 font-medium truncate mb-2">{journal.class} &bull; {journal.teacherName}</p>
                    
                    <button onClick={() => { setSelectedJournal(journal); setValNotes(journal.validatorNotes || ''); }} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-100">
                        <FileText size={12} /> Proses Validasi
                    </button>
                    </div>
                </div>
            ))}
            {filteredJournals.length === 0 && (
                <div className="text-center py-10">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-3" />
                    <p className="text-sm text-emerald-600 font-medium">Bagus! Tidak ada jurnal tertunda.</p>
                </div>
            )}
        </div>
      )}

      {/* Supervision Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-0">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedTeacher(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-bold text-lg text-slate-800 mb-1">Form Supervisi Akademik</h3>
            <p className="text-sm text-slate-500 mb-6">Guru: <span className="font-semibold text-slate-700">{selectedTeacher.name}</span></p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Tanggal Supervisi</label>
                    <input type="date" value={dateSup} onChange={e => setDateSup(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none" />
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Nilai / Skor</label>
                    <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} placeholder="0 - 100" className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none" />
                 </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Supervisor</label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Instrumen Penilaian</label>
                <input type="text" value={instrumen} onChange={e => setInstrumen(e.target.value)} placeholder="Misal: Instrumen Pengamatan KBM..." className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Catatan Supervisi</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tuliskan catatan observasi pembelajaran..." className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none resize-none" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Rekomendasi</label>
                <textarea rows={2} value={rekomendasi} onChange={e => setRekomendasi(e.target.value)} placeholder="Saran perbaikan..." className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-indigo-400 outline-none resize-none" />
              </div>

              <button 
                onClick={handleSaveSupervision}
                disabled={isSaving || !score || !notes}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-md"
              >
                {isSaving ? 'Menyimpan...' : (
                  <><Save size={18} /> Simpan Hasil Supervisi</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Validation Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
                <button onClick={() => setSelectedJournal(null)} className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 text-slate-400">
                    <X size={20} />
                </button>

                <h3 className="font-bold text-slate-800 text-lg pr-8">Validasi Jurnal</h3>
                <p className="text-xs text-slate-500 font-medium mb-5">Oleh: Waka Kurikulum</p>
                
                <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm border border-slate-100">
                    <div className="grid grid-cols-2 gap-y-2">
                        <div><span className="text-slate-500 text-[10px] block">Guru</span><span className="font-semibold">{selectedJournal.teacherName}</span></div>
                        <div><span className="text-slate-500 text-[10px] block">Tanggal</span><span className="font-semibold">{selectedJournal.date}</span></div>
                        <div><span className="text-slate-500 text-[10px] block">Mata Pelajaran</span><span className="font-semibold">{selectedJournal.subject}</span></div>
                        <div><span className="text-slate-500 text-[10px] block">Kelas</span><span className="font-semibold">{selectedJournal.class}</span></div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-500 text-[10px] block">Materi Pembelajaran</span>
                        <p className="font-medium text-slate-700 leading-tight">{selectedJournal.materi}</p>
                    </div>
                </div>

                {/* Histori Revisi */}
                {selectedJournal.validationHistory && selectedJournal.validationHistory.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-[11px] font-bold text-slate-600 mb-2">Histori Validasi</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {selectedJournal.validationHistory.map((hist, i) => (
                                <div key={i} className="text-[10px] bg-slate-50 border border-slate-100 rounded-lg p-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <JournalBadge status={hist.status} />
                                        <span className="text-slate-400">{new Date(hist.date).toLocaleString('id-ID')}</span>
                                    </div>
                                    {hist.notes && <p className="text-slate-600 italic">"{hist.notes}"</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-5">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Catatan Validator</label>
                    <textarea 
                        rows={3} 
                        value={valNotes} 
                        onChange={e => setValNotes(e.target.value)} 
                        placeholder="Berikan catatan atau alasan jika direvisi..." 
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none shadow-sm" 
                    />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleValidate(selectedJournal.id, 'Ditolak')} className="py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">Ditolak</button>
                    <button onClick={() => handleValidate(selectedJournal.id, 'Revisi')} className="py-2.5 rounded-xl text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">Revisi</button>
                    <button onClick={() => handleValidate(selectedJournal.id, 'Disetujui')} className="py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md">Setujui</button>
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
    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center w-max gap-1", bg)}>
      {status === 'Disetujui' || status === 'Diverifikasi' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {status}
    </span>
  )
}
