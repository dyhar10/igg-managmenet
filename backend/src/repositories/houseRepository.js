const prisma = require('../config/database');

function createHouse(data) {
  return prisma.house.create({ data });
}

function listHouses() {
  return prisma.house.findMany({
    orderBy: { code: 'asc' },
  });
}

function findById(id) {
  return prisma.house.findUnique({ where: { id } });
}

function findByCode(code) {
  return prisma.house.findUnique({ where: { code } });
}

module.exports = {
  createHouse,
  listHouses,
  findById,
  findByCode,
};
