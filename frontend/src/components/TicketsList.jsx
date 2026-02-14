import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/tickets/my-tickets',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTicketDetails = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/tickets/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setAddingComment(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/comments`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComment('');
      // Refresh ticket details
      await getTicketDetails(selectedTicket.id);
    } catch (error) {
      console.error('Error adding comment:', error);
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

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  if (loading) {
    return <div style={styles.loading}>⏳ Caricamento ticket...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 I Miei Ticket</h2>

      {!selectedTicket ? (
        <>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Filtra per stato:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tutti</option>
              <option value="open">🔴 Aperto</option>
              <option value="in_progress">🔵 In Corso</option>
              <option value="resolved">🟢 Risolto</option>
              <option value="closed">⚫ Chiuso</option>
            </select>
          </div>

          {filteredTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Nessun ticket trovato</p>
            </div>
          ) : (
            <div style={styles.ticketsList}>
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={styles.ticketCard}
                  onClick={() => getTicketDetails(ticket.id)}
                >
                  <div style={styles.ticketHeader}>
                    <span style={styles.ticketType}>{getTypeIcon(ticket.type)}</span>
                    <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(ticket.status)
                      }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p style={styles.ticketDescription}>{ticket.description}</p>
                  <div style={styles.ticketMeta}>
                    <small>ID: #{ticket.id}</small>
                    <small>{new Date(ticket.created_at).toLocaleDateString('it-IT')}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={styles.detailSection}>
          <button
            onClick={() => setSelectedTicket(null)}
            style={styles.backButton}
          >
            ← Torna alla lista
          </button>

          <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
              <h2 style={styles.detailTitle}>
                {getTypeIcon(selectedTicket.type)} {selectedTicket.title}
              </h2>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(selectedTicket.status)
                }}
              >
                {selectedTicket.status}
              </span>
            </div>

            {selectedTicket.admin_notes && (
              <div style={styles.adminNotes}>
                <strong>📌 Nota dell'Admin:</strong>
                <p>{selectedTicket.admin_notes}</p>
              </div>
            )}

            <div style={styles.detailBody}>
              <p><strong>Descrizione:</strong></p>
              <p>{selectedTicket.description}</p>

              <p><strong>Data creazione:</strong> {new Date(selectedTicket.created_at).toLocaleDateString('it-IT')}</p>
              <p><strong>Priorità:</strong> {selectedTicket.priority}</p>
            </div>

            <div style={styles.commentsSection}>
              <h3>💬 Commenti ({selectedTicket.comments?.length || 0})</h3>

              {selectedTicket.comments && selectedTicket.comments.map(comment => (
                <div key={comment.id} style={styles.commentCard}>
                  <div style={styles.commentHeader}>
                    <strong>{comment.user_name}</strong>
                    <span style={styles.commentRole}>
                      {comment.role === 'admin' ? '🔐 Admin' : '👤 ' + comment.role}
                    </span>
                    <small>{new Date(comment.created_at).toLocaleDateString('it-IT')}</small>
                  </div>
                  <p>{comment.comment}</p>
                </div>
              ))}

              <form onSubmit={handleAddComment} style={styles.commentForm}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  rows="3"
                  style={styles.commentInput}
                />
                <button
                  type="submit"
                  disabled={addingComment}
                  style={{
                    ...styles.submitComment,
                    opacity: addingComment ? 0.6 : 1
                  }}
                >
                  {addingComment ? 'Invio...' : '📤 Invia Commento'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#333',
    marginTop: 0,
    marginBottom: '20px'
  },
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  filterLabel: {
    fontWeight: 'bold',
    color: '#555'
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  },
  ticketsList: {
    display: 'grid',
    gap: '15px'
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  ticketType: {
    fontSize: '20px'
  },
  ticketTitle: {
    margin: 0,
    flex: 1,
    color: '#333'
  },
  statusBadge: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  ticketDescription: {
    margin: '10px 0',
    color: '#666',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  ticketMeta: {
    display: 'flex',
    gap: '20px',
    color: '#999',
    fontSize: '12px'
  },
  detailSection: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  backButton: {
    padding: '10px 20px',
    margin: '15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  detailCard: {
    padding: '20px'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  detailTitle: {
    margin: 0,
    color: '#333'
  },
  adminNotes: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '20px'
  },
  detailBody: {
    marginBottom: '30px',
    color: '#666',
    lineHeight: 1.6
  },
  commentsSection: {
    borderTop: '1px solid #eee',
    paddingTop: '20px'
  },
  commentCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '15px',
    borderLeft: '3px solid #2196f3'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  commentRole: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px'
  },
  commentForm: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  commentInput: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  },
  submitComment: {
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default TicketsList;
