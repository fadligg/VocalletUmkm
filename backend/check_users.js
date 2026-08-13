require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
    if (users.length === 0) {
        console.log("No users found. Creating user with ID 1...");
        const newUser = await prisma.user.create({
            data: {
                name: "Test User",
                email: "test@example.com",
                password: "password123"
            }
        });
        console.log("Created:", newUser);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
