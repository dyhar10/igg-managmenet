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

module.exports = {
  findByEmail,
  create,
};
