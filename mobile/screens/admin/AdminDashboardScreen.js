import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Picker
} from 'react-native';
import { makeRequest } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { io } from 'socket.io-client';
import ManagerRealTimeMapScreen from './ManagerRealTimeMapScreen';

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
  const [currentUser, setCurrentUser] = useState(null);

  // Modal for add/edit user
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [modalUser, setModalUser] = useState({ id: null, name: '', email: '', role: 'customer', password: '' });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const initToken = async () => {
      let tokenValue = route.params?.token;
      if (!tokenValue) {
        tokenValue = await AsyncStorage.getItem('token');
      }
      setToken(tokenValue);
      // get current user info if available
      let u = route.params?.user;
      if (!u) {
        try {
          const stored = await AsyncStorage.getItem('user');
          if (stored) u = JSON.parse(stored);
        } catch (e) {
          // ignore
        }
      }
      if (u) setCurrentUser(u);
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
    // Prevent deleting currently logged-in manager
    if (currentUser && currentUser.id === userId) {
      Alert.alert('Impossibile', "Non puoi eliminare il tuo account mentre sei autenticato");
      return;
    }

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

  const openAddUserModal = () => {
    setModalMode('add');
    setModalUser({ id: null, name: '', email: '', role: 'customer', password: '' });
    setUserModalVisible(true);
  };

  const openEditUserModal = (user) => {
    setModalMode('edit');
    setModalUser({ id: user.id, name: user.name || '', email: user.email || '', role: user.role || 'customer', password: '' });
    setUserModalVisible(true);
  };

  const submitModalUser = async () => {
    // create or update
    setModalLoading(true);
    try {
      if (modalMode === 'add') {
        // require password for new user
        if (!modalUser.password) {
          Alert.alert('Errore', 'Inserisci una password per il nuovo utente');
          setModalLoading(false);
          return;
        }
        await makeRequest('/admin/users', {
          method: 'POST',
          body: JSON.stringify({ name: modalUser.name, email: modalUser.email, role: modalUser.role, password: modalUser.password })
        });
        Alert.alert('Successo', 'Utente creato');
      } else {
        // edit
        const body = { name: modalUser.name, email: modalUser.email, role: modalUser.role };
        // include password only if set
        if (modalUser.password) body.password = modalUser.password;
        await makeRequest(`/admin/users/${modalUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
        Alert.alert('Successo', 'Utente aggiornato');
        // if current user updated their own profile, refresh stored user
        if (currentUser && modalUser.id === currentUser.id) {
          const updated = { ...currentUser, name: modalUser.name, email: modalUser.email, role: modalUser.role };
          setCurrentUser(updated);
          await AsyncStorage.setItem('user', JSON.stringify(updated));
        }
      }
      setUserModalVisible(false);
      loadUsers();
    } catch (e) {
      Alert.alert('Errore', e?.message || 'Operazione fallita');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  const StatCard = ({ title, value, subtitle, trend, trendColor, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: trendColor || '#FF6B00', borderLeftWidth: 4 }]}>
      <View style={styles.statCardHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        {trend && (
          <Text style={[styles.statTrend, { color: trendColor }]}>
            {trend}
          </Text>
        )}
      </View>
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
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#1976d2' }]} onPress={() => openEditUserModal(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        {currentUser && currentUser.id === item.id ? (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#9e9e9e' }]} disabled>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item.id)}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
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
      {/* Header with Notifications */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {currentUser?.name || 'Manager'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBell}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
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
            <StatCard
              icon="👥"
              title="Users"
              value={stats.totalUsers}
              trend="+12% vs ieri"
              trendColor="#4caf50"
            />
            <StatCard
              icon="📦"
              title="Orders"
              value={stats.totalOrders}
              trend="+8% vs ieri"
              trendColor="#4caf50"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="💰"
              title="Revenue"
              value={`€${stats.totalRevenue?.toFixed(2)}`}
              trend="+5% vs ieri"
              trendColor="#4caf50"
            />
          </View>

          <Text style={styles.sectionTitle}>📊 Recent Orders</Text>
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
            <StatCard
              icon="💳"
              title="Revenue"
              value={`€${finance.totalRevenue?.toFixed(2)}`}
              trend="+12% vs mese"
              trendColor="#4caf50"
            />
            <StatCard
              icon="✅"
              title="Payments"
              value={finance.billPayments?.total}
              trend="-2% errors"
              trendColor="#ff9800"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="📋"
              title="Bills"
              value={`€${finance.billPayments?.amount?.toFixed(2)}`}
            />
          </View>

          <Text style={styles.sectionTitle}>💳 Payment Methods</Text>
          {finance.paymentMethods?.map((pm, idx) => (
            <View key={idx} style={[styles.paymentItem, idx % 2 === 0 ? styles.zebra : {}]}>
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
            <StatCard
              icon="🏥"
              title="Pharmacy"
              value={metrics.pharmacy?.total_orders}
              subtitle="Orders"
              trend="+3 today"
              trendColor="#2196f3"
            />
            <StatCard
              icon="🚑"
              title="Transports"
              value={metrics.medicalTransports?.total_transports}
              subtitle="Medical"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="📄"
              title="Pickups"
              value={metrics.documentPickups?.total_pickups}
              subtitle="Documents"
            />
            <StatCard
              icon="💵"
              title="Bills"
              value={metrics.bills?.total_bills}
              subtitle="Total"
            />
          </View>
        </View>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" />
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
                <TouchableOpacity style={[styles.primaryButton]} onPress={openAddUserModal}>
                  <Text style={styles.primaryButtonText}>+ Add User</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={users}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <UserItem item={item} />}
                scrollEnabled={false}
              />
            </>
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
        <ManagerRealTimeMapScreen route={{ params: { token, user: currentUser } }} />
      )}
      {/* Add/Edit User Modal */}
      <Modal visible={userModalVisible} transparent animationType="slide" onRequestClose={() => setUserModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>{modalMode === 'add' ? 'Add User' : 'Edit User'}</Text>
            <TextInput placeholder="Name" style={styles.modalInput} value={modalUser.name} onChangeText={(t) => setModalUser({ ...modalUser, name: t })} />
            <TextInput placeholder="Email" style={styles.modalInput} value={modalUser.email} onChangeText={(t) => setModalUser({ ...modalUser, email: t })} keyboardType="email-address" autoCapitalize="none" />
            <View style={{ marginBottom: 10 }}>
              <Text style={{ marginBottom: 6 }}>Role</Text>
              <Picker selectedValue={modalUser.role} onValueChange={(v) => setModalUser({ ...modalUser, role: v })}>
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Rider" value="rider" />
                <Picker.Item label="Manager" value="manager" />
              </Picker>
            </View>
            {modalMode === 'add' && (
              <TextInput placeholder="Password" style={styles.modalInput} value={modalUser.password} onChangeText={(t) => setModalUser({ ...modalUser, password: t })} secureTextEntry />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#9e9e9e' }]} onPress={() => setUserModalVisible(false)}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6B00' }]} onPress={submitModalUser} disabled={modalLoading}>
                {modalLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{modalMode === 'add' ? 'Create' : 'Save'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  notificationBell: {
    position: 'relative',
    padding: 8,
  },
  bellIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF1744',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
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
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8
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
  statTrend: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8
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
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00'
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
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3'
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
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0'
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
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  paymentItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  zebra: {
    backgroundColor: '#f8f8f8'
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
