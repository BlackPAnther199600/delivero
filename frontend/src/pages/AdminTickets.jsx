import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTicketsAndStats();
  }, []);

  const fetchTicketsAndStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [ticketsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tickets/admin/all', { headers }),
        axios.get('http://localhost:5000/api/tickets/admin/stats', { headers })
      ]);

      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/tickets/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTicket(response.data);
      setUpdateStatus(response.data.status);
      setAdminNotes(response.data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
        {
          status: updateStatus,
          adminNotes: adminNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await handleSelectTicket(selectedTicket.id);
      await fetchTicketsAndStats();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      await handleSelectTicket(selectedTicket.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
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

  const getStatusColor = (status) => {
    const colors = {
      'open': '#ff9800',
      'in_progress': '#2196f3',
      'resolved': '#4caf50',
      'closed': '#757575'
    };
    return colors[status] || '#999';
  };

  const filteredTickets = tickets.filter(t => {
    let typeMatch = filterType === 'all' || t.type === filterType;
    let statusMatch = filterStatus === 'all' || t.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (loading) {
    return <div style={styles.loading}>⏳ Caricamento...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎯 Gestione Ticket</h2>

      {!selectedTicket ? (
        <>
          {stats && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{stats.total}</div>
                <div style={styles.statLabel}>Totale</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#ff9800' }}>{stats.open}</div>
                <div style={styles.statLabel}>Aperto</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#2196f3' }}>{stats.in_progress}</div>
                <div style={styles.statLabel}>In Corso</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#4caf50' }}>{stats.resolved}</div>
                <div style={styles.statLabel}>Risolto</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNumber, color: '#757575' }}>{stats.closed}</div>
                <div style={styles.statLabel}>Chiuso</div>
              </div>
            </div>
          )}

          <div style={styles.filterSection}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tutti i Tipi</option>
              <option value="bug">🐛 Bug</option>
              <option value="complaint">😞 Reclamo</option>
              <option value="feature_request">💡 Richiesta</option>
              <option value="support">🆘 Supporto</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">Tutti gli Stati</option>
              <option value="open">Aperto</option>
              <option value="in_progress">In Corso</option>
              <option value="resolved">Risolto</option>
              <option value="closed">Chiuso</option>
            </select>
          </div>

          <div style={styles.ticketsList}>
            {filteredTickets.length === 0 ? (
              <p style={styles.emptyState}>Nessun ticket trovato</p>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={styles.ticketCard}
                  onClick={() => handleSelectTicket(ticket.id)}
                >
                  <div style={styles.ticketHeader}>
                    <div style={styles.ticketTypeIcon}>{getTypeIcon(ticket.type)}</div>
                    <div style={styles.ticketContent}>
                      <h3 style={styles.ticketTitle}>{ticket.title}</h3>
                      <p style={styles.ticketUser}>Utente: {ticket.user_name}</p>
                    </div>
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
              ))
            )}
          </div>
        </>
      ) : (
        <div style={styles.detailPanel}>
          <button onClick={() => setSelectedTicket(null)} style={styles.backButton}>
            ← Torna alla lista
          </button>

          <div style={styles.detailGrid}>
            <div style={styles.detailLeft}>
              <h3 style={styles.detailTitle}>
                {getTypeIcon(selectedTicket.type)} {selectedTicket.title}
              </h3>

              <div style={styles.metaInfo}>
                <p><strong>Utente:</strong> {selectedTicket.user_name}</p>
                <p><strong>Email:</strong> {selectedTicket.user_email}</p>
                <p><strong>Tipo:</strong> {selectedTicket.type}</p>
                <p><strong>Priorità:</strong> {selectedTicket.priority}</p>
                <p><strong>Data:</strong> {new Date(selectedTicket.created_at).toLocaleDateString('it-IT')}</p>
              </div>

              <div style={styles.description}>
                <h4>Descrizione</h4>
                <p>{selectedTicket.description}</p>
              </div>

              <div style={styles.comments}>
                <h4>💬 Commenti</h4>
                {selectedTicket.comments?.map(c => (
                  <div key={c.id} style={styles.commentItem}>
                    <div style={styles.commentHeader}>
                      <strong>{c.user_name}</strong>
                      {c.role === 'admin' && <span style={styles.adminBadge}>🔐 Admin</span>}
                    </div>
                    <p style={styles.commentText}>{c.comment}</p>
                    <small style={styles.commentMeta}>{new Date(c.created_at).toLocaleDateString('it-IT')}</small>
                  </div>
                ))}

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Aggiungi un commento..."
                  rows="3"
                  style={styles.commentInput}
                />
                <button onClick={handleAddComment} style={styles.commentButton}>
                  Aggiungi Commento
                </button>
              </div>
            </div>

            <div style={styles.detailRight}>
              <div style={styles.updatePanel}>
                <h4>Aggiorna Ticket</h4>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Stato</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    style={styles.select}
                  >
                    <option value="open">Aperto</option>
                    <option value="in_progress">In Corso</option>
                    <option value="resolved">Risolto</option>
                    <option value="closed">Chiuso</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Note Admin</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="5"
                    style={styles.textarea}
                  />
                </div>

                <button onClick={handleUpdateStatus} style={styles.updateButton}>
                  ✅ Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  filterSection: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  filterSelect: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  ticketsList: {
    display: 'grid',
    gap: '10px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    padding: '30px'
  },
  ticketCard: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #eee'
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '10px'
  },
  ticketTypeIcon: {
    fontSize: '24px'
  },
  ticketContent: {
    flex: 1,
    minWidth: 0
  },
  ticketTitle: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '16px'
  },
  ticketUser: {
    margin: '0',
    color: '#666',
    fontSize: '12px'
  },
  statusBadge: {
    color: 'white',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  ticketDescription: {
    margin: '5px 0',
    color: '#666',
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  ticketMeta: {
    display: 'flex',
    gap: '20px',
    color: '#999',
    fontSize: '12px'
  },
  detailPanel: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px'
  },
  backButton: {
    padding: '8px 16px',
    marginBottom: '20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '20px'
  },
  detailLeft: {
    minWidth: 0
  },
  detailRight: {
    borderLeft: '1px solid #eee',
    paddingLeft: '20px'
  },
  detailTitle: {
    margin: '0 0 15px 0',
    color: '#333'
  },
  metaInfo: {
    backgroundColor: '#f9f9f9',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  description: {
    marginBottom: '20px'
  },
  comments: {
    marginTop: '20px'
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    borderLeft: '3px solid #2196f3'
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px'
  },
  adminBadge: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '11px'
  },
  commentText: {
    margin: '5px 0',
    fontSize: '13px'
  },
  commentMeta: {
    color: '#999'
  },
  commentInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '10px',
    marginBottom: '10px'
  },
  commentButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  updatePanel: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '4px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
    fontSize: '13px'
  },
  select: {
    width: '100%',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '13px'
  },
  textarea: {
    width: '100%',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '13px'
  },
  updateButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default AdminTickets;
