import { useEffect, useMemo, useState } from 'react';
import DashboardSummary from '../components/DashboardSummary.jsx';
import * as api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage({ readOnly = false }) {
  const { token } = useAuth();
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .fetchHouses(token)
      .then((response) => {
        if (isMounted) {
          setHouses(response.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);
      try {
        const payload = await api.fetchDashboard({ houseId: selectedHouse || undefined, token });
        if (isMounted) {
          setSummary(payload.data || payload);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat ringkasan');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [selectedHouse, token]);

  const options = useMemo(
    () => [
      { value: '', label: 'Semua Rumah' },
      ...houses.map((house) => ({ value: house.id, label: `${house.code} ${house.ownerName ? `- ${house.ownerName}` : ''}` })),
    ],
    [houses],
  );

  return (
    <div className="stack">
      <div className="card">
        <div className="form-grid form-grid--two-columns">
          <div>
            <label htmlFor="houseFilter">Filter Rumah</label>
            <select
              id="houseFilter"
              value={selectedHouse}
              onChange={(event) => setSelectedHouse(event.target.value)}
              disabled={readOnly || houses.length === 0}
            >
              {options.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {!readOnly && (
            <div className="status-text" style={{ alignSelf: 'flex-end' }}>
              Ringkasan diperbarui secara otomatis berdasarkan transaksi terbaru.
            </div>
          )}
        </div>
      </div>
      <div className="card">
        {loading ? <p className="status-text">Memuat ringkasan...</p> : error ? <div className="alert alert--danger">{error}</div> : <DashboardSummary summary={summary} />}
      </div>
    </div>
  );
}
