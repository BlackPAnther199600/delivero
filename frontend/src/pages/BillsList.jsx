import { useEffect, useState } from "react";
import { billsAPI } from "../services/api";

export default function BillsList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll();
      setBills(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteBill = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Sei sicuro di voler eliminare questa bolletta?")) {
      try {
        await billsAPI.delete(id);
        setBills(bills.filter(b => b.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p className="text-muted ml-2">Caricamento bollette...</p>
    </div>
  );
  if (error) return (
    <div className="alert alert-error" role="alert">
      <span>⚠️</span>
      <span>Errore: {error}</span>
    </div>
  );

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>💳 Le tue Bollette</h2>
        <span className="badge badge-info">{bills.length} bollette</span>
      </div>

      {bills.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">Nessuna bolletta registrata</p>
        </div>
      ) : (
        <div className="list-wrapper">
          {bills.map(bill => (
            <div
              key={bill.id}
              className="card"
              style={{ borderLeft: '4px solid var(--warning-color)' }}
            >
              <div className="flex-between mb-2">
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>📋 {bill.type}</h3>
                  {bill.description && (
                    <p className="text-muted" style={{ margin: 0, marginBottom: '0.5rem' }}>
                      {bill.description}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>
                    📅 Scade: {new Date(bill.due_date).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    €{Number(bill.amount).toFixed(2)}
                  </p>
                  <span className="badge badge-warning">Pendente</span>
                </div>
              </div>
              <div className="card-footer">
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="btn btn-danger btn-sm"
                >
                  🗑️ Elimina
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginLeft: 'auto' }}
                >
                  💳 Paga
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
