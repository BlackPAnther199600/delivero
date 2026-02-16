import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, VirtualizedList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { adminAPI, ordersAPI, ticketsAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ManagerRealTimeMapScreen from './ManagerRealTimeMapScreen';

export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Stats
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");

  // Users
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("open");

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carica i dati in base al tab selezionato
      if (activeTab === 'stats') {
        const stats = await adminAPI.getStats();
        setStats(stats);
      } else if (activeTab === 'users') {
        const users = await adminAPI.getAllUsers();
        setUsers(Array.isArray(users) ? users : users.data || []);
      } else if (activeTab === 'orders') {
        const orders = await adminAPI.getAllOrders();
        setOrders(Array.isArray(orders) ? orders : orders.data || []);
      } else if (activeTab === 'tickets') {
        const tickets = await ticketsAPI.getAdminTickets();
        setTickets(Array.isArray(tickets) ? tickets : tickets.data || []);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError(error.message || "Impossibile caricare i dati");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId) => {
    try {
      setLoading(true);
      await adminAPI.updateUserRole(userId, newRole);
      setSuccess("Ruolo utente aggiornato con successo");
      setEditingUser(null);
      await loadDashboardData(); // Ricarica i dati
    } catch (err) {
      setError(err.response?.data?.message || "Errore nell'aggiornamento del ruolo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      "Conferma Eliminazione",
      "Sei sicuro di voler eliminare questo utente?",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina", style: "destructive", onPress: async () => {
            try {
              setLoading(true);
              await adminAPI.deleteUser(userId);
              setSuccess("Utente eliminato con successo");
              await loadDashboardData(); // Ricarica i dati
            } catch (err) {
              setError(err.response?.data?.message || "Errore nell'eliminazione dell'utente");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['stats', 'users', 'orders', 'tickets'].map((tab) => (
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
      </View>

      {activeTab === 'map' ? (
        <ManagerRealTimeMapScreen route={{ params: { token: 'admin-token' } }} />
      ) : (
        <View style={styles.content}>
          {loading ? <ActivityIndicator size="large" color="#FF6B00" /> : (
            <View>
              {error && <Text style={styles.error}>{error}</Text>}
              {success && <Text style={styles.success}>{success}</Text>}

              {activeTab === 'stats' && stats && (
                <View>
                  <Text style={styles.welcome}>📊 Statistiche</Text>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalUsers || 0}</Text>
                    <Text style={styles.statLabel}>Utenti Totali</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalOrders || 0}</Text>
                    <Text style={styles.statLabel}>Ordini Totali</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>€{stats.totalRevenue?.toFixed(2) || '0.00'}</Text>
                    <Text style={styles.statLabel}>Fatturato Totale</Text>
                  </View>
                </View>
              )}

              {activeTab === 'users' && (
                <View>
                  <Text style={styles.welcome}>👥 Gestione Utenti</Text>
                  <VirtualizedList
                    data={users}
                    getItemCount={users.length}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.userCard}>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>{item.name}</Text>
                          <Text style={styles.userEmail}>{item.email}</Text>
                          <Text style={styles.userRole}>{item.role}</Text>
                        </View>
                        <View style={styles.userActions}>
                          {editingUser === item.id ? (
                            <View style={styles.editActions}>
                              <TouchableOpacity style={styles.saveButton} onPress={() => handleUpdateUserRole(item.id)}>
                                <Text style={styles.buttonText}>Salva</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingUser(null)}>
                                <Text style={styles.buttonText}>Annulla</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.editActions}>
                              <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => { setEditingUser(item.id); setNewRole(item.role); }}
                                disabled={currentUser?.id === item.id}
                              >
                                <Text style={styles.buttonText}>Modifica</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteUser(item.id)}
                                disabled={currentUser?.id === item.id}
                              >
                                <Text style={styles.buttonText}>Elimina</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                          {editingUser === item.id && (
                            <View style={styles.roleSelector}>
                              <Text style={styles.selectLabel}>Seleziona nuovo ruolo:</Text>
                              <View style={styles.selectWrapper}>
                                <TouchableOpacity
                                  style={[styles.roleOption, newRole === 'customer' && styles.selectedRole]}
                                  onPress={() => setNewRole('customer')}
                                >
                                  <Text style={styles.roleText}>Customer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.roleOption, newRole === 'rider' && styles.selectedRole]}
                                  onPress={() => setNewRole('rider')}
                                >
                                  <Text style={styles.roleText}>Rider</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.roleOption, newRole === 'manager' && styles.selectedRole]}
                                  onPress={() => setNewRole('manager')}
                                >
                                  <Text style={styles.roleText}>Manager</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.roleOption, newRole === 'admin' && styles.selectedRole]}
                                  onPress={() => setNewRole('admin')}
                                >
                                  <Text style={styles.roleText}>Admin</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  />
                </View>
              )}

              {activeTab === 'orders' && (
                <View>
                  <Text style={styles.welcome}>📦 Ordini Recenti</Text>
                  <VirtualizedList
                    data={orders}
                    getItemCount={orders.length}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.orderCard}>
                        <Text style={styles.orderId}>#{item.id}</Text>
                        <Text style={styles.orderAmount}>€{item.total_amount}</Text>
                        <Text style={styles.orderStatus}>{item.status}</Text>
                      </View>
                    )}
                  />
                </View>
              )}

              {activeTab === 'tickets' && (
                <View>
                  <Text style={styles.welcome}>🎫 Tickets</Text>
                  <VirtualizedList
                    data={tickets}
                    getItemCount={tickets.length}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.ticketCard}>
                        <Text style={styles.ticketId}>#{item.id}</Text>
                        <Text style={styles.ticketTitle}>{item.title}</Text>
                        <Text style={styles.ticketDescription}>{item.description}</Text>
                      </View>
                    )}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1a1a2e', padding: 5 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#FF6B00' },
  tabText: { color: '#ccc', fontSize: 11, fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  content: { padding: 20 },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  error: { padding: 15, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 8, marginBottom: 15 },
  success: { padding: 15, backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: 8, marginBottom: 15 },
  statCard: { padding: 20, backgroundColor: 'white', borderRadius: 8, marginBottom: 15, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FF6B00', marginBottom: 8 },
  statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
  userCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#666', marginBottom: 5 },
  userRole: { fontSize: 14, color: '#FF6B00', fontWeight: 'bold' },
  userInfo: { marginBottom: 10 },
  userActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  editActions: { flexDirection: 'row', alignItems: 'center' },
  editButton: { backgroundColor: '#FFA500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginRight: 5 },
  cancelButton: { backgroundColor: '#999', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  deleteButton: { backgroundColor: '#d32f2f', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginLeft: 5 },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  roleSelector: { marginTop: 10, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8 },
  selectLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  selectWrapper: { flexDirection: 'row', justifyContent: 'space-around' },
  roleOption: { padding: 10, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', minWidth: 80 },
  selectedRole: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  roleText: { fontSize: 14, textAlign: 'center' },
  orderCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  orderId: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  orderAmount: { fontSize: 16, color: '#FF6B00', fontWeight: 'bold', marginBottom: 5 },
  orderStatus: { fontSize: 14, color: '#666' },
  ticketCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  ticketId: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  ticketTitle: { fontSize: 16, marginBottom: 5 },
  ticketDescription: { fontSize: 14, color: '#666' }
});
