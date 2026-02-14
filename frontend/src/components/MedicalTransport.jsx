import React, { useState } from 'react';
import API from '../services/api';

const MedicalTransport = () => {
  const [formData, setFormData] = useState({
    doctorName: '',
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    pickupAddress: '',
    appointmentDate: '',
    appointmentTime: '',
    returnTrip: true,
    specialRequirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      const response = await API.post('/medical-transports', {
        ...formData,
        pickupLat: 0, // Get from geolocation
        pickupLon: 0
      });

      setMessage('Trasporto medico prenotato con successo!');
      setFormData({
        doctorName: '',
        clinicName: '',
        clinicAddress: '',
        clinicPhone: '',
        pickupAddress: '',
        appointmentDate: '',
        appointmentTime: '',
        returnTrip: true,
        specialRequirements: ''
      });
    } catch (error) {
      setMessage(`Errore: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-transport">
      <h3>Prenota Trasporto Medico</h3>
      <p className="subtitle">Accompagnamento dal medico di famiglia</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome del Medico:</label>
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nome Clinica/Studio:</label>
          <input
            type="text"
            name="clinicName"
            value={formData.clinicName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Indirizzo Clinica:</label>
          <input
            type="text"
            name="clinicAddress"
            value={formData.clinicAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Telefono Clinica:</label>
          <input
            type="tel"
            name="clinicPhone"
            value={formData.clinicPhone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Punto Ritiro (tua casa):</label>
          <input
            type="text"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Data Appuntamento:</label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ora Appuntamento:</label>
          <input
            type="time"
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="returnTrip"
              checked={formData.returnTrip}
              onChange={handleChange}
            />
            Includi viaggio di ritorno
          </label>
        </div>

        <div className="form-group">
          <label>Esigenze Speciali:</label>
          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Es: mobilità ridotta, accompagnatore, etc..."
            rows="3"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Prenotazione in corso...' : 'Prenota Trasporto'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="info-box">
        <h4>✓ Come funziona</h4>
        <ul>
          <li>Seleziona la data e ora del tuo appuntamento</li>
          <li>Scegli se desideri il viaggio di ritorno</li>
          <li>Un rider ti ritirerà da casa e ti porterà in clinica</li>
          <li>Potrai tracciare il rider in tempo reale</li>
        </ul>
      </div>
    </div>
  );
};

export default MedicalTransport;
