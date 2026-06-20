import React, { useState } from 'react';
import { Bell, Mail, MessageCircle, Smartphone, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const EVENTS = [
  { id: 'belum-isi', title: 'Guru belum mengisi jurnal', desc: 'Pengingat otomatis untuk guru yang belum submit jurnal hari ini.' },
  { id: 'disetujui', title: 'Jurnal disetujui', desc: 'Notifikasi saat Waka/Kepsek menyetujui jurnal mengajar.' },
  { id: 'direvisi', title: 'Jurnal direvisi', desc: 'Pemberitahuan kepada guru bahwa jurnal perlu diperbaiki.' },
  { id: 'jadwal-ubah', title: 'Jadwal mengajar berubah', desc: 'Informasi perubahan jadwal mendadak / relokasi kelas.' },
  { id: 'supervisi', title: 'Supervisi dijadwalkan', desc: 'Pemberitahuan jadwal supervisi kepada guru terkait.' },
];

export function Notifications() {
  const [config, setConfig] = useState<Record<string, { email: boolean; wa: boolean; inApp: boolean }>>({
    'belum-isi': { email: false, wa: true, inApp: true },
    'disetujui': { email: false, wa: false, inApp: true },
    'direvisi': { email: false, wa: true, inApp: true },
    'jadwal-ubah': { email: true, wa: true, inApp: true },
    'supervisi': { email: true, wa: true, inApp: true },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleConfig = (eventId: string, channel: 'email' | 'wa' | 'inApp') => {
    setConfig(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [channel]: !prev[eventId][channel]
      }
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24 relative">
      {saved && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 left-4 right-4 bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-sm border border-emerald-100 z-20"
        >
          <CheckCircle2 size={18} /> Pengaturan notifikasi berhasil disimpan!
        </motion.div>
      )}

      <div className="mb-6 mt-2">
        <h2 className="text-xl font-bold text-slate-800">Media Notifikasi</h2>
        <p className="text-xs text-slate-500 mt-1">Atur pengiriman pesan otomatis (Email, WhatsApp, In-App).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
          <div className="col-span-5 text-left">Pemicu / Kondisi</div>
          <div className="col-span-2 flex justify-center"><Mail size={14} className="mb-1 block mx-auto"/> Email</div>
          <div className="col-span-2 flex justify-center"><MessageCircle size={14} className="mb-1 block mx-auto text-emerald-500"/> WhatsApp</div>
          <div className="col-span-3 flex justify-center"><Smartphone size={14} className="mb-1 block mx-auto text-indigo-500"/> In-App</div>
        </div>
        
        {EVENTS.map((ev, i) => (
           <div key={ev.id} className={cn("grid grid-cols-12 p-3 border-slate-100 items-center", i !== EVENTS.length - 1 && "border-b")}>
              <div className="col-span-5 pr-2">
                 <h4 className="text-xs font-semibold text-slate-800">{ev.title}</h4>
                 <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{ev.desc}</p>
              </div>
              
              <div className="col-span-2 flex justify-center">
                 <Toggle isOn={config[ev.id].email} onClick={() => toggleConfig(ev.id, 'email')} />
              </div>
              <div className="col-span-2 flex justify-center">
                 <Toggle isOn={config[ev.id].wa} onClick={() => toggleConfig(ev.id, 'wa')} />
              </div>
              <div className="col-span-3 flex justify-center">
                 <Toggle isOn={config[ev.id].inApp} onClick={() => toggleConfig(ev.id, 'inApp')} />
              </div>
           </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
         <button 
           onClick={handleSave}
           disabled={isSaving}
           className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto disabled:opacity-70"
         >
           {isSaving ? 'Menyimpan...' : <><Save size={18} /> Simpan Pengaturan</>}
         </button>
      </div>
    </div>
  );
}

function Toggle({ isOn, onClick }: { isOn: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-8 h-4 rounded-full relative transition-colors focus:outline-none",
        isOn ? "bg-indigo-500" : "bg-slate-200"
      )}
    >
      <div 
        className={cn(
          "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform",
          isOn ? "left-4.5" : "left-0.5"
        )}
      />
    </button>
  );
}
