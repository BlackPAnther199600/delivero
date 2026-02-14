import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { ordersAPI } from '../../services/api';

export default function CustomerOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingNote, setRatingNote] = useState('');
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);

  const orderStatuses = {
    pending: { label: '📋 In Attesa', color: '#FFC107', icon: '⏳' },
    accepted: { label: '✓ Accettato', color: '#0066FF', icon: '✓' },
    pickup: { label: '📦 Ritiro', color: '#FFA500', icon: '📦' },
    in_transit: { label: '🚗 In Consegna', color: '#FFD700', icon: '🚗' },
    delivered: { label: '✅ Consegnato', color: '#28A745', icon: '✅' },
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'active') {
      return orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    } else if (activeTab === 'past') {
      return orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
    }
    return [];
  };

  const handleCancelOrder = (order) => {
    Alert.alert(
      'Annulla Ordine?',
      `Sei sicuro di voler cancellare l'ordine da ${order.restaurant_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, Annulla',
          onPress: async () => {
            try {
              await ordersAPI.cancelOrder(order.id);
              Alert.alert('✅ Annullato', 'Ordine cancellato con successo');
              loadOrders();
            } catch (error) {
              Alert.alert('Errore', 'Non puoi annullare questo ordine');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleReorder = async (order) => {
    Alert.alert('🔄 Riordina', `Riordina da ${order.restaurant_name}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sì, Riordina',
        onPress: () => {
          navigation.navigate('RestaurantDetail', {
            restaurant: { id: order.restaurant_id, name: order.restaurant_name },
            reorder: true,
          });
        },
      },
    ]);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      Alert.alert('Attenzione', 'Seleziona una valutazione');
      return;
    }

    try {
      await ordersAPI.rateOrder(selectedOrder.id, {
        rating: ratingValue,
        notes: ratingNote,
      });
      Alert.alert('✅ Grazie!', `Ordine valutato ${ratingValue}⭐`);
      setShowRatingModal(false);
      setRatingValue(0);
      setRatingNote('');
      loadOrders();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare la valutazione');
    }
  };

  const renderOrderCard = ({ item }) => {
    const statusInfo = orderStatuses[item.status] || { label: 'Sconosciuto', color: '#999' };
    const isActive = item.status !== 'delivered' && item.status !== 'cancelled';
    const canRate = item.status === 'delivered' && !item.rated;
    const canCancel = isActive && item.status !== 'in_transit' && item.status !== 'pickup';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          setSelectedOrder(item);
          setTrackingModalVisible(true);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{item.restaurant_name || 'Ristorante'}</Text>
            <Text style={styles.orderId}>Ordine #{item.id?.toString().slice(-4)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
            <Text style={styles.statusLabel}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.itemsCount}>📦 {item.items_count || 2} articoli</Text>
          <Text style={styles.totalPrice}>€{item.total_amount?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.timestampRow}>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isActive && <Text style={styles.eta}>⏱️ {item.estimated_time || '30'} min</Text>}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {isActive && (
            <TouchableOpacity
              style={styles.trackingBtn}
              onPress={() => setTrackingModalVisible(true)}
            >
              <Text style={styles.trackingBtnText}>🗺️ Traccia</Text>
            </TouchableOpacity>
          )}
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FFE5E5', borderColor: '#FF6B6B' }]}
              onPress={() => handleCancelOrder(item)}
            >
              <Text style={styles.cancelBtnText}>✕ Annulla</Text>
            </TouchableOpacity>
          )}
          {canRate && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}
              onPress={() => {
                setSelectedOrder(item);
                setShowRatingModal(true);
              }}
            >
              <Text style={styles.rateBtnText}>⭐ Valuta</Text>
            </TouchableOpacity>
          )}
          {!isActive && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#E0ECFF', borderColor: '#0066FF' }]}
              onPress={() => handleReorder(item)}
            >
              <Text style={styles.reorderBtnText}>🔄 Riordina</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>I Miei Ordini 🍔</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Attivi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Storico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0066FF" style={styles.loader} />
      ) : (
        <FlatList
          data={getFilteredOrders()}
          renderItem={renderOrderCard}
          keyExtractor={item => item.id?.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadOrders} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? '📭 Nessun ordine attivo' : '📭 Nessun ordine nel storico'}
            </Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Tracking Modal */}
      <Modal visible={trackingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Traccia Ordine</Text>
              <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingRestaurant}>
                    {selectedOrder.restaurant_name}
                  </Text>
                  <Text style={styles.trackingTotal}>
                    Totale: €{selectedOrder.total_amount?.toFixed(2)}
                  </Text>
                </View>

                {/* Status Timeline */}
                <View style={styles.timeline}>
                  {Object.entries(orderStatuses).map(([key, status], index) => (
                    <View key={key} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          selectedOrder.status === key && styles.timelineDotActive,
                        ]}
                      >
                        <Text style={styles.timelineIcon}>{status.icon}</Text>
                      </View>
                      {index < Object.keys(orderStatuses).length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            selectedOrder.status !== key && styles.timelineLineInactive,
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.timelineLabel,
                          selectedOrder.status === key && styles.timelineLabelActive,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Rider Info */}
                {selectedOrder.status !== 'pending' && selectedOrder.status !== 'accepted' && (
                  <View style={styles.riderSection}>
                    <Text style={styles.riderTitle}>Il tuo Rider 🚗</Text>
                    <View style={styles.riderCard}>
                      <Text style={styles.riderName}>
                        {selectedOrder.rider_name || 'Rider assegnato'}
                      </Text>
                      <Text style={styles.riderRating}>
                        ⭐ {selectedOrder.rider_rating || '4.8'} • 📍 {selectedOrder.rider_distance || '0.5km'}
                      </Text>
                      <TouchableOpacity style={styles.contactBtn}>
                        <Text style={styles.contactBtnText}>📞 Chiama</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setTrackingModalVisible(false)}
                >
                  <Text style={styles.closeModalBtnText}>Chiudi</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⭐ Valuta l'Ordine</Text>
            <Text style={styles.ratingSubtitle}>
              Come è andato l'ordine da {selectedOrder?.restaurant_name}?
            </Text>

            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatingValue(star)}
                  style={styles.star}
                >
                  <Text style={styles.starText}>
                    {star <= ratingValue ? '⭐' : '☆'}
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
                  setShowRatingModal(false);
                  setRatingValue(0);
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
  header: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
    borderBottomColor: '#FF6B00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  orderId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsCount: {
    fontSize: 12,
    color: '#666',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  eta: {
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  trackingBtn: {
    flex: 1,
    backgroundColor: '#E0ECFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  trackingBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  rateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  reorderBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 50,
  },
  loader: {
    marginTop: 50,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  trackingInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trackingRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trackingTotal: {
    fontSize: 12,
    color: '#999',
  },
  timeline: {
    marginVertical: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotActive: {
    backgroundColor: '#0066FF',
  },
  timelineIcon: {
    fontSize: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 18,
    top: 36,
    width: 2,
    height: 20,
    backgroundColor: '#0066FF',
  },
  timelineLineInactive: {
    backgroundColor: '#ddd',
  },
  timelineLabel: {
    flex: 1,
    fontSize: 12,
    color: '#999',
  },
  timelineLabelActive: {
    color: '#0066FF',
    fontWeight: '600',
  },
  riderSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  riderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  riderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  riderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  riderRating: {
    fontSize: 11,
    color: '#666',
    marginVertical: 4,
  },
  contactBtn: {
    backgroundColor: '#0066FF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  contactBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  closeModalBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingSubtitle: {
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
});
