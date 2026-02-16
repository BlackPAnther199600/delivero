import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Platform, RefreshControl, TextInput, Modal, ScrollView
} from 'react-native';
import { adminAPI, ordersAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ManagerRealTimeMapScreen from './ManagerRealTimeMapScreen';
import { Picker } from '@react-native-picker/picker';

export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Data States
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [trackingOrders, setTrackingOrders] = useState([]);

  // Edit States
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    if (!editingUser) return;
    setEditName(editingUser?.name || "");
    setEditEmail(editingUser?.email || "");
    setNewRole(editingUser?.role || "customer");
  }, [editingUser]);

  useEffect(() => {
    loadCurrentUser();
    loadDashboardData();
  }, [activeTab]);

  const loadCurrentUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (activeTab === 'stats') {
        const data = await adminAPI.getStats();
        setStats(data);
      } else if (activeTab === 'users') {
        const data = await adminAPI.getAllUsers();
        setUsers(Array.isArray(data) ? data : data.data || []);
      } else if (activeTab === 'orders') {
        const data = await adminAPI.getAllOrders();
        setOrders(Array.isArray(data) ? data : data.data || []);
      } else if (activeTab === 'tickets') {
        const data = await adminAPI.getAdminTickets();
        setTickets(Array.isArray(data) ? data : data.data || []);
      } else if (activeTab === 'finance') {
        const data = await adminAPI.getFinanceReport();
        setFinance(data);
      } else if (activeTab === 'metrics') {
        const data = await adminAPI.getServiceMetrics();
        setMetrics(data);
      } else if (activeTab === 'tracking') {
        const data = await ordersAPI.getActiveOrdersTracking();
        setTrackingOrders(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      setError("Errore nel caricamento dati: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.tabBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {['stats', 'users', 'orders', 'tickets', 'finance', 'metrics', 'tracking', 'map'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleUpdateUserRole = async (userId) => {
    try {
      setLoading(true);
      await adminAPI.updateUser(userId, { name: editName, email: editEmail, role: newRole });
      setSuccess('Utente aggiornato');
      setEditingUser(null);
      loadDashboardData();
    } catch (err) {
      setError(err?.message || 'Errore aggiornamento utente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (currentUser?.id && String(currentUser.id) === String(userId)) {
      Alert.alert('Operazione non consentita', 'Non puoi eliminare il tuo account.');
      return;
    }
    Alert.alert("Attenzione", "Eliminare definitivamente l'utente?", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina", style: "destructive", onPress: async () => {
          await adminAPI.deleteUser(userId);
          loadDashboardData();
        }
      }
    ]);
  };

  if (activeTab === 'map') {
    return (
      <View style={{ flex: 1 }}>
        {renderHeader()}
        <ManagerRealTimeMapScreen route={{ params: { user: currentUser } }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.content}>
        {error && <Text style={styles.errorBanner}>{error}</Text>}
        {success && <Text style={styles.successBanner}>{success}</Text>}

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={activeTab === 'users' ? users : activeTab === 'orders' ? orders : activeTab === 'tickets' ? tickets : activeTab === 'tracking' ? trackingOrders : []}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={() => (
              <View>
                {activeTab === 'stats' && stats ? (
                  <View>
                    <Text style={styles.welcome}>📊 Dashboard Statistiche</Text>
                    <StatCard label="Utenti" value={stats.totalUsers} />
                    <StatCard label="Ordini" value={stats.totalOrders} />
                    <StatCard label="Incasso" value={`€${stats.totalRevenue?.toFixed(2)}`} />
                  </View>
                ) : null}

                {activeTab === 'finance' && finance ? (
                  <View>
                    <Text style={styles.welcome}>💰 Finance</Text>
                    <StatCard label="Incasso" value={`€${Number(finance.totalRevenue || 0).toFixed(2)}`} />
                    <StatCard label="Bill Payments" value={finance.billPayments?.total || 0} />
                    <StatCard label="Bills Total" value={`€${Number(finance.billPayments?.amount || 0).toFixed(2)}`} />
                  </View>
                ) : null}

                {activeTab === 'metrics' && metrics ? (
                  <View>
                    <Text style={styles.welcome}>📈 Metrics</Text>
                    <StatCard label="Pharmacy Orders" value={metrics.pharmacy?.total_orders || 0} />
                    <StatCard label="Medical Transports" value={metrics.medicalTransports?.total_transports || 0} />
                    <StatCard label="Document Pickups" value={metrics.documentPickups?.total_pickups || 0} />
                    <StatCard label="Bills" value={metrics.bills?.total_bills || 0} />
                  </View>
                ) : null}

                {activeTab === 'tracking' ? (
                  <View>
                    <Text style={styles.welcome}>🗺️ Tracciamento Ordini</Text>
                    <Text style={styles.helperText}>Ordini attivi: {trackingOrders?.length || 0}</Text>
                  </View>
                ) : null}
              </View>
            )}
            renderItem={({ item }) => {
              if (activeTab === 'users') return <UserItem item={item} onEdit={(item) => { setEditingUser(item); setEditName(item.name); setEditEmail(item.email); setNewRole(item.role); }} onDelete={handleDeleteUser} currentUser={currentUser} />;
              if (activeTab === 'orders') return <OrderItem item={item} />;
              if (activeTab === 'tickets') return <TicketItem item={item} />;
              if (activeTab === 'tracking') return <TrackingOrderItem item={item} onOpen={(orderId) => navigation.navigate('OrderTracking', { orderId })} />;
              return null;
            }}
          />
        )}

        <Modal
          visible={!!editingUser}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingUser(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Modifica Utente</Text>

              <View style={styles.editRow}>
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Nome:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>
              </View>

              <View style={styles.editRow}>
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Email:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.editRow}>
                <View style={styles.editField}>
                  <Text style={styles.fieldLabel}>Ruolo:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newRole}
                      onValueChange={(value) => setNewRole(value)}
                      dropdownIconColor="#333"
                    >
                      <Picker.Item label="Customer" value="customer" />
                      <Picker.Item label="Rider" value="rider" />
                      <Picker.Item label="Manager" value="manager" />
                      <Picker.Item label="Admin" value="admin" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleUpdateUserRole(editingUser.id)}
                  disabled={loading}
                >
                  <Text style={styles.btnSaveText}>Salva</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditingUser(null)}
                  disabled={loading}
                >
                  <Text style={styles.btnCancelText}>Annulla</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

// Sub-components per pulizia codice
const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value || 0}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const UserItem = ({ item, onEdit, onDelete, currentUser }) => {
  const isSelf = currentUser?.id === item.id;
  return (
    <View style={styles.card}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email} - <Text style={{ color: '#FF6B00' }}>{item.role}</Text></Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={styles.btnEdit}
          disabled={isSelf}
        >
          <Text style={styles.btnText}>Modifica</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={[styles.btnDelete, isSelf && styles.btnDisabled]}
          disabled={isSelf}
        >
          <Text style={styles.btnText}>{isSelf ? "Can't Delete Self" : "Elimina"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const OrderItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.orderId}>Ordine #{item.id}</Text>
    <Text style={styles.orderStatus}>{item.status.toUpperCase()}</Text>
    <Text style={styles.orderPrice}>€{item.total_amount}</Text>
  </View>
);

const TicketItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.userName}>{item.title}</Text>
    <Text style={styles.userEmail}>{item.description}</Text>
  </View>
);

const TrackingOrderItem = ({ item, onOpen }) => (
  <View style={styles.card}>
    <Text style={styles.orderId}>Ordine #{item.id}</Text>
    <Text style={styles.userEmail}>Cliente: {item.customer_name || '—'}</Text>
    <Text style={styles.userEmail}>Rider: {item.rider_name || '—'}</Text>
    <Text style={styles.userEmail}>Indirizzo: {item.delivery_address || '—'}</Text>
    <Text style={styles.userEmail}>Stato: <Text style={{ color: '#FF6B00' }}>{String(item.status || '').toUpperCase()}</Text></Text>
    <Text style={styles.userEmail}>ETA: {item.eta_minutes != null ? `${item.eta_minutes} min` : '—'}</Text>
    <Text style={styles.userEmail}>Totale: €{item.total_amount != null ? Number(item.total_amount).toFixed(2) : '0.00'}</Text>
    <TouchableOpacity style={styles.trackBtn} onPress={() => onOpen(item.id)}>
      <Text style={styles.trackBtnText}>Traccia</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  tabBar: { backgroundColor: '#1a1a2e', paddingTop: 40, paddingBottom: 10 },
  tabBarContent: { paddingHorizontal: 8 },
  tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, minWidth: 90 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#FF6B00' },
  tabText: { color: '#888', fontSize: 10, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  content: { flex: 1, padding: 15 },
  welcome: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1a1a2e' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
  statCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#FF6B00' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { color: '#666' },
  row: { flexDirection: 'row', marginTop: 10 },
  btnEdit: { backgroundColor: '#FF6B00', padding: 8, borderRadius: 6, marginRight: 10 },
  btnDelete: { backgroundColor: '#dc3545', padding: 8, borderRadius: 6 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  errorBanner: { backgroundColor: '#f8d7da', color: '#721c24', padding: 10, borderRadius: 6, marginBottom: 10 },
  successBanner: { backgroundColor: '#d4edda', color: '#155724', padding: 10, borderRadius: 6, marginBottom: 10 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userEmail: { color: '#666', fontSize: 13 },
  orderId: { fontWeight: 'bold', color: '#1a1a2e' },
  orderStatus: { color: '#FF6B00', fontSize: 12, fontWeight: '700' },
  orderPrice: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  helperText: { color: '#666', fontSize: 13, marginBottom: 10 },
  trackBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FFA500', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  trackBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 15,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 10,
  },
  editContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  editField: {
    flex: 1,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textInputDisabled: {
    backgroundColor: '#f1f3f5',
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
  },
  btnSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});