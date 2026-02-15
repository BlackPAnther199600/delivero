import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { makeRequest } from '../../services/api';

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

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadRestaurants();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await makeRequest('/restaurants/categories', { method: 'GET' });
      setCategories(['All', ...(data || [])]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRestaurants = async (searchQuery = '', category = 'All') => {
    try {
      setLoading(true);
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (category !== 'All') {
        params.append('category', category);
      }
      if (filters.rating_min > 0) {
        params.append('rating_min', filters.rating_min);
      }
      params.append('max_delivery_time', filters.max_delivery_time);
      params.append('max_delivery_cost', filters.max_delivery_cost);

      const queryString = params.toString();
      const url = `/restaurants${queryString ? '?' + queryString : ''}`;
      const data = await makeRequest(url, { method: 'GET' });
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      Alert.alert('Errore', 'Non è stato possibile caricare i ristoranti');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearch = (text) => {
    setSearchText(text);
    loadRestaurants(text, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    loadRestaurants(searchText, category);
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
        <Text style={styles.rating}>⭐ {(item.rating || 0).toFixed(1)}</Text>
      </View>

      <View style={styles.restaurantFooter}>
        <Text style={styles.time}>⏱️ {item.delivery_time || 0}-{(item.delivery_time || 0) + 10}min</Text>
        <Text style={styles.distance}>💰 €{item.delivery_cost || 0}</Text>
        <Text style={styles.reviewCount}>👥 {item.review_count || 0} reviews</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Ristoranti</Text>
        <Text style={styles.headerSubtitle}>Scopri nuove destinazioni</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cerca ristoranti..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Categories Filter */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item}
        horizontal
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Restaurants List or Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Caricamento ristoranti...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={true}
          style={styles.restaurantsList}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  searchContainer: {
    padding: 15,
    paddingVertical: 10,
    backgroundColor: '#FF6B00',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryPillActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  restaurantsList: {
    flex: 1,
  },
  restaurantsContent: {
    padding: 15,
    paddingBottom: 20,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B00',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
  },
  distance: {
    fontSize: 11,
    color: '#999',
  },
  time: {
    fontSize: 11,
    color: '#FF6B00',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
});
