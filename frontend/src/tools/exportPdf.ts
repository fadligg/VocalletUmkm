import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (val: any) => {
  if (val === undefined || val === null || val === '') return '';
  const num = Number(val);
  if (isNaN(num)) return val;
  if (num === 0) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
};

export const exportToPdf = (data: any, filename: string) => {
  const doc = new jsPDF();
  
  // Format Title
  const title = filename.replace('.pdf', '').replace(/_/g, ' ');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  let head: any[][] = [];
  let body: any[][] = [];

  if (filename.includes('Buku_Besar')) {
    head = [['Tanggal', 'Referensi', 'Keterangan', 'Debit', 'Kredit', 'Saldo']];
    body = data.map((d: any) => [d.date, d.ref, d.description, formatCurrency(d.debit), formatCurrency(d.credit), formatCurrency(d.balance)]);
  } else if (filename.includes('Jurnal_Umum')) {
    head = [['Tanggal', 'Referensi', 'Keterangan', 'Ref Akun', 'Debit', 'Kredit']];
    data.forEach((j: any) => {
      j.entries.forEach((e: any, idx: number) => {
        body.push([
          idx === 0 ? j.date : '',
          idx === 0 ? j.ref : '',
          e.accountName,
          e.accountCode,
          formatCurrency(e.debit || 0),
          formatCurrency(e.credit || 0)
        ]);
      });
    });
  } else if (filename.includes('Neraca_Saldo')) {
    head = [['Kode Akun', 'Nama Akun', 'Debit', 'Kredit']];
    body = data.map((d: any) => [d.kode, d.nama, formatCurrency(d.debit), formatCurrency(d.credit)]);
  } else if (filename.includes('Laba_Rugi')) {
    head = [['Keterangan', 'Nominal']];
    body.push(['Penjualan', formatCurrency(data.penjualan)]);
    body.push(['Harga Pokok Penjualan', formatCurrency(data.hpp)]);
    body.push(['Laba Kotor', formatCurrency(data.labaKotor)]);
    body.push(['', '']);
    body.push(['Beban-Beban:', '']);
    if (data.beban && Array.isArray(data.beban)) {
       data.beban.forEach((b: any) => {
          body.push([`  ${b.nama}`, formatCurrency(b.nominal)]);
       });
    }
    body.push(['Total Beban', formatCurrency(data.totalBeban)]);
    body.push(['', '']);
    body.push(['Laba Bersih', formatCurrency(data.labaBersih)]);
  } else if (filename.includes('Neraca')) {
    head = [['Keterangan', 'Nominal']];
    body.push(['AKTIVA LANCAR', '']);
    body.push(['  Kas', formatCurrency(data.aktivaLancar?.kas || 0)]);
    body.push(['  Bank', formatCurrency(data.aktivaLancar?.bank || 0)]);
    body.push(['  Piutang Usaha', formatCurrency(data.aktivaLancar?.piutangUsaha || 0)]);
    body.push(['  Persediaan', formatCurrency(data.aktivaLancar?.persediaan || 0)]);
    body.push(['', '']);
    body.push(['AKTIVA TETAP', '']);
    body.push(['  Peralatan Usaha', formatCurrency(data.aktivaTetap?.peralatanUsaha || 0)]);
    body.push(['  Kendaraan', formatCurrency(data.aktivaTetap?.kendaraan || 0)]);
    body.push(['', '']);
    body.push(['KEWAJIBAN', '']);
    body.push(['  Utang Usaha', formatCurrency(data.kewajiban?.utangUsaha || 0)]);
    body.push(['  Utang Bank', formatCurrency(data.kewajiban?.utangBank || 0)]);
    body.push(['', '']);
    body.push(['EKUITAS', '']);
    body.push(['  Modal Pemilik', formatCurrency(data.modal?.modalPemilik || 0)]);
  } else {
    head = [['Keterangan']];
    body = [['Data tidak dapat diproses format PDF']];
  }

  autoTable(doc, {
    startY: 20,
    head: head,
    body: body,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [11, 123, 63] } // vocallet green
  });

  // Buka PDF di tab baru sebagai preview alih-alih langsung didownload
  const pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
  window.open(pdfBlobUrl, '_blank');
};
