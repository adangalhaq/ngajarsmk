import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, X, Save, CheckCircle, Upload, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterTahun() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', isError: false });

  const [tahun, setTahun] = useState<any[]>([]);

  const fetchTahun = () => {
    fetch('/api/tahun')
        .then(res => res.json())
        .then(data => setTahun(data));
  };

  useEffect(() => {
    fetchTahun();
  }, []);

  const [formData, setFormData] = useState({
    tahun: '',
    semester: 'Ganjil',
    status: 'Tidak Aktif'
  });

  const filtered = tahun.filter(t => t.tahun.includes(search));

  const setAktif = async (id: number) => {
      // Set all other to 'Tidak Aktif', this one to 'Aktif'
      for (const t of tahun) {
          if (t.id === id && t.status !== 'Aktif') {
              await fetch(`/api/tahun/${t.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...t, status: 'Aktif'})});
          } else if (t.id !== id && t.status === 'Aktif') {
              await fetch(`/api/tahun/${t.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...t, status: 'Tidak Aktif'})});
          }
      }
      fetchTahun();
  };

  const handleOpenAdd = () => {
    setFormData({ tahun: '', semester: 'Ganjil', status: 'Tidak Aktif' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setFormData({ tahun: t.tahun, semester: t.semester, status: t.status });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    const isAktif = tahun.find(t => t.id === id)?.status === 'Aktif';
    if (isAktif) {
        setAlertInfo({ title: 'Gagal', message: 'Tidak dapat menghapus tahun ajaran yang sedang aktif.', isError: true });
        setAlertOpen(true);
        return;
    }
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      await fetch(`/api/tahun/${itemToDelete}`, { method: 'DELETE' });
      fetchTahun();
      setAlertInfo({ title: 'Berhasil', message: 'Data tahun ajaran telah terhapus.', isError: false });
      setAlertOpen(true);
      setItemToDelete(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === 'Aktif') {
        for (const t of tahun) {
             if (t.status === 'Aktif' && t.id !== editingId) {
                  await fetch(`/api/tahun/${t.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...t, status: 'Tidak Aktif'})});
             }
        }
    }
    if (editingId) {
      await fetch(`/api/tahun/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch('/api/tahun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    }
    fetchTahun();
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
                tahun: cols[0] || '',
                semester: cols[1] || 'Ganjil',
                status: cols[2] || 'Tidak Aktif'
              };
              if (newItem.tahun) {
                newItems.push(newItem);
              }
            }
          }
          if (newItems.length > 0) {
             setTahun(prev => [...prev, ...newItems]);
             alert(`Berhasil mengimport ${newItems.length} data tahun ajaran.`);
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
    const headers = "Tahun Ajaran,Semester,Status\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + tahun.map(t => `${t.tahun},${t.semester},${t.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_TahunAjaran.csv");
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
                <h1 className="font-bold text-slate-800 text-sm">Tahun Ajaran</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-amber-500 text-white p-2 rounded-lg shadow hover:bg-amber-600 transition flex items-center justify-center">
                <Plus size={16} />
            </button>
        </div>
        
        <div className="flex gap-2 print:hidden">
            <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} onChange={handleImportExcel} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 py-2 rounded-lg flex items-center justify-center gap-1 border border-amber-100 hover:bg-amber-100 transition">
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
            placeholder="Cari tahun ajaran..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(t => (
            <div key={t.id} className={`p-4 rounded-xl shadow-sm border flex flex-col gap-2 relative overflow-hidden transition-all ${t.status === 'Aktif' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">TA {t.tahun}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">Semester {t.semester}</p>
                    </div>
                    {t.status === 'Aktif' && <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded"><CheckCircle size={12} /> AKTIF</div>}
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50 print:hidden">
                     {t.status !== 'Aktif' ? (
                       <button onClick={() => setAktif(t.id)} className="text-[10px] font-bold text-slate-600 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1">Set Aktif</button>
                     ) : <div/>}

                     <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(t)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                            <FileEdit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDeleteRequest(t.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                            <Trash2 size={12} /> Hapus
                        </button>
                     </div>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data tahun ajaran tidak ditemukan.</div>}
      </div>

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Tahun Ajaran" 
        message="Apakah Anda yakin ingin menghapus data ini? Data tidak dapat dipulihkan." 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title={alertInfo.title} 
        message={alertInfo.message} 
        isError={alertInfo.isError}
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-4" onSubmit={handleSave}>
                        <div><label className="text-[10px] font-bold text-slate-500">Tahun Ajaran</label><input type="text" placeholder="YYYY/YYYY" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-amber-300" /></div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Semester</label>
                            <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-amber-300"><option>Ganjil</option><option>Genap</option></select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500">Status</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-amber-300"><option>Tidak Aktif</option><option>Aktif</option></select>
                        </div>
                        
                        <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-amber-600 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
