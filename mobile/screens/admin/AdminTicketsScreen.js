import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { makeRequest } from '../../services/api';

export default function AdminTicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // Endpoint admin in backend: GET /tickets/admin
      const data = await makeRequest('/tickets/admin', { method: 'GET' });
      setTickets(data);
    } catch (e) {
      Alert.alert("Errore", "Impossibile recuperare i ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      // Backend: PATCH /tickets/:id/status
      await makeRequest(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      Alert.alert("Fatto", "Stato ticket aggiornato");
      fetchAll();
    } catch (e) { Alert.alert("Errore", "Aggiornamento fallito"); }
  };

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={styles.title}>Gestione Supporto</Text>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.ticketCard}>
              <Text style={styles.ticketTitle}>{item.title}</Text>
              <Text style={styles.ticketType}>{item.type.toUpperCase()}</Text>
              <Text style={styles.ticketDesc}>{item.description}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => updateStatus(item.id, 'resolved')} style={styles.resolveBtn}>
                  <Text style={{ color: '#fff' }}>Risolto</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  ticketCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  ticketTitle: { fontWeight: 'bold', fontSize: 16 },
  ticketType: { color: '#666', fontSize: 12, marginVertical: 5 },
  ticketDesc: { fontSize: 14, color: '#444' },
  actions: { marginTop: 10, flexDirection: 'row' },
  resolveBtn: { backgroundColor: '#28A745', padding: 8, borderRadius: 5 }
});