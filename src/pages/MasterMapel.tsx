import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, X, Save, Upload, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterMapel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [mapel, setMapel] = useState<any[]>([]);

  const fetchMapel = () => {
    fetch('/api/mapel')
      .then(res => res.json())
      .then(data => setMapel(data));
  };

  useEffect(() => {
    fetchMapel();
  }, []);

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kelompok: '',
    fase: 'E',
    semester: 'Ganjil',
    jam: 2
  });

  const filtered = mapel.filter(m => m.nama.toLowerCase().includes(search.toLowerCase()) || m.kode.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAdd = () => {
    setFormData({ kode: '', nama: '', kelompok: '', fase: 'E', semester: 'Ganjil', jam: 2 });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setFormData({ kode: m.kode, nama: m.nama, kelompok: m.kelompok, fase: m.fase, semester: m.semester, jam: m.jam });
    setEditingId(m.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      await fetch(`/api/mapel/${itemToDelete}`, { method: 'DELETE' });
      fetchMapel();
      setAlertOpen(true);
      setItemToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/mapel/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/mapel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    fetchMapel();
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
            // Kode Mapel,Nama Mapel,Kelompok,Fase,Semester,Jam
            if (cols.length >= 2) { 
              const newItem = {
                id: Date.now() + i,
                kode: cols[0] || '',
                nama: cols[1] || '',
                kelompok: cols[2] || '',
                fase: cols[3] || 'E',
                semester: cols[4] || 'Ganjil',
                jam: parseInt(cols[5]) || 2
              };
              if (newItem.nama) {
                newItems.push(newItem);
              }
            }
          }
          if (newItems.length > 0) {
             setMapel(prev => [...prev, ...newItems]);
             alert(`Berhasil mengimport ${newItems.length} data mapel.`);
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
    const headers = "Kode Mapel,Nama Mapel,Kelompok,Fase,Semester,Jam\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + mapel.map(m => `${m.kode},${m.nama},${m.kelompok},${m.fase},${m.semester},${m.jam}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Mapel.csv");
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
                <h1 className="font-bold text-slate-800 text-sm">Data Mata Pelajaran</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-violet-600 text-white p-2 rounded-lg shadow hover:bg-violet-700 transition flex items-center justify-center">
                <Plus size={16} />
            </button>
        </div>
        
        <div className="flex gap-2 print:hidden">
            <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 py-2 rounded-lg flex items-center justify-center gap-1 border border-emerald-100 hover:bg-emerald-100 transition">
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
            placeholder="Cari mapel..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute pl-2 pt-2 top-0 left-0 bg-violet-600 w-1.5 h-full"></div>
                <div className="flex justify-between items-start ml-2">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{m.nama}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Kode: {m.kode}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 ml-2 mt-1">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{m.kelompok}</span>
                    <span className="text-[9px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-bold border border-sky-100">Fase {m.fase}</span>
                    <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold border border-amber-100">{m.jam} JP</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 ml-2 print:hidden">
                     <button onClick={() => handleOpenEdit(m)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(m.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data mapel tidak ditemukan.</div>}
      </div>

      {/* Modal, dll ada di bawah */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Mapel" 
        message="Apakah Anda yakin ingin menghapus mata pelajaran ini? Data tidak dapat dipulihkan." 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data mata pelajaran telah terhapus." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-3" onSubmit={handleSave}>
                        <div><label className="text-[10px] font-bold text-slate-500">Kode Mapel</label><input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500">Nama Mapel</label><input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500">Kelompok Mapel</label><input type="text" value={formData.kelompok} onChange={e => setFormData({...formData, kelompok: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300" /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Fase</label>
                                <select value={formData.fase} onChange={e => setFormData({...formData, fase: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300"><option>E</option><option>F</option></select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Semester</label>
                                <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300"><option>Ganjil</option><option>Genap</option></select>
                            </div>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500">Jam Pelajaran (JP)</label><input type="number" value={formData.jam} onChange={e => setFormData({...formData, jam: parseInt(e.target.value)})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-violet-300" /></div>
                        
                        <button type="submit" className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-violet-700 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
