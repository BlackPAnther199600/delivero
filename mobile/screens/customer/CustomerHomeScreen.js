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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRequest } from '../../services/api';

export default function CustomerHomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPromos, setShowPromos] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Mapping of category names to emoji and colors
  const categoryEmojis = {
    'Pizza': '🍕',
    'Burger': '🍔',
    'Sushi': '🍣',
    'Poke': '🥗',
    'Kebab': '🌮',
    'Dessert': '🍰',
    'Cinese': '🥡',
    'Healthy': '🥙',
    'Italiano': '🍝',
    'Seafood': '🦐',
    'Mexican': '🌶️',
    'Asian': '🥢',
    'Italian': '🍝',
    'Korean': '🍖',
    'Thai': '🍛',
  };

  const categoryColors = {
    'Pizza': '#FFE5CC',
    'Burger': '#FFF0E6',
    'Sushi': '#E0F7FF',
    'Poke': '#E8F5E9',
    'Kebab': '#FFF3E0',
    'Dessert': '#FCE4EC',
    'Cinese': '#FFF9C4',
    'Healthy': '#E0F2F1',
    'Italiano': '#F3E5F5',
    'Seafood': '#B3E5FC',
    'Mexican': '#FFCCBC',
    'Asian': '#DCEDC8',
    'Italian': '#F3E5F5',
    'Korean': '#FFCCBC',
    'Thai': '#FFE0B2',
  };

  const getEmojiForCategory = (name) => categoryEmojis[name] || '🍽️';
  const getColorForCategory = (name) => categoryColors[name] || '#F0F0F0';

  // Keep fallback categories if API fails
  const fallbackCategories = [
    { id: 1, name: 'Pizza', emoji: '🍕', color: '#FFE5CC' },
    { id: 2, name: 'Burger', emoji: '🍔', color: '#FFF0E6' },
    { id: 3, name: 'Sushi', emoji: '🍣', color: '#E0F7FF' },
    { id: 4, name: 'Poke', emoji: '🥗', color: '#E8F5E9' },
    { id: 5, name: 'Kebab', emoji: '🌮', color: '#FFF3E0' },
    { id: 6, name: 'Dessert', emoji: '🍰', color: '#FCE4EC' },
    { id: 7, name: 'Cinese', emoji: '🥡', color: '#FFF9C4' },
    { id: 8, name: 'Healthy', emoji: '🥙', color: '#E0F2F1' },
    { id: 9, name: 'Italiano', emoji: '🍝', color: '#F3E5F5' },
  ];

  const allRestaurants = [
    { id: 1, name: 'Pizzeria Roma', category: 'Pizza', rating: 4.8, distance: 0.5, time: '20-30', price: '$', reviews: 324 },
    { id: 2, name: 'Burger House', category: 'Burger', rating: 4.6, distance: 0.8, time: '15-25', price: '$$', reviews: 256 },
    { id: 3, name: 'Sushi Master', category: 'Sushi', rating: 4.9, distance: 1.2, time: '30-40', price: '$$$', reviews: 412 },
    { id: 4, name: 'Poke Bowl', category: 'Poke', rating: 4.7, distance: 0.6, time: '15-20', price: '$$', reviews: 189 },
    { id: 5, name: 'Kebab Palace', category: 'Kebab', rating: 4.5, distance: 0.9, time: '10-15', price: '$', reviews: 145 },
    { id: 6, name: 'Pasticceria Dolce', category: 'Dessert', rating: 4.9, distance: 0.4, time: '5-10', price: '$$', reviews: 267 },
  ];

  const promos = [
    { id: 1, title: '🎉 Sconto 20% - Prime 3 ordini', code: 'BENVENUTO20', expiry: '30 gg' },
    { id: 2, title: '🍕 Pizza: 2a al 50% - Pizza', code: 'PIZZA50', expiry: '7 gg' },
    { id: 3, title: '⭐ Fedeltà: Raccogli punti', code: 'LOYALTY', expiry: 'Sempre' },
  ];

  useEffect(() => {
    loadCustomerData();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await makeRequest('/restaurants/categories');

      if (response && Array.isArray(response)) {
        // Map API response to include emoji and color
        const enrichedCategories = response.map((cat, index) => ({
          id: cat.id || index,
          name: cat.name,
          description: cat.description,
          restaurant_count: cat.restaurant_count || 0,
          emoji: getEmojiForCategory(cat.name),
          color: getColorForCategory(cat.name),
        }));
        setCategories(enrichedCategories);
      } else {
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fall back to hardcoded categories if API fails
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadCustomerData = async () => {
    try {
      setRefreshing(true);
      // Simulated data load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load favorites from AsyncStorage
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      // Load recent orders
      const savedOrders = await AsyncStorage.getItem('recentOrders');
      if (savedOrders) setRecentOrders(JSON.parse(savedOrders));
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = async (restaurant) => {
    const isFavorited = favorites.some(f => f.id === restaurant.id);
    let updatedFavorites;

    if (isFavorited) {
      updatedFavorites = favorites.filter(f => f.id !== restaurant.id);
    } else {
      updatedFavorites = [...favorites, restaurant];
    }

    setFavorites(updatedFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const applyCoupon = (coupon) => {
    Alert.alert('✅ Coupon Applicato!', `${coupon.code} - ${coupon.title}`);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const findRestaurants = () => {
    let results = [...allRestaurants];

    // Filter by search text
    if (searchText) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(searchText.toLowerCase()) ||
        r.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply additional filters
    if (activeFilter === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === 'distance') {
      results.sort((a, b) => a.distance - b.distance);
    } else if (activeFilter === 'fast') {
      results = results.filter(r => parseInt(r.time) <= 20);
    }

    return results;
  };

  const renderPromoCard = ({ item }) => (
    <TouchableOpacity
      style={styles.promoCard}
      onPress={() => applyCoupon(item)}
    >
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoExpiry}>Scadenza: {item.expiry}</Text>
      </View>
      <View style={styles.promoCode}>
        <Text style={styles.promoCodeText}>{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('Restaurants', { category: item.name })}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRestaurantItem = ({ item }) => {
    const isFavorited = favorites.some(f => f.id === item.id);
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
      >
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.restaurantCategory}>{item.category} • {item.price}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              <Text style={styles.favoriteIcon}>{isFavorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.restaurantStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>⭐ {item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>📍 {item.distance}km</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: '#FFE5CC' }]}>
            <Text style={styles.timeText}>⏱️ {item.time}min</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredRestaurants = findRestaurants();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadCustomerData} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍽️ Cosa vuoi ordinare?</Text>
          <Text style={styles.subtitle}>Città</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca ristorante, piatto..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Promos Section */}
      {showPromos && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎉 Offerte Speciali</Text>
            <TouchableOpacity onPress={() => setShowPromos(false)}>
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={promos}
            horizontal
            renderItem={renderPromoCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={styles.promoList}
          />
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: 'Tutti' },
          { key: 'rating', label: '⭐ Top Rated' },
          { key: 'distance', label: '📍 Più Vicini' },
          { key: 'fast', label: '⚡ Veloce' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterBtn, activeFilter === filter.key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Food Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorie</Text>
        <FlatList
          data={categories.length > 0 ? categories : fallbackCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
        />
      </View>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ I Tuoi Preferiti</Text>
          <FlatList
            data={favorites}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Search Results / Restaurants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {searchText ? `🔍 Risultati per "${searchText}"` : '🌟 Consigliati per Te'}
        </Text>
        {filteredRestaurants.length === 0 ? (
          <Text style={styles.noResults}>Nessun ristorante trovato 📭</Text>
        ) : (
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🕐 Ordini Recenti</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAllLink}>Vedi tutto →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentOrders.slice(0, 3)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recentOrderCard}>
                <Text style={styles.recentName}>{item.restaurant}</Text>
                <Text style={styles.recentTime}>{item.date}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#FF6B00',
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  logoutButton: {
    padding: 10,
  },
  logoutText: {
    fontSize: 20,
  },
  searchContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dismissText: {
    fontSize: 18,
    color: '#999',
  },
  promoList: {
    marginHorizontal: -15,
    paddingHorizontal: 15,
  },
  promoCard: {
    backgroundColor: 'linear-gradient(135deg, #FF6B00 0%, #FFB347 100%)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 240,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: '#FF6B00',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  promoExpiry: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  promoCode: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promoCodeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    marginLeft: 8,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  restaurantStats: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 20,
  },
  viewAllLink: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 12,
  },
  recentOrderCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B00',
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  recentTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
