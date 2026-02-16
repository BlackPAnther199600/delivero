import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { api } from '../../services/api';

export default function PharmacyScreen() {
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPharmacies(); }, []);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pharmacies');
      setPharmacies(response.data);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile caricare le farmacie di Roma Est');
    } finally { setLoading(false); }
  };

  const selectPharmacy = async (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setLoading(true);
    try {
      const response = await api.get(`/pharmacies/${pharmacy.id}/products`);
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Errore', 'Errore nel caricamento prodotti');
    } finally { setLoading(false); }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      {!selectedPharmacy ? (
        <FlatList
          data={pharmacies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => selectPharmacy(item)}>
              <Text style={styles.cardTitle}>🏥 {item.name}</Text>
              <Text style={styles.cardSub}>{item.address}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedPharmacy(null)} style={styles.backBtn}>
            <Text style={{ color: '#007AFF' }}>← Torna alle farmacie</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Prodotti di {selectedPharmacy.name}</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                <Text>{item.name} - €{item.price}</Text>
                <TouchableOpacity onPress={() => addToCart(item)} style={styles.addBtn}>
                  <Text style={{ color: '#fff' }}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Totale: €{totalPrice.toFixed(2)}</Text>
          <TouchableOpacity style={styles.orderBtn} onPress={() => Alert.alert("Ordine", "Inviato al corriere!")}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Conferma Ordine Farmacia</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#666', fontSize: 13 },
  backBtn: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#fff', marginBottom: 5, borderRadius: 8 },
  addBtn: { backgroundColor: '#34C759', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  orderBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' }
});