import React, { useState } from 'react';
import axios from 'axios';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    type: 'complaint',
    title: '',
    description: '',
    attachmentUrls: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const ticketTypes = [
    { value: 'bug', label: '🐛 Bug/Errore tecnico' },
    { value: 'complaint', label: '😞 Reclamo' },
    { value: 'feature_request', label: '💡 Richiesta funzione' },
    { value: 'support', label: '🆘 Supporto' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/tickets',
        {
          type: formData.type,
          title: formData.title,
          description: formData.description,
          attachmentUrls: formData.attachmentUrls
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: '✅ Ticket creato con successo!' });
      setFormData({
        type: 'complaint',
        title: '',
        description: '',
        attachmentUrls: []
      });

      if (onTicketCreated) {
        onTicketCreated(response.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Errore nella creazione del ticket'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Crea una Segnalazione</h2>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderColor: message.type === 'success' ? '#c3e6cb' : '#f5c6cb'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tipo di Segnalazione *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
          >
            {ticketTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Titolo *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Breve descrizione del problema"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Descrizione dettagliata *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrivi il problema nel dettaglio..."
            required
            rows="5"
            style={styles.textarea}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Invio in corso...' : '📤 Invia Segnalazione'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#333',
    marginTop: 0,
    marginBottom: '20px'
  },
  message: {
    padding: '10px 15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold'
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical'
  },
  select: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};

export default TicketForm;
