const SPREADSHEET_ID = 'MASUKAN_ID_GOOGLE_SHEET_ANDA_DISINI'; // Contoh: 1A2b3C4d5E6f7G8h9I0j

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doGet(e) {
  return handleRequest(e, 'GET');
}

function handleRequest(e, method) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    // Menangani Preflight request (OPTIONS) jika ada
    if (e.postData && e.postData.type === "application/json" && method === 'OPTIONS') {
       return createResponse(200, { status: 'ok' }, headers);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let action = e.parameter.action;
    let table = e.parameter.table;
    
    // Parsing payload body jika ada (biasanya untuk POST)
    let body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
      action = body.action || action;
      table = body.table || table;
    }

    if (!action) {
      return createResponse(200, { message: "Google Apps Script API is running!", method: method }, headers);
    }

    if (!table) {
      return createResponse(400, { error: "Parameter 'table' tidak ditemukan (contoh: users, journals)" }, headers);
    }

    const sheet = ss.getSheetByName(table);
    if (!sheet) {
      return createResponse(404, { error: `Sheet dengan nama '${table}' tidak ditemukan` }, headers);
    }

    // Routing berdasarkan Action
    if (action === 'read') {
      const data = readData(sheet);
      
      // Jika ada filter by id atau dll
      let filteredData = data;
      if (e.parameter.id) {
          filteredData = data.filter(row => row.id == e.parameter.id);
      } else if (body.query) {
          // Menangani query filter sederhana dari client
          const keys = Object.keys(body.query);
          filteredData = data.filter(row => {
             return keys.every(key => row[key] == body.query[key]);
          });
      }
      return createResponse(200, { data: filteredData }, headers);
    } 
    
    else if (action === 'insert' && method === 'POST') {
      const newData = body.data;
      if (!newData) return createResponse(400, { error: "Data untuk insert tidak ditemukan" }, headers);
      
      const inserted = insertData(sheet, newData);
      return createResponse(200, { message: "Data berhasil ditambahkan", data: inserted }, headers);
    }
    
    else if (action === 'update' && method === 'POST') {
      const id = body.id;
      const updates = body.data;
      if (!id || !updates) return createResponse(400, { error: "ID dan Data update harus disertakan" }, headers);
      
      const updated = updateData(sheet, id, updates);
      if (updated) {
        return createResponse(200, { message: "Data berhasil diupdate", data: updated }, headers);
      } else {
        return createResponse(404, { error: `Data dengan ID ${id} tidak ditemukan untuk diupdate` }, headers);
      }
    }
    
    else if (action === 'delete' && method === 'POST') {
      const id = body.id;
      if (!id) return createResponse(400, { error: "ID harus disertakan untuk delete" }, headers);
      
      const deleted = deleteData(sheet, id);
      if (deleted) {
        return createResponse(200, { message: "Data berhasil dihapus" }, headers);
      } else {
        return createResponse(404, { error: `Data dengan ID ${id} tidak ditemukan untuk dihapus` }, headers);
      }
    }
    
    else {
      return createResponse(400, { error: `Action '${action}' tidak valid` }, headers);
    }

  } catch (error) {
    return createResponse(500, { error: error.toString() }, headers);
  }
}

// === Helper Functions ===

// Helper untuk membaca sheet menjadi Array of JSON Objects
function readData(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // Hanya header atau kosong
  
  const headers = values[0];
  const items = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    items.push(item);
  }
  return items;
}

// Helper untuk menambah data row
function insertData(sheet, dataObj) {
  const headers = sheet.getDataRange().getValues()[0];
  
  // Jika tidak ada data sama sekali tapi sheet dipanggil
  if (!headers || headers.length === 0) {
     throw new Error("Sheet tidak memiliki header. Buat minimal kolom 'id' di baris 1");
  }

  // Buat array data baru sesuai urutan header
  const newRow = [];
  
  // Jika objek tersebut tidak memiliki ID, buatkan ID unik 
  // (Sebaiknya dari sisi aplikasi yang men-generate ID seperti UUID)
  if (!dataObj.id && headers.includes('id')) {
    dataObj.id = Utilities.getUuid();
  }

  // Isi array sesuai nama header
  headers.forEach(header => {
    // Tangani nilai undefined menjadi string kosong
    newRow.push(dataObj[header] !== undefined ? dataObj[header] : "");
  });
  
  sheet.appendRow(newRow);
  return dataObj;
}

// Helper untuk mengupdate baris yang cocok berdasarkan 'id'
function updateData(sheet, id, updatesObj) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) throw new Error("Header 'id' tidak ditemukan di tabel");
  
  // Cari baris berdasarkan id
  let targetRowIndex = -1;
  const currentData = {};
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) { // Menggunakan == (loose equality)
      targetRowIndex = i;
      // Simpan data lama
      for(let j=0; j<headers.length; j++) {
         currentData[headers[j]] = values[i][j];
      }
      break;
    }
  }
  
  if (targetRowIndex === -1) return null; // Tidak ditemukan
  
  // Gabungkan old data dengan updates
  const mergedData = { ...currentData, ...updatesObj };
  mergedData.id = id; // Pastikan id tidak tertimpa
  
  // Siapkan array data update
  const updatedRow = [];
  headers.forEach(header => {
    updatedRow.push(mergedData[header] !== undefined ? mergedData[header] : "");
  });
  
  // Simpan kembali ke sheet (ingat index SpreadsheetApp dimulai dari 1 sehingga baris pada variabel values harus + 1)
  sheet.getRange(targetRowIndex + 1, 1, 1, headers.length).setValues([updatedRow]);
  
  return mergedData;
}

// Helper untuk menghapus data berdasarkan id
function deleteData(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) throw new Error("Header 'id' tidak ditemukan di tabel");
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) {
      sheet.deleteRow(i + 1); // Spreadsheet baris dimulai dari 1
      return true;
    }
  }
  return false;
}

// Format Respon HTTP
function createResponse(statusCode, bodyObject, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(bodyObject));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
