import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Journals } from './pages/Journals';
import { JournalForm } from './pages/JournalForm';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { UsersManage } from './pages/UsersManage';
import { SystemManage } from './pages/SystemManage';
import { MasterHub } from './pages/MasterHub';
import { MasterGuru } from './pages/MasterGuru';
import { MasterKelas } from './pages/MasterKelas';
import { MasterMapel } from './pages/MasterMapel';
import { MasterJadwal } from './pages/MasterJadwal';
import { MasterTahun } from './pages/MasterTahun';
import { MasterSiswa } from './pages/MasterSiswa';
import { MasterJurusan } from './pages/MasterJurusan';
import { Laporan } from './pages/Laporan';
import { Kalender } from './pages/Kalender';
import { Notifications } from './pages/Notifications';
import { Supervision } from './pages/Supervision';
import { Statistics } from './pages/Statistics';
import { PrakerinHub } from './pages/PrakerinHub';

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="journals" element={<Journals />} />
              <Route path="journals/new" element={<JournalForm />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UsersManage />} />
              <Route path="system" element={<SystemManage />} />
              <Route path="master" element={<MasterHub />} />
              <Route path="master/guru" element={<MasterGuru />} />
              <Route path="master/kelas" element={<MasterKelas />} />
              <Route path="master/mapel" element={<MasterMapel />} />
              <Route path="master/jadwal" element={<MasterJadwal />} />
              <Route path="master/tahun-ajaran" element={<MasterTahun />} />
              <Route path="master/siswa" element={<MasterSiswa />} />
              <Route path="master/jurusan" element={<MasterJurusan />} />
              <Route path="master/pkl" element={<PrakerinHub />} />
              <Route path="prakerin" element={<PrakerinHub />} />
              <Route path="attendance" element={<div className="p-6 text-center text-slate-400">Modul Absensi QR Code (Under Development)</div>} />
              <Route path="laporan" element={<Laporan />} />
              <Route path="kalender" element={<Kalender />} />
              <Route path="notifikasi" element={<Notifications />} />
              <Route path="supervision" element={<Supervision />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
