const SECTIONS = [
  { key: 'weekly', label: 'Mingguan' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
  { key: 'overall', label: 'Keseluruhan' },
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function DashboardSummary({ summary }) {
  if (!summary) {
    return <div className="empty-state">Belum ada ringkasan kas untuk ditampilkan.</div>;
  }

  return (
    <div className="grid grid--columns-2">
      {SECTIONS.map(({ key, label }) => {
        const data = summary[key];
        if (!data) {
          return null;
        }
        return (
          <div key={key} className="card">
            <p className="metric__label">{label}</p>
            <div className="grid grid--columns-2">
              <div className="metric">
                <span className="metric__label">Pemasukan</span>
                <span className="metric__value">{currencyFormatter.format(data.income || 0)}</span>
              </div>
              <div className="metric">
                <span className="metric__label">Pengeluaran</span>
                <span className="metric__value">{currencyFormatter.format(data.expense || 0)}</span>
              </div>
            </div>
            <div className="metric" style={{ marginTop: '1rem' }}>
              <span className="metric__label">Saldo</span>
              <span className="metric__value">{currencyFormatter.format(data.balance || 0)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
