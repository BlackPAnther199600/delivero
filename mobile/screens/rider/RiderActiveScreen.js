import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ordersAPI } from '../../services/api';
import useRiderLocationSender from '../../hooks/useRiderLocationSender';

const CATEGORY_EMOJI = {
  food: '🍔',
  pharmacy: '💊',
  groceries: '🛒',
  clothes: '👕',
  electronics: '💻',
  restaurants: '🍽️',
};

const STATUS_CONFIG = {
  accepted: { color: '#0066FF', label: '✓ Accettato', icon: '📌' },
  pickup: { color: '#FFA500', label: '📦 Ritiro', icon: '📦' },
  in_transit: { color: '#FFD700', label: '🚗 In Consegna', icon: '🚗' },
  delivered: { color: '#28A745', label: '✅ Consegnato', icon: '✅' },
  rated: { color: '#27AE60', label: '⭐ Valutato', icon: '⭐' },
  pending: { color: '#FFC107', label: '⏳ In Attesa', icon: '⏳' },
};

export default function RiderActiveScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    earnings: 0,
    avgRating: 4.7,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingNote, setRatingNote] = useState('');
  const [trackingActiveOrderId, setTrackingActiveOrderId] = useState(null);

  // Enable location tracking for the first active order
  const locationTracking = useRiderLocationSender(trackingActiveOrderId, trackingActiveOrderId ? 'in_transit' : null);

  useEffect(() => {
    loadActiveOrders();
    const interval = setInterval(loadActiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveOrders = async () => {
    try {
      setRefreshing(true);
      const response = await ordersAPI.getMyOrders();
      const activeOrders = (response || []).filter(
        order => order.status !== 'delivered' && order.status !== 'rated'
      );
      const completedOrders = (response || []).filter(
        order => order.status === 'delivered' || order.status === 'rated'
      );

      // Enable location tracking for first in_transit/pickup order
      const inTransitOrder = activeOrders.find(o => o.status === 'in_transit' || o.status === 'pickup');
      setTrackingActiveOrderId(inTransitOrder?.id || null);

      setOrders(response || []);
      setStats({
        active: activeOrders.length,
        completed: completedOrders.length,
        earnings: completedOrders.reduce((sum, o) => sum + (o.total_amount * 0.15 || 0), 0),
        avgRating: 4.7,
      });
    } catch (error) {
      console.error('Error loading active orders:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      Alert.alert('✅ Aggiornato', `Stato: ${STATUS_CONFIG[newStatus].label}`);
      loadActiveOrders();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiornare lo stato');
    }
  };

  const handleCompleteOrder = (order) => {
    Alert.alert(
      '✅ Consegna Completata?',
      `Confermi di aver consegnato a ${order.customer_name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Sì, Completa',
          onPress: async () => {
            await updateOrderStatus(order.id, 'delivered');
            setSelectedOrder(order);
            setRatingModalVisible(true);
          },
          style: 'default',
        },
      ]
    );
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Attenzione', 'Seleziona una valutazione');
      return;
    }

    try {
      await ordersAPI.rateOrder(selectedOrder.id, {
        rating,
        notes: ratingNote,
      });
      Alert.alert('✅ Grazie!', `Ordine valutato ${rating}⭐`);
      setRatingModalVisible(false);
      setRating(0);
      setRatingNote('');
      loadActiveOrders();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare la valutazione');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const handleCallCustomer = (orderId) => {
    Alert.alert('📞 Chiama Cliente', `Inizia una chiamata all'ordine ${orderId}?`);
  };

  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(o =>
        o.status === 'accepted' || o.status === 'pickup' || o.status === 'in_transit'
      );
    } else if (activeTab === 'completed') {
      return orders.filter(o => o.status === 'delivered' || o.status === 'rated');
    }
    return [];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Le Mie Consegne 📦</Text>
          <Text style={styles.statsHeader}>
            {stats.active} attive • {stats.completed} completate
          </Text>
          {locationTracking.isLocating && (
            <Text style={styles.trackingBadge}>📍 Tracciamento GPS attivo</Text>
          )}
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🚗</Text>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Attive</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completate</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>€{stats.earnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Guadagni</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{stats.avgRating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={styles.tabText}>Attive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={styles.tabText}>Completate</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            {activeTab === 'active' ? '🎉' : '📭'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'active' ? 'Nessuna consegna in corso!' : 'Nessun completamento'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'active'
              ? "Vai alla schermata 'Home' per accettare ordini"
              : 'I tuoi ordini completati appariranno qui'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => {
            const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <View style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryEmoji}>
                      {CATEGORY_EMOJI[item.category] || '📦'}
                    </Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderDescription} numberOfLines={2}>
                      {item.description || 'Ordine'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                      <Text style={styles.statusText}>
                        {statusInfo.icon} {statusInfo.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceText}>€{(item.total_amount * 0.15).toFixed(2)}</Text>
                    <Text style={styles.priceLabel}>guadagno</Text>
                  </View>
                </View>

                {/* Order Details */}
                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Consegna:</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {item.delivery_address || 'Indirizzo'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👤 Cliente:</Text>
                    <Text style={styles.detailValue}>
                      {item.customer_name || 'Cliente'}
                    </Text>
                  </View>
                  {item.notes && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📝 Note:</Text>
                      <Text style={styles.detailValue}>{item.notes}</Text>
                    </View>
                  )}
                </View>

                {/* Status Transition Buttons */}
                {activeTab === 'active' && (
                  <View style={styles.statusButtons}>
                    {item.status === 'accepted' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: '#FFA500' }]}
                        onPress={() => updateOrderStatus(item.id, 'pickup')}
                      >
                        <Text style={styles.statusBtnText}>📦 Presa in Carico</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'pickup' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: '#FFD700' }]}
                        onPress={() => updateOrderStatus(item.id, 'in_transit')}
                      >
                        <Text style={styles.statusBtnText}>🚗 In Consegna</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'in_transit' && (
                      <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: '#28A745' }]}
                        onPress={() => handleCompleteOrder(item)}
                      >
                        <Text style={styles.statusBtnText}>✅ Consegnato</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallCustomer(item.id)}
                  >
                    <Text style={styles.callButtonText}>📞 Chiama</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mapButton}
                  >
                    <Text style={styles.mapButtonText}>🗺️ Mappa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={loadActiveOrders}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⭐ Valuta il Cliente</Text>
            <Text style={styles.modalSubtitle}>
              Come è andato con {selectedOrder?.customer_name}?
            </Text>

            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.star}
                >
                  <Text style={styles.starText}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Aggiungi una nota... (opzionale)"
              value={ratingNote}
              onChangeText={setRatingNote}
              multiline
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ddd' }]}
                onPress={() => {
                  setRatingModalVisible(false);
                  setRating(0);
                  setRatingNote('');
                }}
              >
                <Text style={styles.modalBtnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#0066FF' }]}
                onPress={submitRating}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0066FF',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsHeader: {
    fontSize: 12,
    color: '#E0ECFF',
    marginTop: 5,
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    fontSize: 20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
    borderLeftWidth: 3,
    borderLeftColor: '#0066FF',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#0066FF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0066FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  orderInfo: {
    flex: 1,
  },
  orderDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  priceBox: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  priceLabel: {
    color: '#E0ECFF',
    fontWeight: '500',
    fontSize: 9,
    marginTop: 2,
  },
  orderDetails: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066FF',
    marginRight: 8,
    minWidth: 65,
  },
  detailValue: {
    flex: 1,
    fontSize: 11,
    color: '#333',
  },
  statusButtons: {
    marginBottom: 10,
  },
  statusBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  statusBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#E0ECFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0066FF',
  },
  callButtonText: {
    color: '#0066FF',
    fontSize: 13,
    fontWeight: '600',
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  mapButtonText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  star: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 12,
    fontSize: 13,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trackingBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0066FF',
    marginTop: 4,
  },
});
