import React, { useState, useEffect } from 'react';
import API from '../services/api';

const PharmacyOrder = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch nearby pharmacies
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await API.get('/pharmacies');
      setPharmacies(response.data);
    } catch (error) {
      setMessage(`Errore caricamento farmacie: ${error.message}`);
    }
  };

  const handlePharmacySelect = async (pharmacyId) => {
    setSelectedPharmacy(pharmacyId);
    try {
      const response = await API.get(`/pharmacies/${pharmacyId}/products`);
      setProducts(response.data);
    } catch (error) {
      setMessage(`Errore caricamento prodotti: ${error.message}`);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedPharmacy || cart.length === 0) {
      setMessage('Seleziona una farmacia e aggiungi prodotti');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/pharmacies/orders/create', {
        pharmacyId: selectedPharmacy,
        items: cart,
        deliveryAddress,
        lat: 0, // Get from geolocation
        lon: 0
      });

      setMessage('Ordine creato con successo!');
      setCart([]);
      setDeliveryAddress('');
    } catch (error) {
      setMessage(`Errore: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="pharmacy-order">
      <h3>Ordina Farmaci</h3>

      <div className="pharmacies-list">
        <h4>Farmacie Disponibili</h4>
        {pharmacies.map(pharmacy => (
          <div
            key={pharmacy.id}
            className={`pharmacy-card ${selectedPharmacy === pharmacy.id ? 'selected' : ''}`}
            onClick={() => handlePharmacySelect(pharmacy.id)}
          >
            <h5>{pharmacy.name}</h5>
            <p>{pharmacy.address}</p>
            <p>⭐ {pharmacy.rating}</p>
          </div>
        ))}
      </div>

      {selectedPharmacy && (
        <>
          <div className="products-list">
            <h4>Prodotti</h4>
            {products.map(product => (
              <div key={product.id} className="product-card">
                <h5>{product.name}</h5>
                <p>{product.description}</p>
                <p className="price">€{product.price.toFixed(2)}</p>
                <p className="stock">Stock: {product.stock_quantity}</p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                >
                  Aggiungi al Carrello
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleCheckout} className="checkout-form">
            <h4>Riepilogo Ordine</h4>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Rimuovi
                  </button>
                </div>
              ))}
            </div>

            <div className="total">
              <strong>Totale: €{totalPrice.toFixed(2)}</strong>
            </div>

            <input
              type="text"
              placeholder="Indirizzo di consegna"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />

            <button type="submit" disabled={loading || cart.length === 0}>
              {loading ? 'Elaborazione...' : 'Ordina Ora'}
            </button>
          </form>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default PharmacyOrder;
