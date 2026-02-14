import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

export default function ManagerDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [riders] = useState([
    { id: 1, name: 'Marco Rossi', status: 'free', currentOrders: 0, totalDeliveries: 45, rating: 4.8, lastSeen: '5 min fa' },
    { id: 2, name: 'Giovanni Bianchi', status: 'busy', currentOrders: 2, totalDeliveries: 82, rating: 4.9, lastSeen: 'Ora' },
    { id: 3, name: 'Luca Verdi', status: 'free', currentOrders: 0, totalDeliveries: 38, rating: 4.6, lastSeen: '15 min fa' },
    { id: 4, name: 'Paolo Neri', status: 'busy', currentOrders: 1, totalDeliveries: 61, rating: 4.7, lastSeen: 'Ora' },
    { id: 5, name: 'Andrea Gialli', status: 'free', currentOrders: 0, totalDeliveries: 29, rating: 4.5, lastSeen: '30 min fa' },
  ]);
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Ordine non consegnato', status: 'open', priority: 'high', createdAt: new Date(Date.now() - 3600000), customerId: 3 },
    { id: 2, title: 'Prodotto danneggiato', status: 'in-progress', priority: 'medium', createdAt: new Date(Date.now() - 7200000), customerId: 5 },
    { id: 3, title: 'Rider non trovato', status: 'closed', priority: 'high', createdAt: new Date(Date.now() - 86400000), customerId: 1 },
  ]);
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', amount: 1250.50, date: new Date(Date.now() - 86400000), status: 'paid', period: 'Gennaio 2026' },
    { id: 'INV-002', amount: 1890.75, date: new Date(Date.now() - 172800000), status: 'paid', period: 'Dicembre 2025' },
    { id: 'INV-003', amount: 2150.00, date: new Date(Date.now() - 259200000), status: 'pending', period: 'Novembre 2025' },
  ]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('riders');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);

      const stats = {
        totalOrders: response.data.length,
        pendingOrders: response.data.filter(o => o.status === 'pending').length,
        activeDeliveries: response.data.filter(o => o.status === 'accepted').length,
        completedOrders: response.data.filter(o => o.status === 'completed').length,
        totalRevenue: response.data.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0)
      };
      setStats(stats);
    } catch (err) {
      console.error('Errore:', err);
    }
  };

  const getRiderStatusBadge = (status) => {
    return status === 'free'
      ? '🟢 Libero'
      : '🔴 Occupato';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in-progress': return '#0066FF';
      case 'open': return '#FF0000';
      case 'closed': return '#228B22';
      case 'paid': return '#228B22';
      case 'unpaid': return '#FF0000';
      default: return '#999';
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero mb-4">
        <h1>⚙️ Panel Gestione</h1>
        <p>Gestisci riders, ordini, ticket, fatture e profili dal tuo account</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-4 gap-2 mb-4">
        <div className="card text-center" style={{ backgroundColor: 'rgba(255, 107, 0, 0.05)', borderLeft: '4px solid #FF6B00' }}>
          <p style={{ margin: 0, fontSize: '2rem' }}>📦</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.8rem' }}>{stats.totalOrders}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>Ordini Totali</p>
        </div>

        <div className="card text-center" style={{ backgroundColor: 'rgba(251, 133, 0, 0.05)', borderLeft: '4px solid #FBA500' }}>
          <p style={{ margin: 0, fontSize: '2rem' }}>⏳</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.8rem' }}>{stats.pendingOrders}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>In Attesa</p>
        </div>

        <div className="card text-center" style={{ backgroundColor: 'rgba(0, 102, 255, 0.05)', borderLeft: '4px solid #0066FF' }}>
          <p style={{ margin: 0, fontSize: '2rem' }}>🚚</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.8rem' }}>{stats.activeDeliveries}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>In Consegna</p>
        </div>

        <div className="card text-center" style={{ backgroundColor: 'rgba(76, 175, 80, 0.05)', borderLeft: '4px solid #4CAF50' }}>
          <p style={{ margin: 0, fontSize: '2rem' }}>€</p>
          <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '1.5rem' }}>{stats.totalRevenue.toFixed(2)}</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>Ricavo Totale</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '2rem', maxWidth: '100%' }}>
        {[
          { id: 'riders', label: '🚴 Rider', icon: '🚴' },
          { id: 'orders', label: '📋 Ordini', icon: '📋' },
          { id: 'tickets', label: '🎫 Ticket', icon: '🎫' },
          { id: 'invoices', label: '📄 Bollette', icon: '📄' },
          { id: 'profiles', label: '👥 Profili', icon: '👥' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              borderRadius: '8px',
              border: `2px solid ${activeTab === tab.id ? '#FF6B00' : '#ddd'}`,
              backgroundColor: activeTab === tab.id ? '#FF6B00' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#333',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RIDERS TAB */}
      {activeTab === 'riders' && (
        <div>
          <h2 className="mb-3">🚴 Gestione Rider</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {riders.map(rider => (
              <div key={rider.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>👤 {rider.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>{getRiderStatusBadge(rider.status)}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', backgroundColor: rider.status === 'free' ? '#E8F5E9' : '#FFEBEE', color: rider.status === 'free' ? '#228B22' : '#D32F2F' }}>
                    {rider.status === 'free' ? 'Libero' : 'Occupato'}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f8f8f8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>📦 Ordini Attuali: <strong>{rider.currentOrders}</strong></p>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>✅ Consegne Totali: <strong>{rider.totalDeliveries}</strong></p>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>⭐ Valutazione: <strong>{rider.rating}</strong></p>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>👁️ Visto: <strong>{rider.lastSeen}</strong></p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}>📞 Contatta</button>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}>📍 Localizza</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="mb-3">📋 Gestione Ordini</h2>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'accepted', 'completed'].map(status => (
              <button
                key={status}
                className="btn btn-sm"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: '#fff',
                  color: '#333',
                }}
              >
                {status === 'all' ? 'Tutti' : status === 'pending' ? '⏳ In Attesa' : status === 'accepted' ? '🚗 In Consegna' : '✅ Completati'}
              </button>
            ))}
          </div>

          <div>
            {orders.slice(0, 10).map(order => (
              <div key={order.id} className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${getStatusColor(order.status === 'pending' ? 'pending' : order.status === 'accepted' ? 'in-progress' : 'closed')}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Ordine #{order.id}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>👤 {order.customer_name || 'Cliente Sconosciuto'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#FF6B00' }}>€{(order.total_price || 0).toFixed(2)}</p>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', backgroundColor: getStatusColor(order.status === 'pending' ? 'pending' : order.status === 'accepted' ? 'in-progress' : 'closed'), color: '#fff', fontSize: '0.75rem', fontWeight: '600', marginTop: '4px' }}>
                      {order.status === 'pending' ? '⏳ In Attesa' : order.status === 'accepted' ? '🚗 In Consegna' : '✅ Completato'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#999' }}>🚴 Rider: {order.rider_name || 'Non Assegnato'}</p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#999' }}>📍 {order.address}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div>
          <h2 className="mb-3">🎫 Centro Assistenza - Ticket</h2>
          <button className="btn btn-primary mb-3">➕ Nuovo Ticket</button>

          <div>
            {tickets.map(ticket => (
              <div key={ticket.id} className="card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${getStatusColor(ticket.status === 'open' ? 'open' : ticket.status === 'in-progress' ? 'in-progress' : 'closed')}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>🎫 {ticket.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>ID: #{ticket.id} • Cliente: #{ticket.customerId}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: ticket.priority === 'high' ? '#FFEBEE' : '#FFF3E0', color: ticket.priority === 'high' ? '#D32F2F' : '#E65100', fontSize: '0.75rem', fontWeight: '600' }}>
                      {ticket.priority === 'high' ? '🔴 Alta Priorità' : ticket.priority === 'medium' ? '🟡 Media' : '🟢 Bassa'}
                    </span>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: getStatusColor(ticket.status === 'open' ? 'open' : ticket.status === 'in-progress' ? 'in-progress' : 'closed'), color: '#fff', fontSize: '0.75rem', fontWeight: '600' }}>
                      {ticket.status === 'open' ? '🔴 Aperto' : ticket.status === 'in-progress' ? '🟡 In Corso' : '✅ Chiuso'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#999' }}>📅 {ticket.createdAt.toLocaleString('it-IT')}</p>

                <button className="btn btn-outline" style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '6px 12px' }}>
                  👁️ Visualizza Dettagli
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div>
          <h2 className="mb-3">📄 Bollette e Fatture</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {invoices.map(invoice => (
              <div key={invoice.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>📄 {invoice.id}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{invoice.period}</p>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: invoice.status === 'paid' ? '#E8F5E9' : '#FFF3E0', color: invoice.status === 'paid' ? '#228B22' : '#E65100', fontSize: '0.75rem', fontWeight: '600' }}>
                    {invoice.status === 'paid' ? '✅ Pagato' : '⏳ In Sospeso'}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f8f8f8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Importo</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#FF6B00' }}>€{invoice.amount.toFixed(2)}</p>
                </div>

                <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#999' }}>📅 {invoice.date.toLocaleDateString('it-IT')}</p>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '6px' }}>📥 Scarica</button>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: '0.85rem', padding: '6px' }}>👁️ Visualizza</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILES TAB */}
      {activeTab === 'profiles' && (
        <div>
          <h2 className="mb-3">👥 Gestione Profili</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>👤 Profili Rider</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Gestisci i profili dei rider, documenti e verifiche</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Gestisci Rider</button>
            </div>

            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>👨‍💼 Profili Customer</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Visualizza e gestisci i profili dei clienti</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Gestisci Clienti</button>
            </div>

            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>⚙️ Impostazioni Account</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Configura le tue impostazioni di manager</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Impostazioni</button>
            </div>

            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>🔐 Sicurezza</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Modifica password e impostazioni privacy</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Sicurezza</button>
            </div>

            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>📊 Ruoli & Permessi</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Gestisci ruoli e accessi per i team manager</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Ruoli</button>
            </div>

            <div className="card">
              <h3 style={{ margin: 0, marginBottom: '1rem' }}>📧 Notifiche</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Configura le tue preferenze di notifica</p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Notifiche</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
