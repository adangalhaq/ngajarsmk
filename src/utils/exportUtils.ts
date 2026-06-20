import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Journal } from '../types';

export const exportToExcel = (journal: Journal) => {
  const wb = XLSX.utils.book_new();

  // 1. Absensi Sheet
  const absensiData = journal.absensiSiswa?.map((s, idx) => ({
    No: idx + 1,
    'Nama Siswa': s.studentName,
    Status: s.status
  })) || [];
  const wsAbsensi = XLSX.utils.json_to_sheet(absensiData);
  XLSX.utils.book_append_sheet(wb, wsAbsensi, 'Absensi Siswa');

  // 2. Penilaian Sheet
  const penilaianData = journal.penilaianSiswa?.map((s, idx) => {
    const row: any = {
      No: idx + 1,
      'Nama Siswa': s.studentName,
    };
    
    // Sumatif
    for (let i = 0; i < 10; i++) {
      row[`Sumatif ${i + 1}`] = s.sumatif[i] || '';
    }
    
    // Rata-rata Sumatif Materi
    const sumSumatifMateri = s.sumatif.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    const countSumatifMateri = s.sumatif.filter(val => val !== '').length;
    row['Rata-rata Sumatif Materi'] = countSumatifMateri > 0 ? (sumSumatifMateri / countSumatifMateri).toFixed(1) : '-';
    
    // SAS
    row['SAS Non Tes'] = s.sasNonTes || '';
    row['SAS Tes'] = s.sasTes || '';
    
    const sasNonTesVal = parseFloat(s.sasNonTes) || 0;
    const sasTesVal = parseFloat(s.sasTes) || 0;
    const hasSas = s.sasNonTes !== '' || s.sasTes !== '';
    let NASas = 0;
    if (s.sasNonTes !== '' && s.sasTes !== '') {
      NASas = (sasNonTesVal + sasTesVal) / 2;
    } else if (s.sasNonTes !== '') {
      NASas = sasNonTesVal;
    } else if (s.sasTes !== '') {
      NASas = sasTesVal;
    }
    row['NA Sumatif Akhir'] = hasSas ? NASas.toFixed(1) : '-';
    
    // Rapor
    let nilaiRapor = 0;
    const RataSumatifMateri = countSumatifMateri > 0 ? (sumSumatifMateri / countSumatifMateri) : 0;
    if (countSumatifMateri > 0 && hasSas) {
      nilaiRapor = (RataSumatifMateri + NASas) / 2;
    } else if (countSumatifMateri > 0) {
      nilaiRapor = RataSumatifMateri;
    } else if (hasSas) {
      nilaiRapor = NASas;
    }
    row['Nilai Rapor'] = nilaiRapor > 0 ? Math.round(nilaiRapor) : '-';
    row['Capaian Kompetensi'] = s.capaianKompetensi || '';

    return row;
  }) || [];
  
  if (penilaianData.length > 0) {
      const wsPenilaian = XLSX.utils.json_to_sheet(penilaianData);
      XLSX.utils.book_append_sheet(wb, wsPenilaian, 'Tugas & Penilaian');
  }

  XLSX.writeFile(wb, `Laporan_${journal.class}_${journal.date.replace(/\//g, '-')}.xlsx`);
};

export const exportToPdf = (journal: Journal) => {
  const doc = new jsPDF();
  
  doc.setFontSize(14);
  doc.text('Laporan Jurnal Guru', 10, 10);
  
  doc.setFontSize(10);
  doc.text(`Guru: ${journal.teacherName}`, 10, 20);
  doc.text(`Kelas: ${journal.class}`, 10, 25);
  doc.text(`Mata Pelajaran: ${journal.subject}`, 10, 30);
  doc.text(`Tanggal: ${journal.date}`, 10, 35);

  let finalY = 45;

  // Absensi Table
  if (journal.absensiSiswa && journal.absensiSiswa.length > 0) {
    doc.text('Absensi Siswa', 10, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['No', 'Nama Siswa', 'Status']],
      body: journal.absensiSiswa.map((s, idx) => [idx + 1, s.studentName, s.status]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  }

  // Penilaian Table
  if (journal.penilaianSiswa && journal.penilaianSiswa.length > 0) {
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }
    doc.text('Tugas & Penilaian', 10, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['No', 'Nama Siswa', 'Rata-rata Sumatif', 'NA SAS', 'Nilai Rapor', 'Capaian Kompetensi']],
      body: journal.penilaianSiswa.map((s, idx) => {
        const sumSumatifMateri = s.sumatif.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        const countSumatifMateri = s.sumatif.filter(val => val !== '').length;
        const RataSumatifMateri = countSumatifMateri > 0 ? (sumSumatifMateri / countSumatifMateri) : 0;
        
        const sasNonTesVal = parseFloat(s.sasNonTes) || 0;
        const sasTesVal = parseFloat(s.sasTes) || 0;
        const hasSas = s.sasNonTes !== '' || s.sasTes !== '';
        let NASas = 0;
        if (s.sasNonTes !== '' && s.sasTes !== '') {
          NASas = (sasNonTesVal + sasTesVal) / 2;
        } else if (s.sasNonTes !== '') {
          NASas = sasNonTesVal;
        } else if (s.sasTes !== '') {
          NASas = sasTesVal;
        }
        
        let nilaiRapor = 0;
        if (countSumatifMateri > 0 && hasSas) {
          nilaiRapor = (RataSumatifMateri + NASas) / 2;
        } else if (countSumatifMateri > 0) {
          nilaiRapor = RataSumatifMateri;
        } else if (hasSas) {
          nilaiRapor = NASas;
        }

        return [
          idx + 1,
          s.studentName,
          RataSumatifMateri > 0 ? RataSumatifMateri.toFixed(1) : '-',
          hasSas ? NASas.toFixed(1) : '-',
          nilaiRapor > 0 ? Math.round(nilaiRapor).toString() : '-',
          s.capaianKompetensi
        ];
      }),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
  }

  doc.save(`Laporan_${journal.class}_${journal.date.replace(/\//g, '-')}.pdf`);
};

export const exportPklLaporanToExcel = (laporan: any) => {
  const wb = XLSX.utils.book_new();

  // Rekap Info Laporan
  const infoData = [
    { 'Info': 'Nama Peserta Didik', 'Detail': laporan.studentName },
    { 'Info': 'NISN', 'Detail': laporan.nisn },
    { 'Info': 'Program Keahlian', 'Detail': laporan.programKeahlian },
    { 'Info': 'Tempat PKL', 'Detail': laporan.tempatPkl },
    { 'Info': 'Instruktur PKL', 'Detail': laporan.instruktur },
    { 'Info': 'Tanggal', 'Detail': `${laporan.tanggalMasuk} s.d. ${laporan.tanggalKeluar}` }
  ];
  const wsInfo = XLSX.utils.json_to_sheet(infoData);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Laporan');

  // Penilaian
  const penilaianData = laporan.tujuanPembelajaran.map((t: any, idx: number) => ({
    No: idx + 1,
    'Tujuan Pembelajaran': t.tujuan,
    Skor: t.skor,
    Deskripsi: t.deskripsi
  }));
  const wsPenilaian = XLSX.utils.json_to_sheet(penilaianData);
  XLSX.utils.book_append_sheet(wb, wsPenilaian, 'Penilaian');

  // Kehadiran
  const kehadiranData = [
    { 'Status': 'Sakit', 'Jumlah Hari': laporan.kehadiran.sakit },
    { 'Status': 'Izin', 'Jumlah Hari': laporan.kehadiran.izin },
    { 'Status': 'Tanpa Keterangan', 'Jumlah Hari': laporan.kehadiran.alpa },
    { 'Status': 'Total Hari Terjadwal', 'Jumlah Hari': laporan.kehadiran.jumlahHari }
  ];
  const wsKehadiran = XLSX.utils.json_to_sheet(kehadiranData);
  XLSX.utils.book_append_sheet(wb, wsKehadiran, 'Kehadiran');

  XLSX.writeFile(wb, `Laporan_Guru_Pembimbing_${laporan.studentName}.xlsx`);
};

export const exportPklLaporanToPdf = (laporan: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(14);
  doc.text('Laporan Guru Pembimbing', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Nama Peserta Didik: ${laporan.studentName}`, 15, 30);
  doc.text(`NISN: ${laporan.nisn}`, 15, 36);
  doc.text(`Program Keahlian: ${laporan.programKeahlian}`, 15, 42);
  doc.text(`Tempat PKL: ${laporan.tempatPkl}`, 15, 48);
  doc.text(`Instruktur PKL: ${laporan.instruktur}`, 15, 54);
  doc.text(`Tanggal PKL: ${laporan.tanggalMasuk} s.d. ${laporan.tanggalKeluar}`, 15, 60);

  let finalY = 70;

  // Compute scores
  let sum = 0; let count = 0;
  laporan.tujuanPembelajaran.forEach((tp: any) => { 
    const v = parseFloat(tp.skor); 
    if(!isNaN(v)) {sum+=v; count++;} 
  });
  const avg = count > 0 ? (sum / count).toFixed(1) : '0';
  
  const bodyTP = laporan.tujuanPembelajaran.map((t: any, idx: number) => [idx + 1, t.tujuan, t.skor, t.deskripsi]);
  bodyTP.push(['', 'TOTAL NILAI', sum.toString(), `Rata-rata: ${avg}`]);

  // Tujuan Pembelajaran Table
  doc.text('Penilaian Tujuan Pembelajaran', 15, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    head: [['No', 'Tujuan Pembelajaran', 'Skor', 'Deskripsi']],
    body: bodyTP,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  finalY = (doc as any).lastAutoTable.finalY + 10;

  if (laporan.catatan) {
      doc.setFont('helvetica', 'normal');
      doc.text('Catatan:', 15, finalY);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text(laporan.catatan, 15, finalY + 5, { maxWidth: 180 });
      finalY += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
  }

  // Kehadiran Table
  doc.text('Kehadiran', 15, finalY);
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Status Kehadiran', 'Jumlah Hari']],
    body: [
      ['Sakit', laporan.kehadiran.sakit],
      ['Izin', laporan.kehadiran.izin],
      ['Tanpa Keterangan', laporan.kehadiran.alpa],
      ['Total Hari', laporan.kehadiran.jumlahHari]
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }
  });
  finalY = (doc as any).lastAutoTable.finalY + 20;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // Signatures
  doc.text(`${laporan.tempatLaporan}, ${laporan.tanggalLaporan}`, 15, finalY);
  
  doc.text('Instruktur / Pembimbing Perusahaan', 15, finalY + 10);
  doc.text('Guru Pembimbing', 130, finalY + 10);

  // Digital signature visualization
  doc.setFont('times', 'italic');
  doc.setTextColor(0, 0, 150);
  
  if (laporan.ttdInstruktur && laporan.ttdInstruktur.startsWith('data:image')) {
    doc.addImage(laporan.ttdInstruktur, 'PNG', 15, finalY + 15, 30, 20);
  } else if (laporan.ttdInstruktur) {
    doc.text(`Terverifikasi secara digital`, 15, finalY + 25);
  }

  if (laporan.ttdGuru && laporan.ttdGuru.startsWith('data:image')) {
    doc.addImage(laporan.ttdGuru, 'PNG', 130, finalY + 15, 30, 20);
  } else if (laporan.ttdGuru) {
    doc.text(`Terverifikasi secara digital`, 130, finalY + 25);
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.text(`(${laporan.instruktur})`, 15, finalY + 40);
  doc.text(`(${laporan.guruPembimbing})`, 130, finalY + 40);

  doc.save(`Laporan_Guru_Pembimbing_${laporan.studentName}.pdf`);
};
