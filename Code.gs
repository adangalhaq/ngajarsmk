// ==========================================
// KONFIGURASI
// ==========================================
// Ganti dengan ID Spreadsheet Anda (jika kosong, akan menggunakan spreadsheet yang sedang aktif saat setup)
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet() ? SpreadsheetApp.getActiveSpreadsheet().getId() : 'MASU1H3FozasmcjcODA18Wig9uE0HPIrYPS4Qk6XteC7ayFcKAN_ID_GOOGLE_SHEET_ANDA_DISINI'; 

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
  
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);
  
  // Create an admin user if it's completely empty
  let usersSheet = ss.getSheetByName('users');
  if (usersSheet) {
     const currentUsers = usersSheet.getDataRange().getValues();
     if (currentUsers.length === 1) {
         // Create default admin user
         usersSheet.appendRow(['admin123', 'admin', 'password', 'kurikulum', 'Administrator', '-', '-', 'LAKI_LAKI', 'Semua', '']);
         // Create default teacher user
         usersSheet.appendRow(['guru123', 'guru1', 'password', 'guru', 'Guru 1', '-', '-', 'LAKI_LAKI', 'Umum', '']);
     }
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
  // Jika diakses melalui browser langsung tanpa parameter, tampilkan halaman HTML
  // (Pastikan Anda telah membuat file HTML dengan nama "Index" di dalam Google Apps Script ini, lalu salin isi file google-apps-script-index.html ke dalamnya)
  if (!e.parameter.action && !e.parameter.table) {
    return HtmlService.createHtmlOutputFromFile('index.html');
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
      const newData = body.data;
      if (!newData) return createResponse(400, { error: "Data for insert/update not found" }, headers);
      if (!newData.id) newData.id = Utilities.getUuid(); 
      
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
  let output = ContentService.createTextOutput(JSON.stringify(bodyObject));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
