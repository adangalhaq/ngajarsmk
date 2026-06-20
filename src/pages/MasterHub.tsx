import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Layers, Book, CalendarDays, Archive, GraduationCap, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export function MasterHub() {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-slate-50 min-h-screen pb-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Master Data</h2>
        <p className="text-xs text-slate-500 mt-1">Kelola data induk sekolah.</p>
      </div>

      <div className="space-y-3">
        <MenuCard 
          title="Data Guru" 
          desc="Kelola NIP, NUPTK, profil, mapel yang diajar." 
          icon={<Users size={24} className="text-blue-500" />} 
          onClick={() => navigate('/master/guru')}
        />
        <MenuCard 
          title="Data Siswa" 
          desc="Kelola NISN, profil siswa, kelas, dan jurusan." 
          icon={<GraduationCap size={24} className="text-pink-500" />} 
          onClick={() => navigate('/master/siswa')}
        />
        <MenuCard 
          title="Data Kelas" 
          desc="Kelola tingkat, jurusan, dan wali kelas." 
          icon={<Layers size={24} className="text-indigo-500" />} 
          onClick={() => navigate('/master/kelas')}
        />
        <MenuCard 
          title="Data Jurusan" 
          desc="Kelola data jurusan dan bidang keahlian." 
          icon={<Briefcase size={24} className="text-cyan-500" />} 
          onClick={() => navigate('/master/jurusan')}
        />
        <MenuCard 
          title="Mata Pelajaran" 
          desc="Kelola kode mapel, kelompok, fase, jam." 
          icon={<Book size={24} className="text-violet-500" />} 
          onClick={() => navigate('/master/mapel')}
        />
        <MenuCard 
          title="Jadwal Pelajaran" 
          desc="Plotting guru, mapel, kelas, ruangan, dan hari." 
          icon={<CalendarDays size={24} className="text-emerald-500" />} 
          onClick={() => navigate('/master/jadwal')}
        />
        <MenuCard 
          title="Tahun Ajaran" 
          desc="Kelola tahun ajaran aktif dan semester." 
          icon={<Archive size={24} className="text-amber-500" />} 
          onClick={() => navigate('/master/tahun-ajaran')}
        />
        <MenuCard 
          title="Data Prakerin / PKL" 
          desc="Data tempat, pembimbing, jurnal siswa, dan nilai industri." 
          icon={<Briefcase size={24} className="text-orange-500" />} 
          onClick={() => navigate('/master/pkl')}
        />
      </div>
    </div>
  );
}

function MenuCard({ title, desc, icon, onClick }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.button>
  );
}
