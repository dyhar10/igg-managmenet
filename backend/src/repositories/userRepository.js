const prisma = require('../lib/prisma');

function mapUserRecord(record) {
  if (!record) {
    return null;
  }

  const roles = (record.userRoles || []).map((relation) => relation.role.name);
  const { userRoles, ...user } = record;
  return {
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
    roles,
  };
}

async function findByEmail(email) {
  const record = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  return mapUserRecord(record);
}

async function create(user) {
  const { roles = [], ...userData } = user;
  const uniqueRoles = [...new Set(roles.map((role) => role.trim().toLowerCase()))].filter(
    Boolean
  );

  const record = await prisma.user.create({
    data: {
      ...userData,
      userRoles:
        uniqueRoles.length > 0
          ? {
              create: uniqueRoles.map((roleName) => ({
                role: {
                  connectOrCreate: {
                    where: { name: roleName },
                    create: { name: roleName },
                  },
                },
              })),
            }
          : undefined,
    },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  return mapUserRecord(record);
}

module.exports = {
  findByEmail,
  create,
};
