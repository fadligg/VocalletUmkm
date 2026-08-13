const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log("Using user:", user.id);
        const transaction = await prisma.transaction.create({
            data: {
                trx_id: "TRX-" + Date.now(),
                type: "retur_penjualan",
                date: new Date("2026-08-13"),
                amount: 10000,
                payment_method: "Tunai",
                description: "retur penjualan",
                metadata: '{"extraField":""}',
                userId: user.id,
            }
        });
        console.log("Success:", transaction);
    } catch (e) {
        console.error(e.message);
    }
}
main().finally(() => prisma.$disconnect());
