import { useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const FALLBACK_ROLES = ['admin', 'manager', 'finance', 'member'];

export default function RoleManagementPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState(FALLBACK_ROLES);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([api.fetchUsers(token), api.fetchRoles(token)]);
        const fetchedUsers = usersResponse.data || [];
        setUsers(fetchedUsers);
        if (fetchedUsers.length > 0) {
          setSelectedUserId(fetchedUsers[0].id);
          setSelectedRoles(fetchedUsers[0].roles || []);
        }
        const availableRoles = rolesResponse.data || [];
        setRoleOptions(Array.from(new Set([...FALLBACK_ROLES, ...availableRoles])));
      } catch (error) {
        setErrorMessage(error.message || 'Gagal memuat data role');
      }
    }
    loadData();
  }, [token]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }
    const user = users.find((item) => item.id === selectedUserId);
    if (user) {
      setSelectedRoles(user.roles || []);
    }
  }, [selectedUserId, users]);

  const roleSummary = useMemo(() => {
    const summary = new Map();
    users.forEach((user) => {
      (user.roles || []).forEach((role) => {
        summary.set(role, (summary.get(role) || 0) + 1);
      });
    });
    return Array.from(summary.entries()).sort((a, b) => b[1] - a[1]);
  }, [users]);

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const roles = new Set(prev);
      if (roles.has(role)) {
        roles.delete(role);
      } else {
        roles.add(role);
      }
      return Array.from(roles);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      return;
    }
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const payload = await api.updateUserRoles({ userId: selectedUserId, roles: selectedRoles, token });
      const updatedUser = payload.data;
      setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      setStatusMessage('Role pengguna berhasil diperbarui.');
    } catch (error) {
      setErrorMessage(error.message || 'Gagal memperbarui role pengguna');
    }
  };

  return (
    <div className="grid grid--columns-2">
      <div className="card">
        <h2>Kelola Role Pengguna</h2>
        {errorMessage && <div className="alert alert--danger">{errorMessage}</div>}
        {statusMessage && <div className="alert alert--success">{statusMessage}</div>}
        {users.length === 0 ? (
          <div className="empty-state">Belum ada pengguna untuk diatur.</div>
        ) : (
          <form className="stack" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="userSelector">Pilih Pengguna</label>
              <select id="userSelector" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} — {user.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span>Role yang diberikan</span>
              <div className="stack stack--row">
                {roleOptions.map((role) => (
                  <label key={role} className="badge" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      value={role}
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <button className="button" type="submit">
              Simpan Perubahan
            </button>
          </form>
        )}
      </div>
      <div className="card">
        <h2>Ringkasan Role</h2>
        {roleSummary.length === 0 ? (
          <div className="empty-state">Role belum terdistribusi.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {roleSummary.map(([role, count]) => (
              <li key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span className="badge">{role}</span>
                <span className="status-text">{count} pengguna</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
