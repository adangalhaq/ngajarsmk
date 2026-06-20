import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { motion } from 'motion/react';

export function JournalForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    class: '',
    jamPelajaran: '',
    materi: '',
    tujuanPembelajaran: '',
    capaianPembelajaran: '',
    metodePembelajaran: '',
    mediaPembelajaran: '',
    absensiSiswa: [] as { studentId: string, studentName: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat' }[],
    penilaianSiswa: [] as {
      studentId: string;
      studentName: string;
      sumatif: string[];
      sasNonTes: string;
      sasTes: string;
      capaianKompetensi: string;
    }[],
    buktiPembelajaran: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    const classStudents = students.filter(s => s.class === selectedClass);
    setFormData({
      ...formData,
      class: selectedClass,
      absensiSiswa: classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: 'Hadir'
      })),
      penilaianSiswa: classStudents.map(s => ({
        studentId: s.id,
        studentName: s.name,
        sumatif: Array(10).fill(''),
        sasNonTes: '',
        sasTes: '',
        capaianKompetensi: ''
      }))
    });
  };

  const handleAttendanceChange = (studentId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat') => {
    setFormData(prev => ({
      ...prev,
      absensiSiswa: prev.absensiSiswa.map(s => s.studentId === studentId ? { ...s, status } : s)
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Submit') => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    await fetch('/api/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        teacherId: user?.id,
        teacherName: user?.name,
        status
      })
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/journals');
    }, 600);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-slate-800 text-sm">Tulis Jurnal Baru</h1>
        </div>
      </div>

      <div className="p-4">
        <form className="space-y-5 pb-24">
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Dasar</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tanggal</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kelas</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.class}
                  onChange={handleClassChange}
                >
                  <option value="">Pilih</option>
                  <option value="X TKJ 1">X TKJ 1</option>
                  <option value="XI TKR 2">XI TKR 2</option>
                  <option value="XII AKL 1">XII AKL 1</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mata Pelajaran</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                <option value="">Pilih Mata Pelajaran</option>
                <option value="Matematika">Matematika</option>
                <option value="Fisika">Fisika</option>
                <option value="Pemrograman Dasar">Pemrograman Dasar</option>
              </select>
            </div>
            
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jam Pelajaran</label>
              <input 
                type="text"
                placeholder="Contoh: Ke 1 - 2"
                value={formData.jamPelajaran}
                onChange={e => setFormData({...formData, jamPelajaran: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Materi Pembelajaran</h2>
             
             <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Materi Induk</label>
              <input 
                type="text"
                placeholder="Contoh: Logika Algoritma"
                value={formData.materi}
                onChange={e => setFormData({...formData, materi: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

             <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tujuan Pembelajaran</label>
              <textarea 
                rows={2}
                placeholder="Deskripsikan tujuan pembelajaran..."
                value={formData.tujuanPembelajaran}
                onChange={e => setFormData({...formData, tujuanPembelajaran: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              />
            </div>

             <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Capaian Pembelajaran (CP)</label>
              <textarea 
                rows={3}
                placeholder="Deskripsikan CP..."
                value={formData.capaianPembelajaran}
                onChange={e => setFormData({...formData, capaianPembelajaran: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              />
            </div>

             <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Metode Pembelajaran</label>
              <input 
                type="text"
                placeholder="Contoh: Ceramah, Diskusi, Praktek"
                value={formData.metodePembelajaran}
                onChange={e => setFormData({...formData, metodePembelajaran: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Media Pembelajaran</label>
              <input 
                type="text"
                placeholder="Contoh: Proyektor, Modul, Laptop"
                value={formData.mediaPembelajaran}
                onChange={e => setFormData({...formData, mediaPembelajaran: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Absensi Siswa</h2>
             
             {!formData.class ? (
               <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-xs">
                 Pilih kelas terlebih dahulu untuk melihat daftar siswa.
               </div>
             ) : formData.absensiSiswa.length === 0 ? (
               <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-xs">
                 Belum ada data siswa untuk kelas ini.
               </div>
             ) : (
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                 {formData.absensiSiswa.map((student, idx) => (
                   <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                     <p className="text-xs font-semibold text-slate-800">{idx + 1}. {student.studentName}</p>
                     
                     <div className="flex gap-3">
                       {(['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'] as const).map(status => (
                         <label key={status} className="flex items-center gap-1.5 cursor-pointer group">
                           <div className="relative flex items-center justify-center w-4 h-4">
                             <input
                               type="radio"
                               name={`status-${student.studentId}`}
                               checked={student.status === status}
                               onChange={() => handleAttendanceChange(student.studentId, status)}
                               className="peer appearance-none w-4 h-4 border border-slate-300 rounded checked:border-blue-500 checked:bg-blue-500 transition-colors"
                             />
                             <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                               <polyline points="20 6 9 17 4 12"></polyline>
                             </svg>
                           </div>
                           <span className={`text-[10px] font-medium transition-colors ${
                             student.status === status ? 'text-slate-800 font-bold' : 'text-slate-500 group-hover:text-slate-700'
                           }`}>
                             {status}
                           </span>
                         </label>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4 overflow-x-auto">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tugas & Penilaian</h2>
             {!formData.class ? (
               <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-xs">
                 Pilih kelas terlebih dahulu.
               </div>
             ) : formData.penilaianSiswa.length === 0 ? (
               <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500 text-xs">
                 Belum ada data siswa untuk kelas ini.
               </div>
             ) : (
               <div className="min-w-[1200px]">
                 <table className="w-full text-xs text-left">
                   <thead>
                     <tr className="border-b border-slate-200 bg-slate-50">
                       <th className="p-2 font-semibold text-slate-600 whitespace-nowrap sticky left-0 bg-slate-50 z-10 w-48 border-r border-slate-200">Nama Siswa</th>
                       <th colSpan={11} className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center">Sumatif Lingkup Materi</th>
                       <th colSpan={3} className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center">Sumatif Akhir Semester</th>
                       <th className="p-2 font-semibold text-slate-600 border-r border-slate-200 text-center w-24">Nilai Rapor</th>
                       <th className="p-2 font-semibold text-slate-600">Capaian Kompetensi</th>
                     </tr>
                     <tr className="border-b border-slate-200 bg-slate-50">
                       <th className="p-2 sticky left-0 bg-slate-50 z-10 border-r border-slate-200"></th>
                       {[...Array(10)].map((_, i) => (
                         <th key={i} className="p-2 font-medium text-slate-500 text-center border-r border-slate-200 w-12">{i + 1}</th>
                       ))}
                       <th className="p-2 font-medium text-slate-500 text-center border-r border-slate-200 w-16">Jml NA</th>
                       <th className="p-2 font-medium text-slate-500 text-center border-r border-slate-200 w-16">Non Tes</th>
                       <th className="p-2 font-medium text-slate-500 text-center border-r border-slate-200 w-16">Tes</th>
                       <th className="p-2 font-medium text-slate-500 text-center border-r border-slate-200 w-16">NA</th>
                       <th className="p-2 border-r border-slate-200"></th>
                       <th></th>
                     </tr>
                   </thead>
                   <tbody>
                     {formData.penilaianSiswa.map((student, idx) => {
                       const sumSumatifMateri = student.sumatif.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
                       const countSumatifMateri = student.sumatif.filter(val => val !== '').length;
                       const RataSumatifMateri = countSumatifMateri > 0 ? (sumSumatifMateri / countSumatifMateri) : 0;
                       
                       const sasNonTesVal = parseFloat(student.sasNonTes) || 0;
                       const sasTesVal = parseFloat(student.sasTes) || 0;
                       const hasSas = student.sasNonTes !== '' || student.sasTes !== '';
                       const valSasNonTes = student.sasNonTes !== '' ? sasNonTesVal : 0;
                       const valSasTes = student.sasTes !== '' ? sasTesVal : 0;
                       
                       // Asumsi NA SAS adalah rata-rata dari tes & nontes bila keduanya ada, atau salah satu
                       let NASas = 0;
                       if (student.sasNonTes !== '' && student.sasTes !== '') {
                         NASas = (valSasNonTes + valSasTes) / 2;
                       } else if (student.sasNonTes !== '') {
                         NASas = valSasNonTes;
                       } else if (student.sasTes !== '') {
                         NASas = valSasTes;
                       }
                       
                       let nilaiRapor = 0;
                       if (countSumatifMateri > 0 && hasSas) {
                         nilaiRapor = (RataSumatifMateri + NASas) / 2;
                       } else if (countSumatifMateri > 0) {
                         nilaiRapor = RataSumatifMateri;
                       } else if (hasSas) {
                         nilaiRapor = NASas;
                       }
                       
                       return (
                         <tr key={student.studentId} className="border-b border-slate-100 hover:bg-slate-50/50">
                           <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 truncate">
                             <div className="truncate w-44" title={student.studentName}>{student.studentName}</div>
                           </td>
                           {student.sumatif.map((val, sIdx) => (
                             <td key={sIdx} className="p-1 border-r border-slate-100">
                               <input
                                 type="number"
                                 min="0"
                                 max="100"
                                 value={val}
                                 onChange={e => {
                                   const newVal = e.target.value;
                                   setFormData(prev => {
                                     const newPenilaian = [...prev.penilaianSiswa];
                                     newPenilaian[idx].sumatif[sIdx] = newVal;
                                     return { ...prev, penilaianSiswa: newPenilaian };
                                   });
                                 }}
                                 className="w-full bg-transparent text-center focus:ring-1 focus:ring-blue-500 rounded outline-none p-1"
                               />
                             </td>
                           ))}
                           <td className="p-2 text-center border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">
                              {RataSumatifMateri > 0 ? RataSumatifMateri.toFixed(1) : '-'}
                           </td>
                           <td className="p-1 border-r border-slate-100">
                              <input
                                 type="number"
                                 min="0"
                                 max="100"
                                 value={student.sasNonTes}
                                 onChange={e => {
                                   const newVal = e.target.value;
                                   setFormData(prev => {
                                     const newPenilaian = [...prev.penilaianSiswa];
                                     newPenilaian[idx].sasNonTes = newVal;
                                     return { ...prev, penilaianSiswa: newPenilaian };
                                   });
                                 }}
                                 className="w-full bg-transparent text-center focus:ring-1 focus:ring-blue-500 rounded outline-none p-1"
                               />
                           </td>
                           <td className="p-1 border-r border-slate-100">
                              <input
                                 type="number"
                                 min="0"
                                 max="100"
                                 value={student.sasTes}
                                 onChange={e => {
                                   const newVal = e.target.value;
                                   setFormData(prev => {
                                     const newPenilaian = [...prev.penilaianSiswa];
                                     newPenilaian[idx].sasTes = newVal;
                                     return { ...prev, penilaianSiswa: newPenilaian };
                                   });
                                 }}
                                 className="w-full bg-transparent text-center focus:ring-1 focus:ring-blue-500 rounded outline-none p-1"
                               />
                           </td>
                           <td className="p-2 text-center border-r border-slate-200 font-semibold text-slate-700 bg-slate-50/50">
                              {hasSas ? NASas.toFixed(1) : '-'}
                           </td>
                           <td className="p-2 text-center border-r border-slate-200 font-bold text-blue-600 bg-blue-50/30">
                              {nilaiRapor > 0 ? Math.round(nilaiRapor) : '-'}
                           </td>
                           <td className="p-1">
                              <input
                                 type="text"
                                 value={student.capaianKompetensi}
                                 onChange={e => {
                                   const newVal = e.target.value;
                                   setFormData(prev => {
                                     const newPenilaian = [...prev.penilaianSiswa];
                                     newPenilaian[idx].capaianKompetensi = newVal;
                                     return { ...prev, penilaianSiswa: newPenilaian };
                                   });
                                 }}
                                 placeholder="Mencapai / Perlu Bim..."
                                 className="w-full bg-transparent focus:ring-1 focus:ring-blue-500 rounded outline-none p-1"
                               />
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran</h2>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Upload Bukti Pembelajaran (Opsional)</label>
              <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition">
                 <p className="text-xs text-slate-500 font-medium">Klik atau drop file foto/modul di sini</p>
                 <p className="text-[10px] text-slate-400 mt-1">(Max 5MB. JPG, PNG, PDF)</p>
                 <input type="file" className="hidden" />
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 p-4 pb-safe flex gap-3 z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <button 
          type="button"
          onClick={(e) => handleSubmit(e, 'Draft')}
          disabled={isSubmitting}
          className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Save size={16} /> Draft
        </button>
        <button 
          onClick={(e) => handleSubmit(e, 'Submit')}
          disabled={isSubmitting}
          className="flex-[2] bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <Send size={16} /> Kirim Jurnal
        </button>
      </div>
    </div>
  );
}
