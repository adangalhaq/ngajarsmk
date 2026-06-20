import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, X, Save, Upload, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterKelas() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [kelas, setKelas] = useState<any[]>([]);

  const fetchKelas = () => {
    fetch('/api/kelas')
        .then(res => res.json())
        .then(data => setKelas(data));
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    tingkat: 'X',
    jurusan: '',
    walikelas: '',
    tahun: '2025/2026'
  });

  const filtered = kelas.filter(k => k.nama.toLowerCase().includes(search.toLowerCase()) || k.jurusan.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAdd = () => {
    setFormData({ kode: '', nama: '', tingkat: 'X', jurusan: '', walikelas: '', tahun: '2025/2026' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (k: any) => {
    setFormData({ kode: k.kode, nama: k.nama, tingkat: k.tingkat, jurusan: k.jurusan, walikelas: k.walikelas, tahun: k.tahun });
    setEditingId(k.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      await fetch(`/api/kelas/${itemToDelete}`, { method: 'DELETE' });
      fetchKelas();
      setAlertOpen(true);
      setItemToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/kelas/${editingId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/kelas', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    }
    fetchKelas();
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
                kode: cols[0] || '',
                nama: cols[1] || '',
                tingkat: cols[2] || 'X',
                jurusan: cols[3] || '',
                walikelas: cols[4] || '',
                tahun: cols[5] || '2025/2026'
              };
              if (newItem.nama) {
                newItems.push(newItem);
              }
            }
          }
          if (newItems.length > 0) {
             setKelas(prev => [...prev, ...newItems]);
             alert(`Berhasil mengimport ${newItems.length} data kelas.`);
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
    const headers = "Kode Kelas,Nama Kelas,Tingkat,Jurusan,Wali Kelas,Tahun Ajaran\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + kelas.map(k => `${k.kode},${k.nama},${k.tingkat},${k.jurusan},${k.walikelas},${k.tahun}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Kelas.csv");
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
                <h1 className="font-bold text-slate-800 text-sm">Data Kelas</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-indigo-600 text-white p-2 rounded-lg shadow hover:bg-indigo-700 transition flex items-center justify-center">
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
            placeholder="Cari kelas..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(k => (
            <div key={k.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-50 px-3 py-1 text-[9px] font-bold text-indigo-600 rounded-bl-xl border-b border-l border-indigo-100">
                    Tingkat {k.tingkat}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm mt-1">{k.nama}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{k.jurusan}</p>
                </div>
                <div className="flex flex-col mt-1 space-y-1">
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Wali:</span> {k.walikelas}</span>
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">T.A:</span> {k.tahun}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 print:hidden">
                     <button onClick={() => handleOpenEdit(k)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(k.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data kelas tidak ditemukan.</div>}
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Kelas" 
        message="Apakah Anda yakin ingin menghapus data kelas ini?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data kelas telah terhapus." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Data Kelas' : 'Tambah Data Kelas'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-4" onSubmit={handleSave}>
                        <div><label className="text-[10px] font-bold text-slate-500">Kode Kelas</label><input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500">Nama Kelas</label><input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300" /></div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Tingkat</label>
                            <select value={formData.tingkat} onChange={e => setFormData({...formData, tingkat: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300"><option>X</option><option>XI</option><option>XII</option></select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Jurusan</label>
                            <select value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300">
                                <option value="">Pilih Jurusan</option>
                                <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
                                <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                                <option value="Akuntansi & Keuangan">Akuntansi & Keuangan</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Wali Kelas</label>
                            <select value={formData.walikelas} onChange={e => setFormData({...formData, walikelas: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300">
                                <option value="">Pilih Guru / Wali Kelas</option>
                                <option value="Budi Santoso, S.Pd">Budi Santoso, S.Pd</option>
                                <option value="Siti Aminah, M.Pd">Siti Aminah, M.Pd</option>
                                <option value="Ahmad, S.Kom">Ahmad, S.Kom</option>
                                <option value="Dewi, S.E">Dewi, S.E</option>
                            </select>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500">Tahun Ajaran</label><input type="text" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-indigo-300" /></div>
                        
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-indigo-700 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
