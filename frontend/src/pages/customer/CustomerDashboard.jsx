import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import CreateOrderModal from '../../components/CreateOrderModal';
import CustomerHomeEnhanced from './CustomerHomeEnhanced';
import CustomerOrdersEnhanced from './CustomerOrdersEnhanced';

const CATEGORIES = [
  { id: 'food', name: '🍔 Cibo', icon: '🍕', color: '#FF6B6B' },
  { id: 'pharmacy', name: '💊 Farmacia', icon: '⚕️', color: '#4ECDC4' },
  { id: 'groceries', name: '🛒 Spesa', icon: '🥬', color: '#45B7AA' },
  { id: 'clothes', name: '👕 Abbigliamento', icon: '👔', color: '#F7DC6F' },
  { id: 'electronics', name: '💻 Elettronica', icon: '📱', color: '#3498DB' },
  { id: 'books', name: '📚 Libri', icon: '📖', color: '#9B59B6' },
];

export default function CustomerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div>
      {/* Top Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            background: activeTab === 'home' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'home' ? 'white' : 'var(--text-color)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'home' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          🏠 Home
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'orders' ? 'white' : 'var(--text-color)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          📦 Ordini
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            background: activeTab === 'favorites' ? 'var(--primary-color)' : 'transparent',
            color: activeTab === 'favorites' ? 'white' : 'var(--text-color)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'favorites' ? 'bold' : 'normal',
            transition: 'all 0.3s ease'
          }}
        >
          ❤️ Preferiti
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && <CustomerHomeEnhanced user={user} />}
      {activeTab === 'orders' && <CustomerOrdersEnhanced user={user} />}
      {activeTab === 'favorites' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
            ❤️ I tuoi preferiti verranno mostrati qui
          </p>
        </div>
      )}
    </div>
  );
}
