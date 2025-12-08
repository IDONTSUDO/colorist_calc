import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    // prisma.folder.
    const user = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alic213e@prisma.io',
        },
    });
    console.log(user);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
