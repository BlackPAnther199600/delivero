import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function BrandProductsScreen({ route }) {
  const { brand } = route.params || {};
  const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    name: `${brand?.name || 'Brand'} Product ${i + 1}`,
    price: (Math.random() * 20 + 1).toFixed(2),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{brand?.emoji} {brand?.name}</Text>
        <Text style={styles.subtitle}>{brand?.products || 0} prodotti</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>€{item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, backgroundColor: '#f6f6f6', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 4 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  productName: { fontSize: 16 },
  productPrice: { color: '#333', fontWeight: '600' },
});
