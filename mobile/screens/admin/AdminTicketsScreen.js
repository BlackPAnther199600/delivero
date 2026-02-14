import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Picker
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ticketsAPI } from '../../services/api';

const AdminTicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const fetchTicketsAndStats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [ticketsRes, statsRes] = await Promise.all([
        api.get('http://localhost:5000/api/tickets/admin/all', { headers }),
        api.get('http://localhost:5000/api/tickets/admin/stats', { headers })
      ]);

      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      Alert.alert('Errore', 'Errore nel caricamento dei ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get(`http://localhost:5000/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(response.data);
      setUpdateStatus(response.data.status);
      setAdminNotes(response.data.admin_notes || '');
    } catch (error) {
      Alert.alert('Errore', 'Errore nel caricamento del ticket');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.patch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
        { status: updateStatus, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Successo', 'Ticket aggiornato');
      await fetchTicketDetails(selectedTicket.id);
      await fetchTicketsAndStats();
    } catch (error) {
      Alert.alert('Errore', 'Errore nell\'aggiornamento');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const token = await AsyncStorage.getItem('token');
      await api.post(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      await fetchTicketDetails(selectedTicket.id);
    } catch (error) {
      Alert.alert('Errore', 'Errore nell\'aggiunta del commento');
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ff9800',
      'in_progress': '#2196f3',
      'resolved': '#4caf50',
      'closed': '#757575'
    };
    return colors[status] || '#999';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'bug': '🐛',
      'complaint': '😞',
      'feature_request': '💡',
      'support': '🆘'
    };
    return icons[type] || '📝';
  };

  const filteredTickets = tickets.filter(t => {
    let typeMatch = filterType === 'all' || t.type === filterType;
    let statusMatch = filterStatus === 'all' || t.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!selectedTicket) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Gestione Ticket</Text>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Totale</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#ff9800' }]}>{stats.open}</Text>
              <Text style={styles.statLabel}>Aperto</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2196f3' }]}>{stats.in_progress}</Text>
              <Text style={styles.statLabel}>In Corso</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>{stats.resolved}</Text>
              <Text style={styles.statLabel}>Risolto</Text>
            </View>
          </View>
        )}

        <View style={styles.filtersContainer}>
          <Picker
            selectedValue={filterType}
            onValueChange={setFilterType}
            style={styles.picker}
          >
            <Picker.Item label="Tutti i Tipi" value="all" />
            <Picker.Item label="🐛 Bug" value="bug" />
            <Picker.Item label="😞 Reclamo" value="complaint" />
            <Picker.Item label="💡 Richiesta" value="feature_request" />
            <Picker.Item label="🆘 Supporto" value="support" />
          </Picker>

          <Picker
            selectedValue={filterStatus}
            onValueChange={setFilterStatus}
            style={styles.picker}
          >
            <Picker.Item label="Tutti gli Stati" value="all" />
            <Picker.Item label="Aperto" value="open" />
            <Picker.Item label="In Corso" value="in_progress" />
            <Picker.Item label="Risolto" value="resolved" />
            <Picker.Item label="Chiuso" value="closed" />
          </Picker>
        </View>

        {filteredTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nessun ticket trovato</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.ticketCard}
                onPress={() => fetchTicketDetails(item.id)}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketIcon}>{getTypeIcon(item.type)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ticketTitle}>{item.title}</Text>
                    <Text style={styles.ticketUser}>{item.user_name}</Text>
                  </View>
                  <View
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(item.status)
                    }}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedTicket(null)}
      >
        <Text style={styles.backButtonText}>← Torna</Text>
      </TouchableOpacity>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>
          {getTypeIcon(selectedTicket.type)} {selectedTicket.title}
        </Text>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>Utente: {selectedTicket.user_name}</Text>
          <Text style={styles.metaText}>Email: {selectedTicket.user_email}</Text>
          <Text style={styles.metaText}>Priorità: {selectedTicket.priority}</Text>
          <Text style={styles.metaText}>
            Data: {new Date(selectedTicket.created_at).toLocaleDateString('it-IT')}
          </Text>
        </View>

        {selectedTicket.admin_notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Nota Admin</Text>
            <Text style={styles.notesText}>{selectedTicket.admin_notes}</Text>
          </View>
        )}

        <View style={styles.descriptionBox}>
          <Text style={styles.boxLabel}>Descrizione</Text>
          <Text style={styles.descriptionText}>{selectedTicket.description}</Text>
        </View>

        <View style={styles.commentsBox}>
          <Text style={styles.boxLabel}>Commenti</Text>
          {selectedTicket.comments?.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentName}>{c.user_name}</Text>
                {c.role === 'admin' && <Text style={styles.adminBadge}>🔐</Text>}
              </View>
              <Text style={styles.commentText}>{c.comment}</Text>
            </View>
          ))}

          <TextInput
            style={styles.commentInput}
            placeholder="Aggiungi commento..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.commentButton, addingComment && { opacity: 0.6 }]}
            onPress={handleAddComment}
            disabled={addingComment}
          >
            <Text style={styles.commentButtonText}>Invia</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.updateBox}>
          <Text style={styles.boxLabel}>Aggiorna Ticket</Text>

          <Text style={styles.fieldLabel}>Stato</Text>
          <Picker
            selectedValue={updateStatus}
            onValueChange={setUpdateStatus}
            style={styles.picker}
          >
            <Picker.Item label="Aperto" value="open" />
            <Picker.Item label="In Corso" value="in_progress" />
            <Picker.Item label="Risolto" value="resolved" />
            <Picker.Item label="Chiuso" value="closed" />
          </Picker>

          <Text style={styles.fieldLabel}>Note Admin</Text>
          <TextInput
            style={[styles.commentInput, { height: 80 }]}
            placeholder="Note..."
            value={adminNotes}
            onChangeText={setAdminNotes}
            multiline
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateStatus}
          >
            <Text style={styles.updateButtonText}>✅ Salva</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
  },
  statItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4
  },
  filtersContainer: {
    marginBottom: 12,
    gap: 8
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 6
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  ticketIcon: {
    fontSize: 20
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  ticketUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius:8,
    padding: 16,
    marginBottom: 16
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  metaInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  notesBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6
  },
  notesText: {
    fontSize: 12,
    color: '#856404'
  },
  descriptionBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  },
  commentsBox: {
    marginBottom: 12
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3'
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  commentName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  adminBadge: {
    fontSize: 12
  },
  commentText: {
    fontSize: 12,
    color: '#666'
  },
  commentInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 12,
    marginBottom: 8,
    textAlignVertical: 'top',
    color: '#333'
  },
  commentButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12
  },
  commentButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  updateBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
    marginTop: 8
  },
  updateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  }
});

export default AdminTicketsScreen;
