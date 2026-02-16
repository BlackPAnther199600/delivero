import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { ordersAPI } from '../../services/api';

export default function RiderHomeScreen({ navigation }) {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailable = async () => {
    try {
      const data = await ordersAPI.getAvailable();
      setAvailableOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAvailable(); }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.acceptOrder(orderId);
      Alert.alert("Successo", "Ordine accettato! Vai alla sezione 'Attivi' per gestirlo.");
      fetchAvailable();
      navigation.navigate('RiderActive');
    } catch (e) {
      Alert.alert("Errore", "L'ordine potrebbe essere già stato preso da un altro rider.");
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.emoji}>📦 {item.category || 'Consegna'}</Text>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.address}>Da: {item.pickup_address || 'Punto Ritiro'}</Text>
        <Text style={styles.address}>A: {item.delivery_address}</Text>
        <Text style={styles.payout}>Guadagno stimato: €{item.rider_payout || '5.00'}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(item.id)}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>ACCETTA</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ordini Disponibili</Text>
      </View>
      <FlatList
        data={availableOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAvailable} />}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>Nessun ordine disponibile al momento.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1a1a2e', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  emoji: { fontSize: 24 },
  address: { fontSize: 13, color: '#666' },
  payout: { fontSize: 14, fontWeight: 'bold', color: '#28A745', marginTop: 5 },
  acceptBtn: { backgroundColor: '#FF6B00', padding: 10, borderRadius: 8 }
});