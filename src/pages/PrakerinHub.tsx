import React, { useEffect, useState, useRef } from 'react';
import { Briefcase, Building, CheckCircle, FileText, MapPin, Users, Plus, Download, Upload, Trash2, Edit2, X, PenTool } from 'lucide-react';
import * as XLSX from 'xlsx';
import SignatureCanvas from 'react-signature-canvas';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

import { exportPklLaporanToExcel, exportPklLaporanToPdf } from '../utils/exportUtils';

export function PrakerinHub() {
  const [activeTab, setActiveTab] = useState<'locations' | 'students' | 'laporan'>('locations');
  const [locations, setLocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [laporan, setLaporan] = useState<any[]>([]);
  
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isStuModalOpen, setIsStuModalOpen] = useState(false);
  const [isLapModalOpen, setIsLapModalOpen] = useState(false);
  
  const [editLoc, setEditLoc] = useState<any>(null);
  const [editStu, setEditStu] = useState<any>(null);
  const [editLap, setEditLap] = useState<any>(null);
  
  const [showSigModal, setShowSigModal] = useState<'guru' | 'instruktur' | null>(null);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  
  const [formLoc, setFormLoc] = useState({ name: '', address: '', quota: '', pembimbingId: '' });
  const [formStu, setFormStu] = useState({ name: '', nisn: '', locationId: '', status: 'Aktif' });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'location' | 'student' | 'laporan', id: string } | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  
  const emptyLaporanForm = {
    studentId: '', studentName: '', nisn: '', programKeahlian: '',
    tempatPkl: '', tanggalMasuk: '', tanggalKeluar: '', pembimbing: '',
    tujuanPembelajaran: Array(5).fill({ tujuan: '', skor: '', deskripsi: '' }),
    catatan: '',
    kehadiran: { sakit: '', izin: '', alpa: '', jumlahHari: '' },
    tanggalLaporan: '', tempatLaporan: '', guruPembimbing: '', instruktur: '', ttdGuru: '', ttdInstruktur: ''
  };
  const [formLap, setFormLap] = useState<any>(emptyLaporanForm);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    fetch('/api/pkl/locations').then(r => r.json()).then(setLocations);
    fetch('/api/pkl/students').then(r => r.json()).then(setStudents);
    fetch('/api/pkl/laporan').then(r => r.json()).then(setLaporan);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = (type: 'locations' | 'students') => {
    const data = type === 'locations' ? locations : students;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `Data_Prakerin_${type}.xlsx`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      if (activeTab === 'locations') {
        for (const item of data) {
          await fetch('/api/pkl/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        }
      } else if (activeTab === 'students') {
        for (const item of data) {
          await fetch('/api/pkl/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
        }
      }
      fetchData();
      alert('Import berhasil!');
    };
    reader.readAsBinaryString(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editLoc ? 'PUT' : 'POST';
    const url = editLoc ? `/api/pkl/locations/${editLoc.id}` : '/api/pkl/locations';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formLoc)
    });
    setIsLocModalOpen(false);
    fetchData();
  };

  const deleteLocation = async (id: string) => {
    setItemToDelete({ type: 'location', id });
    setConfirmOpen(true);
  };

  const saveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editStu ? 'PUT' : 'POST';
    const url = editStu ? `/api/pkl/students/${editStu.id}` : '/api/pkl/students';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formStu)
    });
    setIsStuModalOpen(false);
    fetchData();
  };

  const deleteStudent = async (id: string) => {
    setItemToDelete({ type: 'student', id });
    setConfirmOpen(true);
  };

  const saveLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editLap ? 'PUT' : 'POST';
    const url = editLap ? `/api/pkl/laporan/${editLap.id}` : '/api/pkl/laporan';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formLap)
    });
    setIsLapModalOpen(false);
    fetchData();
  };

  const deleteLaporan = async (id: string) => {
    setItemToDelete({ type: 'laporan', id });
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    let url = '';
    if (type === 'location') url = `/api/pkl/locations/${id}`;
    if (type === 'student') url = `/api/pkl/students/${id}`;
    if (type === 'laporan') url = `/api/pkl/laporan/${id}`;
    
    await fetch(url, { method: 'DELETE' });
    fetchData();
    setItemToDelete(null);
    setAlertOpen(true);
  };

  const clearCanvas = () => {
    sigCanvasRef.current?.clear();
  };

  const getCanvasSignature = () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return;
    const url = sigCanvasRef.current.getCanvas().toDataURL('image/png');
    if (showSigModal === 'guru') {
      setFormLap({...formLap, ttdGuru: url});
    } else if (showSigModal === 'instruktur') {
      setFormLap({...formLap, ttdInstruktur: url});
    }
    setShowSigModal(null);
  };

  const computeScores = () => {
    let sum = 0;
    let count = 0;
    formLap.tujuanPembelajaran.forEach((tp: any) => {
      const val = parseFloat(tp.skor);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    });
    return {
      sum: sum.toString(),
      avg: count > 0 ? (sum / count).toFixed(1) : '0'
    };
  };

  const lapScores = computeScores();

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Monitoring Prakerin / PKL</h2>
          <p className="text-xs text-slate-500 mt-1">Data tempat, pembimbing, dan penilaian industri.</p>
        </div>
        {(activeTab === 'locations' || activeTab === 'students') && (
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport(activeTab)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
              <Download size={14} /> Export
            </button>
            <button onClick={handleImportClick} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
              <Upload size={14} /> Import
            </button>
            <button onClick={() => {
                if(activeTab === 'locations') { setEditLoc(null); setFormLoc({name:'', address:'', quota:'', pembimbingId:''}); setIsLocModalOpen(true); }
                else { setEditStu(null); setFormStu({name:'', nisn:'', locationId:'', status: 'Aktif'}); setIsStuModalOpen(true); }
              }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
              <Plus size={14} /> Tambah
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
        <button onClick={() => setActiveTab('locations')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeTab === 'locations' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>Tempat PKL</button>
        <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeTab === 'students' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>Siswa & Monitoring</button>
        <button onClick={() => setActiveTab('laporan')} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${activeTab === 'laporan' ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>Laporan Guru Pembimbing</button>
      </div>

      <div className="space-y-4">
        {activeTab === 'locations' && locations.map(loc => (
          <div key={loc.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Building size={16} className="text-orange-500" /> {loc.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {loc.address}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Briefcase size={12}/> Kuota: {loc.quota} Siswa</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded border border-orange-100">
                Pembimbing ID: {loc.pembimbingId}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditLoc(loc); setFormLoc(loc); setIsLocModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={14}/></button>
                <button onClick={() => deleteLocation(loc.id)} className="p-1.5 text-rose-600 bg-rose-50 rounded hover:bg-rose-100"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'students' && students.map((stu, i) => {
          const loc = locations.find(l => l.id === stu.locationId);
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Users size={16} className="text-indigo-500" /> {stu.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1 font-medium">NISN: {stu.nisn}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${stu.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {stu.status}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditStu(stu); setFormStu(stu); setIsStuModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={14}/></button>
                    <button onClick={() => deleteStudent(stu.id)} className="p-1.5 text-rose-600 bg-rose-50 rounded hover:bg-rose-100"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600 bg-orange-50 border border-orange-100 p-2.5 rounded-lg break-words flex items-center gap-2">
                <Building size={14} className="text-orange-400" />
                <span>
                  <span className="font-semibold text-orange-700">Tempat PKL: </span>
                  {loc ? loc.name : 'Belum ditempatkan'}
                </span>
              </div>
            </div>
          );
        })}

        {activeTab === 'laporan' && (
          <div className="mb-4">
            <button onClick={() => {
              setEditLap(null);
              setFormLap(emptyLaporanForm);
              setIsLapModalOpen(true);
            }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition">
              <Plus size={16} /> Buat Laporan Baru
            </button>
          </div>
        )}
        
        {activeTab === 'laporan' && laporan.length > 0 ? laporan.map((lap, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileText size={16} className="text-indigo-500" /> {lap.studentName}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">NISN: {lap.nisn} &bull; {lap.programKeahlian}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { exportPklLaporanToPdf(lap); }} className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100" title="Export PDF"><Download size={14}/></button>
                <button onClick={() => { exportPklLaporanToExcel(lap); }} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100" title="Export Excel"><Download size={14}/></button>
                <button onClick={() => { setEditLap(lap); setFormLap(lap); setIsLapModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Edit2 size={14}/></button>
                <button onClick={() => deleteLaporan(lap.id)} className="p-1.5 text-rose-600 bg-rose-50 rounded hover:bg-rose-100"><Trash2 size={14}/></button>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="font-semibold text-slate-600 block">Tempat PKL:</span> {lap.tempatPkl}</div>
              <div><span className="font-semibold text-slate-600 block">Guru Pembimbing:</span> {lap.guruPembimbing}</div>
              <div className="col-span-2"><span className="font-semibold text-slate-600 block">Periode:</span> {lap.tanggalMasuk} - {lap.tanggalKeluar}</div>
            </div>
          </div>
        )) : null}
        {activeTab === 'laporan' && laporan.length === 0 && <div className="text-xs text-slate-500 text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">Belum ada laporan guru pembimbing.</div>}
      </div>

      {isLocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">{editLoc ? 'Edit Tempat PKL' : 'Tambah Tempat PKL'}</h3>
              <button onClick={() => setIsLocModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <form onSubmit={saveLocation} className="p-4 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Perusahaan / Tempat</label>
                <input required type="text" value={formLoc.name} onChange={e => setFormLoc({...formLoc, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Alamat</label>
                <input required type="text" value={formLoc.address} onChange={e => setFormLoc({...formLoc, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kuota Siswa</label>
                  <input required type="number" value={formLoc.quota} onChange={e => setFormLoc({...formLoc, quota: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">ID Pembimbing</label>
                  <input required type="text" value={formLoc.pembimbingId} onChange={e => setFormLoc({...formLoc, pembimbingId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-slate-700 transition-colors">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">{editStu ? 'Edit Siswa PKL' : 'Tambah Siswa PKL'}</h3>
              <button onClick={() => setIsStuModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <form onSubmit={saveStudent} className="p-4 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Siswa</label>
                <input required type="text" value={formStu.name} onChange={e => setFormStu({...formStu, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">NISN</label>
                <input required type="text" value={formStu.nisn} onChange={e => setFormStu({...formStu, nisn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tempat PKL</label>
                <select required value={formStu.locationId} onChange={e => setFormStu({...formStu, locationId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Pilih Tempat PKL</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Status</label>
                <select required value={formStu.status} onChange={e => setFormStu({...formStu, status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Bermasalah">Bermasalah</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-slate-700 transition-colors">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isLapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-slate-800 text-sm">{editLap ? 'Edit Laporan' : 'Tambah Laporan'}</h3>
              <button onClick={() => setIsLapModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <form onSubmit={saveLaporan} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Peserta Didik</label>
                  <select required value={formLap.studentId} onChange={e => {
                    const stu = students.find(s => s.id === e.target.value);
                    const loc = locations.find(l => l.id === stu?.locationId);
                    setFormLap({
                      ...formLap, 
                      studentId: e.target.value,
                      studentName: stu?.name || '',
                      nisn: stu?.nisn || '',
                      programKeahlian: 'Teknik Komputer dan Jaringan', // Default or derived
                      tempatPkl: loc?.name || ''
                    });
                  }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Pilih Siswa...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">NISN</label>
                  <input readOnly value={formLap.nisn} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Program Keahlian</label>
                  <input readOnly value={formLap.programKeahlian} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tempat PKL</label>
                  <input readOnly value={formLap.tempatPkl} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tgl Masuk</label>
                  <input required type="date" value={formLap.tanggalMasuk} onChange={e => setFormLap({...formLap, tanggalMasuk: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tgl Keluar</label>
                  <input required type="date" value={formLap.tanggalKeluar} onChange={e => setFormLap({...formLap, tanggalKeluar: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2 mt-4">Tujuan Pembelajaran</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-1 bg-slate-100 p-2 text-[10px] font-bold text-slate-600 text-center">
                    <div className="col-span-1">No</div>
                    <div className="col-span-5">Tujuan Pembelajaran</div>
                    <div className="col-span-2">Skor</div>
                    <div className="col-span-3">Deskripsi</div>
                    <div className="col-span-1">Act</div>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {formLap.tujuanPembelajaran.map((tp: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 gap-1 p-2 items-center">
                        <div className="col-span-1 text-center text-xs text-slate-500 font-medium">{idx + 1}</div>
                        <div className="col-span-5">
                           <input placeholder="Tujuan..." value={tp.tujuan} onChange={(e) => {
                             const newTp = [...formLap.tujuanPembelajaran];
                             newTp[idx].tujuan = e.target.value;
                             setFormLap({...formLap, tujuanPembelajaran: newTp});
                           }} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-2">
                           <input type="number" placeholder="0-100" value={tp.skor} onChange={(e) => {
                             const newTp = [...formLap.tujuanPembelajaran];
                             newTp[idx].skor = e.target.value;
                             setFormLap({...formLap, tujuanPembelajaran: newTp});
                           }} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 outline-none text-center" />
                        </div>
                        <div className="col-span-3">
                           <input placeholder="Ket..." value={tp.deskripsi} onChange={(e) => {
                             const newTp = [...formLap.tujuanPembelajaran];
                             newTp[idx].deskripsi = e.target.value;
                             setFormLap({...formLap, tujuanPembelajaran: newTp});
                           }} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 outline-none" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                           <button type="button" onClick={() => {
                             const newTp = [...formLap.tujuanPembelajaran];
                             newTp.splice(idx, 1);
                             setFormLap({...formLap, tujuanPembelajaran: newTp});
                           }} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 gap-1 bg-slate-50 p-2 font-bold text-[11px] text-slate-700">
                    <div className="col-span-6 text-right pe-3 uppercase">Total Nilai</div>
                    <div className="col-span-2 text-center text-blue-600 bg-blue-50 py-1 rounded inline-block">{lapScores.sum}</div>
                    <div className="col-span-4 ps-2 flex items-center whitespace-nowrap">Rata-rata: <span className="ms-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">{lapScores.avg}</span></div>
                  </div>
                  <div className="bg-slate-50 p-2 text-center border-t border-slate-200">
                    <button type="button" onClick={() => {
                      setFormLap({
                        ...formLap, 
                        tujuanPembelajaran: [...formLap.tujuanPembelajaran, { tujuan: '', skor: '', deskripsi: '' }]
                      });
                    }} className="text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1 mx-auto hover:text-blue-700">
                      <Plus size={12} /> Tambah Baris Tujuan Pembelajaran
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Catatan</label>
                <textarea value={formLap.catatan} onChange={(e) => setFormLap({...formLap, catatan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="Tuliskan catatan evaluasi..."></textarea>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-2">Kehadiran</p>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Sakit</label>
                    <input type="number" value={formLap.kehadiran.sakit} onChange={(e) => setFormLap({...formLap, kehadiran: {...formLap.kehadiran, sakit: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Izin</label>
                    <input type="number" value={formLap.kehadiran.izin} onChange={(e) => setFormLap({...formLap, kehadiran: {...formLap.kehadiran, izin: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Alpa</label>
                    <input type="number" value={formLap.kehadiran.alpa} onChange={(e) => setFormLap({...formLap, kehadiran: {...formLap.kehadiran, alpa: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block flex-1 whitespace-nowrap">Total Hari</label>
                    <input type="number" value={formLap.kehadiran.jumlahHari} onChange={(e) => setFormLap({...formLap, kehadiran: {...formLap.kehadiran, jumlahHari: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Tempat Laporan</label>
                    <input required type="text" value={formLap.tempatLaporan} onChange={(e) => setFormLap({...formLap, tempatLaporan: e.target.value})} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs outline-none" placeholder="ex: Surabaya" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 mb-1 block">Tanggal Laporan</label>
                    <input required type="date" value={formLap.tanggalLaporan} onChange={(e) => setFormLap({...formLap, tanggalLaporan: e.target.value})} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600 mb-1">Instruktur PKL</p>
                    <input required type="text" value={formLap.instruktur} onChange={(e) => setFormLap({...formLap, instruktur: e.target.value})} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none text-center mb-1" placeholder="Nama Instruktur..." />
                    <div className="h-14 flex flex-col justify-center items-center border border-slate-200 bg-white rounded cursor-pointer group overflow-hidden" onClick={() => setShowSigModal('instruktur')}>
                      {formLap.ttdInstruktur ? (
                        <img src={formLap.ttdInstruktur} alt="TTD Instruktur" className="h-full w-full object-contain object-center scale-90" />
                      ) : (
                         <span className="text-[10px] text-slate-400 group-hover:text-blue-500 flex flex-col items-center gap-1"><PenTool size={12} /> TTD / Paraf</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-600 mb-1">Guru Pembimbing</p>
                    <input required type="text" value={formLap.guruPembimbing} onChange={(e) => setFormLap({...formLap, guruPembimbing: e.target.value})} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none text-center mb-1" placeholder="Nama Guru..." />
                    <div className="h-14 flex flex-col justify-center items-center border border-slate-200 bg-white rounded cursor-pointer group overflow-hidden" onClick={() => setShowSigModal('guru')}>
                       {formLap.ttdGuru ? (
                        <img src={formLap.ttdGuru} alt="TTD Guru" className="h-full w-full object-contain object-center scale-90" />
                      ) : (
                         <span className="text-[10px] text-slate-400 group-hover:text-blue-500 flex flex-col items-center gap-1"><PenTool size={12} /> TTD / Paraf</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 sticky bottom-0 bg-white pb-2">
                <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 transition-colors shadow-lg">Simpan Laporan & Validasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSigModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Tanda Tangan {showSigModal === 'guru' ? 'Guru' : 'Instruktur'}</h3>
              <button onClick={() => setShowSigModal(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
            </div>
            <div className="p-4 bg-slate-100">
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl overflow-hidden cursor-crosshair">
                <SignatureCanvas 
                  ref={sigCanvasRef}
                  canvasProps={{className: 'w-full h-40'}}
                  penColor="black"
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <button type="button" onClick={clearCanvas} className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">Bersihkan</button>
                <button type="button" onClick={getCanvasSignature} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-md">Simpan Tanda Tangan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal 
        isOpen={confirmOpen} 
        onClose={() => setConfirmOpen(false)} 
        onConfirm={executeDelete} 
        title="Hapus Data PKL" 
        message="Apakah Anda yakin ingin menghapus data ini dari sistem?" 
      />
      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Berhasil" 
        message="Data telah berhasil dihapus." 
      />
    </div>
  );
}
