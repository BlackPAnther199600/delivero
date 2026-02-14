import React, { useState } from 'react';
import API from '../services/api';

const DocumentPickup = () => {
  const [formData, setFormData] = useState({
    documentType: 'certificate',
    pickupLocation: '',
    deliveryAddress: '',
    estimatedCost: 5.00,
    description: '',
    signatureRequired: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const documentTypes = [
    { value: 'certificate', label: 'Certificato' },
    { value: 'permit', label: 'Permesso' },
    { value: 'contract', label: 'Contratto' },
    { value: 'document', label: 'Documento generico' },
    { value: 'bill', label: 'Bolletta' },
    { value: 'other', label: 'Altro' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await API.post('/document-pickups', {
        ...formData,
        pickupLat: 0,
        pickupLon: 0,
        deliveryLat: 0,
        deliveryLon: 0,
        estimatedCost: parseFloat(formData.estimatedCost)
      });

      setTrackingNumber(response.data.tracking_number);
      setMessage('Ritiro documento prenotato con successo!');
      
      // Reset form
      setFormData({
        documentType: 'certificate',
        pickupLocation: '',
        deliveryAddress: '',
        estimatedCost: 5.00,
        description: '',
        signatureRequired: false
      });
    } catch (error) {
      setMessage(`Errore: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-pickup">
      <h3>Ritiro Documenti</h3>
      <p className="subtitle">Ritiro e consegna documenti in tutta la città</p>

      {trackingNumber && (
        <div className="tracking-info">
          <h4>✓ Ritiro Confermato</h4>
          <p>Numero di Tracking: <strong>{trackingNumber}</strong></p>
          <p>Puoi tracciare lo stato del tuo ritiro usando questo numero</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo di Documento:</label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            required
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Luogo Ritiro:</label>
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleChange}
            placeholder="Indirizzo dove ritirarli"
            required
          />
        </div>

        <div className="form-group">
          <label>Indirizzo Consegna:</label>
          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="Dove ti deve consegnare i documenti"
            required
          />
        </div>

        <div className="form-group">
          <label>Descrizione:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrizione dei documenti (es: 5 certificati di residenza)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Costo Stimato (€):</label>
          <input
            type="number"
            name="estimatedCost"
            value={formData.estimatedCost}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="signatureRequired"
              checked={formData.signatureRequired}
              onChange={handleChange}
            />
            Richiedi firma alla consegna
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Prenotazione in corso...' : 'Prenota Ritiro'}
        </button>
      </form>

      {message && (
        <p className={`message ${trackingNumber ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <div className="info-box">
        <h4>ℹ️ Informazioni importante</h4>
        <ul>
          <li>Specifica chiaramente il luogo di ritiro</li>
          <li>Indica l'indirizzo di consegna</li>
          <li>Il rider ritirerà i documenti e te li consegnerà</li>
          <li>Potrai tracciare il ritiro con il numero di tracking</li>
          <li>Per documenti importanti, consigliamo la firma alla consegna</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentPickup;
