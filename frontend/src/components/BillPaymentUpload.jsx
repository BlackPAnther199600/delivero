import React, { useState, useEffect } from 'react';
import API from '../services/api';

const BillPaymentUpload = ({ billId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [barcodeFile, setBarcodeFile] = useState(null);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');

  const handleBarcodeChange = (e) => {
    setBarcodeFile(e.target.files[0]);
  };

  const handleQrCodeChange = (e) => {
    setQrCodeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the bill payment request
      const paymentResponse = await API.post('/bill-payments', {
        billId,
        paymentMethod
      });

      const billPaymentId = paymentResponse.data.id;

      // Then upload images if provided
      if (barcodeFile || qrCodeFile) {
        const formData = new FormData();
        if (barcodeFile) formData.append('barcode', barcodeFile);
        if (qrCodeFile) formData.append('qrCode', qrCodeFile);

        await API.post(
          `/bill-payments/${billPaymentId}/upload-images`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      setMessage('Richiesta pagamento bolletta creata con successo!');
      setBarcodeFile(null);
      setQrCodeFile(null);
      
      if (onSuccess) onSuccess(billPaymentId);
    } catch (error) {
      setMessage(`Errore: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bill-payment-upload">
      <h3>Carica Bolletta</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Metodo di Pagamento:</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="cash">Contanti (Rider paga)</option>
            <option value="prepaid">Pre-pagamento</option>
          </select>
        </div>

        <div className="form-group">
          <label>Foto Barcode:</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleBarcodeChange}
          />
        </div>

        <div className="form-group">
          <label>Foto Codice QR:</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleQrCodeChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'In caricamento...' : 'Invia Richiesta'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default BillPaymentUpload;
