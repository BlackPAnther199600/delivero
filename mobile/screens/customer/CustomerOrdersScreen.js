import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ordersAPI } from '../../services/api';

const CATEGORY_EMOJI = {
  food: '🍔',
  pharmacy: '💊',
  groceries: '🛒',
  clothes: '👕',
  electronics: '💻',
};

const STATUS_CONFIG = {
  pending: { color: '#FFC107', label: '⏳ In Attesa', icon: '⌛' },
  accepted: { color: '#0066FF', label: '🚗 In Rotta', icon: '🚗' },
  in_delivery: { color: '#0066FF', label: '🚗 In Consegna', icon: '📦' },
  completed: { color: '#28A745', label: '✅ Consegnato', icon: '✅' },
  cancelled: { color: '#DC3545', label: '❌ Annullato', icon: '❌' },
};

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, active, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyOrders();
    const interval = setInterval(loadMyOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMyOrders = async () => {
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
    let filtered = orders;

    if (filter === 'pending') {
      filtered = orders.filter(o => o.status === 'pending');
    } else if (filter === 'active') {
      filtered = orders.filter(
        o => o.status === 'accepted' || o.status === 'in_delivery'
      );
    } else if (filter === 'completed') {
      filtered = orders.filter(o => o.status === 'completed');
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Annulla Ordine?',
      'Sei sicuro? Non potrai annullare ordini già accettati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          onPress: async () => {
            try {
              await ordersAPI.cancelOrder(orderId);
              Alert.alert('Successo', 'Ordine annullato');
              loadMyOrders();
            } catch (error) {
              Alert.alert('Errore', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const filteredOrders = getFilteredOrders();
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'accepted' || o.status === 'in_delivery').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Caricamento ordini...</Text>
      </View>
    );
  }

  const FilterButton = ({ label, count, filterKey, active }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(filterKey)}
    >
      <Text style={[
        styles.filterButtonText,
        active && styles.filterButtonTextActive,
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I Miei Ordini 📋</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterButton
          label="Tutti"
          count={orders.length}
          filterKey="all"
          active={filter === 'all'}
        />
        <FilterButton
          label="In Attesa"
          count={stats.pending}
          filterKey="pending"
          active={filter === 'pending'}
        />
        <FilterButton
          label="In Consegna"
          count={stats.active}
          filterKey="active"
          active={filter === 'active'}
        />
        <FilterButton
          label="Consegnati"
          count={stats.completed}
          filterKey="completed"
          active={filter === 'completed'}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Nessun ordine in questa categoria</Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Crea Ordine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

            return (
              <View style={styles.orderCard}>
                {/* Top Section - Status & Date */}
                <View style={styles.cardTop}>
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
                    <View>
                      <Text style={styles.statusLabel}>{statusConfig.label}</Text>
                      <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('it-IT')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryBox}>
                    <Text style={styles.categoryEmoji}>
                      {CATEGORY_EMOJI[item.category] || '📦'}
                    </Text>
                  </View>
                </View>

                {/* Middle Section - Order Details */}
                <View style={styles.cardMiddle}>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.addressRow}>
                    <Text style={styles.addressIcon}>📍</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {item.address}
                    </Text>
                  </View>
                </View>

                {/* Bottom Section - Price & Actions */}
                <View style={styles.cardBottom}>
                  <View style={styles.priceSection}>
                    <Text style={styles.priceLabel}>Totale</Text>
                    <Text style={styles.priceValue}>
                      €{item.total_price?.toFixed(2) || '0.00'}
                    </Text>
                  </View>

                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelOrder(item.id)}
                    >
                      <Text style={styles.cancelButtonText}>🗑️ Annulla</Text>
                    </TouchableOpacity>
                  )}

                  {(item.status === 'accepted' || item.status === 'in_delivery') && (
                    <TouchableOpacity style={styles.trackButton}>
                      <Text style={styles.trackButtonText}>📍 Traccia</Text>
                    </TouchableOpacity>
                  )}

                  {item.status === 'completed' && (
                    <TouchableOpacity style={styles.reviewButton}>
                      <Text style={styles.reviewButtonText}>⭐ Valuta</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={loadMyOrders}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FF6B00',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  categoryBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 22,
  },
  cardMiddle: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFE0E0',
    borderWidth: 1,
    borderColor: '#FFB3B3',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC3545',
  },
  trackButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E0ECFF',
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066FF',
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E0FFE0',
    borderWidth: 1,
    borderColor: '#B3FFB3',
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28A745',
  },
});
