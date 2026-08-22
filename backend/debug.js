const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found");
    const payload = {
      userId: user.id,
      trx_id: 'TRX-' + Date.now(),
      type: 'terima_pembayaran',
      date: new Date('2026-08-21'),
      amount: 10000,
      payment_method: 'Tunai',
      description: 'tet',
      metadata: '{"extraField":"Kajung"}'
    };
    
    console.log("Payload:", payload);
    const result = await prisma.transaction.create({ data: payload });
    console.log("Success:", result);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
