import React, { useState } from 'react';
import { ordersAPI } from '../services/api';

export default function CreateOrderModal({ category, onOrderCreated, onClose }) {
  const [formData, setFormData] = useState({
    description: '',
    address: '',
    total_price: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ordersAPI.create({
        ...formData,
        category,
        status: 'pending'
      });
      setError(null);
      setFormData({ description: '', address: '', total_price: '', notes: '' });
      onOrderCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nella creazione ordine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">📝 Descrizione Ordine</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Descrivi cosa desideri ordinare..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">📍 Indirizzo di Consegna</label>
          <input
            id="address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Via Roma, 123 - 00100 Roma"
          />
        </div>

        <div className="grid grid-2 gap-2">
          <div className="form-group">
            <label htmlFor="price">💰 Importo (€)</label>
            <input
              id="price"
              type="number"
              name="total_price"
              value={formData.total_price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">📌 Note Aggiuntive</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Es. Niente cipolla, senza lattosio, etc..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Creazione...' : '🚀 Conferma Ordine'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            ❌ Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
