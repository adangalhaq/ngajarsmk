# Panduan Integrasi Google Apps Script & Google Sheets

Untuk mengganti backend database aplikasi Anda dari Supabase ke Google Sheets, Anda perlu membuat project Google Apps Script yang terhubung ke sebuah Spreadsheet.

Silakan ikuti langkah-langkah di bawah ini:

## Langkah 1: Buat Google Sheet dan Apps Script
1. Buka [Google Sheets](https://sheets.new/) dan buat spreadsheet kosong baru.
2. Beri nama spreadsheet Anda (misal: "Database Aplikasi Jurnal").
3. Klik menu **Ekstensi > Apps Script**.
4. Anda akan dialihkan ke editor Apps Script.

## Langkah 2: Salin Kode ke `Code.gs`
1. Di editor Apps Script, Anda akan melihat file bernama `Code.gs`.
2. Hapus semua kode default dan salin-tempel kode di bawah ini ke dalam `Code.gs`:

```javascript
// ==========================================
// KONFIGURASI
// ==========================================
// Ganti dengan ID Spreadsheet Anda (jika kosong, akan menggunakan spreadsheet yang sedang aktif saat setup)
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet() ? SpreadsheetApp.getActiveSpreadsheet().getId() : 'MASUKAN_ID_GOOGLE_SHEET_ANDA_DISINI'; 

// ==========================================
// SETUP DATABASE (Jalankan sekali saja)
// ==========================================
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Daftar tabel yang akan dibuat beserta kolomnya
  const tables = {
    'users': ['id', 'username', 'password', 'role', 'name', 'nip', 'nuptk', 'gender', 'mapel', 'photoUrl'],
    'journals': ['id', 'userId', 'userName', 'dateStr', 'topic', 'duration', 'activity', 'absentStudents', 'photoUrl', 'createdAt', 'role', 'schoolLevel'],
    'supervisions': ['id', 'supervisorName', 'teacherName', 'dateStr', 'subject', 'notes', 'score', 'status', 'createdAt', 'role'],
    'pkl_locations': ['id', 'name', 'address', 'companyName', 'contactPerson', 'contactPhone', 'industryType', 'status'],
    'pkl_students': ['id', 'name', 'nisn', 'class', 'pklLocationId', 'pklLocationName', 'mentorName', 'status', 'startDate', 'endDate'],
    'pkl_laporan': ['id', 'studentId', 'studentName', 'pklLocationId', 'pklLocationName', 'dateStr', 'activity', 'photoUrl', 'status', 'notes', 'verifiedBy', 'verifiedAt', 'createdAt'],
    'events': ['id', 'dateStr', 'type', 'title']
  };

  for (const [tableName, columns] of Object.entries(tables)) {
    let sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
      sheet.appendRow(columns);
      // Format header menjadi tebal
      sheet.getRange(1, 1, 1, columns.length).setFontWeight("bold");
    } else {
      // Jika sheet sudah ada, pastikan header ada
      const currentData = sheet.getDataRange().getValues();
      if (currentData.length === 0) {
        sheet.appendRow(columns);
        sheet.getRange(1, 1, 1, columns.length).setFontWeight("bold");
      }
    }
  }
  
  // Hapus "Sheet1" bawaan jika masih ada
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }
  
  Logger.log('Setup Database Selesai!');
  return "Database Berhasil Dibuat!";
}

// ==========================================
// API HANDLERS (Untuk menerima HTTP Request)
// ==========================================
function doPost(e) {
  return handleRequest(e, 'POST');
}

function doGet(e) {
  // Jika diakses melalui browser langsung, kembalikan halaman HTML sederhana
  if (!e.parameter.action && !e.parameter.table) {
    return HtmlService.createHtmlOutputFromFile('Index');
  }
  return handleRequest(e, 'GET');
}

function handleRequest(e, method) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    if (e.postData && e.postData.type === "application/json" && method === 'OPTIONS') {
       return createResponse(200, { status: 'ok' }, headers);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let action = e.parameter.action;
    let table = e.parameter.table;
    
    let body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
      action = body.action || action;
      table = body.table || table;
    }

    if (!action) return createResponse(200, { message: "API is running!" }, headers);
    if (!table) return createResponse(400, { error: "Parameter 'table' tidak ditemukan" }, headers);

    const sheet = ss.getSheetByName(table);
    if (!sheet) return createResponse(404, { error: `Table '${table}' tidak ditemukan` }, headers);

    if (action === 'read') {
      const data = readData(sheet);
      return createResponse(200, { data: data }, headers);
    } 
    else if ((action === 'insert' || action === 'add' || action === 'update' || action === 'upsert') && method === 'POST') {
      // Upsert logic (insert or update)
      const newData = body.data;
      if (!newData) return createResponse(400, { error: "Data for insert/update not found" }, headers);
      if (!newData.id) newData.id = Utilities.getUuid(); // Add ID if not exists
      
      const values = sheet.getDataRange().getValues();
      const headers_row = values[0] || [];
      const idIndex = headers_row.indexOf('id');
      
      let targetRowIndex = -1;
      if (idIndex !== -1 && body.id) {
        for (let i = 1; i < values.length; i++) {
          if (values[i][idIndex] == body.id || values[i][idIndex] == newData.id) {
            targetRowIndex = i;
            break;
          }
        }
      }

      if (targetRowIndex !== -1) {
        // Update
        const currentData = {};
        for(let j=0; j<headers_row.length; j++) currentData[headers_row[j]] = values[targetRowIndex][j];
        const mergedData = { ...currentData, ...newData };
        if (body.id) mergedData.id = body.id;
        
        const updatedRow = headers_row.map(h => mergedData[h] !== undefined ? mergedData[h] : "");
        sheet.getRange(targetRowIndex + 1, 1, 1, headers_row.length).setValues([updatedRow]);
        return createResponse(200, { message: "Updated", data: mergedData }, headers);
      } else {
        // Insert
        const newRow = headers_row.map(h => newData[h] !== undefined ? newData[h] : "");
        sheet.appendRow(newRow);
        return createResponse(200, { message: "Inserted", data: newData }, headers);
      }
    }
    else if (action === 'delete' && method === 'POST') {
      const id = body.id || (body.data && body.data.id);
      if (!id) return createResponse(400, { error: "ID required for delete" }, headers);
      
      const deleted = deleteData(sheet, id);
      return deleted ? createResponse(200, { message: "Deleted" }, headers) : createResponse(404, { error: "Not found" }, headers);
    }
    else {
      return createResponse(400, { error: `Invalid action: ${action}` }, headers);
    }
  } catch (error) {
    return createResponse(500, { error: error.toString(), stack: error.stack }, headers);
  }
}

function readData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; 
  const headers = values[0];
  const items = [];
  for (let i = 1; i < values.length; i++) {
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = values[i][j];
    }
    items.push(item);
  }
  return items;
}

function deleteData(sheet, id) {
  const values = sheet.getDataRange().getValues();
  if(values.length <= 1) return false;
  const idIndex = values[0].indexOf('id');
  if (idIndex === -1) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function createResponse(statusCode, bodyObject, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(bodyObject));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
```

## Langkah 3: Buat File `Index.html`
1. Di editor Apps Script, pada menu kiri "File", klik tanda `+` (Tambah File).
2. Pilih **HTML** dan beri nama file **Index** (huruf 'I' besar).
3. Salin-tempel kode di bawah ini ke dalam file `Index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <title>Database Aplikasi Jurnal (API Aktif)</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 2rem; color: #1f2937; text-align: center; }
      .card { background-color: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
      h1 { color: #10b981; }
      p { font-size: 1.1rem; line-height: 1.6; }
      .url-box { background-color: #f1f5f9; padding: 1rem; border-radius: 5px; word-break: break-all; margin: 1.5rem 0; font-family: monospace; border: 1px solid #cbd5e1; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✅ Google Apps Script API Berjalan</h1>
      <p>Ini adalah halaman utama dari Web App. Database Google Sheets yang terhubung bertindak sebagai backend API untuk Aplikasi Jurnal Anda.</p>
      <p>URL Web App ini dapat dipasang pada file konfigurasi aplikasi React (environment variabel <code>APPS_SCRIPT_URL</code>).</p>
      <div style="margin-top: 2rem; color: #64748b; font-size: 0.9rem;">
        Halaman ini dibuat sebagai penanda bahwa proses deployment berhasil.
      </div>
    </div>
  </body>
</html>
```

## Langkah 4: Jalankan Setup Database
1. Buka kembali file **`Code.gs`** di Editor.
2. Di bagian atas menu (sebelah kanan tombol "Run / Jalankan"), pastikan fungsi yang terpilih dari dropdown adalah **`setupDatabase`**.
3. Klik tombol **Run (Jalankan)**.
4. Anda akan diminta memberikan **Izin Akses (Authorization)**:
   - Klik **Review permissions**.
   - Pilih akun Google Anda.
   - Klik **Advanced (Lanjutan)** > Pilih **Go to Untitled project (unsafe) / Buka project (tidak aman)**.
   - Klik **Allow (Izinkan)**.
5. Setup database telah selesai! Buka Spreadsheet Anda, tab tabel seperti `users`, `journals`, dll akan otomatis dibuat. (Silahkan isi 1 atau 2 user secara manual di sheet `users` sebagai data login awal - jika ingin menggunakan id lokal, silang dulu sheetnya).

## Langkah 5: Publish Menjadi Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy (Terapkan) > New deployment (Deployment baru)**.
2. Di jendela popup:
   - Pada ikon roda gigi biru (Pilih Jenis), ceklis **Web app**.
   - Deskripsi: Ketik `Versi 1.0`
   - Execute as (Jalankan sebagai): **Me / Diri Saya**
   - Who has access (Siapa yang memiliki akses): **Anyone / Siapa saja** (PENTING: Jangan pilih yang lain, agar API bisa diakses).
3. Klik **Deploy**.
4. Akan muncul `Web app URL` (berawal dari `https://script.google.com/macros/s/.../exec`).
5. **SALIN URL TERSEBUT**.

## Langkah 6: Masukkan URL ke Aplikasi
1. Buka aplikasi Anda (atau repository Github / Vercel).
2. Tambahkan URL tersebut ke file `.env` (atau di "Environment Variables" Vercel Anda):

```env
APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycby.../exec"
```
3. Jika variabel ini sudah diset, aplikasi akan **otomatis** membaca dan menyimpan data ke Google Sheets menggantikan Supabase.
