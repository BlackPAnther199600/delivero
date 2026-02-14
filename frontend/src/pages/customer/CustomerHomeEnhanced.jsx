import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import './CustomerHome.css';

export default function CustomerHomeEnhanced() {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [restaurants, setRestaurants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const foodCategories = [
    { id: 1, name: 'Pizza', emoji: '🍕', color: '#FFE5CC' },
    { id: 2, name: 'Burger', emoji: '🍔', color: '#FFF0E6' },
    { id: 3, name: 'Sushi', emoji: '🍣', color: '#E0F7FF' },
    { id: 4, name: 'Poke', emoji: '🥗', color: '#E8F5E9' },
    { id: 5, name: 'Kebab', emoji: '🌮', color: '#FFF3E0' },
    { id: 6, name: 'Dessert', emoji: '🍰', color: '#FCE4EC' },
    { id: 7, name: 'Cinese', emoji: '🥡', color: '#FFF9C4' },
    { id: 8, name: 'Healthy', emoji: '🥙', color: '#E0F2F1' },
    { id: 9, name: 'Italiano', emoji: '🍝', color: '#F3E5F5' },
  ];

  const allRestaurants = [
    { id: 1, name: 'Pizzeria Roma', category: 'Pizza', rating: 4.8, distance: 0.5, time: 20, price: '€', reviews: 324 },
    { id: 2, name: 'Burger House', category: 'Burger', rating: 4.6, distance: 0.8, time: 15, price: '€€', reviews: 256 },
    { id: 3, name: 'Sushi Master', category: 'Sushi', rating: 4.9, distance: 1.2, time: 30, price: '€€€', reviews: 412 },
    { id: 4, name: 'Poke Bowl', category: 'Poke', rating: 4.7, distance: 0.6, time: 15, price: '€€', reviews: 189 },
    { id: 5, name: 'Kebab Palace', category: 'Kebab', rating: 4.5, distance: 0.9, time: 10, price: '€', reviews: 145 },
    { id: 6, name: 'Pasticceria Dolce', category: 'Dessert', rating: 4.9, distance: 0.4, time: 5, price: '€€', reviews: 267 },
  ];

  useEffect(() => {
    setRestaurants(allRestaurants);
    setLoading(false);
  }, []);

  const toggleFavorite = (restaurant) => {
    const isFavorited = favorites.some(f => f.id === restaurant.id);
    if (isFavorited) {
      setFavorites(favorites.filter(f => f.id !== restaurant.id));
    } else {
      setFavorites([...favorites, restaurant]);
    }
  };

  const findRestaurants = () => {
    let results = [...allRestaurants];

    if (searchText) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(searchText.toLowerCase()) ||
        r.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (activeFilter === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === 'distance') {
      results.sort((a, b) => a.distance - b.distance);
    } else if (activeFilter === 'fast') {
      results = results.filter(r => r.time <= 20);
    }

    return results;
  };

  const promos = [
    { id: 1, title: '🎉 Sconto 20% - Prime 3 ordini', code: 'BENVENUTO20' },
    { id: 2, title: '🍕 Pizza: 2a al 50%', code: 'PIZZA50' },
    { id: 3, title: '⭐ Raccogli punti fedeltà', code: 'LOYALTY' },
  ];

  const filteredRestaurants = findRestaurants();

  return (
    <div className="customer-home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">🍽️ Delivero</h1>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ❤️ Preferiti ({favorites.length})
            </button>
            <button 
              className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Ordini
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {activeTab === 'home' && (
          <>
            {/* Header */}
            <div className="hero">
              <h2>🍽️ Cosa vuoi ordinare?</h2>
              <p>Encuentra los mejores de comida cerca de ti</p>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca ristorante, piatto..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* Promos */}
            <div className="promos-section">
              <h3>🎉 Offerte Speciali</h3>
              <div className="promos-carousel">
                {promos.map(promo => (
                  <div key={promo.id} className="promo-card">
                    <p className="promo-title">{promo.title}</p>
                    <span className="promo-code">{promo.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Tutti
              </button>
              <button
                className={`filter-btn ${activeFilter === 'rating' ? 'active' : ''}`}
                onClick={() => setActiveFilter('rating')}
              >
                ⭐ Top Rated
              </button>
              <button
                className={`filter-btn ${activeFilter === 'distance' ? 'active' : ''}`}
                onClick={() => setActiveFilter('distance')}
              >
                📍 Più Vicini
              </button>
              <button
                className={`filter-btn ${activeFilter === 'fast' ? 'active' : ''}`}
                onClick={() => setActiveFilter('fast')}
              >
                ⚡ Veloce
              </button>
            </div>

            {/* Categories */}
            <div className="categories-section">
              <h3>Categorie</h3>
              <div className="categories-grid">
                {foodCategories.map(cat => (
                  <div
                    key={cat.id}
                    className="category-card"
                    style={{ backgroundColor: cat.color }}
                  >
                    <span className="category-emoji">{cat.emoji}</span>
                    <p className="category-name">{cat.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurants */}
            <div className="restaurants-section">
              <h3>
                {searchText ? `🔍 Risultati per "${searchText}"` : '🌟 Consigliati per Te'}
              </h3>
              {filteredRestaurants.length === 0 ? (
                <p className="no-results">Nessun ristorante trovato 📭</p>
              ) : (
                <div className="restaurants-grid">
                  {filteredRestaurants.map(restaurant => {
                    const isFavorited = favorites.some(f => f.id === restaurant.id);
                    return (
                      <div key={restaurant.id} className="restaurant-card">
                        <div className="restaurant-header">
                          <div>
                            <h4 className="restaurant-name">{restaurant.name}</h4>
                            <p className="restaurant-category">
                              {restaurant.category} • {restaurant.price}
                            </p>
                          </div>
                          <button
                            className="favorite-btn"
                            onClick={() => toggleFavorite(restaurant)}
                          >
                            {isFavorited ? '❤️' : '🤍'}
                          </button>
                        </div>

                        <div className="restaurant-stats">
                          <span className="stat-badge">⭐ {restaurant.rating} ({restaurant.reviews})</span>
                          <span className="stat-badge">📍 {restaurant.distance}km</span>
                          <span className="stat-badge time">⏱️ {restaurant.time}min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <h2>❤️ I Tuoi Preferiti</h2>
            {favorites.length === 0 ? (
              <p className="no-results">Nessun ristorante salvato nei preferiti</p>
            ) : (
              <div className="restaurants-grid">
                {favorites.map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card">
                    <div className="restaurant-header">
                      <div>
                        <h4 className="restaurant-name">{restaurant.name}</h4>
                        <p className="restaurant-category">
                          {restaurant.category} • {restaurant.price}
                        </p>
                      </div>
                      <button
                        className="favorite-btn"
                        onClick={() => toggleFavorite(restaurant)}
                      >
                        ❤️
                      </button>
                    </div>
                    <div className="restaurant-stats">
                      <span className="stat-badge">⭐ {restaurant.rating}</span>
                      <span className="stat-badge">📍 {restaurant.distance}km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
