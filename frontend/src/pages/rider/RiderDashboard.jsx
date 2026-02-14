import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

export default function RiderDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [filters, setFilters] = useState({ status: 'all' });

  useEffect(() => {
    // Ottieni la posizione del rider
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        error => console.error('Errore geolocalizzazione:', error)
      );
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Aggiorna ogni 30 secondi
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      // Separa ordini disponibili da quelli presi dal rider
      const available = response.data.filter(o => o.status === 'pending');
      const mine = response.data.filter(o => o.rider_id === user.id);
      setOrders(available);
      setMyOrders(mine);
      setLoading(false);
    } catch (err) {
      console.error('Errore:', err);
      setLoading(false);
    }
  };

  const calculateDistance = (order) => {
    if (!userLocation) return null;
    // Semplice calcolo approssimativo della distanza (in km)
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = order.delivery_lat || 41.9028;
    const lon2 = order.delivery_lng || 12.4964;

    const R = 6371; // Raggio della terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.updateStatus(orderId, 'accepted', { rider_id: user.id });
      fetchOrders();
    } catch (err) {
      alert('Errore nell\'accettazione ordine');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await ordersAPI.updateStatus(orderId, 'completed');
      fetchOrders();
    } catch (err) {
      alert('Errore nel completamento ordine');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const distA = parseFloat(calculateDistance(a)) || 999;
    const distB = parseFloat(calculateDistance(b)) || 999;
    return distA - distB;
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="hero mb-4">
        <h1>🚗 Benvenuto, {user.name}!</h1>
        <p>Completa le consegne e guadagna</p>
      </div>

      {/* Location Info */}
      {userLocation && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', borderLeft: '4px solid var(--success-color)' }}>
          <p style={{ margin: 0 }}>
            📍 Posizione: Lat {userLocation.lat.toFixed(4)}, Lng {userLocation.lng.toFixed(4)} | Precisione: ±{Math.round(userLocation.accuracy)}m
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-3 gap-2 mb-4">
        <div className="card text-center">
          <p style={{ margin: 0, fontSize: '2rem' }}>📦</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{orders.length}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>Ordini Disponibili</p>
        </div>
        <div className="card text-center">
          <p style={{ margin: 0, fontSize: '2rem' }}>🚚</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{myOrders.filter(o => o.status === 'accepted').length}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>In Consegna</p>
        </div>
        <div className="card text-center">
          <p style={{ margin: 0, fontSize: '2rem' }}>✅</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{myOrders.filter(o => o.status === 'completed').length}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>Completati</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-2 gap-2 mb-4" style={{ maxWidth: '500px' }}>
        <button
          onClick={() => setActiveTab('available')}
          className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`}
        >
          📦 Disponibili ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('myorders')}
          className={`btn ${activeTab === 'myorders' ? 'btn-primary' : 'btn-outline'}`}
        >
          🚚 Mie Consegne ({myOrders.length})
        </button>
      </div>

      {activeTab === 'available' ? (
        <div>
          <h2 className="mb-3">📦 Ordini Disponibili Vicino a Te</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="card text-center">
              <p className="text-muted">Nessun ordine disponibile al momento</p>
            </div>
          ) : (
            <div className="list-wrapper">
              {sortedOrders.map(order => {
                const distance = calculateDistance(order);
                return (
                  <div key={order.id} className="card" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
                    <div className="flex-between mb-2">
                      <div>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Ordine #{order.id}</h3>
                        <p className="text-muted">📍 {distance} km da te</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0.5rem 0' }}>€{Number(order.total_price || 0).toFixed(2)}</p>
                        <span className="badge badge-info">⏳ In Attesa</span>
                      </div>
                    </div>
                    <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
                      📌 {order.address || 'Indirizzo non specificato'}
                    </p>
                    {order.notes && (
                      <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#666', marginBottom: '0.5rem' }}>
                        Nota: {order.notes}
                      </p>
                    )}
                    <div className="card-footer">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="btn btn-success"
                        style={{ marginLeft: 'auto' }}
                      >
                        ✅ Prendi Ordine
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="mb-3">🚚 Le Tue Consegne</h2>
          {myOrders.length === 0 ? (
            <div className="card text-center">
              <p className="text-muted">Nessuna consegna attiva</p>
            </div>
          ) : (
            <div className="list-wrapper">
              {myOrders.map(order => (
                <div key={order.id} className="card" style={{ borderLeft: `4px solid ${order.status === 'accepted' ? '#FB8500' : '#4CAF50'}` }}>
                  <div className="flex-between mb-2">
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Ordine #{order.id}</h3>
                      <span className={`badge badge-${order.status === 'accepted' ? 'warning' : 'success'}`}>
                        {order.status === 'accepted' ? '🚗 In Consegna' : '✅ Completato'}
                      </span>
                    </div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>€{Number(order.total_price || 0).toFixed(2)}</p>
                  </div>
                  <p className="text-muted">📍 {order.address || 'Indirizzo'}</p>
                  {order.status === 'accepted' && (
                    <div className="card-footer">
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        className="btn btn-success"
                        style={{ marginLeft: 'auto' }}
                      >
                        ✅ Consegna Completata
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
