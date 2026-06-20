import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, Download, Upload, X, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterJurusan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [jurusan, setJurusan] = useState<any[]>([]);

  const fetchJurusan = () => {
    fetch('/api/jurusan')
        .then(res => res.json())
        .then(data => setJurusan(data));
  };

  useEffect(() => {
    fetchJurusan();
  }, []);

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    bidang: ''
  });

  const filtered = jurusan.filter(j => j.nama.toLowerCase().includes(search.toLowerCase()) || j.kode.toLowerCase().includes(search.toLowerCase()));

  const handleOpenAdd = () => {
    setFormData({ kode: '', nama: '', bidang: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (j: any) => {
    setFormData({ kode: j.kode, nama: j.nama, bidang: j.bidang });
    setEditingId(j.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      await fetch(`/api/jurusan/${itemToDelete}`, { method: 'DELETE' });
      fetchJurusan();
      setAlertOpen(true);
      setItemToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/jurusan/${editingId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/jurusan', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
    }
    fetchJurusan();
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
                bidang: cols[2] || ''
              };
              if (newItem.nama) {
                newItems.push(newItem);
              }
            }
          }
          if (newItems.length > 0) {
             setJurusan(prev => [...prev, ...newItems]);
             alert(`Berhasil mengimport ${newItems.length} data jurusan.`);
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
    const headers = "Kode Jurusan,Nama Jurusan,Bidang Keahlian\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + jurusan.map(j => `${j.kode},${j.nama},${j.bidang}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Jurusan.csv");
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
                <h1 className="font-bold text-slate-800 text-sm">Data Jurusan</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-cyan-600 text-white p-2 rounded-lg shadow hover:bg-cyan-700 transition flex items-center justify-center">
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
            placeholder="Cari Jurusan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(j => (
            <div key={j.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute pl-2 pt-2 top-0 left-0 bg-cyan-600 w-1.5 h-full"></div>
                <div className="flex justify-between items-start ml-2">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{j.nama}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Kode: {j.kode}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 ml-2 mt-1">
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Bidang:</span> {j.bidang}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 ml-2 print:hidden">
                     <button onClick={() => handleOpenEdit(j)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(j.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data jurusan tidak ditemukan.</div>}
      </div>

       {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Jurusan" 
        message="Apakah Anda yakin ingin menghapus data jurusan ini?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data jurusan telah terhapus." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Data Jurusan' : 'Tambah Data Jurusan'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-4" onSubmit={handleSave}>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Kode Jurusan</label>
                          <input type="text" value={formData.kode} onChange={e => setFormData({...formData, kode: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-cyan-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Nama Jurusan</label>
                          <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-cyan-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Bidang Keahlian</label>
                          <input type="text" value={formData.bidang} onChange={e => setFormData({...formData, bidang: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-cyan-300" />
                        </div>
                        <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-cyan-700 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
