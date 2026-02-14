import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';

export default function ShoppingScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  const brands = [
    { id: 1, name: 'Carrefour', emoji: '🏬', color: '#FF0000', products: 1240 },
    { id: 2, name: 'Conad', emoji: '🏪', color: '#0066FF', products: 856 },
    { id: 3, name: 'Lidl', emoji: '🏬', color: '#FFD700', products: 920 },
    { id: 4, name: 'Auchan', emoji: '🏬', color: '#FF6B00', products: 1050 },
    { id: 5, name: 'Esselunga', emoji: '🏪', color: '#00AA00', products: 1180 },
    { id: 6, name: 'Coop', emoji: '🏬', color: '#FF1493', products: 980 },
    { id: 7, name: 'Penny Market', emoji: '🏪', color: '#8B0000', products: 750 },
    { id: 8, name: 'Eurospin', emoji: '🏬', color: '#8B00FF', products: 680 },
    { id: 9, name: 'Famila', emoji: '🏪', color: '#00CED1', products: 720 },
    { id: 10, name: 'Naturasi', emoji: '🏬', color: '#228B22', products: 640 },
  ];

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderBrandItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.brandCard, { borderTopColor: item.color }]}
      onPress={() => navigation.navigate('BrandProducts', { brand: item })}
    >
      <View style={styles.brandHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.brandEmoji}>{item.emoji}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.brandName}>{item.name}</Text>
            <Text style={styles.productCount}>{item.products} prodotti</Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛍️ Shopping</Text>
        <Text style={styles.subtitle}>Scegli il supermercato</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Cerca supermercati..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* Brands List */}
      <FlatList
        data={filteredBrands}
        renderItem={renderBrandItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.brandsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>😅 Nessun supermercato trovato</Text>
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
  header: {
    backgroundColor: '#0066FF',
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  brandsList: {
    padding: 15,
    paddingBottom: 20,
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  brandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#999',
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
  },
});
