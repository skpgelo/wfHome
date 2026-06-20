// webapps: https://script.google.com/macros/s/AKfycbxgJdlYeDX001cPK3malvuUq__Cuc9oKstKBDn4eBcioUZPIZuV1LirN9jhZqgPBVgC/exec
// spreadsheet: https://docs.google.com/spreadsheets/d/1URH184f_9MYbuY_PJkF2dFdbfEUFUVpTFPj-4D_n6v4/edit?gid=0#gid=0
// Fungsi untuk menyediakan data pegawai ke HTML saat halaman dimuat
function doGet() {
  return HtmlService.createHtmlOutput("Web App Berjalan Aktif.");
}

// Fungsi utama menerima data dari HTML Form
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetWFH = ss.getSheetByName("Sheet1"); // wfh sheet
    
    // 1. Generate No (Auto Increment)
    const lastRow = sheetWFH.getLastRow();
    let nextNo = 1;
    if (lastRow > 1) {
      const prevNo = sheetWFH.getRange(lastRow, 1).getValue();
      nextNo = Number(prevNo) + 1;
    }
    
    // 2. Generate Tanggal (Timestamp)
    const timestamp = new Date();
    
    // 3. Ambil Email dari Sesi Browser Pengakses
    const userEmail = Session.getActiveUser().getEmail() || "Tidak Terdeteksi (Gunakan Akun Google)";
    
    // 4. Proses Upload Gambar ke Drive (Gambar 1, 2, 3)
    const imgUrls = { Gambar_1: "", Gambar_2: "", Gambar_3: "" };
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    ["Gambar_1", "Gambar_2", "Gambar_3"].forEach((key) => {
      if (data[key] && data[key].length > 0) {
        let urls = [];
        data[key].forEach((fileData, index) => {
          // Format nama file: [ID]-[Timestamp]-[Index]
          const fileName = `${data.id}_${timestamp.getTime()}_${key}_${index + 1}`;
          const contentBlob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.type, fileName);
          const file = folder.createFile(contentBlob);
          urls.push(file.getUrl());
        });
        imgUrls[key] = urls.join(", "); // Jika ada 2 file, dipisahkan koma
      }
    });

    // 5. Susun Baris Data Sesuai Kolom Sheet1
    // No | Tanggal | Nama | Jabatan | id | Jabatan (ke-2) | Latitude | Longitude | Alamat | Email | Gambar_1 | Gambar_2 | Gambar_3
    const rowData = [
      nextNo,
      timestamp,
      data.Nama,
      data.Jabatan,
      data.id,
      data.Jabatan, // Pengulangan kolom Jabatan sesuai instruksi Anda
      data.Latitude,
      data.Longitude,
      data.Alamat,
      userEmail,
      imgUrls.Gambar_1,
      imgUrls.Gambar_2,
      imgUrls.Gambar_3
    ];
    
    sheetWFH.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data berhasil disimpan!" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi API pembantu untuk mengambil data dari Sheet2 'Pegawai' ke HTML Dropdown
function getPegawaiData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetPegawai = ss.getSheetByName("Pegawai");
  const data = sheetPegawai.getDataRange().getValues();
  
  // Baris 1 adalah header: No | Nama | id | Jabatan | Unit | Email
  let pegawaiList = [];
  for (let i = 1; i < data.length; i++) {
    if(data[i][1]) { // Jika kolom nama tidak kosong
      pegawaiList.push({
        nama: data[i][1],
        id: data[i][2],
        jabatan: data[i][3]
      });
    }
  }
  return pegawaiList;
}


