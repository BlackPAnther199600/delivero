import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI, restaurantsAPI } from '../../services/api';
import './CustomerHome.css';

export default function CustomerHomeAdvanced() {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);

  // Enhanced categories with icons
  const categories = [
    { id: 'all', name: 'Tutti', icon: '🏠', color: '#FF6B00' },
    { id: 'pizza', name: 'Pizza', icon: '🍕', color: '#FFE5CC' },
    { id: 'burger', name: 'Burger', icon: '🍔', color: '#FFF0E6' },
    { id: 'sushi', name: 'Sushi', icon: '🍣', color: '#E0F7FF' },
    { id: 'poke', name: 'Poke', icon: '🥗', color: '#E8F5E9' },
    { id: 'kebab', name: 'Kebab', icon: '🌮', color: '#FFF3E0' },
    { id: 'dessert', name: 'Dessert', icon: '🍰', color: '#FCE4EC' },
    { id: 'healthy', name: 'Healthy', icon: '🥙', color: '#E0F2F1' },
    { id: 'italian', name: 'Italiano', icon: '🍝', color: '#F3E5F5' }
  ];

  // Load data on mount
  useEffect(() => {
    loadRestaurants();
    loadRecentOrders();
    loadPromotions();
    loadFavorites();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantsAPI.getAll();
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const data = await ordersAPI.getMyOrders();
      setRecentOrders(data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadPromotions = async () => {
    // Mock promotions - in real app would come from API
    setPromotions([
      { id: 1, title: 'Sconto 20% Pizza', description: 'Su tutte le pizze', discount: '20%', icon: '🍕' },
      { id: 2, title: 'Consegna Gratis', description: 'Ordini sopra €15', discount: 'Consegna', icon: '🚚' },
      { id: 3, title: 'Happy Hour', description: '50% di sconto 18-20', discount: '50%', icon: '🎉' }
    ]);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoriteRestaurants');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const toggleFavorite = useCallback((restaurant) => {
    const isFavorited = favorites.some(f => f.id === restaurant.id);
    let newFavorites;
    
    if (isFavorited) {
      newFavorites = favorites.filter(f => f.id !== restaurant.id);
    } else {
      newFavorites = [...favorites, restaurant];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRestaurants', JSON.stringify(newFavorites));
  }, [favorites]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = !searchText || 
      restaurant.name.toLowerCase().includes(searchText.toLowerCase()) ||
      restaurant.category?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || restaurant.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderRestaurantCard = (restaurant) => (
    <div className="restaurant-card">
      <div className="restaurant-header">
        <div className="restaurant-info">
          <h3>{restaurant.name}</h3>
          <div className="restaurant-meta">
            <span className="rating">⭐ {restaurant.rating || '4.5'}</span>
            <span className="time">⏱️ {restaurant.delivery_time || '30'} min</span>
            <span className="price">💰 €{restaurant.delivery_cost || '2.00'}</span>
          </div>
        </div>
        <button 
          className="favorite-btn"
          onClick={() => toggleFavorite(restaurant)}
        >
          {favorites.some(f => f.id === restaurant.id) ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="restaurant-footer">
        <p className="description">{restaurant.description}</p>
        <div className="restaurant-actions">
          <button className="order-btn">Ordina Ora</button>
          <button className="menu-btn">Menu Completo</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customer-home-advanced">
      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Cerca ristoranti o piatti..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
          <button className="filter-btn">Filtri</button>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <h2>🍽️ Categorie</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
              style={{ backgroundColor: category.color }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promotions Banner */}
      <div className="promotions-section">
        <h2>🎉 Offerte Speciali</h2>
        <div className="promotions-grid">
          {promotions.map(promo => (
            <div key={promo.id} className="promotion-card">
              <div className="promotion-header">
                <span className="promo-icon">{promo.icon}</span>
                <span className="promo-title">{promo.title}</span>
                <span className="promo-discount">{promo.discount}</span>
              </div>
              <p className="promo-description">{promo.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders-section">
        <h2>📦 Ordini Recenti</h2>
        <div className="recent-orders-grid">
          {recentOrders.map(order => (
            <div key={order.id} className="recent-order-card">
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
                <span className="order-status">{order.status}</span>
              </div>
              <div className="order-content">
                <p className="order-items">{order.items?.slice(0, 2).join(', ')}...</p>
                <p className="order-total">€{order.total_amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="restaurants-section">
        <h2>🍽️ Ristoranti ({filteredRestaurants.length})</h2>
        {loading ? (
          <div className="loading">Caricamento...</div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map(restaurant => renderRestaurantCard(restaurant))}
          </div>
        )}
      </div>
    </div>
  );
}
