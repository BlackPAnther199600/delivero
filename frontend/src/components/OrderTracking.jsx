import { useEffect, useState } from "react";
import io from "socket.io-client";
import { ordersAPI } from "../services/api";

export default function OrderTracking({ orderId, userId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();

    // Connect to Socket.IO
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    socket.emit("joinUserRoom", userId);

    // Listen for order updates
    socket.on("orderStatusUpdate", (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => ({
          ...prev,
          status: data.status,
          location: data.location
        }));
      }
    });

    return () => socket.disconnect();
  }, [orderId, userId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <p>Caricamento ordine...</p>;
  if (error) return <p>Errore: {error}</p>;
  if (!order) return <p>Ordine non trovato</p>;

  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    preparing: "purple",
    in_delivery: "green",
    completed: "darkgreen",
    cancelled: "red"
  };

  return (
    <div style={{ padding: "20px", border: "2px solid #ddd", borderRadius: "8px", marginTop: "20px" }}>
      <h3>Tracciamento Ordine #{order.id}</h3>
      
      <div style={{ marginBottom: "15px" }}>
        <p><strong>Stato:</strong></p>
        <div style={{
          padding: "10px",
          backgroundColor: statusColors[order.status] || "gray",
          color: "white",
          borderRadius: "5px",
          fontSize: "16px",
          textAlign: "center"
        }}>
          {order.status.toUpperCase().replace("_", " ")}
        </div>
      </div>

      <p><strong>Indirizzo consegna:</strong> {order.delivery_address}</p>
      <p><strong>Importo:</strong> €{order.total_amount}</p>

      {order.location && (
        <p><strong>Posizione attuale:</strong> {order.location}</p>
      )}

      <p style={{ fontSize: "12px", color: "#666" }}>
        Creato: {new Date(order.created_at).toLocaleDateString("it-IT")}
      </p>
    </div>
  );
}
