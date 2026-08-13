import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding untuk Pedagang Bakso secara komprehensif...');

  // 1. Bersihkan data lama
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Kang Bakso',
      email: 'bakso@test.com',
      password: hashedPassword,
    },
  });
  console.log(`✅ User dibuat: ${user.name} (${user.email})`);

  // 3. Buat Business
  const business = await prisma.business.create({
    data: {
      userId: user.id,
      namaUsaha: 'Bakso Mantap Jiwa',
      jenisUsaha: 'Kuliner',
      tahunMulai: new Date('2026-01-01'),
      tahunAkhir: new Date('2026-12-31'),
      saldoKas: 0,
      saldoBank: 0,
    },
  });
  console.log(`✅ Business dibuat: ${business.namaUsaha}`);

  // 4. Buat Products
  const baksoUrat = await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Bakso Urat Jumbo',
      unit: 'Porsi',
      priceBuy: 10000,
      priceSell: 15000,
      stock: 50,
    },
  });

  const baksoHalus = await prisma.product.create({
    data: {
      userId: user.id,
      name: 'Bakso Halus',
      unit: 'Porsi',
      priceBuy: 8000,
      priceSell: 12000,
      stock: 100,
    },
  });

  console.log('✅ Produk dibuat (Bakso Urat, Bakso Halus)');

  // 5. Buat 18 Transaksi super komplit!
  const transactions = [
    {
      trx_id: 'TRX-001',
      type: 'tambah_modal', // 1
      date: new Date('2026-08-01T08:00:00Z'),
      amount: 15000000,
      payment_method: 'Tunai',
      description: 'Modal awal jualan bakso',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-002',
      type: 'beli_aset', // 2
      date: new Date('2026-08-02T09:00:00Z'),
      amount: 5000000,
      payment_method: 'Tunai',
      description: 'Beli gerobak motor dan dandang',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-003',
      type: 'pembelian_barang', // 3
      date: new Date('2026-08-03T07:00:00Z'),
      amount: 1000000,
      payment_method: 'Tunai',
      description: 'Beli bahan baku daging, mie, sayur',
      userId: user.id,
      metadata: JSON.stringify({ namaProduk: 'Bahan Baku Bakso' }),
    },
    {
      trx_id: 'TRX-004',
      type: 'penjualan', // 4
      date: new Date('2026-08-04T12:00:00Z'),
      amount: 300000,
      payment_method: 'Tunai',
      description: 'Jual 20 porsi bakso urat',
      userId: user.id,
      metadata: JSON.stringify({ productId: baksoUrat.id, jumlah: 20, hargaJual: 15000 }),
    },
    {
      trx_id: 'TRX-005',
      type: 'penjualan', // 5
      date: new Date('2026-08-04T13:00:00Z'),
      amount: 120000,
      payment_method: 'QRIS',
      description: 'Jual 10 porsi bakso halus via QRIS',
      userId: user.id,
      metadata: JSON.stringify({ productId: baksoHalus.id, jumlah: 10, hargaJual: 12000 }),
    },
    {
      trx_id: 'TRX-006',
      type: 'diskon_penjualan', // 6
      date: new Date('2026-08-04T13:10:00Z'),
      amount: 20000,
      payment_method: 'QRIS',
      description: 'Diskon untuk pelanggan VIP',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-007',
      type: 'retur_penjualan', // 7
      date: new Date('2026-08-04T14:00:00Z'),
      amount: 30000,
      payment_method: 'Tunai',
      description: 'Retur 2 porsi bakso urat karena tumpah',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-008',
      type: 'penjualan', // Ngutang
      date: new Date('2026-08-05T12:00:00Z'),
      amount: 100000,
      payment_method: 'Utang', // Dicatat piutang di backend
      description: 'Pak RT ngutang bakso buat acara rapat',
      userId: user.id,
      metadata: JSON.stringify({ pelanggan: 'Pak RT' }),
    },
    {
      trx_id: 'TRX-009',
      type: 'terima_pembayaran', // 8
      date: new Date('2026-08-06T09:00:00Z'),
      amount: 100000,
      payment_method: 'Tunai',
      description: 'Pak RT bayar utang bakso kemarin',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-010',
      type: 'bayar_beban', // 9
      date: new Date('2026-08-07T10:00:00Z'),
      amount: 50000,
      payment_method: 'Tunai',
      description: 'Bayar iuran listrik dan air pasar',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-011',
      type: 'bayar_beban', // 10
      date: new Date('2026-08-07T10:15:00Z'),
      amount: 100000,
      payment_method: 'Tunai',
      description: 'Bayar sewa lapak',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-012',
      type: 'terima_pinjaman', // 11
      date: new Date('2026-08-08T09:00:00Z'),
      amount: 2000000,
      payment_method: 'Transfer Bank',
      description: 'Pinjaman KUR dari Bank',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-013',
      type: 'bayar_cicilan', // 12
      date: new Date('2026-08-09T09:00:00Z'),
      amount: 500000,
      payment_method: 'Transfer Bank',
      description: 'Bayar cicilan KUR bulan ini',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-014',
      type: 'bayar_utang', // 13
      date: new Date('2026-08-10T08:00:00Z'),
      amount: 200000,
      payment_method: 'Tunai',
      description: 'Bayar utang ke supplier daging (Haji Maman)',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-015',
      type: 'prive', // 14
      date: new Date('2026-08-11T12:00:00Z'),
      amount: 150000,
      payment_method: 'Tunai',
      description: 'Ambil kas untuk jajan anak',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-016',
      type: 'barang_rusak', // 15
      date: new Date('2026-08-12T07:00:00Z'),
      amount: 40000,
      payment_method: 'Tunai',
      description: 'Daging sapi sedikit bau, dibuang (kerugian)',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-017',
      type: 'bayar_ongkir', // 16
      date: new Date('2026-08-12T14:00:00Z'),
      amount: 15000,
      payment_method: 'Tunai',
      description: 'Ongkir Gofood antar bakso ke pelanggan jauh',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-018',
      type: 'transaksi_lainnya', // 17
      date: new Date('2026-08-12T15:00:00Z'),
      amount: 25000,
      payment_method: 'Tunai',
      description: 'Beli sapu dan pel untuk bersihin lapak',
      userId: user.id,
      metadata: JSON.stringify({}),
    },
    {
      trx_id: 'TRX-019',
      type: 'retur_pembelian', // 18
      date: new Date('2026-08-12T16:00:00Z'),
      amount: 50000,
      payment_method: 'Tunai',
      description: 'Tukar mie yang kadaluarsa ke agen, uang kembali',
      userId: user.id,
      metadata: JSON.stringify({}),
    }
  ];

  for (const trx of transactions) {
    await prisma.transaction.create({ data: trx });
  }
  console.log(`✅ ${transactions.length} Transaksi super komplit berhasil dibuat!`);
  console.log('🎉 Seeding Selesai!');
  console.log('\n=======================================');
  console.log('Login dengan:');
  console.log('Email   : bakso@test.com');
  console.log('Password: password123');
  console.log('=======================================');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
