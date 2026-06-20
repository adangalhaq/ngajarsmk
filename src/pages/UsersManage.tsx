import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Shield, ShieldCheck, FileEdit, Trash2, X, Save } from 'lucide-react';
import { User, Role } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { AlertModal } from '../components/AlertModal';

export function UsersManage() {
   const [users, setUsers] = useState<User[]>([]);
   
   const fetchUsers = () => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
   };

   useEffect(() => {
        fetchUsers();
   }, []);

   const [searchQuery, setSearchQuery] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingUser, setEditingUser] = useState<User | null>(null);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [itemToDelete, setItemToDelete] = useState<string | null>(null);
   const [alertOpen, setAlertOpen] = useState(false);

   const [formData, setFormData] = useState<{name: string, username: string, role: string}>({
       name: '',
       username: '',
       role: 'GURU'
   });

   const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const handleOpenAdd = () => {
       setFormData({ name: '', username: '', role: 'GURU' });
       setEditingUser(null);
       setIsModalOpen(true);
   };

   const handleOpenEdit = (user: User) => {
       setFormData({ name: user.name, username: user.username, role: user.role });
       setEditingUser(user);
       setIsModalOpen(true);
   };

   const handleDeleteRequest = (id: string) => {
       setItemToDelete(id);
       setConfirmOpen(true);
   };

   const executeDelete = async () => {
       if (itemToDelete !== null) {
           await fetch(`/api/users/${itemToDelete}`, { method: 'DELETE' });
           fetchUsers();
           setAlertOpen(true);
           setItemToDelete(null);
       }
   };

   const handleSave = async (e: React.FormEvent) => {
       e.preventDefault();
       if (editingUser) {
           await fetch(`/api/users/${editingUser.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(formData)
           });
       } else {
           await fetch('/api/users', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(formData)
           });
       }
       fetchUsers();
       setIsModalOpen(false);
   };

   return (
    <div className="p-4 flex flex-col h-full bg-slate-50 pb-24">
      {/* Header Area */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen User</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola data dan hak akses pengguna sistem.</p>
        </div>
        
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </div>

       {/* Search Bar */}
       <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau username..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

       <div className="space-y-3">
           {filteredUsers.map(u => (
               <div key={u.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3 w-full min-w-0">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-500">
                           {u.role === 'SUPER_ADMIN' ? <ShieldCheck size={18} className="text-purple-600"/> : 
                            u.role === 'ADMIN' ? <Shield size={18} className="text-blue-600"/> :
                            <Users size={18} />}
                       </div>
                       <div className="min-w-0 flex-1">
                           <h3 className="font-semibold text-sm text-slate-800 truncate">{u.name}</h3>
                           <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 truncate">
                               {u.role.replace('_', ' ')} &bull; @{u.username}
                           </p>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-2 shrink-0">
                       <button onClick={() => handleOpenEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                           <FileEdit size={16} />
                       </button>
                       <button onClick={() => handleDeleteRequest(u.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                           <Trash2 size={16} />
                       </button>
                   </div>
               </div>
           ))}
       </div>

       {/* Modals */}
       <ConfirmModal 
         isOpen={confirmOpen} 
         onClose={() => setConfirmOpen(false)} 
         onConfirm={executeDelete} 
         title="Hapus Pengguna" 
         message="Apakah Anda yakin ingin menghapus pengguna ini?" 
       />
       <AlertModal 
         isOpen={alertOpen} 
         onClose={() => setAlertOpen(false)} 
         title="Berhasil" 
         message="Data pengguna telah terhapus." 
       />

       {/* Modal Editor */}
       {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
               <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex justify-between items-center mb-5">
                       <h3 className="font-bold text-slate-800">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
                       <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                           <X size={18} />
                       </button>
                   </div>

                   <form onSubmit={handleSave} className="space-y-4">
                       <div>
                           <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Lengkap</label>
                           <input 
                               type="text"
                               required
                               value={formData.name}
                               onChange={e => setFormData({...formData, name: e.target.value})}
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           />
                       </div>
                       <div>
                           <label className="text-[11px] font-semibold text-slate-600 block mb-1">Username</label>
                           <input 
                               type="text"
                               required
                               value={formData.username}
                               onChange={e => setFormData({...formData, username: e.target.value})}
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           />
                       </div>
                       <div>
                           <label className="text-[11px] font-semibold text-slate-600 block mb-1">Role / Hak Akses</label>
                           <select 
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                               value={formData.role}
                               onChange={e => setFormData({...formData, role: e.target.value})}
                           >
                               <option value="GURU">Guru</option>
                               <option value="ADMIN">Admin Sekolah</option>
                               <option value="WAKA_KURIKULUM">Waka Kurikulum</option>
                               <option value="KEPALA_SEKOLAH">Kepala Sekolah</option>
                               <option value="SUPER_ADMIN">Super Admin</option>
                           </select>
                       </div>

                       <div className="pt-2">
                           <button 
                               type="submit"
                               className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-all text-sm"
                           >
                               <Save size={16} /> Simpan Data
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
   )
}
