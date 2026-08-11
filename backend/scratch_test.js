const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    console.log('User found:', user);
  } catch (err) {
    console.error('Prisma Error:', err);
  }
}
main();
