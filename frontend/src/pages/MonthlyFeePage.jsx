import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const STATUS_LABEL = { PAID: 'Lunas', UNPAID: 'Belum Bayar', WAIVED: 'Dibebaskan' };
const STATUS_COLOR = { PAID: '#16a34a', UNPAID: '#ef4444', WAIVED: '#64748b' };
const STATUS_BG = { PAID: 'rgba(22,163,74,0.1)', UNPAID: 'rgba(239,68,68,0.1)', WAIVED: 'rgba(100,116,139,0.1)' };

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function MonthlyFeePage() {
  const { token } = useAuth();
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

  const [filters, setFilters] = useState({
    year: String(currentYear),
    month: String(currentMonth),
    status: '',
    houseId: '',
  });
  const [generateForm, setGenerateForm] = useState({
    year: String(currentYear),
    month: String(currentMonth),
    amount: '250000',
  });
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }
  const [updatingId, setUpdatingId] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadFees = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await api.fetchFees({ filters, token });
      setFees(payload.data?.fees || []);
      setSummary(payload.data?.summary || null);
    } catch (err) {
      showMessage('error', err.message || 'Gagal memuat data iuran');
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    setGenerateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const result = await api.generateFees({
        data: {
          year: Number(generateForm.year),
          month: Number(generateForm.month),
          amount: Number(generateForm.amount),
        },
        token,
      });
      showMessage('success', `${result.data?.length || 0} tagihan berhasil digenerate untuk ${MONTHS[Number(generateForm.month) - 1]} ${generateForm.year}.`);
      await loadFees();
    } catch (err) {
      showMessage('error', err.message || 'Gagal generate iuran');
    } finally {
      setIsGenerating(false);
    }
  };

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.updateFeeStatus({ id, data: { status }, token });
      showMessage('success', `Status berhasil diubah ke ${STATUS_LABEL[status]}.`);
      await loadFees();
    } catch (err) {
      showMessage('error', err.message || 'Gagal mengubah status');
    } finally {
      setUpdatingId(null);
    }
  };

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear + 1; y >= 2020; y--) years.push(y);
    return years;
  }, [currentYear]);

  return (
    <div className="stack">
      {/* Generate Fees Card */}
      <div className="card">
        <h2 style={{ margin: '0 0 1.25rem' }}>Generate Tagihan Bulanan</h2>
        <form className="form-grid form-grid--two-columns" onSubmit={handleGenerate}>
          <div>
            <label htmlFor="gen-year">Tahun</label>
            <select id="gen-year" name="year" value={generateForm.year} onChange={handleGenerateChange}>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gen-month">Bulan</label>
            <select id="gen-month" name="month" value={generateForm.month} onChange={handleGenerateChange}>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="gen-amount">Nominal Iuran (Rp)</label>
            <input
              id="gen-amount"
              name="amount"
              type="number"
              min="1"
              value={generateForm.amount}
              onChange={handleGenerateChange}
              placeholder="250000"
              required
            />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="button" type="submit" disabled={isGenerating}>
              {isGenerating ? 'Memproses...' : '⚡ Generate Tagihan'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid--columns-3" style={{ gap: '1rem' }}>
          {[
            { label: 'Total Rumah', value: summary.total, accent: '#2563eb' },
            { label: 'Sudah Bayar', value: summary.PAID, accent: '#16a34a' },
            { label: 'Belum Bayar', value: summary.UNPAID, accent: '#ef4444' },
            { label: 'Dibebaskan', value: summary.WAIVED, accent: '#64748b' },
            { label: 'Total Terkumpul', value: currencyFormatter.format(summary.totalCollected), accent: '#2563eb', wide: true },
          ].map((item) => (
            <div
              key={item.label}
              className="card"
              style={{ padding: '1.25rem', gridColumn: item.wide ? 'span 2' : undefined }}
            >
              <div className="metric__label">{item.label}</div>
              <div className="metric__value" style={{ color: item.accent, fontSize: '1.5rem' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Fee List */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Daftar Iuran</h2>
          <div className="stack stack--row">
            <select name="month" value={filters.month} onChange={handleFilterChange} style={{ width: 'auto' }}>
              <option value="">Semua Bulan</option>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select name="year" value={filters.year} onChange={handleFilterChange} style={{ width: 'auto' }}>
              <option value="">Semua Tahun</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: 'auto' }}>
              <option value="">Semua Status</option>
              <option value="UNPAID">Belum Bayar</option>
              <option value="PAID">Lunas</option>
              <option value="WAIVED">Dibebaskan</option>
            </select>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert--success' : 'alert--danger'}`} style={{ marginBottom: '1rem' }}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <p className="status-text">Memuat data iuran...</p>
        ) : fees.length === 0 ? (
          <div className="empty-state">
            Belum ada data iuran untuk periode ini.<br />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', display: 'block' }}>
              Gunakan tombol "Generate Tagihan" di atas untuk membuat tagihan.
            </span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Rumah</th>
                  <th>Pemilik</th>
                  <th>Periode</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Tanggal Bayar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id}>
                    <td><strong>{fee.house?.code || '—'}</strong></td>
                    <td>{fee.house?.ownerName || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                    <td>{MONTHS[fee.month - 1]} {fee.year}</td>
                    <td>{currencyFormatter.format(fee.amount)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          color: STATUS_COLOR[fee.status],
                          background: STATUS_BG[fee.status],
                        }}
                      >
                        {STATUS_LABEL[fee.status]}
                      </span>
                    </td>
                    <td>
                      {fee.paidAt
                        ? new Date(fee.paidAt).toLocaleDateString('id-ID')
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td>
                      <div className="stack stack--row" style={{ gap: '0.35rem' }}>
                        {fee.status !== 'PAID' && (
                          <button
                            className="button"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#16a34a' }}
                            onClick={() => changeStatus(fee.id, 'PAID')}
                            disabled={updatingId === fee.id}
                          >
                            ✓ Lunas
                          </button>
                        )}
                        {fee.status !== 'WAIVED' && fee.status !== 'PAID' && (
                          <button
                            className="button button--ghost"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => changeStatus(fee.id, 'WAIVED')}
                            disabled={updatingId === fee.id}
                          >
                            Bebaskan
                          </button>
                        )}
                        {fee.status !== 'UNPAID' && (
                          <button
                            className="button button--ghost"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                            onClick={() => changeStatus(fee.id, 'UNPAID')}
                            disabled={updatingId === fee.id}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
