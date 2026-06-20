import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, X, Save, Upload, Download, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterJadwal() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [jadwal, setJadwal] = useState<any[]>([]);

  const fetchJadwal = () => {
    fetch('/api/jadwal')
        .then(res => res.json())
        .then(data => setJadwal(data));
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const [formData, setFormData] = useState({
    hari: 'Senin',
    jamKe: '',
    guru: '',
    mapel: '',
    kelas: '',
    ruangan: ''
  });

  const filtered = jadwal.filter(j => 
    j.hari.toLowerCase().includes(search.toLowerCase()) || 
    j.guru.toLowerCase().includes(search.toLowerCase()) || 
    j.kelas.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({ hari: 'Senin', jamKe: '', guru: '', mapel: '', kelas: '', ruangan: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (j: any) => {
    setFormData({ hari: j.hari, jamKe: j.jamKe, guru: j.guru, mapel: j.mapel, kelas: j.kelas, ruangan: j.ruangan });
    setEditingId(j.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      await fetch(`/api/jadwal/${itemToDelete}`, { method: 'DELETE' });
      fetchJadwal();
      setAlertOpen(true);
      setItemToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/jadwal/${editingId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/jadwal', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    }
    fetchJadwal();
    setIsModalOpen(false);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        if (rows.length > 1) {
          const newItems = [];
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',').map(c => c.trim());
            if (cols.length >= 2) { 
              const newItem = {
                id: Date.now() + i,
                hari: cols[0] || '',
                jamKe: cols[1] || '',
                guru: cols[2] || '',
                mapel: cols[3] || '',
                kelas: cols[4] || '',
                ruangan: cols[5] || ''
              };
              if (newItem.hari && newItem.jamKe) {
                newItems.push(newItem);
              }
            }
          }
          if (newItems.length > 0) {
             setJadwal(prev => [...prev, ...newItems]);
             alert(`Berhasil mengimport ${newItems.length} jadwal pelajaran.`);
          }
        }
      };
      reader.readAsText(file);
    } else {
      alert(`Harap gunakan file CSV untuk melakukan import.`);
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    const headers = "Hari,Jam Ke,Guru,Mapel,Kelas,Ruangan\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + jadwal.map(j => `${j.hari},${j.jamKe},${j.guru},${j.mapel},${j.kelas},${j.ruangan}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Jadwal.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex flex-col justify-center z-10 shadow-sm gap-3 print:hidden">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="font-bold text-slate-800 text-sm">Jadwal Pelajaran</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-emerald-600 text-white p-2 rounded-lg shadow hover:bg-emerald-700 transition flex items-center justify-center">
                <Plus size={16} />
            </button>
        </div>
        
        <div className="flex gap-2 print:hidden">
            <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 py-2 rounded-lg flex items-center justify-center gap-1 border border-blue-100 hover:bg-blue-100 transition">
                <Upload size={14} /> Import
            </button>
            <button onClick={handleExportExcel} className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 py-2 rounded-lg flex items-center justify-center gap-1 border border-amber-100 hover:bg-amber-100 transition">
                <Download size={14} /> Excel
            </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari guru, kelas, hari..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(j => (
            <div key={j.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-50 px-3 py-1 text-[9px] font-bold text-emerald-600 rounded-bl-xl border-b border-l border-emerald-100">
                    Jam ke-{j.jamKe}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{j.hari}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Kelas {j.kelas} &bull; {j.ruangan}</p>
                </div>
                <div className="flex flex-col mt-1 space-y-1">
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Mapel:</span> {j.mapel}</span>
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Guru:</span> {j.guru}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 print:hidden">
                     <button onClick={() => handleOpenEdit(j)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(j.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Jadwal tidak ditemukan.</div>}
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Jadwal" 
        message="Apakah Anda yakin ingin menghapus data jadwal ini?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data jadwal telah terhapus." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-3" onSubmit={handleSave}>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Hari</label>
                                <select value={formData.hari} onChange={e => setFormData({...formData, hari: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300">
                                    <option>Senin</option><option>Selasa</option><option>Rabu</option>
                                    <option>Kamis</option><option>Jumat</option><option>Sabtu</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Jam Ke</label>
                                <input type="text" placeholder="1-2" value={formData.jamKe} onChange={e => setFormData({...formData, jamKe: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Guru</label>
                            <select value={formData.guru} onChange={e => setFormData({...formData, guru: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300">
                                <option value="">Pilih Guru</option>
                                <option value="Budi Santoso, S.Pd">Budi Santoso, S.Pd</option>
                                <option value="Siti Aminah, M.Pd">Siti Aminah, M.Pd</option>
                                <option value="Ahmad, S.Kom">Ahmad, S.Kom</option>
                                <option value="Dewi, S.E">Dewi, S.E</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Mata Pelajaran</label>
                            <select value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300">
                                <option value="">Pilih Mapel</option>
                                <option value="Pendidikan Agama dan Budi Pekerti">Pendidikan Agama dan Budi Pekerti</option>
                                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                <option value="Matematika">Matematika</option>
                                <option value="Dasar Kejuruan">Dasar Kejuruan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Kelas</label>
                            <select value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300">
                                <option value="">Pilih Kelas</option>
                                <option value="X TKJ 1">X TKJ 1</option>
                                <option value="XI TKR 2">XI TKR 2</option>
                                <option value="XII AKL 1">XII AKL 1</option>
                            </select>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500">Ruangan</label><input type="text" value={formData.ruangan} onChange={e => setFormData({...formData, ruangan: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-emerald-300" /></div>
                        
                        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-emerald-700 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
