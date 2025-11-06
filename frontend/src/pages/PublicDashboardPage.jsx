import DashboardPage from './DashboardPage.jsx';

export default function PublicDashboardPage() {
  return (
    <div className="public-page">
      <header className="public-page__header">
        <h1>Dashboard Publik IGG</h1>
        <p className="status-text">Tampilan ringkasan kas secara real-time tanpa perlu login.</p>
      </header>
      <div className="card">
        <DashboardPage readOnly />
      </div>
      <footer className="public-page__footer">
        <a className="button" href="/login">
          Masuk sebagai admin
        </a>
      </footer>
    </div>
  );
}
