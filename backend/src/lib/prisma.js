const { PrismaClient } = require('@prisma/client');
const config = require('../config/environment');

function createClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
  });
}

const globalScope = globalThis;
const clientKey = '__prismaClient';
const disconnectHookKey = '__prismaDisconnectHook';

const prisma = globalScope[clientKey] || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalScope[clientKey] = prisma;
}

if (!globalScope[disconnectHookKey]) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  globalScope[disconnectHookKey] = true;
}

module.exports = prisma;
