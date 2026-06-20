import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, KeySquare, Shield, GraduationCap, ArrowRight, 
  Award, Briefcase, Sparkles, LayoutDashboard, Database, HelpCircle 
} from 'lucide-react';
import { cn } from '../lib/utils';

const DEMO_ACCOUNTS = [
  { 
    username: 'guru1', 
    name: 'Budi Santoso', 
    role: 'GURU', 
    label: 'Guru Utama',
    desc: 'Input jurnal harian & absensi siswa',
    color: 'from-blue-500 to-indigo-600',
    lightColor: 'bg-blue-50 text-blue-600'
  },
  { 
    username: 'waka', 
    name: 'Siti Aminah', 
    role: 'WAKA_KURIKULUM', 
    label: 'Waka Kurikulum',
    desc: 'Validasi rekap, rincian & kalender',
    color: 'from-amber-500 to-orange-600',
    lightColor: 'bg-amber-50 text-amber-600'
  },
  { 
    username: 'kepsek', 
    name: 'Kepala Sekolah', 
    role: 'KEPALA_SEKOLAH', 
    label: 'Kepala Sekolah',
    desc: 'Monitoring grafik, statistik & cetak',
    color: 'from-emerald-500 to-teal-600',
    lightColor: 'bg-emerald-50 text-emerald-600'
  },
  { 
    username: 'admin', 
    name: 'Admin Sekolah', 
    role: 'ADMIN', 
    label: 'Administrator',
    desc: 'Kelola data master & konfigurasi',
    color: 'from-purple-500 to-pink-600',
    lightColor: 'bg-purple-50 text-purple-600'
  }
];

export function Login() {
  const [username, setUsername] = useState('guru1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbType, setDbType] = useState('local');
  const { login } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbType(data.dbType))
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Silakan masukkan username atau pilih salah satu akun demo.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await login(username);
      navigate('/');
    } catch (err) {
      setError('Username tidak ditemukan. Coba ketik guru1, waka, atau kepsek.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (u: string) => {
    setUsername(u);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* DB Connection Status (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white/80 backdrop-blur-sm border px-3 py-1.5 rounded-full shadow-sm text-xs font-medium flex items-center gap-2">
           <Database size={14} className="text-slate-400" />
           <span className="text-slate-600">Database:</span>
           {dbType === 'apps_script' ? (
             <span className="text-green-600 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Google Sheets</span>
           ) : dbType === 'supabase' ? (
             <span className="text-blue-600 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div> Supabase</span>
           ) : (
             <span className="text-amber-600 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Local Mode</span>
           )}
        </div>
      </div>

      {/* LEFT COLUMN: Visual Showcase Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract glowing patterns */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/20 blur-[128px]"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-[96px]"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-cyan-500/20 blur-[112px]"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-500/30 flex items-center justify-center text-white shadow-lg">
            <BookOpen size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-black tracking-tight text-lg leading-none">Jurnal Ngajar</h2>
            <p className="text-[10px] text-blue-300 font-bold tracking-wider uppercase mt-1">Platform KBM & Supervisi</p>
          </div>
        </div>

        {/* Feature Teaser Cards */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2">
              <Sparkles size={11} /> Versi Modern 3.2
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Revitalisasi Rekap Jurnal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300">
                Pendidikan Digital & Akurat.
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Selamat datang di Jurnal Ngajar. Sederhanakan pelaporan harian pengajaran, kehadiran siswa, target kurikulum, serta rekapitulasi supervisi dalam satu platform terpadu.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-300 mb-2">
                <LayoutDashboard size={16} />
              </div>
              <h4 className="text-xs font-bold text-white">Full Dashboard</h4>
              <p className="text-[10px] text-slate-400 mt-1">Grup grafik keterberdayaan kurikulum & supervisi instan.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-300 mb-2">
                <Database size={16} />
              </div>
              <h4 className="text-xs font-bold text-white">Ekspor Fleksibel</h4>
              <p className="text-[10px] text-slate-400 mt-1">Cetak berkas PDF & spreadsheet Excel dalam hitungan detik.</p>
            </div>
          </div>
        </div>

        {/* School name & copyright */}
        <div className="relative z-10 text-slate-400 text-xs">
          <p className="font-semibold text-slate-300">{config.schoolName}</p>
          <p className="text-[10px] text-slate-400/80 mt-1">&copy; 2026 Jurnal Ngajar Sistem Mutu KBM • All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Login Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 py-10 relative overflow-y-auto">
        
        {/* Background blobs for mobile elegance */}
        <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-blue-100/50 blur-3xl lg:hidden"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-100/50 blur-3xl lg:hidden"></div>

        <div className="w-full max-w-md bg-white rounded-3xl sm:-my-4 shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-100 relative z-10">
          
          {/* Header Mobile Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            {config.logoUrl ? (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg overflow-hidden border border-slate-100">
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-md shadow-blue-500/20">
                <BookOpen size={26} />
              </div>
            )}
            
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800">
              {config.appName}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-snug">
              {config.schoolName}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Username Pendidik / Staf
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeySquare size={16} />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={username}
                  autoComplete="off"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
                  placeholder="Masukkan username anda..."
                />
              </div>

              {/* Error handle rendering */}
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-rose-600 text-[11px] mt-2 font-semibold flex items-center gap-1 justify-center bg-rose-50 p-2 rounded-lg border border-rose-100"
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-75 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* QUICK DEMO SELECTOR BAR */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
              <Shield size={12} className="text-blue-500" /> Akses Cepat Akun Demo
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = username === acc.username;
                return (
                  <button
                    id={`demo-acc-${acc.username}`}
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickSelect(acc.username)}
                    className={cn(
                      "p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between group h-20 relative overflow-hidden",
                      isSelected 
                        ? "border-blue-500 bg-blue-50/50 shadow-inner" 
                        : "border-slate-150 hover:bg-slate-50/80 hover:border-slate-350"
                    )}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={cn(
                        "text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md", 
                        acc.lightColor
                      )}>
                        {acc.role.replace('_', ' ')}
                      </span>
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></div>
                      )}
                    </div>

                    <div className="mt-2">
                      <p className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-[8px] text-slate-400 truncate leading-snug mt-0.5">
                        {acc.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info copy */}
        <p className="text-[10px] sm:text-xs text-slate-400 mt-8 z-10 text-center">
          &copy; 2026 {config.schoolName} &bull; Direkam secara enkripsi &amp; aman.
        </p>
      </div>

    </div>
  );
}
