import React, { useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Save, Bell, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();
  const { config, updateConfig } = useConfig();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = React.useState({
    appName: config.appName,
    schoolName: config.schoolName,
    notificationsEnabled: config.notificationsEnabled,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateConfig(formData);
    navigate(-1);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-slate-800 text-sm">Pengaturan Akun</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        
        {/* Identitas Sistem */}
        {user?.role === 'SUPER_ADMIN' && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identitas Sistem</h2>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden relative border border-slate-200 mb-3 shadow-inner">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-2xl text-slate-300">S</span>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <Upload size={14} /> Ganti Logo
            </button>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Aplikasi</label>
            <input 
              type="text"
              value={formData.appName}
              onChange={e => setFormData({...formData, appName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Sekolah</label>
            <input 
              type="text"
              value={formData.schoolName}
              onChange={e => setFormData({...formData, schoolName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
        )}

        {/* Notifikasi */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notifikasi</h2>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Notifikasi Aplikasi</p>
                <p className="text-[10px] text-slate-500">Pemberitahuan jurnal dan aktivitas.</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer" 
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

        </div>

      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 p-4 pb-safe z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <Save size={16} /> Simpan Pengaturan
        </button>
      </div>

    </div>
  );
}
