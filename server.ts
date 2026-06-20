import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { safeSupabaseRead, safeSupabaseWrite } from './server/supabase';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

// Mock DB
const db = {
  users: [
    { id: '1', name: 'Super Admin', role: 'SUPER_ADMIN', username: 'superadmin' },
    { id: '2', name: 'Admin Sekolah', role: 'ADMIN', username: 'admin' },
    { id: '3', name: 'Budi Santoso', role: 'GURU', username: 'guru1' },
    { id: '3a', name: 'Dewi Lestari', role: 'GURU', username: 'guru2' },
    { id: '3b', name: 'Ahmad Dahlan', role: 'GURU', username: 'guru3' },
    { id: '4', name: 'Siti Aminah', role: 'WAKA_KURIKULUM', username: 'waka' },
    { id: '5', name: 'Kepala Sekolah', role: 'KEPALA_SEKOLAH', username: 'kepsek' },
  ] as any[],
  journals: [
    { id: 'j1', date: '2023-10-25', teacherId: '3', teacherName: 'Budi Santoso', subject: 'Matematika', class: 'X TKJ 1', status: 'Submit', materi: 'Aljabar' },
    { id: 'j2', date: '2023-10-25', teacherId: '3', teacherName: 'Budi Santoso', subject: 'Fisika', class: 'XI TKR 2', status: 'Draft', materi: 'Hukum Newton' },
  ] as any[],
  supervisions: [
    { id: 's1', teacherId: '3', teacherName: 'Budi Santoso', supervisor: 'Kepala Sekolah', instrumen: 'Instrumen Standar KBM', score: '85', date: '2023-10-20', notes: 'Penyampaian materi baik, interaksi siswa aktif.', rekomendasi: 'Tingkatkan penggunaan media interaktif.' },
  ],
  pklLocations: [
    { id: '1', name: 'PT Telkom Indonesia', address: 'Jl. Ketintang, Surabaya', quota: 5, pembimbingId: '3' },
    { id: '2', name: 'PLN Persero', address: 'Jl. Pemuda, Surabaya', quota: 3, pembimbingId: '3a' }
  ],
  pklStudents: [
    { id: 's1', name: 'Andi Saputra', nisn: '0051234567', locationId: '1', status: 'Aktif' },
    { id: 's2', name: 'Rina Amelia', nisn: '0057654321', locationId: '1', status: 'Aktif' },
    { id: 's3', name: 'Bimo Arya', nisn: '0061122334', locationId: '2', status: 'Aktif' }
  ],
  pklLaporan: [
    {
      id: 'lap1', studentId: 's1', studentName: 'Andi Saputra', nisn: '0051234567',
      programKeahlian: 'Teknik Komputer dan Jaringan',
      tempatPkl: 'PT Telkom Indonesia',
      tanggalMasuk: '2023-07-01', tanggalKeluar: '2023-11-01',
      pembimbing: 'Bpk. Budi Santoso',
      tujuanPembelajaran: [
        { tujuan: 'Memahami topologi jaringan', skor: '90', deskripsi: 'Sangat baik' },
        { tujuan: 'Instalasi perangkat', skor: '85', deskripsi: 'Baik' },
        { tujuan: 'Konfigurasi router', skor: '88', deskripsi: 'Sangat baik' },
        { tujuan: 'Troubleshooting jaringan', skor: '80', deskripsi: 'Baik' },
        { tujuan: 'Laporan dan dokumentasi', skor: '85', deskripsi: 'Baik' }
      ],
      kehadiran: { sakit: '1', izin: '0', alpa: '0', jumlahHari: '90' },
      tanggalLaporan: '2023-11-05',
      tempatLaporan: 'Surabaya',
      guruPembimbing: 'Dadang Kurnia, M.Pd.',
      instruktur: 'Bpk. Budi Santoso',
      ttdGuru: 'signed-tutor1',
      ttdInstruktur: 'signed-inst1'
    }
  ],
  students: [
    { id: 'st1', name: 'Alfi Syahrin', nisn: '005111', class: 'X TKJ 1' },
    { id: 'st2', name: 'Bunga Citra', nisn: '005112', class: 'X TKJ 1' },
    { id: 'st3', name: 'Candra Darmawan', nisn: '005113', class: 'X TKJ 1' },
    { id: 'st4', name: 'Dini Marlina', nisn: '005114', class: 'XI TKR 2' },
    { id: 'st5', name: 'Eka Pratama', nisn: '005115', class: 'XI TKR 2' }
  ],
  mapel: [
    { id: '1', kode: 'MP01', nama: 'Pendidikan Agama dan Budi Pekerti', kelompok: 'A (Muatan Nasional)', fase: 'E', semester: 'Ganjil', jam: 3 },
    { id: '2', kode: 'MP02', nama: 'Pendidikan Pancasila', kelompok: 'A (Muatan Nasional)', fase: 'E', semester: 'Ganjil', jam: 2 },
    { id: '3', kode: 'MP03', nama: 'Bahasa Indonesia', kelompok: 'A (Muatan Nasional)', fase: 'E', semester: 'Ganjil', jam: 4 },
  ],
  tahun: [
    { id: '1', tahun: '2024/2025', semester: 'Ganjil', status: 'Tidak Aktif' },
    { id: '2', tahun: '2024/2025', semester: 'Genap', status: 'Aktif' },
    { id: '3', tahun: '2025/2026', semester: 'Ganjil', status: 'Tidak Aktif' }
  ],
  jurusan: [
    { id: '1', kode: 'TKJ', nama: 'Teknik Komputer Jaringan', bidang: 'Teknologi Informasi' },
    { id: '2', kode: 'AKL', nama: 'Akuntansi Keuangan', bidang: 'Bisnis Manajemen' },
    { id: '3', kode: 'TKR', nama: 'Teknik Kendaraan Ringan', bidang: 'Otomotif' }
  ],
  kelas: [
    { id: '1', kode: '10TKJ1', nama: 'X TKJ 1', tingkat: 'X', jurusan: 'Teknik Komputer Jaringan', walikelas: 'Ahmad, S.Kom', tahun: '2025/2026' },
    { id: '2', kode: '11TKJ1', nama: 'XI TKJ 1', tingkat: 'XI', jurusan: 'Teknik Komputer Jaringan', walikelas: 'Budi, S.Kom', tahun: '2025/2026' }
  ],
  jadwal: [
    { id: '1', hari: 'Senin', jamKe: '1-2', guru: 'Budi Santoso, S.Pd', mapel: 'Matematika', kelas: 'X TKJ 1', ruangan: 'R.101' },
    { id: '2', hari: 'Senin', jamKe: '3-4', guru: 'Dewi Lestari, M.Pd', mapel: 'Fisika', kelas: 'XI TKR 2', ruangan: 'Lab. Fisika' },
    { id: '3', hari: 'Selasa', jamKe: '1-3', guru: 'Ahmad Dahlan, S.Kom', mapel: 'Pemrograman Dasar', kelas: 'X TKJ 2', ruangan: 'Lab. Kom 1' }
  ],
  events: [
    { id: '1', dateStr: '2026-8-5', type: 'pendidikan', title: 'Hari Pertama Sekolah' },
    { id: '2', dateStr: '2026-8-10', type: 'kegiatan', title: 'Rapat Wali Murid' },
    { id: '3', dateStr: '2026-8-17', type: 'libur', title: 'Hari Kemerdekaan RI' },
    { id: '4', dateStr: '2026-8-24', type: 'ujian', title: 'Penilaian Tengah Semester' },
    { id: '5', dateStr: '2026-8-25', type: 'ujian', title: 'Penilaian Tengah Semester' },
    { id: 'h1', dateStr: '2026-1-1', type: 'libur', title: 'Tahun Baru Masehi' },
    { id: 'h2', dateStr: '2026-2-18', type: 'libur', title: 'Isra Mikraj Nabi Muhammad SAW' },
    { id: 'h3', dateStr: '2026-3-3', type: 'libur', title: 'Hari Raya Nyepi' },
    { id: 'h4', dateStr: '2026-3-19', type: 'libur', title: 'Hari Raya Idul Fitri 1447 H' },
    { id: 'h5', dateStr: '2026-3-20', type: 'libur', title: 'Hari Raya Idul Fitri 1447 H' },
    { id: 'h6', dateStr: '2026-4-3', type: 'libur', title: 'Wafat Yesus Kristus' },
    { id: 'h7', dateStr: '2026-5-1', type: 'libur', title: 'Hari Buruh Internasional' },
    { id: 'h8', dateStr: '2026-5-14', type: 'libur', title: 'Kenaikan Yesus Kristus' },
    { id: 'h9', dateStr: '2026-5-26', type: 'libur', title: 'Hari Raya Waisak' },
    { id: 'h10', dateStr: '2026-5-27', type: 'libur', title: 'Hari Raya Idul Adha 1447 H' },
    { id: 'h11', dateStr: '2026-6-1', type: 'libur', title: 'Hari Lahir Pancasila' },
    { id: 'h12', dateStr: '2026-6-17', type: 'libur', title: 'Tahun Baru Islam 1448 H' },
    { id: 'h13', dateStr: '2026-8-26', type: 'libur', title: 'Maulid Nabi Muhammad SAW' },
    { id: 'h14', dateStr: '2026-12-25', type: 'libur', title: 'Hari Raya Natal' },
  ],
  stats: {
    totalGuru: 45,
    totalKelas: 24,
    totalMapel: 15,
    jurnalHariIni: 32,
    guruHadir: 40,
    guruBelumIsi: 13,
    persentaseKeterlaksanaan: 85,
    kehadiranSiswa: 96,
    rataRataNilai: 82,
    totalMateri: 154
  }
};

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Securely handle cases where body might be a raw string or buffer in serverless environments
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  } else if (req.body && Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8'));
    } catch (e) {}
  }
  next();
});

app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

  // Dynamic Supabase startup syncer
// Start DB Sync in background
const dbSyncPromise = (async () => {
    try {
      console.log('[Supabase Init] Attempting to synchronize with active databases...');
      const tables = [
        { name: 'users', ref: db.users },
        { name: 'journals', ref: db.journals },
        { name: 'supervisions', ref: db.supervisions },
        { name: 'pkl_locations', ref: db.pklLocations },
        { name: 'pkl_students', ref: db.pklStudents },
        { name: 'pkl_laporan', ref: db.pklLaporan },
        { name: 'students', ref: db.students },
        { name: 'mapel', ref: db.mapel },
        { name: 'tahun', ref: db.tahun },
        { name: 'jurusan', ref: db.jurusan },
        { name: 'kelas', ref: db.kelas },
        { name: 'jadwal', ref: db.jadwal },
        { name: 'events', ref: db.events }
      ];
      
      // Process tables in parallel to prevent high latency
      // FOR APPS SCRIPT: run sequentially or reduce load to prevent rate limiting
      const isAppsScript = process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL;
      
      const results = [];
      if (isAppsScript) {
         // for apps script, just sync users at startup to prevent 429 too many concurrent requests
         // the other tables can be synced lazily or we just rely on local fallback until requested.
         for (const table of tables) {
            if (table.name === 'users' || table.name === 'kelas' || table.name === 'mapel') {
               try {
                 results.push(await safeSupabaseRead(table.name, table.ref));
               } catch (e) {
                 results.push(table.ref);
               }
            } else {
               results.push(table.ref);
            }
         }
      } else {
         // Supabase can handle parallel requests
         const pRes = await Promise.all(
           tables.map(async (table) => {
             try {
               return await safeSupabaseRead(table.name, table.ref);
             } catch (e) {
               return table.ref;
             }
           })
         );
         results.push(...pRes);
      }
      
      db.users = results[0];
      
      // Ensure core admin accounts always exist for login fallback
      const requiredAdmins = [
        { id: '1', name: 'Super Admin', role: 'SUPER_ADMIN', username: 'superadmin', password: 'password123' },
        { id: '2', name: 'Admin Sekolah', role: 'ADMIN', username: 'admin', password: 'password123' }
      ];
      for (const admin of requiredAdmins) {
        if (!db.users.find(u => u.username === admin.username)) {
          db.users.push(admin);
        }
      }
      
      db.journals = results[1];
      db.supervisions = results[2];
      db.pklLocations = results[3];
      db.pklStudents = results[4];
      db.pklLaporan = results[5];
      db.students = results[6];
      db.mapel = results[7];
      db.tahun = results[8];
      db.jurusan = results[9];
      db.kelas = results[10];
      db.jadwal = results[11];
      db.events = results[12];
      console.log('[Supabase Init] Sync finished successfully.');
    } catch (err) {
      console.log('[Supabase Init Issue] Local database loaded instead:', err);
    }
  })();

  // Middleware to ensure DB is synced before handling API requests
  app.use('/api', async (req, res, next) => {
    // Wait for the background sync to finish before resolving any API handlers
    // Use a 5-second timeout to prevent Vercel 504 Gateway Timeout on cold starts
    try {
      await Promise.race([
        dbSyncPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Sync Timeout')), 8000))
      ]);
    } catch (err) {
      console.log('[API] Db sync taking too long or failed, serving from local cache map');
    }
    next();
  });

  // REST API Routes
  const apiRouter = express.Router();
  
  apiRouter.get('/health', (req, res) => {
    let dbType = 'local';
    if (process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL) {
      dbType = 'apps_script';
    } else if (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) {
      dbType = 'supabase';
    }
    res.json({ status: 'ok', database: 'connected', dbType });
  });

  apiRouter.get('/test', (req, res) => {
    res.json({ msg: 'API router works' });
  });

  apiRouter.post('/auth/login', async (req, res) => {
    // Robust parsing for Vercel edge/node environments where body might be raw
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    } else if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString()); } catch (e) {}
    }
    
    const username = body?.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    let user = db.users.find(u => u.username === username);
    
    // Fallback: If not found in local memory (which happens on Vercel cold starts before background sync finishes),
    // query Supabase directly to check if the user exists.
    if (!user) {
      try {
        // Retrieve fresh user list to ensure we don't miss recently created accounts or cold start delays
        const usersInDb = await safeSupabaseRead('users', db.users);
        const match = Array.isArray(usersInDb) ? usersInDb.find((u: any) => u.username === username) : undefined;
        if (match) {
          user = match;
          // We can also update our local memory db.users 
          db.users = usersInDb;
        } else {
          // AUTO REGISTER FALLBACK (Kemudahan untuk login)
          console.log(`[Login] User ${username} not found. Auto-registering for ease of access.`);
          const newUser = {
            id: String(Date.now()),
            username: username,
            password: 'password123',
            role: username.toLowerCase().includes('admin') || username.toLowerCase().includes('kurikulum') ? 'kurikulum' : 'guru',
            name: username.charAt(0).toUpperCase() + username.slice(1),
            nip: '-',
            nuptk: '-',
            gender: 'LAKI_LAKI',
            mapel: 'Umum'
          };
          await safeSupabaseWrite('users', 'insert', newUser);
          user = newUser;
          db.users.push(user);
        }
      } catch (err) {
        console.error('[Login] Error fetching from Supabase fallback:', err);
      }
    }

    if (user) {
      console.log(`[Login] Successfully resolved user ${user.username}. Sending response.`);
      res.json({ token: 'mock-jwt-token', user });
    } else {
      res.status(401).json({ error: 'User not found' });
    }
  });

  apiRouter.put('/auth/profile', async (req, res) => {
    const { id, name, photoUrl } = req.body;
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      db.users[userIndex] = { ...db.users[userIndex], name, photoUrl };
      await safeSupabaseWrite('users', 'update', db.users[userIndex], { col: 'id', val: id });
      res.json(db.users[userIndex]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  apiRouter.get('/teachers', (req, res) => {
    res.json(db.users.filter(u => u.role === 'GURU'));
  });

  apiRouter.post('/teachers', async (req, res) => {
    const newUser = { id: `guru_${Date.now()}`, role: 'GURU', username: `guru_${Date.now()}`, ...req.body };
    db.users.push(newUser);
    await safeSupabaseWrite('users', 'insert', newUser);
    res.json(newUser);
  });

  apiRouter.put('/teachers/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.users.findIndex(u => u.id === id && u.role === 'GURU');
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...req.body };
      await safeSupabaseWrite('users', 'update', db.users[idx], { col: 'id', val: id });
      res.json(db.users[idx]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  apiRouter.delete('/teachers/:id', async (req, res) => {
    const { id } = req.params;
    db.users = db.users.filter(u => !(u.id === id && u.role === 'GURU'));
    await safeSupabaseWrite('users', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  apiRouter.get('/dashboard/stats', (req, res) => {
    res.json(db.stats);
  });
  
  apiRouter.get('/dashboard/chart-data', (req, res) => {
    res.json({
      kehadiran: [
        { name: 'Senin', hadir: 310, sakit: 5, izin: 3 },
        { name: 'Selasa', hadir: 315, sakit: 2, izin: 1 },
        { name: 'Rabu', hadir: 308, sakit: 6, izin: 4 },
        { name: 'Kamis', hadir: 312, sakit: 3, izin: 3 },
        { name: 'Jumat', hadir: 318, sakit: 0, izin: 0 },
      ],
      kehadiranGuru: [
        { name: 'Senin', hadir: 42, izin: 2, sakit: 1 },
        { name: 'Selasa', hadir: 44, izin: 1, sakit: 0 },
        { name: 'Rabu', hadir: 40, izin: 3, sakit: 2 },
        { name: 'Kamis', hadir: 43, izin: 1, sakit: 1 },
        { name: 'Jumat', hadir: 45, izin: 0, sakit: 0 },
      ],
      aktivitasMengajar: [
        { name: 'Senin', terlaksana: 32, belum: 8 },
        { name: 'Selasa', terlaksana: 35, belum: 5 },
        { name: 'Rabu', terlaksana: 30, belum: 10 },
        { name: 'Kamis', terlaksana: 36, belum: 4 },
        { name: 'Jumat', terlaksana: 40, belum: 0 },
      ],
      pengisianJurnal: [
        { name: 'Minggu 1', disetujui: 150, direvisi: 10, telat: 5 },
        { name: 'Minggu 2', disetujui: 160, direvisi: 5, telat: 2 },
        { name: 'Minggu 3', disetujui: 155, direvisi: 8, telat: 4 },
        { name: 'Minggu 4', disetujui: 165, direvisi: 2, telat: 1 },
      ],
      mataPelajaran: [
        { name: 'Produktif', jam: 120 },
        { name: 'Normatif', jam: 60 },
        { name: 'Adaptif', jam: 80 },
        { name: 'Muatan Lokal', jam: 20 },
      ],
      keterlaksanaanKurikulum: [
        { name: 'Jul', persentase: 15 },
        { name: 'Agu', persentase: 30 },
        { name: 'Sep', persentase: 48 },
        { name: 'Okt', persentase: 65 },
        { name: 'Nov', persentase: 82 },
      ],
      supervisi: [
        { name: 'Pedagogik', skor: 85 },
        { name: 'Profesional', skor: 88 },
        { name: 'Kepribadian', skor: 90 },
        { name: 'Sosial', skor: 86 },
      ],
      nilai: [
        { name: 'Matematika', rataRata: 82 },
        { name: 'Fisika', rataRata: 76 },
        { name: 'Bahasa Indonesia', rataRata: 88 },
        { name: 'Kejuruan', rataRata: 92 },
        { name: 'Bahasa Inggris', rataRata: 80 }
      ],
      materi: [
        { mapel: 'Matematika', kelas: 'X TKJ 1', materi: 'Aljabar Lanjut', waktu: 'Hari ini, 08:00' },
        { mapel: 'Fisika', kelas: 'XI TKR 2', materi: 'Hukum Newton', waktu: 'Hari ini, 10:15' },
        { mapel: 'Pemrograman', kelas: 'XII RPL 1', materi: 'RESTful API', waktu: 'Kemarin, 09:30' },
        { mapel: 'Bahasa Inggris', kelas: 'X OTKP', materi: 'Narrative Text', waktu: 'Kemarin, 13:00' }
      ]
    });
  });

  apiRouter.get('/journals', (req, res) => {
    res.json(db.journals);
  });

  apiRouter.post('/journals', async (req, res) => {
    const newJournal = { id: `j${Date.now()}`, status: 'Submit', ...req.body };
    db.journals.push(newJournal);
    await safeSupabaseWrite('journals', 'insert', newJournal);
    res.json(newJournal);
  });

  apiRouter.put('/journals/:id/validate', async (req, res) => {
    const { id } = req.params;
    const { status, validatorNotes } = req.body;
    const journalIndex = db.journals.findIndex(j => j.id === id);
    if (journalIndex !== -1) {
      if (status) db.journals[journalIndex].status = status;
      if (validatorNotes !== undefined) db.journals[journalIndex].validatorNotes = validatorNotes;
      db.journals[journalIndex].validationHistory = db.journals[journalIndex].validationHistory || [];
      if (status) {
         db.journals[journalIndex].validationHistory.push({
           status,
           date: new Date().toISOString(),
           notes: validatorNotes || ''
         });
      }
      await safeSupabaseWrite('journals', 'update', db.journals[journalIndex], { col: 'id', val: id });
      res.json(db.journals[journalIndex]);
    } else {
      res.status(404).json({ error: 'Journal not found' });
    }
  });

  apiRouter.put('/journals/:id/submit', async (req, res) => {
    const { id } = req.params;
    const journalIndex = db.journals.findIndex(j => j.id === id);
    if (journalIndex !== -1) {
      db.journals[journalIndex].status = 'Submit';
      await safeSupabaseWrite('journals', 'update', db.journals[journalIndex], { col: 'id', val: id });
      res.json(db.journals[journalIndex]);
    } else {
      res.status(404).json({ error: 'Journal not found' });
    }
  });

  apiRouter.get('/supervisions', (req, res) => {
    res.json(db.supervisions);
  });

  apiRouter.post('/supervisions', async (req, res) => {
    const { teacherId } = req.body;
    const existingIndex = db.supervisions.findIndex(s => s.teacherId === teacherId);
    
    if (existingIndex > -1) {
      db.supervisions[existingIndex] = { ...db.supervisions[existingIndex], ...req.body };
      await safeSupabaseWrite('supervisions', 'update', db.supervisions[existingIndex], { col: 'teacherId', val: teacherId });
      res.json(db.supervisions[existingIndex]);
    } else {
      const newSupervision = { id: `s${Date.now()}`, ...req.body };
      db.supervisions.push(newSupervision);
      await safeSupabaseWrite('supervisions', 'insert', newSupervision);
      res.json(newSupervision);
    }
  });

  apiRouter.get('/students', (req, res) => {
    res.json(db.students);
  });

  apiRouter.post('/students', async (req, res) => {
    const newStudent = { id: `st${Date.now()}`, ...req.body };
    db.students.push(newStudent);
    await safeSupabaseWrite('students', 'insert', newStudent);
    res.json(newStudent);
  });

  apiRouter.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.students[idx] = { ...db.students[idx], ...req.body };
      await safeSupabaseWrite('students', 'update', db.students[idx], { col: 'id', val: id });
      res.json(db.students[idx]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  apiRouter.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    db.students = db.students.filter(s => s.id !== id);
    await safeSupabaseWrite('students', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for mapel
  apiRouter.get('/mapel', (req, res) => res.json(db.mapel));
  apiRouter.post('/mapel', async (req, res) => {
    const newRecord = { id: `m${Date.now()}`, ...req.body };
    db.mapel.push(newRecord);
    await safeSupabaseWrite('mapel', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/mapel/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.mapel.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.mapel[idx] = { ...db.mapel[idx], ...req.body };
      await safeSupabaseWrite('mapel', 'update', db.mapel[idx], { col: 'id', val: id });
      res.json(db.mapel[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/mapel/:id', async (req, res) => {
    const { id } = req.params;
    db.mapel = db.mapel.filter(x => x.id != id);
    await safeSupabaseWrite('mapel', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for tahun
  apiRouter.get('/tahun', (req, res) => res.json(db.tahun));
  apiRouter.post('/tahun', async (req, res) => {
    const newRecord = { id: `t${Date.now()}`, ...req.body };
    db.tahun.push(newRecord);
    await safeSupabaseWrite('tahun', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/tahun/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.tahun.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.tahun[idx] = { ...db.tahun[idx], ...req.body };
      await safeSupabaseWrite('tahun', 'update', db.tahun[idx], { col: 'id', val: id });
      res.json(db.tahun[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/tahun/:id', async (req, res) => {
    const { id } = req.params;
    db.tahun = db.tahun.filter(x => x.id != id);
    await safeSupabaseWrite('tahun', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for jurusan
  apiRouter.get('/jurusan', (req, res) => res.json(db.jurusan));
  apiRouter.post('/jurusan', async (req, res) => {
    const newRecord = { id: `j${Date.now()}`, ...req.body };
    db.jurusan.push(newRecord);
    await safeSupabaseWrite('jurusan', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/jurusan/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.jurusan.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.jurusan[idx] = { ...db.jurusan[idx], ...req.body };
      await safeSupabaseWrite('jurusan', 'update', db.jurusan[idx], { col: 'id', val: id });
      res.json(db.jurusan[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/jurusan/:id', async (req, res) => {
    const { id } = req.params;
    db.jurusan = db.jurusan.filter(x => x.id != id);
    await safeSupabaseWrite('jurusan', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for kelas
  apiRouter.get('/kelas', (req, res) => res.json(db.kelas));
  apiRouter.post('/kelas', async (req, res) => {
    const newRecord = { id: `k${Date.now()}`, ...req.body };
    db.kelas.push(newRecord);
    await safeSupabaseWrite('kelas', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/kelas/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.kelas.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.kelas[idx] = { ...db.kelas[idx], ...req.body };
      await safeSupabaseWrite('kelas', 'update', db.kelas[idx], { col: 'id', val: id });
      res.json(db.kelas[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/kelas/:id', async (req, res) => {
    const { id } = req.params;
    db.kelas = db.kelas.filter(x => x.id != id);
    await safeSupabaseWrite('kelas', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for jadwal
  apiRouter.get('/jadwal', (req, res) => res.json(db.jadwal));
  apiRouter.post('/jadwal', async (req, res) => {
    const newRecord = { id: `jad${Date.now()}`, ...req.body };
    db.jadwal.push(newRecord);
    await safeSupabaseWrite('jadwal', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/jadwal/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.jadwal.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.jadwal[idx] = { ...db.jadwal[idx], ...req.body };
      await safeSupabaseWrite('jadwal', 'update', db.jadwal[idx], { col: 'id', val: id });
      res.json(db.jadwal[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/jadwal/:id', async (req, res) => {
    const { id } = req.params;
    db.jadwal = db.jadwal.filter(x => x.id != id);
    await safeSupabaseWrite('jadwal', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Endpoints for events
  apiRouter.get('/events', (req, res) => res.json(db.events));
  apiRouter.post('/events', async (req, res) => {
    const newRecord = { id: `ev${Date.now()}`, ...req.body };
    db.events.push(newRecord);
    await safeSupabaseWrite('events', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/events/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.events.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.events[idx] = { ...db.events[idx], ...req.body };
      await safeSupabaseWrite('events', 'update', db.events[idx], { col: 'id', val: id });
      res.json(db.events[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    db.events = db.events.filter(x => x.id != id);
    await safeSupabaseWrite('events', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  // Extra generic users endpoint for UsersManage
  apiRouter.get('/users', (req, res) => res.json(db.users));
  apiRouter.post('/users', async (req, res) => {
    const newRecord = { id: `u${Date.now()}`, ...req.body };
    db.users.push(newRecord);
    await safeSupabaseWrite('users', 'insert', newRecord);
    res.json(newRecord);
  });
  apiRouter.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.users.findIndex(x => x.id == id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...req.body };
      await safeSupabaseWrite('users', 'update', db.users[idx], { col: 'id', val: id });
      res.json(db.users[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    db.users = db.users.filter(x => x.id != id);
    await safeSupabaseWrite('users', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  apiRouter.get('/pkl/locations', (req, res) => res.json(db.pklLocations));
  apiRouter.post('/pkl/locations', async (req, res) => {
    const newLoc = { id: `loc${Date.now()}`, ...req.body };
    db.pklLocations.push(newLoc);
    await safeSupabaseWrite('pkl_locations', 'insert', newLoc);
    res.json(newLoc);
  });
  apiRouter.put('/pkl/locations/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.pklLocations.findIndex(l => l.id === id);
    if (idx !== -1) {
      db.pklLocations[idx] = { ...db.pklLocations[idx], ...req.body };
      await safeSupabaseWrite('pkl_locations', 'update', db.pklLocations[idx], { col: 'id', val: id });
      res.json(db.pklLocations[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/pkl/locations/:id', async (req, res) => {
    const { id } = req.params;
    db.pklLocations = db.pklLocations.filter(l => l.id !== id);
    await safeSupabaseWrite('pkl_locations', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });
  
  apiRouter.get('/pkl/students', (req, res) => res.json(db.pklStudents));
  apiRouter.post('/pkl/students', async (req, res) => {
    const newStu = { id: `s${Date.now()}`, ...req.body };
    db.pklStudents.push(newStu);
    await safeSupabaseWrite('pkl_students', 'insert', newStu);
    res.json(newStu);
  });
  apiRouter.put('/pkl/students/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.pklStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.pklStudents[idx] = { ...db.pklStudents[idx], ...req.body };
      await safeSupabaseWrite('pkl_students', 'update', db.pklStudents[idx], { col: 'id', val: id });
      res.json(db.pklStudents[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/pkl/students/:id', async (req, res) => {
    const { id } = req.params;
    db.pklStudents = db.pklStudents.filter(s => s.id !== id);
    await safeSupabaseWrite('pkl_students', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });
  apiRouter.get('/pkl/laporan', (req, res) => res.json(db.pklLaporan));
  apiRouter.post('/pkl/laporan', async (req, res) => {
    const newLaporan = { id: `lap${Date.now()}`, ...req.body };
    db.pklLaporan.push(newLaporan);
    await safeSupabaseWrite('pkl_laporan', 'insert', newLaporan);
    res.json(newLaporan);
  });
  apiRouter.put('/pkl/laporan/:id', async (req, res) => {
    const { id } = req.params;
    const idx = db.pklLaporan.findIndex(l => l.id === id);
    if (idx !== -1) {
      db.pklLaporan[idx] = { ...db.pklLaporan[idx], ...req.body };
      await safeSupabaseWrite('pkl_laporan', 'update', db.pklLaporan[idx], { col: 'id', val: id });
      res.json(db.pklLaporan[idx]);
    } else res.status(404).json({ error: 'Not found' });
  });
  apiRouter.delete('/pkl/laporan/:id', async (req, res) => {
    const { id } = req.params;
    db.pklLaporan = db.pklLaporan.filter(l => l.id !== id);
    await safeSupabaseWrite('pkl_laporan', 'delete', null, { col: 'id', val: id });
    res.json({ success: true });
  });

  app.use('/api', apiRouter);
  // Fallback for Vercel if /api prefix is stripped or not present
  if (process.env.VERCEL) {
    app.use('/', apiRouter);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    (async () => {
      try {
        // Hide from Vercel's static analyzer to prevent massive bundle size
        const vitePath = 'vi' + 'te'; 
        const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePath);
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (e) {
        console.log('Skipping vite development server setup', e);
      }
    })();
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

export default app;
