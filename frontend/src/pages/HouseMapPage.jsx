import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const STATUS_CONFIG = {
  PAID: { label: 'Lunas', bg: 'linear-gradient(135deg,#bbf7d0,#86efac)', border: '#16a34a', text: '#14532d', icon: '✓' },
  UNPAID: { label: 'Belum Bayar', bg: 'linear-gradient(135deg,#fee2e2,#fca5a5)', border: '#ef4444', text: '#7f1d1d', icon: '!' },
  WAIVED: { label: 'Dibebaskan', bg: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)', border: '#94a3b8', text: '#475569', icon: '—' },
  NO_FEE: { label: 'Tidak Ada', bg: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '#cbd5e1', text: '#94a3b8', icon: '?' },
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
});

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// Default house form
const DEFAULT_HOUSE = { code: '', ownerName: '', address: '' };

export default function HouseMapPage() {
  const { token } = useAuth();
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [houses, setHouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null); // for detail modal
  const [message, setMessage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // House management state
  const [showHouseForm, setShowHouseForm] = useState(false);
  const [houseForm, setHouseForm] = useState(DEFAULT_HOUSE);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [isSavingHouse, setIsSavingHouse] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const loadMap = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload = await api.fetchHouseMap({
        year: Number(selectedYear),
        month: Number(selectedMonth),
        token,
      });
      setHouses(payload.data || []);
    } catch (err) {
      showMessage('error', err.message || 'Gagal memuat peta rumah');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, token]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  const markPaid = async (houseEntry) => {
    if (!houseEntry.fee) {
      showMessage('error', 'Belum ada tagihan untuk rumah ini. Generate tagihan terlebih dahulu.');
      return;
    }
    setUpdatingId(houseEntry.id);
    try {
      await api.updateFeeStatus({ id: houseEntry.fee.id, data: { status: 'PAID' }, token });
      showMessage('success', `${houseEntry.code} berhasil ditandai Lunas.`);
      setSelectedHouse(null);
      await loadMap();
    } catch (err) {
      showMessage('error', err.message || 'Gagal mengubah status');
    } finally {
      setUpdatingId(null);
    }
  };

  // House management
  const handleHouseFormChange = (e) => {
    const { name, value } = e.target;
    setHouseForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddHouse = () => {
    setHouseForm(DEFAULT_HOUSE);
    setEditingHouseId(null);
    setShowHouseForm(true);
  };

  const openEditHouse = (house) => {
    setHouseForm({ code: house.code, ownerName: house.ownerName || '', address: house.address || '' });
    setEditingHouseId(house.id);
    setShowHouseForm(true);
    setSelectedHouse(null);
  };

  const handleSaveHouse = async (e) => {
    e.preventDefault();
    setIsSavingHouse(true);
    try {
      if (editingHouseId) {
        await api.updateHouse({ id: editingHouseId, data: houseForm, token });
        showMessage('success', 'Rumah berhasil diperbarui.');
      } else {
        await api.createHouse({ data: houseForm, token });
        showMessage('success', `Rumah ${houseForm.code} berhasil ditambahkan.`);
      }
      setShowHouseForm(false);
      setHouseForm(DEFAULT_HOUSE);
      await loadMap();
    } catch (err) {
      showMessage('error', err.message || 'Gagal menyimpan rumah');
    } finally {
      setIsSavingHouse(false);
    }
  };

  const handleDeleteHouse = async (house) => {
    if (!window.confirm(`Hapus rumah ${house.code}? Data transaksi dan iuran terkait juga akan dihapus.`)) return;
    try {
      await api.deleteHouse({ id: house.id, token });
      showMessage('success', `Rumah ${house.code} berhasil dihapus.`);
      setSelectedHouse(null);
      await loadMap();
    } catch (err) {
      showMessage('error', err.message || 'Gagal menghapus rumah');
    }
  };

  const yearOptions = [];
  for (let y = currentYear + 1; y >= 2020; y--) yearOptions.push(y);

  // Count by status
  const counts = { PAID: 0, UNPAID: 0, WAIVED: 0, NO_FEE: 0 };
  houses.forEach((h) => {
    const s = h.fee?.status || 'NO_FEE';
    counts[s] = (counts[s] || 0) + 1;
  });

  return (
    <div className="stack">
      {/* Controls */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div className="stack stack--row" style={{ alignItems: 'flex-end' }}>
            <div>
              <label htmlFor="map-month" style={{ marginBottom: '0.35rem' }}>Bulan</label>
              <select id="map-month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ width: 'auto' }}>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="map-year" style={{ marginBottom: '0.35rem' }}>Tahun</label>
              <select id="map-year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: 'auto' }}>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button className="button" onClick={openAddHouse}>+ Tambah Rumah</button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert--success' : 'alert--danger'}`}>
          {message.text}
        </div>
      )}

      {/* Status Legend + Counts */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div
            key={key}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.85rem', borderRadius: '999px',
              background: cfg.bg.replace('linear-gradient(135deg,', '').split(',')[0],
              border: `1px solid ${cfg.border}`,
              color: cfg.text, fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            <span>{cfg.icon}</span>
            <span>{cfg.label}</span>
            <span style={{ opacity: 0.65 }}>({counts[key] || 0})</span>
          </div>
        ))}
      </div>

      {/* House Grid Map */}
      <div className="card">
        <h2 style={{ margin: '0 0 1.25rem' }}>
          Peta Rumah — {MONTHS[Number(selectedMonth) - 1]} {selectedYear}
        </h2>
        {isLoading ? (
          <p className="status-text">Memuat peta rumah...</p>
        ) : houses.length === 0 ? (
          <div className="empty-state">Belum ada data rumah. Tambahkan rumah terlebih dahulu.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {houses.map((house) => {
              const statusKey = house.fee?.status || 'NO_FEE';
              const cfg = STATUS_CONFIG[statusKey];
              const isUpdating = updatingId === house.id;
              return (
                <button
                  key={house.id}
                  onClick={() => setSelectedHouse(house)}
                  disabled={isUpdating}
                  style={{
                    background: cfg.bg,
                    border: `2px solid ${cfg.border}`,
                    borderRadius: '12px',
                    padding: '0.85rem 0.65rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}
                >
                  <div style={{ fontSize: '1.4rem', lineHeight: 1 }}>{cfg.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: cfg.text }}>{house.code}</div>
                  {house.ownerName && (
                    <div style={{ fontSize: '0.72rem', color: cfg.text, opacity: 0.75, lineHeight: 1.3, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {house.ownerName}
                    </div>
                  )}
                  {house.fee && (
                    <div style={{ fontSize: '0.7rem', color: cfg.text, opacity: 0.65, marginTop: '0.15rem' }}>
                      {currencyFormatter.format(house.fee.amount)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* House Detail Modal */}
      {selectedHouse && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedHouse(null); }}
        >
          <div
            className="card"
            style={{ width: 'min(440px, 100%)', margin: 0, animation: 'none', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {(() => {
              const cfg = STATUS_CONFIG[selectedHouse.fee?.status || 'NO_FEE'];
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>Rumah {selectedHouse.code}</h2>
                      {selectedHouse.ownerName && <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{selectedHouse.ownerName}</p>}
                    </div>
                    <button
                      className="button button--ghost"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '1rem' }}
                      onClick={() => setSelectedHouse(null)}
                    >
                      ✕
                    </button>
                  </div>

                  {selectedHouse.address && (
                    <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>📍 {selectedHouse.address}</p>
                  )}

                  <div
                    style={{
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: cfg.text, opacity: 0.75, marginBottom: '0.25rem' }}>
                      Status Iuran — {MONTHS[Number(selectedMonth) - 1]} {selectedYear}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.15rem', color: cfg.text }}>
                      {cfg.icon} {cfg.label}
                    </div>
                    {selectedHouse.fee && (
                      <div style={{ fontSize: '0.9rem', color: cfg.text, opacity: 0.8, marginTop: '0.35rem' }}>
                        {currencyFormatter.format(selectedHouse.fee.amount)}
                        {selectedHouse.fee.paidAt && (
                          <span> · Dibayar {new Date(selectedHouse.fee.paidAt).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="stack stack--row">
                    {(!selectedHouse.fee || selectedHouse.fee.status !== 'PAID') && (
                      <button
                        className="button"
                        style={{ background: '#16a34a', flex: 1 }}
                        onClick={() => markPaid(selectedHouse)}
                        disabled={updatingId === selectedHouse.id}
                      >
                        ✓ Tandai Lunas
                      </button>
                    )}
                    <button
                      className="button button--ghost"
                      onClick={() => openEditHouse(selectedHouse)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="button button--ghost"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => handleDeleteHouse(selectedHouse)}
                    >
                      🗑
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add/Edit House Modal */}
      {showHouseForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowHouseForm(false); }}
        >
          <div className="card" style={{ width: 'min(440px, 100%)', margin: 0 }}>
            <h2 style={{ margin: '0 0 1.25rem' }}>{editingHouseId ? 'Edit Rumah' : 'Tambah Rumah Baru'}</h2>
            <form className="stack" onSubmit={handleSaveHouse}>
              <div>
                <label htmlFor="modal-house-code">Kode Rumah</label>
                <input
                  id="modal-house-code"
                  name="code"
                  value={houseForm.code}
                  onChange={handleHouseFormChange}
                  placeholder="Contoh: A-01"
                  required
                />
              </div>
              <div>
                <label htmlFor="modal-house-owner">Nama Pemilik</label>
                <input
                  id="modal-house-owner"
                  name="ownerName"
                  value={houseForm.ownerName}
                  onChange={handleHouseFormChange}
                  placeholder="Opsional"
                />
              </div>
              <div>
                <label htmlFor="modal-house-address">Alamat</label>
                <textarea
                  id="modal-house-address"
                  name="address"
                  value={houseForm.address}
                  onChange={handleHouseFormChange}
                  placeholder="Opsional"
                />
              </div>
              <div className="stack stack--row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="button button--ghost" onClick={() => setShowHouseForm(false)}>
                  Batal
                </button>
                <button type="submit" className="button" disabled={isSavingHouse}>
                  {isSavingHouse ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
