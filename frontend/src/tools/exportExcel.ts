import * as XLSX from 'xlsx';

export const exportToExcel = (data: any, filename: string) => {
  let wsData: any[] = [];
  
  if (filename.includes('Buku_Besar')) {
    wsData = data.map((d: any) => ({
      'Tanggal': d.date,
      'Referensi': d.ref,
      'Keterangan': d.description,
      'Debit': d.debit,
      'Kredit': d.credit,
      'Saldo': d.balance
    }));
  } else if (filename.includes('Jurnal_Umum')) {
    data.forEach((j: any) => {
      j.entries.forEach((e: any, idx: number) => {
        wsData.push({
          'Tanggal': idx === 0 ? j.date : '',
          'Referensi': idx === 0 ? j.ref : '',
          'Keterangan': e.accountName,
          'Ref Akun': e.accountCode,
          'Debit': e.debit || 0,
          'Kredit': e.credit || 0
        });
      });
    });
  } else if (filename.includes('Neraca_Saldo')) {
    wsData = data.map((d: any) => ({
      'Kode Akun': d.kode,
      'Nama Akun': d.nama,
      'Debit': d.debit,
      'Kredit': d.credit
    }));
  } else if (filename.includes('Laba_Rugi')) {
    wsData.push({'Keterangan': 'Penjualan', 'Nominal': data.penjualan});
    wsData.push({'Keterangan': 'Harga Pokok Penjualan', 'Nominal': data.hpp});
    wsData.push({'Keterangan': 'Laba Kotor', 'Nominal': data.labaKotor});
    wsData.push({'Keterangan': '', 'Nominal': ''});
    wsData.push({'Keterangan': 'Beban-Beban:', 'Nominal': ''});
    if (data.beban && Array.isArray(data.beban)) {
       data.beban.forEach((b: any) => {
          wsData.push({'Keterangan': `  ${b.nama}`, 'Nominal': b.nominal});
       });
    }
    wsData.push({'Keterangan': 'Total Beban', 'Nominal': data.totalBeban});
    wsData.push({'Keterangan': '', 'Nominal': ''});
    wsData.push({'Keterangan': 'Laba Bersih', 'Nominal': data.labaBersih});
  } else if (filename.includes('Neraca')) {
    wsData.push({'Keterangan': 'AKTIVA LANCAR', 'Nominal': ''});
    wsData.push({'Keterangan': '  Kas', 'Nominal': data.aktivaLancar?.kas || 0});
    wsData.push({'Keterangan': '  Bank', 'Nominal': data.aktivaLancar?.bank || 0});
    wsData.push({'Keterangan': '  Piutang Usaha', 'Nominal': data.aktivaLancar?.piutangUsaha || 0});
    wsData.push({'Keterangan': '  Persediaan', 'Nominal': data.aktivaLancar?.persediaan || 0});
    wsData.push({'Keterangan': '', 'Nominal': ''});
    wsData.push({'Keterangan': 'AKTIVA TETAP', 'Nominal': ''});
    wsData.push({'Keterangan': '  Peralatan Usaha', 'Nominal': data.aktivaTetap?.peralatanUsaha || 0});
    wsData.push({'Keterangan': '  Kendaraan', 'Nominal': data.aktivaTetap?.kendaraan || 0});
    wsData.push({'Keterangan': '', 'Nominal': ''});
    wsData.push({'Keterangan': 'KEWAJIBAN', 'Nominal': ''});
    wsData.push({'Keterangan': '  Utang Usaha', 'Nominal': data.kewajiban?.utangUsaha || 0});
    wsData.push({'Keterangan': '  Utang Bank', 'Nominal': data.kewajiban?.utangBank || 0});
    wsData.push({'Keterangan': '', 'Nominal': ''});
    wsData.push({'Keterangan': 'EKUITAS', 'Nominal': ''});
    wsData.push({'Keterangan': '  Modal Pemilik', 'Nominal': data.modal?.modalPemilik || 0});
  } else {
    wsData = Array.isArray(data) ? data : [];
  }

  const ws = XLSX.utils.json_to_sheet(wsData);
  
  // Set column widths to prevent overlapping text
  ws['!cols'] = [
    { wch: 15 }, // A
    { wch: 25 }, // B
    { wch: 35 }, // C
    { wch: 18 }, // D
    { wch: 18 }, // E
    { wch: 18 }, // F
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  XLSX.writeFile(wb, filename);
};
