-- Disable referential integrity check if needed, though we drop if exists in correct order.
DROP TABLE IF EXISTS "students";
DROP TABLE IF EXISTS "pkl_laporan";
DROP TABLE IF EXISTS "pkl_students";
DROP TABLE IF EXISTS "pkl_locations";
DROP TABLE IF EXISTS "supervisions";
DROP TABLE IF EXISTS "journals";
DROP TABLE IF EXISTS "users";

-- Table: users
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "username" TEXT UNIQUE NOT NULL,
    "photoUrl" TEXT,
    "nip" TEXT,
    "nuptk" TEXT,
    "gender" TEXT,
    "mapel" TEXT
);

-- Table: journals
CREATE TABLE "journals" (
    "id" TEXT PRIMARY KEY,
    "date" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "materi" TEXT NOT NULL,
    "notes" TEXT,
    "absensiSiswa" JSONB,
    "refleksi" TEXT,
    "kendala" TEXT,
    "tindakLanjut" TEXT
);

-- Table: supervisions
CREATE TABLE "supervisions" (
    "id" TEXT PRIMARY KEY,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "instrumen" TEXT,
    "score" TEXT,
    "date" TEXT,
    "notes" TEXT,
    "rekomendasi" TEXT
);

-- Table: pkl_locations
CREATE TABLE "pkl_locations" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "pembimbingId" TEXT
);

-- Table: pkl_students
CREATE TABLE "pkl_students" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "locationId" TEXT,
    "status" TEXT NOT NULL
);

-- Table: pkl_laporan
CREATE TABLE "pkl_laporan" (
    "id" TEXT PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "nisn" TEXT,
    "programKeahlian" TEXT,
    "tempatPkl" TEXT,
    "tanggalMasuk" TEXT,
    "tanggalKeluar" TEXT,
    "pembimbing" TEXT,
    "tujuanPembelajaran" JSONB,
    "kehadiran" JSONB,
    "tanggalLaporan" TEXT,
    "tempatLaporan" TEXT,
    "guruPembimbing" TEXT,
    "instruktur" TEXT,
    "ttdGuru" TEXT,
    "ttdInstruktur" TEXT
);

-- Table: students
CREATE TABLE "students" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nisn" TEXT,
    "class" TEXT,
    "gender" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TEXT,
    "jurusan" TEXT,
    "tahunMasuk" TEXT
);

-- Table: mapel
CREATE TABLE "mapel" (
    "id" TEXT PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelompok" TEXT,
    "fase" TEXT,
    "semester" TEXT,
    "jam" INTEGER
);

-- Table: tahun
CREATE TABLE "tahun" (
    "id" TEXT PRIMARY KEY,
    "tahun" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- Table: jurusan
CREATE TABLE "jurusan" (
    "id" TEXT PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bidang" TEXT
);

-- Table: kelas
CREATE TABLE "kelas" (
    "id" TEXT PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" TEXT,
    "jurusan" TEXT,
    "walikelas" TEXT,
    "tahun" TEXT
);

-- Table: jadwal
CREATE TABLE "jadwal" (
    "id" TEXT PRIMARY KEY,
    "hari" TEXT NOT NULL,
    "jamKe" TEXT NOT NULL,
    "guru" TEXT NOT NULL,
    "mapel" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "ruangan" TEXT
);

-- Table: events
CREATE TABLE "events" (
    "id" TEXT PRIMARY KEY,
    "dateStr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL
);

-- Seed Initial Data for Demo
INSERT INTO "users" ("id", "name", "role", "username") VALUES 
('1', 'Super Admin', 'SUPER_ADMIN', 'superadmin'),
('2', 'Admin Sekolah', 'ADMIN', 'admin'),
('3', 'Budi Santoso', 'GURU', 'guru1'),
('3a', 'Dewi Lestari', 'GURU', 'guru2'),
('3b', 'Ahmad Dahlan', 'GURU', 'guru3'),
('4', 'Siti Aminah', 'WAKA_KURIKULUM', 'waka'),
('5', 'Kepala Sekolah', 'KEPALA_SEKOLAH', 'kepsek')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "events" ("id", "dateStr", "type", "title") VALUES
('1', '2026-8-5', 'pendidikan', 'Hari Pertama Sekolah'),
('2', '2026-8-10', 'kegiatan', 'Rapat Wali Murid'),
('3', '2026-8-17', 'libur', 'Hari Kemerdekaan RI'),
('4', '2026-8-24', 'ujian', 'Penilaian Tengah Semester'),
('5', '2026-8-25', 'ujian', 'Penilaian Tengah Semester'),
('h1', '2026-1-1', 'libur', 'Tahun Baru Masehi'),
('h2', '2026-2-18', 'libur', 'Isra Mikraj Nabi Muhammad SAW'),
('h3', '2026-3-3', 'libur', 'Hari Raya Nyepi'),
('h4', '2026-3-19', 'libur', 'Hari Raya Idul Fitri 1447 H'),
('h5', '2026-3-20', 'libur', 'Hari Raya Idul Fitri 1447 H'),
('h6', '2026-4-3', 'libur', 'Wafat Yesus Kristus'),
('h7', '2026-5-1', 'libur', 'Hari Buruh Internasional'),
('h8', '2026-5-14', 'libur', 'Kenaikan Yesus Kristus'),
('h9', '2026-5-26', 'libur', 'Hari Raya Waisak'),
('h10', '2026-5-27', 'libur', 'Hari Raya Idul Adha 1447 H'),
('h11', '2026-6-1', 'libur', 'Hari Lahir Pancasila'),
('h12', '2026-6-17', 'libur', 'Tahun Baru Islam 1448 H'),
('h13', '2026-8-26', 'libur', 'Maulid Nabi Muhammad SAW'),
('h14', '2026-12-25', 'libur', 'Hari Raya Natal')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "journals" ("id", "date", "teacherId", "teacherName", "subject", "class", "status", "materi") VALUES 
('j1', '2023-10-25', '3', 'Budi Santoso', 'Matematika', 'X TKJ 1', 'Submit', 'Aljabar'),
('j2', '2023-10-25', '3', 'Budi Santoso', 'Fisika', 'XI TKR 2', 'Draft', 'Hukum Newton')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "supervisions" ("id", "teacherId", "teacherName", "supervisor", "instrumen", "score", "date", "notes", "rekomendasi") VALUES 
('s1', '3', 'Budi Santoso', 'Kepala Sekolah', 'Instrumen Standar KBM', '85', '2023-10-20', 'Penyampaian materi baik, interaksi siswa aktif.', 'Tingkatkan penggunaan media interaktif.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "pkl_locations" ("id", "name", "address", "quota", "pembimbingId") VALUES 
('1', 'PT Telkom Indonesia', 'Jl. Ketintang, Surabaya', 5, '3'),
('2', 'PLN Persero', 'Jl. Pemuda, Surabaya', 3, '3a')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "pkl_students" ("id", "name", "nisn", "locationId", "status") VALUES 
('s1', 'Andi Saputra', '0051234567', '1', 'Aktif'),
('s2', 'Rina Amelia', '0057654321', '1', 'Aktif'),
('s3', 'Bimo Arya', '0061122334', '2', 'Aktif')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "students" ("id", "name", "nisn", "class") VALUES 
('st1', 'Alfi Syahrin', '005111', 'X TKJ 1'),
('st2', 'Bunga Citra', '005112', 'X TKJ 1'),
('st3', 'Candra Darmawan', '005113', 'X TKJ 1'),
('st4', 'Dini Marlina', '005114', 'XI TKR 2'),
('st5', 'Eka Pratama', '005115', 'XI TKR 2')
ON CONFLICT ("id") DO NOTHING;
