import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MENU_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/financial', label: 'Financial Management' },
  { to: '/app/users', label: 'User Management' },
  { to: '/app/roles', label: 'Role Management' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const activeItem = MENU_ITEMS.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-accent" />
          <span>IGG Admin</span>
        </div>
        <nav className="sidebar__nav">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="avatar">{user?.fullName?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <p className="sidebar__user-name">{user?.fullName || 'User'}</p>
              <p className="sidebar__user-email">{user?.email}</p>
            </div>
          </div>
          <button type="button" className="button button--ghost" onClick={logout}>
            Keluar
          </button>
        </div>
      </aside>
      <div className="app-shell__main">
        <header className="topbar">
          <div>
            <p className="topbar__subtitle">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <h1 className="topbar__title">{activeItem?.label || 'Dashboard'}</h1>
          </div>
          <div className="topbar__actions">
            <NavLink to="/" className="button button--ghost">
              Public View
            </NavLink>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
