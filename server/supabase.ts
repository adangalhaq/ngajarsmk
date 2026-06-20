import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

// Use user's configured env secrets or default fallback database.
// Never override/hijack the user's custom credentials if they are provided!
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://fjsvebfvgacuaiymtqau.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqc3ZlYmZ2Z2FjdWFpeW10cWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTg1MjcsImV4cCI6MjA5NzM5NDUyN30.sx2pnuuuE9CPI1gLe5VIc1boxzP9NT3Ex-e91bVdaos';

const ACTIVE_URL = SUPABASE_URL;
const ACTIVE_KEY = SUPABASE_ANON_KEY;

console.log(`[Supabase] Initializing client...`);
console.log(`[Supabase] Database URL: ${ACTIVE_URL}`);
if (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) {
  console.log(`[Supabase] Connected to CUSTOM database from environment variables.`);
} else {
  console.log(`[Supabase] No custom SUPABASE_URL found in environment variables. Using default fallback database.`);
}

let supabaseClient: any = null;

try {
  supabaseClient = createClient(ACTIVE_URL, ACTIVE_KEY, {
    auth: {
      persistSession: false
    }
  });
  console.log('[Supabase] Client initialized successfully.');
} catch (err) {
  console.log('[Supabase] Failed to initialize client:', err);
}

export const supabase = supabaseClient;

const TABLE_SCHEMAS: Record<string, string[]> = {
  users: ['id', 'name', 'role', 'username', 'photoUrl', 'nip', 'nuptk', 'gender', 'mapel'],
  journals: ['id', 'date', 'teacherId', 'teacherName', 'subject', 'class', 'status', 'materi', 'notes', 'absensiSiswa', 'refleksi', 'kendala', 'tindakLanjut'],
  supervisions: ['id', 'teacherId', 'teacherName', 'supervisor', 'instrumen', 'score', 'date', 'notes', 'rekomendasi'],
  pkl_locations: ['id', 'name', 'address', 'quota', 'pembimbingId'],
  pkl_students: ['id', 'name', 'nisn', 'locationId', 'status'],
  pkl_laporan: ['id', 'studentId', 'studentName', 'nisn', 'programKeahlian', 'tempatPkl', 'tanggalMasuk', 'tanggalKeluar', 'pembimbing', 'tujuanPembelajaran', 'kehadiran', 'tanggalLaporan', 'tempatLaporan', 'guruPembimbing', 'instruktur', 'ttdGuru', 'ttdInstruktur'],
  students: ['id', 'name', 'nisn', 'class', 'gender', 'tempatLahir', 'tanggalLahir', 'jurusan', 'tahunMasuk'],
  mapel: ['id', 'kode', 'nama', 'kelompok', 'fase', 'semester', 'jam'],
  tahun: ['id', 'tahun', 'semester', 'status'],
  jurusan: ['id', 'kode', 'nama', 'bidang'],
  kelas: ['id', 'kode', 'nama', 'tingkat', 'jurusan', 'walikelas', 'tahun'],
  jadwal: ['id', 'hari', 'jamKe', 'guru', 'mapel', 'kelas', 'ruangan'],
  events: ['id', 'dateStr', 'type', 'title']
};

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || process.env.VITE_APPS_SCRIPT_URL || '';

/**
 * High-reliability utility to try saving a record.
 * Supports Supabase, or falls back to Google Apps Script API if configured.
 */
export async function safeSupabaseWrite(table: string, action: 'insert' | 'update' | 'upsert' | 'delete', data: any, queryFilter?: { col: string; val: any }) {
  // Auto-sanitize data
  let cleanData = data;
  if (data && TABLE_SCHEMAS[table]) {
    const allowedKeys = TABLE_SCHEMAS[table];
    cleanData = {};
    for (const key of Object.keys(data)) {
      if (allowedKeys.includes(key)) {
        cleanData[key] = data[key];
      }
    }
  }

  // Jika Apps Script URL di set
  if (APPS_SCRIPT_URL) {
    try {
      const payload = {
        action: action === 'upsert' ? (queryFilter ? 'update' : 'insert') : action,
        table: table,
        data: cleanData,
        id: queryFilter?.col === 'id' ? queryFilter.val : cleanData.id || undefined
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        // Also ensure we parse correctly just in case
        const text = await res.text();
        try {
          const result = JSON.parse(text);
          if (result.error) throw new Error(result.error);
        } catch(e) {
          // not json, but res.ok is true
        }
        return true;
      }
      return false;
    } catch(err) {
      console.error(`[Apps Script Write Error ${table}]:`, err);
      return false;
    }
  }

  // Jika Apps Script tidak ada, jalankan default Supabase
  if (!supabase) return null;
  
  try {
    let query = supabase.from(table);
    let asyncWrite;
    
    if (action === 'insert') {
      asyncWrite = query.insert(cleanData);
    } else if (action === 'update') {
      if (queryFilter) {
        asyncWrite = query.update(cleanData).eq(queryFilter.col, queryFilter.val);
      } else {
        asyncWrite = query.update(cleanData);
      }
    } else if (action === 'upsert') {
      asyncWrite = query.upsert(cleanData);
    } else if (action === 'delete') {
      if (queryFilter) {
        asyncWrite = query.delete().eq(queryFilter.col, queryFilter.val);
      }
    }
    
    if (asyncWrite && typeof asyncWrite.catch === 'function') {
      asyncWrite = asyncWrite.catch((e: any) => { return { error: e }; });
    }
    
    // Set a reliable timeout (e.g. 10s) suitable for Vercel limits and cold starts.
    const TIMEOUT_MS = 10000;
    // @ts-ignore
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), TIMEOUT_MS));

    
    // @ts-ignore
    const result = await Promise.race([asyncWrite, timeoutPromise]);
    
    if (result?.error) {
      console.error(`[Supabase Write Error on ${table}]:`, result.error);
      return false;
    }
    return true;
  } catch (err: any) {
    if (err.message === 'Supabase request timeout') {
      console.error(`[Supabase] Timeout on writing table ${table}, falling back.`);
    } else {
      console.error(`[Supabase Write Exception on ${table}]:`, err);
    }
    return false;
  }
}

/**
 * Fetch list from database, falls back to local data if table doesn't exist
 */
export async function safeSupabaseRead(table: string, fallbackData: any[]): Promise<any[]> {
  // Jika Apps Script URL di set, baca dari SpreadSheet
  if (APPS_SCRIPT_URL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${APPS_SCRIPT_URL}?action=read&table=${table}`, { 
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = await res.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error(`[Apps Script Read Error ${table}]: Response is not valid JSON. Response starts with:`, text.substring(0, 100));
          return fallbackData;
        }
        if (result && result.data && Array.isArray(result.data)) {
          console.log(`[Apps Script Info] Synced ${result.data.length} records successfully from table "${table}"`);
          return result.data.length > 0 ? result.data : fallbackData;
        }
      }
      return fallbackData;
    } catch(err) {
      console.error(`[Apps Script Read Error ${table}]:`, err);
      return fallbackData;
    }
  }

  // Jika Apps Script tidak ada, jalankan default Supabase
  if (!supabase) return fallbackData;
  try {
    const supabasePromise = supabase.from(table).select('*').catch((e) => { return { data: null, error: e }; });
    const TIMEOUT_MS = 10000;
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), TIMEOUT_MS));
    
    // @ts-ignore
    const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
    
    if (error) {
      console.error(`[Supabase Read Error on ${table}]:`, error);
      return fallbackData;
    }
    if (data) {
      console.log(`[Supabase Info] Synced ${data.length} records successfully from table "${table}"`);
      return data;
    }
    return fallbackData;
  } catch (err: any) {
    if (err.message === 'Supabase request timeout') {
      console.error(`[Supabase] Timeout on reading table ${table}, falling back to local memory.`);
    }
    return fallbackData;
  }
}
