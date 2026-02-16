import React, { useState, useEffect, useCallback } from 'react'; // Aggiunto useCallback
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeRequest } from '../../services/api';
// Se non hai lodash installato, puoi usare un debounce semplice o installarlo con: npm install lodash.debounce
import debounce from 'lodash.debounce';

export default function RestaurantsScreen({ navigation, route }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating_min: 0,
    max_delivery_time: 60,
    max_delivery_cost: 100,
  });

  // 1. Caricamento iniziale
  useEffect(() => {
    loadCategories();
    loadRestaurants('', 'All');
  }, []);

  const loadCategories = async () => {
    try {
      const data = await makeRequest('/restaurants/categories', { method: 'GET' });
      setCategories(['All', ...(data || [])]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // 2. Funzione principale di fetch (modificata per essere più robusta)
  const loadRestaurants = async (searchQuery = searchText, category = selectedCategory) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (category !== 'All') params.append('category', category);
      if (filters.rating_min > 0) params.append('rating_min', filters.rating_min);

      params.append('max_delivery_time', filters.max_delivery_time);
      params.append('max_delivery_cost', filters.max_delivery_cost);

      // Limita i risultati quando "All" è selezionato per ridurre il sovraccarico
      if (category === 'All') {
        params.append('limit', '20');
      }

      const url = `/restaurants?${params.toString()}`;
      const data = await makeRequest(url, { method: 'GET' });
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Implementazione DEBOUNCE
  // Usiamo useCallback per evitare che la funzione venga ricreata ad ogni render
  const debouncedSearch = useCallback(
    debounce((query, cat) => {
      loadRestaurants(query, cat);
    }, 500),
    [filters] // Si aggiorna se cambiano i filtri
  );

  const handleSearch = (text) => {
    setSearchText(text);
    debouncedSearch(text, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadRestaurants(searchText, category); // Al click cambiamo subito, no debounce
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        selectedCategory === item && styles.categoryPillActive
      ]}
      onPress={() => handleCategoryChange(item)}
    >
      <Text style={[
        styles.categoryPillText,
        selectedCategory === item && styles.categoryPillTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
    >
      <View style={styles.restaurantHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantCategory}>{item.category || 'Ristorante'}</Text>
        </View>
        <Text style={styles.rating}>⭐ {Number(item.rating || 0).toFixed(1)}</Text>
      </View>

      <View style={styles.restaurantFooter}>
        <Text style={styles.time}>⏱️ {item.delivery_time || 0} min</Text>
        <Text style={styles.distance}>💰 €{Number(item.delivery_cost || 0).toFixed(2)}</Text>
        <Text style={styles.reviewCount}>👥 {item.review_count || 0} recensioni</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B00', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🍽️ Ristoranti</Text>
        <Text style={styles.headerSubtitle}>Scopri nuove destinazioni</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cerca ristoranti..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />

      {loading && restaurants.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.restaurantsContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>😅 Nessun ristorante trovato</Text>
              <Text style={styles.emptySubtext}>Prova a cambiare i filtri o la ricerca</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 20, paddingTop: 25, backgroundColor: '#FF6B00', borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#fff', marginTop: 4, opacity: 0.9 },
  searchContainer: { padding: 15, backgroundColor: '#FF6B00' },
  searchInput: { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14 },
  categoriesContainer: { backgroundColor: '#fff', maxHeight: 60 },
  categoriesContent: { paddingHorizontal: 10, alignItems: 'center' },
  categoryPill: { paddingHorizontal: 15, paddingVertical: 6, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  categoryPillActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  categoryPillText: { fontSize: 12, fontWeight: '600', color: '#666' },
  categoryPillTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },
  restaurantsContent: { padding: 15 },
  restaurantCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  restaurantHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  restaurantName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  restaurantCategory: { fontSize: 12, color: '#666' },
  rating: { fontSize: 14, fontWeight: 'bold', color: '#FF6B00' },
  restaurantFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  reviewCount: { fontSize: 11, color: '#999' },
  distance: { fontSize: 11, color: '#999' },
  time: { fontSize: 11, color: '#FF6B00', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#999' },
  emptySubtext: { color: '#ccc' },
});