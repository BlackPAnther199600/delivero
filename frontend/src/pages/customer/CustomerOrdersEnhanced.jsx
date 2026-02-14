import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import './CustomerOrders.css';

export default function CustomerOrdersEnhanced() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModal, setTrackingModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState('');

  const orderStatuses = {
    pending: { label: 'In Attesa', color: '#FFC107', icon: '⏳' },
    accepted: { label: 'Accettato', color: '#0066FF', icon: '✓' },
    pickup: { label: 'Ritiro', color: '#FFA500', icon: '📦' },
    in_transit: { label: 'In Consegna', color: '#FFD700', icon: '🚗' },
    delivered: { label: 'Consegnato', color: '#28A745', icon: '✅' },
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    } else if (activeTab === 'past') {
      return orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
    }
    return [];
  };

  const handleCancelOrder = async (order) => {
    if (window.confirm(`Sei sicuro di voler cancellare l'ordine da ${order.restaurant_name}?`)) {
      try {
        await ordersAPI.cancelOrder(order.id);
        alert('✅ Ordine cancellato con successo');
        loadOrders();
      } catch (error) {
        alert('Errore: Non puoi annullare questo ordine');
      }
    }
  };

  const handleReorder = (order) => {
    alert(`🔄 Riordina da ${order.restaurant_name} (funzionalità da implementare)`);
  };

  const submitRating = async () => {
    if (rating === 0) {
      alert('Seleziona una valutazione');
      return;
    }

    try {
      await ordersAPI.rateOrder(selectedOrder.id, {
        rating,
        notes: ratingNote,
      });
      alert('✅ Grazie! Ordine valutato ' + rating + '⭐');
      setRatingModal(false);
      setRating(0);
      setRatingNote('');
      loadOrders();
    } catch (error) {
      alert('Errore nel salvataggio valutazione');
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="customer-orders">
      {/* Header */}
      <div className="header">
        <h1>I Miei Ordini 🍔</h1>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Attivi
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Storico
        </button>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {loading ? (
          <p className="loading">Caricamento...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="empty">
            {activeTab === 'active'
              ? '📭 Nessun ordine attivo'
              : '📭 Nessun ordine nel storico'}
          </p>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => {
              const statusInfo = orderStatuses[order.status] || {
                label: 'Sconosciuto',
                color: '#999',
              };
              const isActive =
                order.status !== 'delivered' && order.status !== 'cancelled';
              const canRate = order.status === 'delivered' && !order.rated;
              const canCancel =
                isActive &&
                order.status !== 'in_transit' &&
                order.status !== 'pickup';

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="restaurant-info">
                      <h3 className="restaurant-name">
                        {order.restaurant_name || 'Ristorante'}
                      </h3>
                      <p className="order-id">
                        Ordine #{order.id?.toString().slice(-4)}
                      </p>
                    </div>
                    <div
                      className="status-badge"
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      <span className="status-icon">{statusInfo.icon}</span>
                      <span className="status-label">{statusInfo.label}</span>
                    </div>
                  </div>

                  <div className="order-details">
                    <span className="items-count">
                      📦 {order.items_count || 2} articoli
                    </span>
                    <span className="total-price">
                      €{order.total_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  <div className="timestamp-row">
                    <span className="timestamp">
                      {new Date(order.created_at).toLocaleDateString('it-IT')}{' '}
                      {new Date(order.created_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isActive && (
                      <span className="eta">
                        ⏱️ {order.estimated_time || '30'} min
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="action-row">
                    {isActive && (
                      <button
                        className="btn-track"
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingModal(true);
                        }}
                      >
                        🗺️ Traccia
                      </button>
                    )}
                    {canCancel && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(order)}
                      >
                        ✕ Annulla
                      </button>
                    )}
                    {canRate && (
                      <button
                        className="btn-rate"
                        onClick={() => {
                          setSelectedOrder(order);
                          setRatingModal(true);
                        }}
                      >
                        ⭐ Valuta
                      </button>
                    )}
                    {!isActive && (
                      <button
                        className="btn-reorder"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Riordina
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Traccia Ordine</h2>
              <button
                className="modal-close"
                onClick={() => setTrackingModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="tracking-info">
              <p className="tracking-restaurant">
                {selectedOrder.restaurant_name}
              </p>
              <p className="tracking-total">
                Totale: €{selectedOrder.total_amount?.toFixed(2)}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="timeline">
              {Object.entries(orderStatuses).map(([key, status], index) => (
                <div key={key} className="timeline-item">
                  <div
                    className={`timeline-dot ${
                      selectedOrder.status === key ? 'active' : ''
                    }`}
                  >
                    <span className="timeline-icon">{status.icon}</span>
                  </div>
                  {index < Object.keys(orderStatuses).length - 1 && (
                    <div
                      className={`timeline-line ${
                        selectedOrder.status === key ? 'active' : ''
                      }`}
                    />
                  )}
                  <span
                    className={`timeline-label ${
                      selectedOrder.status === key ? 'active' : ''
                    }`}
                  >
                    {status.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Rider Info */}
            {selectedOrder.status !== 'pending' &&
              selectedOrder.status !== 'accepted' && (
                <div className="rider-section">
                  <h3>Il tuo Rider 🚗</h3>
                  <div className="rider-card">
                    <p className="rider-name">
                      {selectedOrder.rider_name || 'Rider assegnato'}
                    </p>
                    <p className="rider-rating">
                      ⭐ {selectedOrder.rider_rating || '4.8'} • 📍{' '}
                      {selectedOrder.rider_distance || '0.5km'}
                    </p>
                    <button className="btn-contact">📞 Chiama</button>
                  </div>
                </div>
              )}

            <button
              className="btn-close-modal"
              onClick={() => setTrackingModal(false)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>⭐ Valuta l'Ordine</h2>
              <button
                className="modal-close"
                onClick={() => setRatingModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="rating-subtitle">
              Come è andato l'ordine da {selectedOrder.restaurant_name}?
            </p>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              className="note-input"
              placeholder="Aggiungi una nota... (opzionale)"
              value={ratingNote}
              onChange={(e) => setRatingNote(e.target.value)}
              rows="3"
            />

            <div className="modal-buttons">
              <button
                className="btn-modal-cancel"
                onClick={() => {
                  setRatingModal(false);
                  setRating(0);
                  setRatingNote('');
                }}
              >
                Annulla
              </button>
              <button className="btn-modal-save" onClick={submitRating}>
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
