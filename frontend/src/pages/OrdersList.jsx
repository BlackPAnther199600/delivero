import { useEffect, useState } from "react";
import { ordersAPI } from "../services/api";
import OrderTracking from "../components/OrderTracking";

export default function OrdersList({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  if (loading) return <p>Caricamento ordini...</p>;
  if (error) return <p style={{ color: "red" }}>Errore: {error}</p>;

  const filteredOrders = orders.filter(o => {
    // search by id, customer name or email
    const q = search.trim().toLowerCase();
    if (q) {
      const inId = o.id.toString().includes(q);
      const inName = (o.name || '').toLowerCase().includes(q);
      const inEmail = (o.email || '').toLowerCase().includes(q);
      if (!(inId || inName || inEmail)) return false;
    }

    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      if (new Date(o.created_at) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (new Date(o.created_at) > to) return false;
    }

    return true;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>I tuoi Ordini</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Cerca per id, nome, email" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Tutti gli stati</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button onClick={clearFilters}>Reset</button>
      </div>
      {filteredOrders.length === 0 ? (
        <p>Nessun ordine</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredOrders.map(order => (
            <li
              key={order.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedOrder?.id === order.id ? "#f5f5f5" : "white"
              }}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>Ordine #{order.id}</strong> - €{order.total_amount}
                  <p style={{ margin: "5px 0", color: "#666" }}>
                    Stato: <span style={{
                      color: order.status === "completed" ? "green" : order.status === "pending" ? "orange" : "blue"
                    }}>
                      {order.status.toUpperCase().replace("_", " ")}
                    </span>
                  </p>
                  <small>{new Date(order.created_at).toLocaleDateString("it-IT")}</small>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <OrderTracking orderId={order.id} userId={userId} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
