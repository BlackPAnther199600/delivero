import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { makeRequest } from '../../services/api';

export default function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await makeRequest('/tickets/my-tickets');
        setTickets(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    loadTickets();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I miei Ticket</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TicketForm')}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Nuovo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={[styles.status, { color: item.status === 'open' ? 'green' : 'gray' }]}>
              ● {item.status === 'open' ? 'Aperto' : 'Chiuso'}
            </Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#333', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  ticketTitle: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12, marginTop: 5, fontWeight: 'bold' },
  date: { fontSize: 11, color: '#999', marginTop: 5 }
});