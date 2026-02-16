import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import axios from 'axios'; // AGGIUNTO: Axios mancava
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

// Gestione dinamica di Google Maps
let MapView = null;
let MapMarker = null;
if (Platform.OS !== 'web') {
  try {
    MapView = require('react-native-maps').default;
    MapMarker = require('react-native-maps').Marker;
  } catch (e) {
    console.log("Maps not available");
  }
}

const API_URL = 'http://192.168.1.5:5000/api';

const AdminDashboardScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [token, setToken] = useState(null);
  const [selectedOrderMarker, setSelectedOrderMarker] = useState(null);

  // 1. Inizializzazione Token e Dati
  useEffect(() => {
    const init = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const tokenValue = route.params?.token || storedToken;
      setToken(tokenValue);
      if (tokenValue) {
        loadAllData(tokenValue);
      } else {
        Alert.alert("Errore", "Sessione scaduta, effettua il login.");
        navigation.navigate('Login');
      }
    };
    init();
  }, []);

  // 2. Socket.io per il tracking in tempo reale
  useEffect(() => {
    if (!token) return;
    const socketAddr = API_URL.replace('/api', '');
    const s = io(socketAddr, { auth: { token }, transports: ['websocket'] });

    s.on('connect', () => s.emit('joinManagerRoom'));
    s.on('activeOrderUpdate', (data) => {
      setActiveOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.orderId);
        const update = {
          id: data.orderId,
          rider_latitude: data.latitude,
          rider_longitude: data.longitude,
          status: data.status || 'in_transit',
          total_amount: data.total_amount || (prev[idx]?.total_amount) || 0,
          rider_name: data.rider_name || (prev[idx]?.rider_name) || "Rider"
        };
        if (idx === -1) return [update, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...update };
        return copy;
      });
    });

    return () => s.disconnect();
  }, [token]);

  // 3. Funzioni di caricamento
  const loadAllData = async (authToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${authToken}` };
      const [statsRes, financeRes, metricsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/finance`, { headers }),
        axios.get(`${API_URL}/admin/metrics`, { headers })
      ]);
      setStats(statsRes.data);
      setFinance(financeRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/orders/active/all`, { headers });
      setActiveOrders(res.data || []);
    } catch (e) {
      Alert.alert("Errore", "Impossibile caricare i rider attivi");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) loadUsers();
    if (tab === 'tickets' && tickets.length === 0) loadTickets();
    if (tab === 'tracking') loadActiveOrders(); // AGGIUNTO: Carica i dati mappa
  };

  // --- RENDERING ---

  const StatCard = ({ title, value, subtitle }) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
          <Text style={styles.headerSubtitle}>System Management</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <TouchableOpacity onPress={() => handleTabChange('stats')} style={[styles.tabButton, activeTab === 'stats' && styles.tabButtonActive]}>
            <Text style={[styles.tabButtonText, activeTab === 'stats' && styles.tabButtonTextActive]}>📊 Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('finance')} style={[styles.tabButton, activeTab === 'finance' && styles.tabButtonActive]}>
            <Text style={[styles.tabButtonText, activeTab === 'finance' && styles.tabButtonTextActive]}>💰 Finance</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('tracking')} style={[styles.tabButton, activeTab === 'tracking' && styles.tabButtonActive]}>
            <Text style={[styles.tabButtonText, activeTab === 'tracking' && styles.tabButtonTextActive]}>🗺️ Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('users')} style={[styles.tabButton, activeTab === 'users' && styles.tabButtonActive]}>
            <Text style={[styles.tabButtonText, activeTab === 'users' && styles.tabButtonTextActive]}>👥 Users</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.content}>
          {activeTab === 'stats' && stats && (
            <View>
              <View style={styles.statsGrid}>
                <StatCard title="Users" value={stats.totalUsers} />
                <StatCard title="Orders" value={stats.totalOrders} />
              </View>
              <StatCard title="Total Revenue" value={`€${stats.totalRevenue?.toFixed(2)}`} />
            </View>
          )}

          {activeTab === 'tracking' && (
            <View>
              {MapView && activeOrders.length > 0 ? (
                <View style={{ height: 400, borderRadius: 10, overflow: 'hidden' }}>
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: 45.4642, // Milano Default
                      longitude: 9.1900,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }}
                  >
                    {activeOrders.map(o => (
                      o.rider_latitude && (
                        <MapMarker
                          key={o.id}
                          coordinate={{ latitude: parseFloat(o.rider_latitude), longitude: parseFloat(o.rider_longitude) }}
                          title={`Ordine #${o.id}`}
                          description={o.status}
                          pinColor="#FF6B00"
                        />
                      )
                    ))}
                  </MapView>
                </View>
              ) : (
                <Text style={styles.emptyText}>Nessun rider attivo sulla mappa</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      )}
    </View>
  );
};