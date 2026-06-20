import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, FileEdit, Trash2, Download, Upload, X, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function MasterSiswa() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [siswa, setSiswa] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setSiswa(data))
      .catch(console.error);
  }, []);

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
          const newSiswaList = [];
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',').map(c => c.trim());
            // Format is NISN,Nama Lengkap,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,Kelas,Jurusan,Tahun Masuk
            if (cols.length >= 2) { 
              const newSiswa = {
                nisn: cols[0] || '',
                name: cols[1] || '',
                gender: cols[2] || 'Laki-laki',
                tempatLahir: cols[3] || '',
                tanggalLahir: cols[4] || '',
                kelas: cols[5] || '',
                jurusan: cols[6] || '',
                tahunMasuk: cols[7] || new Date().getFullYear().toString()
              };
              if (newSiswa.name) {
                newSiswaList.push(newSiswa);
              }
            }
          }
          if (newSiswaList.length > 0) {
            let addedCount = 0;
            for (const toAdd of newSiswaList) {
              try {
                const res = await fetch('/api/students', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(toAdd)
                });
                if (res.ok) addedCount++;
              } catch(e) {
                console.error(e);
              }
            }
            alert(`Berhasil mengimport ${addedCount} data siswa.`);
            fetch('/api/students')
              .then(res => res.json())
              .then(data => setSiswa(data))
              .catch(console.error);
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
    const headers = "NISN,Nama Lengkap,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,Kelas,Jurusan,Tahun Masuk\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + siswa.map(s => `${s.nisn || ''},${s.name || ''},${s.gender || ''},${s.tempatLahir || ''},${s.tanggalLahir || ''},${s.kelas || ''},${s.jurusan || ''},${s.tahunMasuk || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Data_Siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [formData, setFormData] = useState({
    nisn: '',
    name: '',
    gender: 'Laki-laki',
    tempatLahir: '',
    tanggalLahir: '',
    kelas: '',
    jurusan: '',
    tahunMasuk: ''
  });

  const filtered = siswa.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.nisn || '').includes(search));

  const handleOpenAdd = () => {
    setFormData({ nisn: '', name: '', gender: 'Laki-laki', tempatLahir: '', tanggalLahir: '', kelas: 'X TKJ 1', jurusan: 'Teknik Komputer Jaringan', tahunMasuk: new Date().getFullYear().toString() });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setFormData({ 
      nisn: s.nisn || '', 
      name: s.name || '', 
      gender: s.gender || 'Laki-laki', 
      tempatLahir: s.tempatLahir || '', 
      tanggalLahir: s.tanggalLahir || '', 
      kelas: s.kelas || '', 
      jurusan: s.jurusan || '', 
      tahunMasuk: s.tahunMasuk || '' 
    });
    setEditingId(s.id);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (itemToDelete !== null) {
      try {
        const res = await fetch(`/api/students/${itemToDelete}`, { method: 'DELETE' });
        if (res.ok) {
          setSiswa(siswa.filter(s => s.id !== itemToDelete));
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
        const res = await fetch(`/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const updated = await res.json();
          setSiswa(siswa.map(s => s.id === editingId ? updated : s));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          const created = await res.json();
          setSiswa([...siswa, created]);
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
                <h1 className="font-bold text-slate-800 text-sm">Data Siswa</h1>
            </div>
            <button onClick={handleOpenAdd} className="bg-pink-600 text-white p-2 rounded-lg shadow hover:bg-pink-700 transition flex items-center justify-center">
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
            placeholder="Cari NISN atau Nama..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">NISN: {s.nisn}</p>
                    </div>
                </div>
                <div className="flex flex-col mt-1 space-y-1">
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Kelas:</span> {s.kelas}</span>
                    <span className="text-[10px] text-slate-600 font-medium"><span className="text-slate-400">Jurusan:</span> {s.jurusan}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">{s.gender}</span>
                    <span className="text-[9px] bg-pink-50 text-pink-600 px-2 py-1 rounded font-bold">{s.tahunMasuk}</span>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-2 pt-2 print:hidden">
                     <button onClick={() => handleOpenEdit(s)} className="text-[10px] font-bold text-blue-600 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1">
                         <FileEdit size={12} /> Edit
                     </button>
                     <button onClick={() => handleDeleteRequest(s.id)} className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1">
                         <Trash2 size={12} /> Hapus
                     </button>
                </div>
            </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-xs py-10">Data siswa tidak ditemukan.</div>}
      </div>

       {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Siswa" 
        message="Apakah Anda yakin ingin menghapus data siswa ini?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data siswa telah terhapus dari sistem." 
      />

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }}
                 className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
                >
                   <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2">
                       <h3 className="font-bold text-slate-800">{editingId ? 'Edit Data Siswa' : 'Tambah Data Siswa'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                           <X size={18} />
                       </button>
                   </div>
                   <form className="space-y-4" onSubmit={handleSave}>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">NISN</label>
                          <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label>
                          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Jenis Kelamin</label>
                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300">
                              <option value="Laki-laki">Laki-laki</option>
                              <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Tempat Lahir</label>
                                <input type="text" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Tanggal Lahir</label>
                                <input type="date" value={formData.tanggalLahir} onChange={e => setFormData({...formData, tanggalLahir: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300" />
                            </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Kelas</label>
                          <select value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300">
                              <option value="">Pilih Kelas</option>
                              <option value="X TKJ 1">X TKJ 1</option>
                              <option value="XI TKR 2">XI TKR 2</option>
                              <option value="XII AKL 1">XII AKL 1</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Jurusan</label>
                          <select value={formData.jurusan} onChange={e => setFormData({...formData, jurusan: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300">
                              <option value="">Pilih Jurusan</option>
                              <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
                              <option value="Teknik Kendaraan Ringan">Teknik Kendaraan Ringan</option>
                              <option value="Akuntansi & Keuangan">Akuntansi & Keuangan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">Tahun Masuk</label>
                          <input type="text" value={formData.tahunMasuk} onChange={e => setFormData({...formData, tahunMasuk: e.target.value})} required className="w-full border rounded-lg p-2 text-xs outline-none focus:border-pink-300" />
                        </div>
                        <button type="submit" className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 mt-4 hover:bg-pink-700 transition"><Save size={16}/> Simpan</button>
                   </form>
               </motion.div>
           </div>
       )}
    </div>
  )
}
