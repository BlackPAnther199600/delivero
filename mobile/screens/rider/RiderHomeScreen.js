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
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { ordersAPI } from '../../services/api';

// WebMapView per mappe web
let WebMapView;
if (Platform.OS === 'web') {
  try {
    WebMapView = require('./WebMapView').default;
  } catch (e) {
    WebMapView = null;
  }
}

// MapView solo su mobile, non su web
let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    MapView = null;
    Marker = null;
  }
}

const CATEGORY_EMOJI = {
  food: '🍔',
  pharmacy: '💊',
  groceries: '🛒',
  clothes: '👕',
  electronics: '💻',
  restaurants: '🍽️',
};

// Leaflet Map Component for Web
const LeafletMapComponent = ({ orders, riderLocation }) => {
  const mapContainerId = 'rider-map-' + Math.random().toString(36).slice(2);
  
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    
    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const L = window.L;
      if (!L || !document.getElementById(mapContainerId)) return;
      
      const riderLat = riderLocation?.latitude || 40.7128;
      const riderLng = riderLocation?.longitude || -74.0060;
      
      // Create map
      const map = L.map(mapContainerId).setView([riderLat, riderLng], 14);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      
      // Rider marker (green)
      const riderIcon = L.divIcon({
        className: 'rider-marker',
        html: `<div style="
          width: 40px;
          height: 40px;
          background: #dcfce7;
          border: 3px solid #22863a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 4px rgba(34, 134, 58, 0.3);
        ">🟢</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });
      
      L.marker([riderLat, riderLng], { icon: riderIcon })
        .bindPopup('<b>🟢 La tua posizione</b>')
        .addTo(map)
        .openPopup();
      
      // Order markers (blue)
      if (Array.isArray(orders) && orders.length > 0) {
        orders.forEach((order, index) => {
          const lat = riderLat + (index * 0.004) - 0.008;
          const lng = riderLng + (Math.sin(index) * 0.006);
          
          const orderIcon = L.divIcon({
            className: 'order-marker',
            html: `<div style="
              width: 50px;
              height: 50px;
              background: #dbeafe;
              border: 3px solid #3182ce;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              box-shadow: 0 2px 4px rgba(49, 130, 206, 0.3);
              cursor: pointer;
            ">🔵</div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [0, -25],
          });
          
          const popupContent = `
            <div style="font-size: 12px; font-family: sans-serif; min-width: 180px;">
              <b style="color: #1a1a2e;">🍔 ${order.items?.[0]?.name || 'Ordine'}</b><br>
              <span style="color: #666;">📍 A ${(order.distance || 2).toFixed(1)} km</span><br>
              <b style="color: #1a1a2e; font-size: 14px;">€${(order.total_amount || 0).toFixed(2)}</b><br>
              <span style="color: #22863a; font-weight: bold; font-size: 11px;">
                💵 Guadagno: +€${((order.total_amount || 0) * 0.15).toFixed(2)}
              </span><br>
              <span style="color: #718096; font-size: 10px; display: block; margin-top: 6px;">
                📍 ${order.delivery_address?.substring(0, 40) || 'Indirizzo'}
              </span>
            </div>
          `;
          
          L.marker([lat, lng], { icon: orderIcon })
            .bindPopup(popupContent)
            .addTo(map);
        });
        
        // Auto fit bounds
        const bounds = L.latLngBounds([[riderLat, riderLng]]);
        orders.forEach((_, index) => {
          const lat = riderLat + (index * 0.004) - 0.008;
          const lng = riderLng + (Math.sin(index) * 0.006);
          bounds.extend([lat, lng]);
        });
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    document.head.appendChild(script);
    
    return () => {
      if (document.getElementById(mapContainerId)) {
        const mapElement = document.getElementById(mapContainerId);
        if (mapElement._leaflet_map) {
          mapElement._leaflet_map.remove();
        }
      }
    };
  }, [orders, riderLocation]);
  
  return (
    <View style={styles.leafletMapContainer}>
      <View style={styles.leafletMapHeader}>
        <Text style={styles.leafletMapTitle}>🗺️ Mappa Ordini</Text>
        <Text style={styles.leafletMapSubtitle}>Clicca su un marker per i dettagli</Text>
      </View>
      <div
        id={mapContainerId}
        style={{
          width: '100%',
          height: '350px',
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
        }}
      />
    </View>
  );
};

export default function RiderHomeScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [acceptedOrdersCount, setAcceptedOrdersCount] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState(null);

  useEffect(() => {
    initializeRider();
    const interval = setInterval(loadAvailableOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitor active deliveries and send location updates
  useEffect(() => {
    if (!location) return;

    const checkAndTrackDelivery = async () => {
      try {
        const activeOrders = await ordersAPI.getActiveRiderOrders();
        const inDelivery = activeOrders.find(o => o.status === 'in_transit' || o.status === 'pickup');
        
        if (inDelivery) {
          setActiveDeliveryOrder(inDelivery);
          // Send location to backend
          await sendLocationToBackend(inDelivery.id, location);
        } else {
          setActiveDeliveryOrder(null);
        }
      } catch (error) {
        console.error('Error tracking delivery:', error);
      }
    };

    // Check immediately
    checkAndTrackDelivery();
    
    // Then check every 30 seconds
    const trackingInterval = setInterval(checkAndTrackDelivery, 30000);
    return () => clearInterval(trackingInterval);
  }, [location]);

  // Send rider location to backend
  const sendLocationToBackend = async (orderId, userLocation) => {
    try {
      const eta = calculateETA(userLocation);
      const response = await ordersAPI.updateRiderLocation(
        orderId,
        userLocation.latitude,
        userLocation.longitude,
        eta
      );
      console.log('Location sent:', response);
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  // Calculate ETA based on distance (simple formula: distance / 20 km/h)
  const calculateETA = (userLocation) => {
    if (!activeDeliveryOrder) return 20;
    
    // For now, return fixed estimate - in production would calculate real distance
    // to delivery address using route optimization service
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      40.7150,
      -74.0050
    );
    const speedKmPerHour = 20;
    const etaMinutes = Math.ceil((parseFloat(distance) / speedKmPerHour) * 60);
    return Math.max(5, Math.min(60, etaMinutes)); // Between 5 and 60 minutes
  };

  const initializeRider = async () => {
    try {
      let userLocation = { latitude: 40.7128, longitude: -74.0060 };

      // Get real location based on platform
      if (Platform.OS === 'web') {
        // Web: Use navigator.geolocation
        userLocation = await new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.log('Geolocation error:', error);
                resolve({ latitude: 40.7128, longitude: -74.0060 }); // Fallback
              },
              { timeout: 10000 }
            );
          } else {
            resolve({ latitude: 40.7128, longitude: -74.0060 }); // Fallback
          }
        });
      } else {
        // Mobile: Use expo-location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            userLocation = {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            };
          } catch (locError) {
            console.log('Location error:', locError);
          }
        }
      }

      setLocation(userLocation);
      
      const savedEarnings = await AsyncStorage.getItem('todayEarnings');
      if (savedEarnings) setTodayEarnings(parseFloat(savedEarnings));
      
      await loadAvailableOrders();
      setLoading(false);
    } catch (error) {
      console.error('Initialize error:', error);
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setLoading(false);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      setRefreshing(true);
      const response = await ordersAPI.getAvailable();
      const ordersArray = Array.isArray(response) ? response : [];
      const sortedOrders = sortOrdersByDistance(ordersArray);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + 
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return (Math.sqrt(2 * R * R * a)).toFixed(1);
  };

  const sortOrdersByDistance = (orders) => {
    if (!location) return orders;
    
    return orders
      .map(order => {
        const distance = calculateDistance(
          location.latitude, 
          location.longitude,
          40.7150 + Math.random() * 0.02,
          -74.0050 + Math.random() * 0.02
        );
        return { ...order, distance: parseFloat(distance) };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await ordersAPI.acceptOrder(orderId);
      
      const order = orders.find(o => o.id === orderId);
      const estimatedEarnings = order?.total_price * 0.15 || 2.5;
      const newTotal = todayEarnings + estimatedEarnings;
      setTodayEarnings(newTotal);
      await AsyncStorage.setItem('todayEarnings', newTotal.toString());
      
      setAcceptedOrdersCount(acceptedOrdersCount + 1);
      Alert.alert('✅ Ordine Accettato!', `Guadagnerai ~€${estimatedEarnings.toFixed(2)}`);
      loadAvailableOrders();
    } catch (error) {
      Alert.alert('Errore', 'Non puoi accettare questo ordine');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  // Helper function to safely convert to number
  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Helper to format currency safely
  const formatCurrency = (amount, decimals = 2) => {
    return toNumber(amount).toFixed(decimals);
  };

  const sortedOrders = sortOrdersByDistance(orders);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Caricamento ordini...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con gradient */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚚 Ordini Disponibili</Text>
          <Text style={styles.headerSubtitle}>Guadagna ritirando e consegnando</Text>
        </View>
      </View>

      {/* Stats Dashboard */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>€</Text>
          <Text style={styles.statValue}>{todayEarnings.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Oggi</Text>
        </View>
        <View style={styles.divider}></View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>✅</Text>
          <Text style={styles.statValue}>{acceptedOrdersCount}</Text>
          <Text style={styles.statLabel}>Accettati</Text>
        </View>
        <View style={styles.divider}></View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📍</Text>
          <Text style={styles.statValue}>{sortedOrders.length}</Text>
          <Text style={styles.statLabel}>Disponibili</Text>
        </View>
      </View>

      {/* Map Toggle Button */}
      <TouchableOpacity style={styles.mapToggleBtn} onPress={() => setShowMap(!showMap)}>
        <Text style={styles.mapToggleBtnText}>
          {showMap ? '🗺️ Chiudi Mappa' : '🗺️ Apri Mappa'}
        </Text>
      </TouchableOpacity>

      {/* Map View - Platform-specific */}
      {showMap && Platform.OS !== 'web' && MapView && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChange={setMapRegion}
          >
            {/* Current Rider Location */}
            <Marker
              coordinate={{
                latitude: location?.latitude || 40.7128,
                longitude: location?.longitude || -74.0060,
              }}
              title="La tua posizione"
              description="Sei qui"
              pinColor="#22863a"
            />
            {/* Available Orders on Map */}
            {sortedOrders.map((order, index) => (
              <Marker
                key={order.id || index}
                coordinate={{
                  latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
                  longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
                }}
                title={`${order.items?.[0]?.name || 'Ordine'} - €${formatCurrency(order.total_amount)}`}
                description={order.delivery_address}
                pinColor="#3182ce"
              />
            ))}
          </MapView>
        </View>
      )}

      {/* Web Map - Real Leaflet Map */}
      {showMap && Platform.OS === 'web' && (
        <LeafletMapComponent orders={sortedOrders} riderLocation={location} />
      )}
      {sortedOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Nessun ordine</Text>
          <Text style={styles.emptyText}>Non ci sono ordini disponibili al momento</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadAvailableOrders}>
            <Text style={styles.refreshBtnText}>🔄 Riprova</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedOrders}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {/* Top Bar con distanza e prezzo */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryIcon}>🍔</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.orderTitle} numberOfLines={1}>
                    {item.items?.[0]?.name || 'Ordine'}
                  </Text>
                  <Text style={styles.orderMeta}>
                    📍 {(item.distance || 2).toFixed(1)} km • ⏱️ 20-30 min
                  </Text>
                </View>
                <View style={styles.distancePriceBox}>
                  <Text style={styles.earnAmount}>€{formatCurrency(toNumber(item.total_amount) * 0.15)}</Text>
                  <Text style={styles.earnLabel}>guadagno</Text>
                </View>
              </View>

              {/* Address section */}
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>📍 Consegna a:</Text>
                <Text style={styles.address} numberOfLines={2}>
                  {item.delivery_address || 'Indirizzo non disponibile'}
                </Text>
              </View>

              {/* Price total */}
              <View style={styles.priceSection}>
                <View>
                  <Text style={styles.priceLabel}>Importo ordine</Text>
                  <Text style={styles.priceValue}>€{formatCurrency(item.total_amount)}</Text>
                </View>
                <View style={styles.earnBadge}>
                  <Text style={styles.earnBadgeText}>
                    +€{formatCurrency(toNumber(item.total_amount) * 0.15)} guadagno
                  </Text>
                </View>
              </View>

              {/* Accept Button */}
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAcceptOrder(item.id)}
              >
                <Text style={styles.acceptBtnText}>✅ Accetta Ordine</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={loadAvailableOrders}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    backgroundColor: '#1a1a2e',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#a0aec0',
    fontWeight: '400',
  },
  logoutBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 22,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3182ce',
    borderRadius: 8,
  },
  refreshBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  orderMeta: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  distancePriceBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  earnAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22863a',
    marginBottom: 2,
  },
  earnLabel: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
  },
  addressSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3182ce',
  },
  addressLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
    lineHeight: 20,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  earnBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 6,
  },
  earnBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22863a',
  },
  acceptBtn: {
    paddingVertical: 14,
    backgroundColor: '#22863a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#22863a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  mapToggleBtn: {
    marginHorizontal: 12,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3182ce',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapToggleBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  mapContainer: {
    height: 280,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  map: {
    flex: 1,
  },
  mapFallbackContainer: {
    height: 280,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  mapFallback: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mapFallbackHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  mapFallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  coordinateItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  coordinateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22863a',
    marginBottom: 4,
  },
  orderNameSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 11,
    color: '#718096',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  addressSmall: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 15,
  },
  noOrdersText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 20,
  },
  dividerFull: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  leafletMapContainer: {
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  leafletMapHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f7fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  leafletMapTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  leafletMapSubtitle: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
});
