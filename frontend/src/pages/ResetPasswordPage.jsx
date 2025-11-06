import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api/client.js';

export default function ResetPasswordPage() {
  const [formState, setFormState] = useState({ email: '', newPassword: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setError(null);
    try {
      await api.resetPassword(formState);
      setStatus('Password berhasil diperbarui. Silakan login kembali.');
      setFormState({ email: '', newPassword: '' });
    } catch (err) {
      setError(err.message || 'Gagal memperbarui password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Reset Password</h1>
        <p className="status-text">Masukkan email dan password baru untuk memperbarui akses Anda.</p>
        {status && <div className="alert alert--success">{status}</div>}
        {error && <div className="alert alert--danger">{error}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="user@example.com" value={formState.email} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="newPassword">Password Baru</label>
            <input id="newPassword" name="newPassword" type="password" placeholder="Minimal 6 karakter" value={formState.newPassword} onChange={handleChange} required minLength={6} />
          </div>
          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Simpan Password'}
          </button>
        </form>
        <p className="status-text">
          Sudah ingat password?{' '}
          <Link className="link" to="/login">
            Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}
