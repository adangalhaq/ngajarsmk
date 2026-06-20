import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, Bell, QrCode, Edit2, X, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { config } = useConfig();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name: editName, photoUrl: editPhoto });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditPhoto(user?.photoUrl || '');
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 bg-slate-50 min-h-full pb-24">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center mt-4 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600">
             <button onClick={openEditModal} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-2 text-[10px] uppercase font-bold tracking-widest rounded-full transition-all flex items-center gap-1 shadow-sm">
                <Edit2 size={12} /> Edit Profil
             </button>
        </div>
        
        <div className="relative mt-8">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden relative">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mt-4">{user?.name}</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-full mt-2">
          {user?.role.replace('_', ' ')}
        </span>
        
        <div className="w-full mt-8 space-y-2">
          <MenuButton onClick={() => navigate('/settings')} icon={<Settings size={18} />} label="Pengaturan Akun" />
          <MenuButton icon={<Bell size={18} />} label="Notifikasi" badge={config.notificationsEnabled ? "Aktif" : "Non-aktif"} />
          {user?.role === 'GURU' && (
             <MenuButton icon={<QrCode size={18} />} label="QR Kehadiran Saya" />
          )}
        </div>

        <button 
          onClick={logout}
          className="w-full mt-6 bg-rose-50 text-rose-600 font-semibold py-3 rounded-xl hover:bg-rose-100 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Keluar Akun
        </button>

      </div>
      
      <div className="text-center mt-8">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">{config.appName} - {config.schoolName}</p>
      </div>

      {/* Modal Edit Profil */}
      {isEditModalOpen && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
             <motion.div 
               initial={{ y: '100%' }} animate={{ y: 0 }}
               className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-xl"
             >
                 <div className="flex justify-between items-center mb-5 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
                     <h3 className="font-bold text-slate-800 text-lg">Edit Profil</h3>
                     <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                         <X size={20} />
                     </button>
                 </div>
                 <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                        className="w-full border rounded-lg p-3 text-sm mt-1 outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Foto Profil</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditPhoto(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {editPhoto && editPhoto.startsWith('data:image') && (
                        <div className="mt-2 text-[10px] text-emerald-600 font-semibold">✓ Foto berhasil dipilih</div>
                      )}
                    </div>
                    <button disabled={isSaving} type="submit" className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm flex justify-center items-center gap-2 hover:bg-blue-700 transition">
                      <Save size={16}/> {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                 </form>
             </motion.div>
         </div>
      )}

    </div>
  );
}

function MenuButton({ icon, label, badge, onClick }: { icon: React.ReactNode, label: string, badge?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {badge && (
        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}
