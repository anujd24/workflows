import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() {
    try {
        const tables = await p.$queryRawUnsafe("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log(JSON.stringify(tables, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await p.$disconnect();
    }
}
m();
