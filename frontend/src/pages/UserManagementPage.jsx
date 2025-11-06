import { useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const FALLBACK_ROLES = ['admin', 'manager', 'finance', 'member'];

export default function UserManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState(FALLBACK_ROLES);
  const [formState, setFormState] = useState({ fullName: '', email: '', password: '', roles: ['member'] });
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([api.fetchUsers(token), api.fetchRoles(token)]);
        setUsers(usersResponse.data || []);
        const availableRoles = rolesResponse.data || [];
        setRoleOptions(Array.from(new Set([...FALLBACK_ROLES, ...availableRoles])));
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || 'Gagal memuat data pengguna');
      }
    }
    loadData();
  }, [token]);

  const selectedRoles = useMemo(() => new Set(formState.roles), [formState.roles]);

  const toggleRole = (role) => {
    setFormState((prev) => {
      const roles = new Set(prev.roles);
      if (roles.has(role)) {
        roles.delete(role);
      } else {
        roles.add(role);
      }
      return { ...prev, roles: roles.size > 0 ? Array.from(roles) : ['member'] };
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const payload = await api.register(formState);
      const createdUser = payload.data?.user;
      setStatusMessage('Pengguna baru berhasil dibuat.');
      setFormState({ fullName: '', email: '', password: '', roles: ['member'] });
      if (createdUser) {
        setUsers((prev) => [createdUser, ...prev]);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Gagal membuat pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid--columns-2">
      <div className="card">
        <h2>Pengguna Terdaftar</h2>
        {errorMessage && <div className="alert alert--danger">{errorMessage}</div>}
        {users.length === 0 ? (
          <div className="empty-state">Belum ada data pengguna.</div>
        ) : (
          <div className="stack">
            {users.map((user) => (
              <div key={user.id} className="card" style={{ padding: '1.25rem' }}>
                <div className="stack" style={{ gap: '0.35rem' }}>
                  <strong>{user.fullName}</strong>
                  <span className="status-text">{user.email}</span>
                  <div className="stack stack--row">
                    {(user.roles || []).map((role) => (
                      <span key={role} className="badge">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h2>Buat Pengguna Baru</h2>
        {statusMessage && <div className="alert alert--success">{statusMessage}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName">Nama Lengkap</label>
            <input id="fullName" name="fullName" value={formState.fullName} onChange={handleChange} placeholder="Nama lengkap" required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formState.email} onChange={handleChange} placeholder="user@example.com" required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={formState.password} onChange={handleChange} placeholder="Minimal 6 karakter" minLength={6} required />
          </div>
          <div>
            <span>Roles</span>
            <div className="stack stack--row">
              {roleOptions.map((role) => (
                <label key={role} className="badge" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value={role}
                    checked={selectedRoles.has(role)}
                    onChange={() => toggleRole(role)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Buat Pengguna'}
          </button>
        </form>
      </div>
    </div>
  );
}
