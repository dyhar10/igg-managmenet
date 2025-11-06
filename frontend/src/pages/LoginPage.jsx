import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(formState);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Masuk ke IGG Admin</h1>
        <p className="status-text">Kelola lingkungan perumahan dengan mudah.</p>
        {error && <div className="alert alert--danger">{error}</div>}
        <form className="stack" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="admin@example.com" value={formState.email} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••" value={formState.password} onChange={handleChange} required minLength={6} />
          </div>
          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="status-text">
          Lupa password?{' '}
          <Link className="link" to="/reset-password">
            Reset sekarang
          </Link>
        </p>
        <p className="status-text">
          Lihat dashboard publik?{' '}
          <Link className="link" to="/">
            Buka halaman publik
          </Link>
        </p>
      </div>
    </div>
  );
}
