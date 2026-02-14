import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';

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

  const filteredRestaurants = restaurants.filter(r => {
    const matchCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchSearch = r.name.toLowerCase().includes(searchText.toLowerCase()) || 
                       r.category.toLowerCase().includes(searchText.toLowerCase());
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
          <Text style={styles.restaurantCategory}>{item.category}</Text>
        </View>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      
      <View style={styles.restaurantFooter}>
        <Text style={styles.reviewCount}>📝 {item.reviews} reviews</Text>
        <Text style={styles.distance}>📍 {item.distance}</Text>
        <Text style={styles.time}>⏱️ {item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cerca ristoranti..."
          value={searchText}
          onChangeText={setSearchText}
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

      {/* Restaurants List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={true}
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
    paddingBottom: 10,
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
