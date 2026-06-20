import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardStats } from '../types';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Activity, Medal, BookMarked, MonitorPlay, Layers, ClipboardCheck, UserCheck, UserX, BarChart2, CheckSquare, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data));

    fetch('/api/dashboard/chart-data')
      .then(res => res.json())
      .then(data => setChartData(data));
  }, []);

  if (!stats || !chartData) return <div className="p-6 text-center text-slate-400">Memuat dashboard...</div>;

  const isAdminRole = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'KEPALA_SEKOLAH' || user?.role === 'WAKA_KURIKULUM';

  return (
    <div className="p-4 space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200"
      >
        <h2 className="text-xl font-bold mb-1">Halo, {user?.name}!</h2>
        <p className="text-blue-100 text-sm opacity-90">
          {(!isAdminRole) ? "Semangat mengabdi hari ini. Jangan lupa isi jurnal." : "Pantau aktivitas akademik sekolah hari ini."}
        </p>
      </motion.div>

      {isAdminRole ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<Users size={20} className="text-blue-500"/>} label="Total Guru" value={stats.totalGuru} />
            <StatCard icon={<Layers size={20} className="text-indigo-500"/>} label="Total Kelas" value={stats.totalKelas} />
            <StatCard icon={<BookOpen size={20} className="text-teal-500"/>} label="Total Mata Pelajaran" value={stats.totalMapel} />
            <StatCard icon={<ClipboardCheck size={20} className="text-emerald-500"/>} label="Jurnal Hari Ini" value={stats.jurnalHariIni} />
            <StatCard icon={<UserCheck size={20} className="text-green-500"/>} label="Guru Hadir Mengajar" value={stats.guruHadir} />
            <StatCard icon={<UserX size={20} className="text-rose-500"/>} label="Guru Belum Mengisi Jurnal" value={stats.guruBelumIsi} />
            <div className="col-span-2">
              <StatCard icon={<BarChart2 size={20} className="text-amber-500"/>} label="Persentase Keterlaksanaan Pembelajaran" value={`${stats.persentaseKeterlaksanaan}%`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Grafik Aktivitas Mengajar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Grafik Aktivitas Mengajar</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.aktivitasMengajar} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="terlaksana" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Terlaksana" />
                    <Bar dataKey="belum" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Belum" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik Kehadiran Guru */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Users size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Grafik Kehadiran Guru</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.kehadiranGuru} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGuru" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGuru)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Grafik Pengisian Jurnal */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Grafik Pengisian Jurnal</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.pengisianJurnal} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="disetujui" stackId="a" fill="#3b82f6" name="Disetujui" />
                    <Bar dataKey="direvisi" stackId="a" fill="#f59e0b" name="Direvisi" />
                    <Bar dataKey="telat" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Terlambat" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik Mata Pelajaran */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Grafik Mata Pelajaran (Jam)</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.mataPelajaran} dataKey="jam" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                      {chartData.mataPelajaran?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik Keterlaksanaan Kurikulum */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Keterlaksanaan Kurikulum</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.keterlaksanaanKurikulum} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Line type="monotone" dataKey="persentase" name="Persentase %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik Supervisi */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <CheckSquare size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Grafik Supervisi</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.supervisi} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="skor" name="Rata-rata Skor" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.supervisi?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Guru Dashboard - Combined with requested stats where relevant */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Users size={20} className="text-blue-500"/>} label="Kehadiran Siswa" value={`${stats.kehadiranSiswa}%`} />
            <StatCard icon={<Medal size={20} className="text-amber-500"/>} label="Rata-rata Nilai" value={stats.rataRataNilai} />
            <StatCard icon={<BookMarked size={20} className="text-indigo-500"/>} label="Total Materi" value={stats.totalMateri} />
            <StatCard icon={<ClipboardCheck size={20} className="text-emerald-500"/>} label="Jurnal Anda Hari Ini" value={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Statistik Kehadiran Siswa Anda</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.kehadiran} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="hadir" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 pb-8">
              <div className="flex items-center gap-2 mb-6">
                <Medal size={18} className="text-slate-400" />
                <h3 className="font-semibold text-slate-800 text-sm">Statistik Nilai Siswa Anda</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.nilai} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="rataRata" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Materi Pelajaran for Guru */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-slate-400" />
              <h3 className="font-semibold text-slate-800 text-sm">Materi Pelajaran Terbaru</h3>
            </div>
            <div className="space-y-3">
              {chartData.materi?.map((m: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center border-b border-slate-50 pb-3 last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MonitorPlay size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{m.materi}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{m.mapel} &bull; {m.kelas}</p>
                  </div>
                  <div className="text-[10px] text-right font-medium text-slate-400">
                    {m.waktu}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-[10px] uppercase font-medium tracking-wider text-slate-500 mt-1 leading-tight">{label}</p>
      </div>
    </motion.div>
  );
}
