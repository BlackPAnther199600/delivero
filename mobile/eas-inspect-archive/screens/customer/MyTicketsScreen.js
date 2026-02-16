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
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const MyTicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('https://delivero-gyjx.onrender.com/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
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
      const response = await api.get(`https://delivero-gyjx.onrender.com/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTicket(response.data);
    } catch (error) {
      Alert.alert('Errore', 'Errore nel caricamento del ticket');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const token = await AsyncStorage.getItem('token');
      await api.post(
        `https://delivero-gyjx.onrender.com/api/tickets/${selectedTicket.id}/comments`,
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  if (!selectedTicket) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📋 I Miei Ticket</Text>

        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nessun ticket creato</Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.ticketCard}
                onPress={() => fetchTicketDetails(item.id)}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketType}>{getTypeIcon(item.type)}</Text>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketTitle}>{item.title}</Text>
                    <Text style={styles.ticketType}>Tipo: {item.type}</Text>
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
                <Text style={styles.ticketDescription}>{item.description.substring(0, 100)}...</Text>
                <Text style={styles.ticketMeta}>
                  {new Date(item.created_at).toLocaleDateString('it-IT')}
                </Text>
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
        <Text style={styles.backButtonText}>← Torna alla lista</Text>
      </TouchableOpacity>

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>
            {getTypeIcon(selectedTicket.type)} {selectedTicket.title}
          </Text>
          <View
            style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(selectedTicket.status)
            }}
          >
            <Text style={styles.statusText}>{selectedTicket.status}</Text>
          </View>
        </View>

        {selectedTicket.admin_notes && (
          <View style={styles.adminNotes}>
            <Text style={styles.adminNotesLabel}>📌 Nota dell\'Admin:</Text>
            <Text style={styles.adminNotesText}>{selectedTicket.admin_notes}</Text>
          </View>
        )}

        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Tipo: <Text style={styles.metaValue}>{selectedTicket.type}</Text></Text>
          <Text style={styles.metaLabel}>Priorità: <Text style={styles.metaValue}>{selectedTicket.priority}</Text></Text>
          <Text style={styles.metaLabel}>Data: <Text style={styles.metaValue}>
            {new Date(selectedTicket.created_at).toLocaleDateString('it-IT')}
          </Text></Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrizione</Text>
          <Text style={styles.descriptionText}>{selectedTicket.description}</Text>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            💬 Commenti ({selectedTicket.comments?.length || 0})
          </Text>

          {selectedTicket.comments && selectedTicket.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentName}>{comment.user_name}</Text>
                {comment.role === 'admin' && (
                  <Text style={styles.adminBadge}>🔐 Admin</Text>
                )}
              </View>
              <Text style={styles.commentText}>{comment.comment}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString('it-IT')}
              </Text>
            </View>
          ))}

          <View style={styles.addCommentSection}>
            <TextInput
              style={[styles.commentInput, { height: 80 }]}
              placeholder="Aggiungi un commento..."
              value={newComment}
              onChangeText={setNewComment}
              multiline={true}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.submitButton, addingComment && { opacity: 0.6 }]}
              onPress={handleAddComment}
              disabled={addingComment}
            >
              {addingComment ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>📤 Invia Commento</Text>
              )}
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10
  },
  ticketType: {
    fontSize: 18,
    marginTop: 2
  },
  ticketInfo: {
    flex: 1
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold'
  },
  ticketDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8
  },
  ticketMeta: {
    fontSize: 11,
    color: '#999'
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 16
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  adminNotes: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16
  },
  adminNotesLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6
  },
  adminNotesText: {
    fontSize: 13,
    color: '#856404'
  },
  metaSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    gap: 6
  },
  metaLabel: {
    fontSize: 13,
    color: '#666'
  },
  metaValue: {
    fontWeight: 'bold',
    color: '#333'
  },
  descriptionSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20
  },
  commentsSection: {
    marginBottom: 20
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  commentName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333'
  },
  adminBadge: {
    backgroundColor: '#007bff',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 10
  },
  commentText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18
  },
  commentDate: {
    fontSize: 11,
    color: '#999'
  },
  addCommentSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  commentInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default MyTicketsScreen;
