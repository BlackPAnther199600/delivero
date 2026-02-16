import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';

export default function ShoppingScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  const brands = [
    { id: 1, name: 'Carrefour', emoji: '🏬', color: '#FF0000', products: 1240 },
    { id: 2, name: 'Conad', emoji: '🏪', color: '#0066FF', products: 856 },
    { id: 3, name: 'Lidl', emoji: '🏬', color: '#FFD700', products: 920 },
    { id: 4, name: 'Esselunga', emoji: '🏪', color: '#00AA00', products: 1180 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Roma Est</Text>
        <Text style={styles.subtitle}>Supermercati e Negozi</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Cerca un negozio..."
          style={styles.searchInput}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={brands.filter(b => b.name.toLowerCase().includes(searchText.toLowerCase()))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.brandCard, { borderTopColor: item.color }]}
            onPress={() => navigation.navigate('BrandProducts', { brand: item })}
          >
            <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.brandName}>{item.name}</Text>
              <Text style={styles.brandSubtitle}>{item.products} prodotti disponibili</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.brandsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { backgroundColor: '#0066FF', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#fff', opacity: 0.8 },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  brandsList: { padding: 15 },
  brandCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: 4, elevation: 2 },
  brandName: { fontSize: 18, fontWeight: 'bold' },
  brandSubtitle: { color: '#666', fontSize: 13 }
});