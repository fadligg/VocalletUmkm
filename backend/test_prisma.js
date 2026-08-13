const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log("Using user:", user.id);
        const transaction = await prisma.transaction.create({
            data: {
                trx_id: "TRX-" + Date.now(),
                type: "test_type",
                date: new Date(),
                amount: 0,
                payment_method: "Tunai",
                description: "Test description",
                metadata: "{}",
                userId: user.id,
            }
        });
        console.log("Success:", transaction);
    } catch (e) {
        console.error(e.message);
    }
}
main().finally(() => prisma.$disconnect());
