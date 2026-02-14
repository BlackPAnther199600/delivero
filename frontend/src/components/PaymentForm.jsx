import { useState, useEffect } from "react";
import { paymentsAPI, ordersAPI } from "../services/api";

export default function PaymentForm({ orderId, totalAmount }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, [orderId, totalAmount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.createPayment(orderId, totalAmount);
      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      await paymentsAPI.confirmPayment(paymentIntentId, orderId);
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px", marginTop: "20px" }}>
      <h3>Pagamento Ordine #{orderId}</h3>
      <p><strong>Importo:</strong> €{totalAmount}</p>

      {error && <p style={{ color: "red" }}>Errore: {error}</p>}
      {success && <p style={{ color: "green" }}>Pagamento effettuato con successo!</p>}

      {!success && clientSecret && (
        <button
          onClick={handleConfirmPayment}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Elaborazione..." : "Conferma Pagamento"}
        </button>
      )}
    </div>
  );
}
