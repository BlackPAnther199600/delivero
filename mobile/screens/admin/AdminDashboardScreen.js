import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { makeRequest } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { io } from 'socket.io-client';

let MapView = null;
let MapMarker = null;
if (Platform.OS !== 'web') {
  try {
    MapView = require('react-native-maps').default;
    MapMarker = require('react-native-maps').Marker;
  } catch (e) {
    MapView = null;
    MapMarker = null;
  }
}

const API_URL = 'https://delivero-gyjx.onrender.com/api';

const AdminDashboardScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initToken = async () => {
      let tokenValue = route.params?.token;
      if (!tokenValue) {
        tokenValue = await AsyncStorage.getItem('token');
      }
      setToken(tokenValue);
      if (tokenValue) {
        loadAllData(tokenValue);
      }
    };
    initToken();
  }, []);

  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderMarker, setSelectedOrderMarker] = useState(null);
  const [socket, setSocket] = useState(null);

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/orders/active/all', { method: 'GET' });
      setActiveOrders(response || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load active orders');
    } finally {
      setLoading(false);
    }
  };

  // Realtime socket connection for managers
  useEffect(() => {
    if (!token) return;
    try {
      const s = io(API_URL.replace('/api', ''), { auth: { token }, transports: ['websocket'] });
      setSocket(s);
      s.on('connect', () => {
        s.emit('joinManagerRoom');
      });

      s.on('activeOrderUpdate', (data) => {
        // update or append the active order with new location/status
        setActiveOrders(prev => {
          const idx = prev.findIndex(o => o.id === data.orderId);
          const update = {
            id: data.orderId,
            rider_latitude: data.latitude,
            rider_longitude: data.longitude,
            status: data.status || 'in_transit',
            total_amount: data.total_amount || (prev[idx] && prev[idx].total_amount) || 0,
            rider_name: data.rider_name || (prev[idx] && prev[idx].rider_name) || null
          };
          if (idx === -1) return [update, ...prev];
          const copy = [...prev]; copy[idx] = { ...copy[idx], ...update }; return copy;
        });
      });

      return () => {
        s.disconnect();
      };
    } catch (e) {
      // ignore socket failures on web or missing lib
    }
  }, [token]);

  const loadAllData = async (authToken) => {
    try {
      setLoading(true);

      const [statsRes, financeRes, metricsRes] = await Promise.all([
        makeRequest('/admin/stats', { method: 'GET' }),
        makeRequest('/admin/finance', { method: 'GET' }),
        makeRequest('/admin/metrics', { method: 'GET' })
      ]);

      setStats(statsRes);
      setFinance(financeRes);
      setMetrics(metricsRes);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/admin/users', { method: 'GET' });
      setUsers(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await makeRequest('/tickets/admin', { method: 'GET' });
      setTickets(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) loadUsers();
    if (tab === 'tickets' && tickets.length === 0) loadTickets();
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert('Confirm', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await makeRequest(`/admin/users/${userId}`, { method: 'DELETE' });
            Alert.alert('Success', 'User deleted');
            loadUsers();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete user');
          }
        }
      }
    ]);
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  const StatCard = ({ title, value, subtitle }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const TabButton = ({ tab, label, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => handleTabChange(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {icon} {label}
      </Text>
    </TouchableOpacity>
  );

  const UserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const TicketItem = ({ item }) => (
    <View style={styles.ticketItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.ticketType}>{item.type} • {item.priority}</Text>
        <Text style={styles.ticketDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.ticketStatus, { backgroundColor: item.status === 'open' ? '#ff9800' : '#4caf50' }]}>
        <Text style={styles.ticketStatusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
        <Text style={styles.headerSubtitle}>System Management</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <TabButton tab="stats" label="Stats" icon="📊" />
        <TabButton tab="finance" label="Finance" icon="💰" />
        <TabButton tab="metrics" label="Metrics" icon="📈" />
        <TabButton tab="users" label="Users" icon="👥" />
        <TabButton tab="tickets" label="Tickets" icon="🎫" />
        <TabButton tab="tracking" label="Tracking" icon="🗺️" />
      </ScrollView>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <StatCard title="Users" value={stats.totalUsers} />
            <StatCard title="Orders" value={stats.totalOrders} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard title="Total Revenue" value={`€${stats.totalRevenue?.toFixed(2)}`} />
          </View>

          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {stats.recentOrders?.map(order => (
            <View key={order.id} style={styles.orderItem}>
              <View>
                <Text style={styles.orderCustomer}>{order.name}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderAmount}>€{order.total_amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && finance && (
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <StatCard title="Revenue" value={`€${finance.totalRevenue?.toFixed(2)}`} />
            <StatCard title="Bill Payments" value={finance.billPayments?.total} />
          </View>
          <View style={styles.statsGrid}>
            <StatCard title="Bills Total" value={`€${finance.billPayments?.amount?.toFixed(2)}`} />
          </View>

          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {finance.paymentMethods?.map((pm, idx) => (
            <View key={idx} style={styles.paymentItem}>
              <Text style={styles.paymentMethod}>{pm.payment_method}</Text>
              <Text style={styles.paymentAmount}>€{pm.total?.toFixed(2)} ({pm.count})</Text>
            </View>
          ))}
        </View>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <StatCard title="Pharmacy" value={metrics.pharmacy?.total_orders} subtitle="Orders" />
            <StatCard title="Transports" value={metrics.medicalTransports?.total_transports} subtitle="Medical" />
          </View>
          <View style={styles.statsGrid}>
            <StatCard title="Pickups" value={metrics.documentPickups?.total_pickups} subtitle="Documents" />
            <StatCard title="Bills" value={metrics.bills?.total_bills} subtitle="Total" />
          </View>
        </View>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" />
          ) : (
            <FlatList
              data={users}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => <UserItem item={item} />}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" />
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => <TicketItem item={item} />}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" />
          ) : (
            MapView && activeOrders.length > 0 ? (
              <View style={{ height: 400 }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: parseFloat(activeOrders[0].rider_latitude || 45.4642),
                    longitude: parseFloat(activeOrders[0].rider_longitude || 9.19),
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  {activeOrders.map(o => o.rider_latitude ? (
                    <MapMarker
                      key={o.id}
                      coordinate={{ latitude: parseFloat(o.rider_latitude), longitude: parseFloat(o.rider_longitude) }}
                      title={`Ordine #${o.id}`}
                      description={`${o.status} • €${o.total_amount}`}
                      onPress={() => setSelectedOrderMarker(o)}
                    />
                  ) : null)}
                </MapView>
              </View>
            ) : (
              <FlatList
                data={activeOrders}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.orderItem}>
                    <View>
                      <Text style={styles.orderCustomer}>Ordine #{item.id} • {item.status}</Text>
                      <Text style={styles.orderStatus}>{item.rider_name || `Rider #${item.rider_id || '--'}`}</Text>
                      <Text style={styles.orderStatus}>Pos: {item.rider_latitude ? `${parseFloat(item.rider_latitude).toFixed(4)}, ${parseFloat(item.rider_longitude).toFixed(4)}` : 'n/d'}</Text>
                    </View>
                    <Text style={styles.orderAmount}>€{item.total_amount}</Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            )
          )}
          {selectedOrderMarker && (
            <View style={{ padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }}>
              <Text style={{ fontWeight: '700' }}>Ordine #{selectedOrderMarker.id} • €{selectedOrderMarker.total_amount}</Text>
              <Text>{selectedOrderMarker.status} • Rider: {selectedOrderMarker.rider_name || '—'}</Text>
              <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setSelectedOrderMarker(null)}>
                <Text style={{ color: '#FF6B00' }}>Chiudi</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5
  },
  tabsScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: '#FF6B00'
  },
  tabButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600'
  },
  tabButtonTextActive: {
    color: '#FF6B00'
  },
  content: {
    padding: 15
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00'
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  statSubtitle: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 3
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderCustomer: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  orderStatus: {
    fontSize: 11,
    color: '#999',
    marginTop: 3
  },
  orderAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B00'
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  userEmail: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  userRole: {
    fontSize: 11,
    color: '#FF6B00',
    marginTop: 2,
    fontWeight: '500'
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  ticketItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ticketTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  ticketType: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  ticketDate: {
    fontSize: 10,
    color: '#bbb',
    marginTop: 2
  },
  ticketStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 10
  },
  ticketStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600'
  },
  paymentItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  paymentMethod: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  paymentAmount: {
    fontSize: 13,
    color: '#FF6B00',
    fontWeight: 'bold'
  }
});

export default AdminDashboardScreen;
