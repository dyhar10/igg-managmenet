import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const defaultTransaction = {
  houseId: '',
  transactionType: 'INCOME',
  paymentMethod: 'CASH',
  category: '',
  amount: '',
  transactionDate: '',
  description: '',
};

const defaultHouse = {
  code: '',
  ownerName: '',
  address: '',
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function FinancialManagementPage() {
  const { token } = useAuth();
  const [houses, setHouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ houseId: '', transactionType: '', startDate: '', endDate: '' });
  const [transactionForm, setTransactionForm] = useState(defaultTransaction);
  const [houseForm, setHouseForm] = useState(defaultHouse);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHouses = useCallback(async () => {
    try {
      const payload = await api.fetchHouses(token);
      setHouses(payload.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const payload = await api.fetchTransactions({ filters, token });
      setTransactions(payload.data || payload);
    } catch (error) {
      setErrorMessage(error.message || 'Gagal memuat transaksi');
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    loadHouses();
  }, [loadHouses]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (houses.length > 0 && !transactionForm.houseId) {
      setTransactionForm((prev) => ({ ...prev, houseId: houses[0].id }));
    }
  }, [houses, transactionForm.houseId]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    loadTransactions();
  };

  const resetFilters = () => {
    setFilters({ houseId: '', transactionType: '', startDate: '', endDate: '' });
  };

  const handleTransactionChange = (event) => {
    const { name, value } = event.target;
    setTransactionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    const payload = {
      ...transactionForm,
      amount: Number(transactionForm.amount),
    };

    try {
      await api.createTransaction({ data: payload, token });
      setStatusMessage('Transaksi berhasil disimpan.');
      setTransactionForm(defaultTransaction);
      await loadTransactions();
    } catch (error) {
      setErrorMessage(error.message || 'Gagal menyimpan transaksi');
    }
  };

  const handleHouseChange = (event) => {
    const { name, value } = event.target;
    setHouseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateHouse = async (event) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const payload = await api.createHouse({ data: houseForm, token });
      setStatusMessage(`Rumah ${payload.data?.code || ''} berhasil ditambahkan.`);
      setHouseForm(defaultHouse);
      await loadHouses();
    } catch (error) {
      setErrorMessage(error.message || 'Gagal menambahkan rumah');
    }
  };

  const houseOptions = useMemo(
    () => [
      { value: '', label: 'Semua Rumah' },
      ...houses.map((house) => ({ value: house.id, label: `${house.code} ${house.ownerName ? `- ${house.ownerName}` : ''}` })),
    ],
    [houses],
  );

  return (
    <div className="stack">
      <div className="card">
        <h2>Filter Transaksi</h2>
        <form className="form-grid form-grid--two-columns" onSubmit={handleApplyFilters}>
          <div>
            <label htmlFor="filterHouse">Rumah</label>
            <select id="filterHouse" name="houseId" value={filters.houseId} onChange={handleFilterChange}>
              {houseOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterType">Tipe Transaksi</label>
            <select id="filterType" name="transactionType" value={filters.transactionType} onChange={handleFilterChange}>
              <option value="">Semua</option>
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterStart">Tanggal Mulai</label>
            <input id="filterStart" name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div>
            <label htmlFor="filterEnd">Tanggal Selesai</label>
            <input id="filterEnd" name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          <div className="stack stack--row" style={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}>
            <button type="button" className="button button--ghost" onClick={resetFilters}>
              Reset
            </button>
            <button type="submit" className="button">
              Terapkan
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Daftar Transaksi</h2>
        {statusMessage && <div className="alert alert--success">{statusMessage}</div>}
        {errorMessage && <div className="alert alert--danger">{errorMessage}</div>}
        {isLoading ? (
          <p className="status-text">Memuat data transaksi...</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">Belum ada transaksi yang tercatat.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Rumah</th>
                  <th>Tipe</th>
                  <th>Metode</th>
                  <th>Kategori</th>
                  <th>Jumlah</th>
                  <th>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.transactionDate).toLocaleDateString('id-ID')}</td>
                    <td>{transaction.house?.code || '—'}</td>
                    <td>{transaction.transactionType === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.category}</td>
                    <td>{currencyFormatter.format(transaction.amount || 0)}</td>
                    <td>{transaction.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid--columns-2">
        <div className="card">
          <h2>Catat Transaksi Baru</h2>
          <form className="stack" onSubmit={handleCreateTransaction}>
            <div>
              <label htmlFor="transactionHouse">Rumah</label>
              <select id="transactionHouse" name="houseId" value={transactionForm.houseId} onChange={handleTransactionChange} required>
                <option value="" disabled>
                  Pilih rumah
                </option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.code} {house.ownerName ? `- ${house.ownerName}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid form-grid--two-columns">
              <div>
                <label htmlFor="transactionType">Tipe</label>
                <select id="transactionType" name="transactionType" value={transactionForm.transactionType} onChange={handleTransactionChange}>
                  <option value="INCOME">Pemasukan</option>
                  <option value="EXPENSE">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod">Metode Pembayaran</label>
                <select id="paymentMethod" name="paymentMethod" value={transactionForm.paymentMethod} onChange={handleTransactionChange}>
                  <option value="CASH">Tunai</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="category">Kategori</label>
              <input id="category" name="category" value={transactionForm.category} onChange={handleTransactionChange} placeholder="Contoh: Iuran Bulanan" required />
            </div>
            <div className="form-grid form-grid--two-columns">
              <div>
                <label htmlFor="amount">Jumlah</label>
                <input id="amount" name="amount" type="number" min="0" step="0.01" value={transactionForm.amount} onChange={handleTransactionChange} placeholder="250000" required />
              </div>
              <div>
                <label htmlFor="transactionDate">Tanggal</label>
                <input id="transactionDate" name="transactionDate" type="date" value={transactionForm.transactionDate} onChange={handleTransactionChange} required />
              </div>
            </div>
            <div>
              <label htmlFor="description">Catatan</label>
              <textarea id="description" name="description" value={transactionForm.description} onChange={handleTransactionChange} placeholder="Informasi tambahan (opsional)" />
            </div>
            <button className="button" type="submit">
              Simpan Transaksi
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Tambah Rumah</h2>
          <form className="stack" onSubmit={handleCreateHouse}>
            <div>
              <label htmlFor="houseCode">Kode Rumah</label>
              <input id="houseCode" name="code" value={houseForm.code} onChange={handleHouseChange} placeholder="Contoh: A-01" required />
            </div>
            <div>
              <label htmlFor="houseOwner">Nama Pemilik</label>
              <input id="houseOwner" name="ownerName" value={houseForm.ownerName} onChange={handleHouseChange} placeholder="Nama pemilik (opsional)" />
            </div>
            <div>
              <label htmlFor="houseAddress">Alamat</label>
              <textarea id="houseAddress" name="address" value={houseForm.address} onChange={handleHouseChange} placeholder="Alamat lengkap (opsional)" />
            </div>
            <button className="button button--ghost" type="submit">
              Simpan Rumah
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
