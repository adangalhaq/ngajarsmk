import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, Download, Upload, X, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterGuru() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [gurus, setGurus] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teachers')
      .then(res => res.json())
      .then(data => setGurus(data))
      .catch(console.error);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim());
        if (rows.length > 1) {
          alert('Mengimport data, mohon tunggu...');
          const newGurus = [];
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',').map(c => c.trim());
            // Format is NIP,NUPTK,Nama Lengkap,Jenis Kelamin,Mata Pelajaran
            if (cols.length >= 3) { 
              const newGuru = {
                nip: cols[0] || '',
                nuptk: cols[1] || '',
                name: cols[2] || '',
                gender: cols[3] || 'Laki-laki',
                mapel: cols[4] || ''
              };
              if (newGuru.name) {
                newGurus.push(newGuru);
              }
            }
          }
          if (newGurus.length > 0) {
            let addedCount = 0;
            for (const toAdd of newGurus) {
              try {
                const res = await fetch('/api/teachers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(toAdd)
                });
                if (res.ok) addedCount++;
              } catch(e) {
                console.error(e);
              }
            }
            alert(`Berhasil mengimport ${addedCount} data guru.`);
            fetch('/api/teachers')
              .then(res => res.json())
              .then(data => setGurus(data))
              .catch(console.error);
          }
        }
      };
      reader.readAsText(file);
    } else {
      alert(`Harap gunakan file CSV untuk melakukan import. Silakan download template Excel (CSV) terlebih dahulu.`);
    }
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    const headers = "NIP,NUPTK,Nama Lengkap,Jenis Kelamin,Mata Pelajaran\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + gurus.map(g => `${g.nip || ''},${g.nuptk || ''},${g.name || ''},${g.gender || ''},${g.mapel || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Guru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const [formData, setFormData] = useState({
    nip: '',
    nuptk: '',
    name: '',
    gender: 'Laki-laki',
    mapel: ''
  });

  const filtered = gurus.filter(g => (g.name || '').toLowerCase().includes(search.toLowerCase()) || (g.nip || '').includes(search));

  const handleOpenAdd = () => {
    setFormData({ nip: '', nuptk: '', name: '', gender: 'Laki-laki', mapel: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guru: any) => {
    setFormData({ nip: guru.nip || '', nuptk: guru.nuptk || '', name: guru.name || '', gender: guru.gender || 'Laki-laki', mapel: guru.mapel || '' });
    setEditingId(guru.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      try {
        const res = await fetch(`/api/teachers/${itemToDelete}`, { method: 'DELETE' });
        if (res.ok) {
          setGurus(gurus.filter(g => g.id !== itemToDelete));
          setAlertOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setItemToDelete(null);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      try {
        const res = await fetch(`/api/teachers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setGurus(gurus.map(g => g.id === editingId ? updated : g));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const created = await res.json();
          setGurus([...gurus, created]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex flex-col justify-center z-10 shadow-sm gap-3 print:hidden">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="font-bold text-slate-800 text-sm">Data Guru</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-blue-600 text-white p-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center">
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
            placeholder="Cari guru..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(guru => (
            <div key={guru.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{guru.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">NIP. {guru.nip}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">{guru.mapel}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{guru.gender}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 print:hidden">
                     <button onClick={() => handleOpenEdit(guru)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(guru.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data guru tidak ditemukan.</div>}
      </div>

       {/* Simple Form Modal representation */}
       {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Guru" 
        message="Apakah Anda yakin ingin menghapus data guru ini?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data guru telah terhapus dari sistem." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Data Guru' : 'Tambah Data Guru'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-4" onSubmit={handleSave}>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">NIP</label>
                          <input type="text" value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">NUPTK</label>
                          <input type="text" value={formData.nuptk} onChange={e => setFormData({...formData, nuptk: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label>
                          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Jenis Kelamin</label>
                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300">
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Mata Pelajaran</label>
                          <select value={formData.mapel} onChange={e => setFormData({...formData, mapel: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-blue-300">
                             <option value="">Pilih Mata Pelajaran</option>
                             <option value="Pendidikan Agama dan Budi Pekerti">Pendidikan Agama dan Budi Pekerti</option>
                             <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                             <option value="Matematika">Matematika</option>
                             <option value="Dasar Kejuruan">Dasar Kejuruan</option>
                             <option value="Bahasa Inggris">Bahasa Inggris</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
