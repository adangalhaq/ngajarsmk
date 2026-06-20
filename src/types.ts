export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GURU' | 'WAKA_KURIKULUM' | 'KEPALA_SEKOLAH';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  photoUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export interface Journal {
  id: string;
  date: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  class: string;
  jamPelajaran?: string;
  materi: string;
  tujuanPembelajaran?: string;
  capaianPembelajaran?: string;
  metodePembelajaran?: string;
  mediaPembelajaran?: string;
  penilaianSiswa?: {
    studentId: string;
    studentName: string;
    sumatif: string[];
    sasNonTes: string;
    sasTes: string;
    capaianKompetensi: string;
  }[];
  absensiSiswa?: {
    studentId: string;
    studentName: string;
    status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';
  }[];
  buktiPembelajaran?: string;
  status: 'Draft' | 'Submit' | 'Disetujui' | 'Revisi' | 'Ditolak' | 'Diverifikasi';
  validatorNotes?: string;
  refleksi?: string;
  kendala?: string;
  tindakLanjut?: string;
  validationHistory?: {
    status: string;
    date: string;
    notes: string;
  }[];
}

export interface DashboardStats {
  totalGuru: number;
  totalKelas: number;
  totalMapel: number;
  jurnalHariIni: number;
  guruHadir: number;
  guruBelumIsi: number;
  persentaseKeterlaksanaan: number;
  kehadiranSiswa: number;
  rataRataNilai: number;
  totalMateri: number;
}
