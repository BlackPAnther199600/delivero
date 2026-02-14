import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

export default function GroceriesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const groceryCategories = [
    { id: 1, name: 'Macelleria', emoji: '🥩', color: '#FF6B00', products: 45 },
    { id: 2, name: 'Alcolici', emoji: '🍷', color: '#8B0000', products: 120 },
    { id: 3, name: 'Bibite', emoji: '🧃', color: '#1E90FF', products: 85 },
    { id: 4, name: 'Panetteria', emoji: '🍞', color: '#D2691E', products: 62 },
    { id: 5, name: 'Latticini', emoji: '🧀', color: '#FFD700', products: 78 },
    { id: 6, name: 'Verdure', emoji: '🥬', color: '#228B22', products: 95 },
    { id: 7, name: 'Frutta', emoji: '🍎', color: '#FF1493', products: 88 },
    { id: 8, name: 'Pasta & Riso', emoji: '🍝', color: '#CD853F', products: 112 },
    { id: 9, name: 'Condimenti', emoji: '🫙', color: '#8B4513', products: 67 },
    { id: 10, name: 'Dolci', emoji: '🍪', color: '#FF69B4', products: 103 },
    { id: 11, name: 'Surgelati', emoji: '🧊', color: '#87CEEB', products: 156 },
    { id: 12, name: 'Igiene', emoji: '🧼', color: '#LightBlue', products: 89 },
  ];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.productCount}>{item.products} prodotti</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Spesa Online</Text>
        <Text style={styles.subtitle}>Scegli una categoria per continuare</Text>
      </View>

      {/* Categories Grid */}
      <FlatList
        data={groceryCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
        contentContainerStyle={styles.categoriesContainer}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#228B22',
    padding: 20,
    paddingTop: 15,
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
  categoriesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.85,
    textAlign: 'center',
  },
});
