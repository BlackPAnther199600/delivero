import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { ordersAPI } from '../../services/api';

export default function CustomerOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getMyOrders();
      setOrders(data);
    } catch (e) {
      Alert.alert("Errore", "Non ho potuto caricare i tuoi ordini.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Ordine #{item.id.toString().slice(-5)}</Text>
        <Text style={[styles.status, { color: item.status === 'delivered' ? '#28A745' : '#FF6B00' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.details}>{item.restaurant_name || 'Servizio Delivero'}</Text>
      <Text style={styles.price}>€{item.total_price || item.total}</Text>

      <View style={styles.actions}>
        {item.status !== 'delivered' && item.status !== 'cancelled' ? (
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('OrderTrackingLive', { orderId: item.id })}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Traccia Live 📍</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.reorderBtn} onPress={() => Alert.alert("Reorder", "Funzione in arrivo!")}>
            <Text style={{ color: '#FF6B00' }}>Ordina di nuovo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderOrder}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nessun ordine trovato.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  status: { fontWeight: '700', fontSize: 12 },
  details: { color: '#666', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  actions: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  trackBtn: { backgroundColor: '#FF6B00', padding: 10, borderRadius: 8, alignItems: 'center' },
  reorderBtn: { padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B00' }
});