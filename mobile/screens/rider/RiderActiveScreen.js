import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ordersAPI } from '../../services/api';
import { useRiderLocationSender } from '../../hooks/useRiderLocationSender';

export default function RiderActiveScreen() {
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const data = await ordersAPI.getActiveRiderOrders();
      setActiveOrders(data);
    } catch (e) { console.log(e); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      Alert.alert("Stato Aggiornato", `L'ordine è ora: ${newStatus}`);
      fetchActiveOrders();
    } catch (e) { Alert.alert("Errore", "Impossibile aggiornare lo stato."); }
  };

  const ActiveOrderCard = ({ item }) => {
    useRiderLocationSender(item?.id, item?.status);

    return (
      <View style={styles.activeCard}>
        <Text style={styles.statusBadge}>{item.status.toUpperCase()}</Text>
        <Text style={{ fontWeight: 'bold' }}>Cliente: {item.customer_name || 'Utente'}</Text>
        <Text>📍 {item.delivery_address}</Text>

        <View style={styles.row}>
          {item.status === 'accepted' && (
            <TouchableOpacity style={styles.btnPickup} onPress={() => updateStatus(item.id, 'pickup')}>
              <Text style={styles.btnText}>Ritirato</Text>
            </TouchableOpacity>
          )}
          {(item.status === 'pickup' || item.status === 'accepted') && (
            <TouchableOpacity style={styles.btnTransit} onPress={() => updateStatus(item.id, 'in_transit')}>
              <Text style={styles.btnText}>In Viaggio</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnComplete} onPress={() => updateStatus(item.id, 'delivered')}>
            <Text style={styles.btnText}>Consegnato ✅</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Le tue consegne attive</Text>
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ActiveOrderCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#FF6B00' },
  statusBadge: { backgroundColor: '#eee', alignSelf: 'flex-start', padding: 4, borderRadius: 4, fontSize: 10, marginBottom: 10 },
  row: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  btnPickup: { backgroundColor: '#FFA500', padding: 10, borderRadius: 8, flex: 1, marginRight: 5 },
  btnTransit: { backgroundColor: '#0066FF', padding: 10, borderRadius: 8, flex: 1, marginRight: 5 },
  btnComplete: { backgroundColor: '#28A745', padding: 10, borderRadius: 8, flex: 1.5 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 12 }
});