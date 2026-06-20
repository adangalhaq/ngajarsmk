-- PostgreSQL Schema for Supabase

CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    role VARCHAR,
    username VARCHAR UNIQUE
);

CREATE TABLE journals (
    id VARCHAR PRIMARY KEY,
    date DATE,
    "teacherId" VARCHAR,
    "teacherName" VARCHAR,
    subject VARCHAR,
    class VARCHAR,
    status VARCHAR,
    materi TEXT
);

CREATE TABLE supervisions (
    id VARCHAR PRIMARY KEY,
    "teacherId" VARCHAR,
    "teacherName" VARCHAR,
    supervisor VARCHAR,
    instrumen VARCHAR,
    score VARCHAR,
    date DATE,
    notes TEXT,
    rekomendasi TEXT
);

CREATE TABLE pkl_locations (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    address TEXT,
    quota INT,
    "pembimbingId" VARCHAR
);

CREATE TABLE pkl_students (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    nisn VARCHAR,
    "locationId" VARCHAR,
    status VARCHAR
);

CREATE TABLE pkl_laporan (
    id VARCHAR PRIMARY KEY,
    "studentId" VARCHAR,
    "studentName" VARCHAR,
    nisn VARCHAR,
    "programKeahlian" VARCHAR,
    "tempatPkl" VARCHAR,
    "tanggalMasuk" DATE,
    "tanggalKeluar" DATE,
    pembimbing VARCHAR,
    "tujuanPembelajaran" JSONB,
    kehadiran JSONB,
    "tanggalLaporan" DATE,
    "tempatLaporan" VARCHAR,
    "guruPembimbing" VARCHAR,
    instruktur VARCHAR,
    "ttdGuru" VARCHAR,
    "ttdInstruktur" VARCHAR
);

CREATE TABLE students (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    nisn VARCHAR,
    class VARCHAR
);

CREATE TABLE mapel (
    id VARCHAR PRIMARY KEY,
    kode VARCHAR,
    nama VARCHAR,
    kelompok VARCHAR,
    fase VARCHAR,
    semester VARCHAR,
    jam INT
);

CREATE TABLE tahun (
    id VARCHAR PRIMARY KEY,
    tahun VARCHAR,
    semester VARCHAR,
    status VARCHAR
);

CREATE TABLE jurusan (
    id VARCHAR PRIMARY KEY,
    kode VARCHAR,
    nama VARCHAR,
    bidang VARCHAR
);

CREATE TABLE kelas (
    id VARCHAR PRIMARY KEY,
    kode VARCHAR,
    nama VARCHAR,
    tingkat VARCHAR,
    jurusan VARCHAR,
    walikelas VARCHAR,
    tahun VARCHAR
);

CREATE TABLE jadwal (
    id VARCHAR PRIMARY KEY,
    hari VARCHAR,
    "jamKe" VARCHAR,
    guru VARCHAR,
    mapel VARCHAR,
    kelas VARCHAR,
    ruangan VARCHAR
);

CREATE TABLE events (
    id VARCHAR PRIMARY KEY,
    "dateStr" VARCHAR,
    type VARCHAR,
    title VARCHAR
);
