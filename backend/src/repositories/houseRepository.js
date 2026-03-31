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

function updateHouse(id, data) {
  return prisma.house.update({ where: { id }, data });
}

function deleteHouse(id) {
  return prisma.house.delete({ where: { id } });
}

module.exports = {
  createHouse,
  listHouses,
  findById,
  findByCode,
  updateHouse,
  deleteHouse,
};
