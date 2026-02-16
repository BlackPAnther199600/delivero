import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RestaurantsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Pizza', 'Burger', 'Sushi', 'Poke', 'Kebab', 'Dessert', 'Cinese', 'Healthy', 'Italiano'];

  const restaurants = [
    { id: 1, name: 'Pizzeria Roma', category: 'Pizza', rating: 4.8, distance: '0.5km', time: '20-30min', reviews: 234 },
    { id: 2, name: 'Burger House', category: 'Burger', rating: 4.6, distance: '0.8km', time: '15-25min', reviews: 189 },
    { id: 3, name: 'Sushi Master', category: 'Sushi', rating: 4.9, distance: '1.2km', time: '30-40min', reviews: 312 },
    { id: 4, name: 'Poke Bowl', category: 'Poke', rating: 4.7, distance: '0.6km', time: '15-20min', reviews: 156 },
    { id: 5, name: 'Kebab Palace', category: 'Kebab', rating: 4.5, distance: '0.9km', time: '10-15min', reviews: 201 },
    { id: 6, name: 'Pasticceria Dolce', category: 'Dessert', rating: 4.9, distance: '0.4km', time: '5-10min', reviews: 298 },
    { id: 7, name: 'Dragon Cinese', category: 'Cinese', rating: 4.4, distance: '1.1km', time: '25-35min', reviews: 167 },
    { id: 8, name: 'Healthy Bowl', category: 'Healthy', rating: 4.8, distance: '0.7km', time: '12-18min', reviews: 245 },
    { id: 9, name: 'La Trattoria', category: 'Italiano', rating: 4.7, distance: '1.3km', time: '30-45min', reviews: 289 },
  ];

  // Logica di filtro migliorata
  const filteredRestaurants = restaurants.filter(r => {
    const categoryToCompare = r.category || r.category_name || '';
    const matchCategory = selectedCategory === 'All' || categoryToCompare === selectedCategory;
    const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase()) ||
      categoryToCompare.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        selectedCategory === item && styles.categoryPillActive
      ]}
      onPress={() => setSelectedCategory(item)}
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
          <Text style={styles.restaurantCategory}>
            {item.category || item.category_name || 'Generico'}
          </Text>
        </View>
        {/* Protezione per toFixed e conversione sicura in numero */}
        <Text style={styles.rating}>⭐ {Number(item.rating || 0).toFixed(1)}</Text>
      </View>

      <View style={styles.restaurantFooter}>
        <Text style={styles.reviewCount}>📝 {item.reviews || 0} reviews</Text>
        <Text style={styles.distance}>📍 {item.distance || 'N/A'}</Text>
        <Text style={styles.time}>⏱️ {item.time || '-- min'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar con Gradiente */}
      <LinearGradient
        colors={['#FF6B00', '#FF8C00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cerca ristoranti..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </LinearGradient>

      {/* Categories Filter */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      {/* Restaurants List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.restaurantsList}
        contentContainerStyle={styles.restaurantsContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>😅 Nessun ristorante trovato</Text>
            <Text style={styles.emptySubtext}>Prova a cambiare i filtri</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    padding: 15,
    paddingTop: 20, // Spazio extra per l'estetica
    paddingBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoriesWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryPillActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryPillTextActive: {
    color: '#fff',
  },
  restaurantsList: {
    flex: 1,
  },
  restaurantsContent: {
    padding: 15,
    paddingBottom: 30,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCategory: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B00',
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  distance: {
    fontSize: 12,
    color: '#999',
  },
  time: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
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