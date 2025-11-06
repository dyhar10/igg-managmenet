const prisma = require('../config/database');

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

async function create(user) {
  return prisma.user.create({
    data: {
      ...user,
      email: user.email.toLowerCase(),
    },
  });
}

async function findAll() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

async function update(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

module.exports = {
  findByEmail,
  create,
  findAll,
  update,
};
