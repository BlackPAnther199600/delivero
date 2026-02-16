import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from '../../services/api'; // Usiamo makeRequest come standard

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Servizi Speciali (quelli che hai caricato nei file)
  const specialServices = [
    { id: 'pharmacy', name: 'Farmacia', emoji: '💊', screen: 'Pharmacy' },
    { id: 'bills', name: 'Bollette', emoji: '📄', screen: 'BillPayment' },
    { id: 'medical', name: 'Trasporto', emoji: '🚑', screen: 'MedicalTransport' },
    { id: 'docs', name: 'Documenti', emoji: '📁', screen: 'DocumentPickup' },
    { id: 'grocery', name: 'Spesa', emoji: '🛒', screen: 'Groceries' },
  ];

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await requestLocation();
    loadCategories();
    loadData();
  };

  const requestLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("GPS disattivato", "Usa la posizione per vedere i servizi a Roma Est.");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  const loadCategories = async () => {
    try {
      const data = await makeRequest('/restaurants/categories');
      if (data) {
        setCategories(data.map((c, i) => ({ id: i, name: c })));
      }
    } catch (e) { console.log("Errore categorie", e); }
  };

  const loadData = async () => {
    setRefreshing(true);
    try {
      const res = await makeRequest('/restaurants');
      if (res) setRestaurants(res);

      const savedFavs = await AsyncStorage.getItem('favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (e) {
      console.log("Errore caricamento", e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchText.toLowerCase()) ||
    r.category.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header con Toggle Mappa */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Delivero Roma</Text>
          <Text style={styles.subtitle}>📍 {userLocation ? 'Roma Est Attiva' : 'Ricerca posizione...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.mapToggleBtn}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            {viewMode === 'list' ? '🗺️ Mappa' : '📜 Lista'}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <ScrollView
          stickyHeaderIndices={[1]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
        >
          {/* 1. Servizi Rapidi (Orizzontali) */}
          <View style={styles.whiteSection}>
            <Text style={styles.sectionTitle}>Servizi Extra</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 15 }}>
              {specialServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCircle}
                  onPress={() => navigation.navigate(service.screen)}
                >
                  <View style={styles.iconCircle}><Text style={{ fontSize: 24 }}>{service.emoji}</Text></View>
                  <Text style={styles.serviceText}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 2. Search Bar (Sticky) */}
          <View style={styles.searchSection}>
            <TextInput
              placeholder="Cerca pizza, sushi, farmacia..."
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* 3. Categorie Food (Orizzontali) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorie Food</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.categoryPill} onPress={() => navigation.navigate('Restaurants', { category: item.name })}>
                  <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 15 }}
            />
          </View>

          {/* 4. Lista Ristoranti */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ristoranti Vicini</Text>
            {filteredRestaurants.map(rest => (
              <TouchableOpacity
                key={rest.id}
                style={styles.restCard}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurant: rest })}
              >
                <View style={styles.restInfo}>
                  <Text style={styles.restName}>{rest.name}</Text>
                  <Text style={styles.restSub}>{rest.category} • ⭐ {rest.rating}</Text>
                </View>
                <View style={styles.restBadge}><Text style={styles.badgeText}>{rest.time || '25'} min</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        /* VISTA MAPPA INTERATTIVA */
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude || 41.8800,
            longitude: userLocation?.longitude || 12.6759,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          showsUserLocation={true}
        >
          {filteredRestaurants.map(rest => (
            <Marker
              key={rest.id}
              coordinate={{ latitude: parseFloat(rest.latitude || 41.88), longitude: parseFloat(rest.longitude || 12.67) }}
            >
              <Callout onPress={() => navigation.navigate('RestaurantDetail', { restaurant: rest })}>
                <View style={{ padding: 5, width: 120 }}>
                  <Text style={{ fontWeight: 'bold' }}>{rest.name}</Text>
                  <Text style={{ fontSize: 10 }}>{rest.category}</Text>
                  <Text style={{ color: '#FF6B00', marginTop: 5 }}>Vedi Menu →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#FF6B00', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#fff', opacity: 0.9, fontSize: 12 },
  mapToggleBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignSelf: 'center' },
  whiteSection: { backgroundColor: '#fff', paddingVertical: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, marginBottom: 15, color: '#333' },
  serviceCircle: { alignItems: 'center', marginRight: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF0E6', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  serviceText: { fontSize: 12, fontWeight: '500' },
  searchSection: { padding: 15, backgroundColor: '#f9f9f9' },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', elevation: 2 },
  categoryPill: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10 },
  categoryText: { color: '#fff', fontWeight: 'bold' },
  restCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 12, borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  restName: { fontSize: 16, fontWeight: 'bold' },
  restSub: { color: '#666', fontSize: 13, marginTop: 3 },
  restBadge: { backgroundColor: '#FFE5CC', padding: 8, borderRadius: 8 },
  badgeText: { color: '#FF6B00', fontWeight: 'bold', fontSize: 12 },
  map: { flex: 1 },
  section: { marginBottom: 20 }
});