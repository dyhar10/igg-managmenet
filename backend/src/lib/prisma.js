const { PrismaClient } = require('@prisma/client');
const config = require('../config/environment');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
