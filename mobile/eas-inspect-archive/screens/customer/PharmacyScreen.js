import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import API from '../../services/api';

const PharmacyScreen = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response = await API.get('/pharmacies');
      setPharmacies(response.data);
    } catch (error) {
      Alert.alert('Errore', error.message);
    }
  };

  const selectPharmacy = async (pharmacyId) => {
    setSelectedPharmacy(pharmacyId);
    try {
      const response = await API.get(`/pharmacies/${pharmacyId}/products`);
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Errore', error.message);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!selectedPharmacy) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 15 }}>
          Farmacie Disponibili
        </Text>
        {pharmacies.map(pharmacy => (
          <TouchableOpacity
            key={pharmacy.id}
            style={{
              padding: 15,
              marginHorizontal: 15,
              marginVertical: 8,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#34C759'
            }}
            onPress={() => selectPharmacy(pharmacy.id)}
          >
            <Text style={{ fontSize: 16, fontWeight: '600' }}>
              🏥 {pharmacy.name}
            </Text>
            <Text style={{ color: '#666', marginTop: 5 }}>
              📍 {pharmacy.address}
            </Text>
            <Text style={{ color: '#007AFF', marginTop: 5 }}>
              ⭐ {pharmacy.rating.toFixed(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  const selectedPharmacyData = pharmacies.find(p => p.id === selectedPharmacy);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity
        style={{ padding: 15, paddingBottom: 0 }}
        onPress={() => setSelectedPharmacy(null)}
      >
        <Text style={{ color: '#007AFF', fontSize: 16 }}>← Torna alle farmacie</Text>
      </TouchableOpacity>

      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          🏥 {selectedPharmacyData?.name}
        </Text>
        <Text style={{ color: '#666', marginTop: 5 }}>
          {selectedPharmacyData?.address}
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingHorizontal: 15, paddingTop: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          Prodotti Disponibili
        </Text>
        {products.map(product => (
          <View
            key={product.id}
            style={{
              padding: 12,
              marginBottom: 10,
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600' }}>
                {product.name}
              </Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 3 }}>
                {product.description}
              </Text>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', marginTop: 5 }}>
                €{product.price.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                padding: 8,
                backgroundColor: '#34C759',
                borderRadius: 6,
                marginLeft: 10
              }}
              onPress={() => addToCart(product)}
              disabled={product.stock_quantity === 0}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {cart.length > 0 && (
        <View style={{ padding: 15, borderTopWidth: 1, borderTopColor: '#eee' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
            🛒 Carrello ({cart.length})
          </Text>
          {cart.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#eee'
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={{ color: '#666' }}>
                  €{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: '#ff3b30',
                  borderRadius: 4
                }}
                onPress={() => removeFromCart(item.id)}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>Rimuovi</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              Totale: €{totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 10,
                padding: 12,
                backgroundColor: '#007AFF',
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={() => Alert.alert('Ordine', 'Ordine creato con successo!')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Ordina Ora
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default PharmacyScreen;
