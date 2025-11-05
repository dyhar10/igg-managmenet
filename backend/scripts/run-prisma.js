#!/usr/bin/env node
/*
 * Helper to execute Prisma CLI commands using DIRECT_URL for migrations/seed.
 */
const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('No Prisma command specified.');
  process.exit(1);
}

const directUrl = process.env.DIRECT_URL;
if (!directUrl || !directUrl.trim()) {
  console.error('DIRECT_URL environment variable is required for this command.');
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: directUrl,
};

const prismaBinary = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

const child = spawn(prismaBinary, args, {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to start Prisma CLI:', error);
  process.exit(1);
});
