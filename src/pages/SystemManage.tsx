import React, { useState, useRef, useEffect } from 'react';
import { Database, Download, Upload, Activity, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LogType = "normal" | "success" | "system";
interface LogEntry {
  id: number;
  time: string;
  user: string;
  action: string;
  type: LogType;
}

const initialLogs: LogEntry[] = [
  { id: 1, time: "15:20", user: "admin", action: "Mengupdate data jadwal kelas X TKJ 1", type: "normal" },
  { id: 2, time: "14:55", user: "kepsek", action: "Mengakses dashboard statistik", type: "normal" },
  { id: 3, time: "14:30", user: "waka", action: "Memvalidasi 12 jurnal mengajar", type: "normal" },
  { id: 4, time: "13:10", user: "guru1", action: "Submit jurnal mapel Matematika", type: "success" },
  { id: 5, time: "12:05", user: "system", action: "Auto-backup database harian selesai", type: "system" }
];

export function SystemManage() {
  const [backupStatus, setBackupStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  useEffect(() => {
    const mockActions = [
      { user: 'guru2', action: 'Mengisi absensi kehadiran' },
      { user: 'guru3', action: 'Update capaian pembelajaran' },
      { user: 'waka', action: 'Melihat laporan bulanan' },
      { user: 'admin', action: 'Login ke sistem' },
      { user: 'guru1', action: 'Submit jurnal mapel Bahasa Indonesia', type: 'success' },
      { user: 'waka', action: 'Memberi revisi jurnal mengajar' }
    ];

    const interval = setInterval(() => {
      const randomAction = mockActions[Math.floor(Math.random() * mockActions.length)];
      const now = new Date();
      const newLog: LogEntry = {
        id: Date.now(),
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        user: randomAction.user,
        action: randomAction.action,
        type: (randomAction.type as LogType) || 'normal'
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep latest 10
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const handleBackup = () => {
    setBackupStatus('Memproses backup otomatis...');
    setTimeout(() => {
      // Simulate file download
      const dbContent = "-- Mock DB Backup for SIJARMA\nCREATE TABLE Users (id INT, name VARCHAR(255));\nINSERT INTO Users VALUES (1, 'Super Admin');\n-- END OF BACKUP";
      const blob = new Blob([dbContent], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sijarma_DB_Backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setBackupStatus('Backup berhasil diunduh.');
    }, 1500);
  }

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackupStatus(`Memverifikasi file restore dari ${file.name}...`);
      setTimeout(() => {
        setBackupStatus('Restore database berhasil!');
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2000);
    }
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Sistem</h2>
          <p className="text-xs text-slate-500 mt-1">Laman khusus Super Admin</p>
        </div>
      </div>

      <AnimatePresence>
        {backupStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
               <ShieldCheck size={16} /> {backupStatus}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Database Management */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
              <Database size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold text-slate-700 tracking-wide">Backup & Restore</h2>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">Amankan data sistem secara berkala dengan fitur Pencadangan Database. Lakukan backup sebelum merestore data.</p>
          
          <input 
            type="file" 
            accept=".sql" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />

          <div className="grid grid-cols-2 gap-3">
              <button onClick={handleBackup} className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-blue-100">
                  <Download size={24} />
                  <span className="text-xs font-semibold">Backup Harian</span>
              </button>
              <button onClick={handleRestoreClick} className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border border-slate-200">
                  <Upload size={24} />
                  <span className="text-xs font-semibold">Restore Data</span>
              </button>
          </div>
      </div>

       {/* System Monitoring */}
       <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-700 tracking-wide">Monitoring Aktivitas (Live)</h2>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
          </div>
          
          <div className="space-y-3">
             <AnimatePresence>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                       <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                           <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'system' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                           <span className="text-[9px] font-bold text-slate-400">{log.time}</span>
                       </div>
                       <div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium"><span className="font-bold text-slate-900">{log.user}</span> {log.action}</p>
                       </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
       </div>

    </div>
  )
}
