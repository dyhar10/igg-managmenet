const userRepository = require('../repositories/userRepository');
const { hashPassword, verifyPassword } = require('../utils/password');

function ensureEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    const error = new Error('Email harus valid');
    error.statusCode = 400;
    throw error;
  }
  return email.trim().toLowerCase();
}

function ensurePassword(password) {
  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password minimal 6 karakter');
    error.statusCode = 400;
    throw error;
  }
  return password;
}

function normalizeRoles(roles) {
  return Array.isArray(roles) && roles.length > 0
    ? [...new Set(roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean))]
    : ['member'];
}

async function registerUser({ email, password, fullName, roles = ['member'] }) {
  const normalizedEmail = ensureEmail(email);
  const sanitizedPassword = ensurePassword(password);
  if (!fullName || typeof fullName !== 'string') {
    const error = new Error('Nama lengkap wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  const normalizedRoles = normalizeRoles(roles);

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) {
    const error = new Error('Email sudah terdaftar');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = hashPassword(sanitizedPassword);
  const user = await userRepository.create({
    email: normalizedEmail,
    passwordHash,
    fullName: fullName.trim(),
    roles: normalizedRoles,
  });

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

async function authenticateUser({ email, password }) {
  const normalizedEmail = ensureEmail(email);
  const sanitizedPassword = ensurePassword(password);

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (!existing || !verifyPassword(sanitizedPassword, existing.passwordHash)) {
    const error = new Error('Email atau password tidak valid');
    error.statusCode = 401;
    throw error;
  }

  const { passwordHash: _, ...safeUser } = existing;
  return safeUser;
}

async function listUsers() {
  const users = await userRepository.findAll();
  return users.map((user) => {
    const { passwordHash: _, ...safeUser } = user;
    return { ...safeUser, roles: user.roles || [] };
  });
}

async function updateUserRoles({ userId, roles }) {
  if (!userId || typeof userId !== 'string') {
    const error = new Error('userId wajib diisi');
    error.statusCode = 400;
    throw error;
  }

  const normalizedRoles = normalizeRoles(roles);
  const updated = await userRepository.update(userId, { roles: normalizedRoles });
  const { passwordHash: _, ...safeUser } = updated;
  return safeUser;
}

async function resetPassword({ email, newPassword }) {
  const normalizedEmail = ensureEmail(email);
  const sanitizedPassword = ensurePassword(newPassword);

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (!existing) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const passwordHash = hashPassword(sanitizedPassword);
  const updated = await userRepository.update(existing.id, { passwordHash });
  const { passwordHash: _, ...safeUser } = updated;
  return safeUser;
}

async function listRoles() {
  const users = await userRepository.findAll();
  const roleSet = new Set();
  users.forEach((user) => {
    (user.roles || []).forEach((role) => {
      if (role) {
        roleSet.add(role);
      }
    });
  });
  if (roleSet.size === 0) {
    ['admin', 'manager', 'finance', 'member'].forEach((role) => roleSet.add(role));
  }
  return Array.from(roleSet);
}

module.exports = {
  registerUser,
  authenticateUser,
  listUsers,
  updateUserRoles,
  resetPassword,
  listRoles,
};
