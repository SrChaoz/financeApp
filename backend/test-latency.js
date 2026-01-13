const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

async function testLatency() {
    console.log('--- Starting Latency Test ---');

    // Test 1: Cold Start Connection
    const startConnect = performance.now();
    await prisma.$connect();
    const endConnect = performance.now();
    console.log(`Connection Establishment: ${(endConnect - startConnect).toFixed(2)}ms`);

    // Test 2: First Query
    const startQ1 = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const endQ1 = performance.now();
    console.log(`First Query (SELECT 1): ${(endQ1 - startQ1).toFixed(2)}ms`);

    // Test 3: Second Query (Should be cached connection)
    const startQ2 = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const endQ2 = performance.now();
    console.log(`Second Query (Reused Connection): ${(endQ2 - startQ2).toFixed(2)}ms`);

    // Test 4: Real Data Query
    const startQ3 = performance.now();
    await prisma.transaction.findFirst();
    const endQ3 = performance.now();
    console.log(`Real Data Query (FindFirst): ${(endQ3 - startQ3).toFixed(2)}ms`);

    console.log('--- End Test ---');
    process.exit(0);
}

testLatency().catch(console.error);
