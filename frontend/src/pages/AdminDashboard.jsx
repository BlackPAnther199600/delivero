import { useEffect, useState } from "react";
import { adminAPI, ordersAPI, ticketsAPI } from "../services/api";
import ManagerTrackingDashboard from "./ManagerTrackingDashboard";

const styles = {
  container: { padding: "20px", maxWidth: "1400px", margin: "0 auto" },
  header: { marginBottom: "30px" },
  tabsContainer: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  tabButton: (active) => ({
    padding: "10px 15px",
    backgroundColor: active ? "#FF6B00" : "#e0e0e0",
    color: active ? "white" : "black",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: active ? "bold" : "normal"
  }),
  card: { padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", marginBottom: "15px" },
  gridCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { padding: "20px", backgroundColor: "white", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  statValue: { fontSize: "28px", fontWeight: "bold", color: "#FF6B00", marginBottom: "10px" },
  statLabel: { fontSize: "14px", color: "#666" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  tableHeader: { backgroundColor: "#333", color: "white" },
  tableHeaderCell: { padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" },
  tableCell: { padding: "12px", borderBottom: "1px solid #ddd" },
  tableRow: { "&:hover": { backgroundColor: "#f9f9f9" } },
  inputGroup: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  select: { padding: "8px", borderRadius: "4px", border: "1px solid #ddd", flex: 1, minWidth: "150px" },
  button: { padding: "8px 15px", backgroundColor: "#FF6B00", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  actionButton: (danger) => ({
    padding: "6px 12px",
    backgroundColor: danger ? "#d32f2f" : "#FFA500",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  }),
  loading: { textAlign: "center", padding: "40px", color: "#666" },
  error: { padding: "20px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px", marginBottom: "20px" },
  success: { padding: "20px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "4px", marginBottom: "20px" }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Stats
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");

  // Users
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("open");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stats, finance, metrics, tickets] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getFinanceReport(),
        adminAPI.getServiceMetrics(),
        adminAPI.getTicketStats()
      ]);
      setStats(stats);
      setFinance(finance);
      setMetrics(metrics);
      setTicketStats(tickets);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || "Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAdminTickets();
      setTickets(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);

    if (tab === "orders" && orders.length === 0) loadOrders();
    if (tab === "users" && users.length === 0) loadUsers();
    if (tab === "tickets" && tickets.length === 0) loadTickets();
  };

  const handleUpdateUserRole = async (userId) => {
    try {
      setLoading(true);
      await adminAPI.updateUserRole(userId, newRole);
      setSuccess("User role updated successfully");
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating user role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        await adminAPI.deleteUser(userId);
        setSuccess("User deleted successfully");
        await loadUsers();
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting user");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredOrders = orders.filter(o => orderFilter === "all" ? true : o.status === orderFilter);
  const filteredUsers = users.filter(u => userFilter === "all" ? true : u.role === userFilter);
  const filteredTickets = tickets.filter(t => ticketFilter === "all" ? true : t.status === ticketFilter);

  if (loading && activeTab === "stats") return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>⚙️ Admin Dashboard</h1>
        <p style={{ color: "#666", marginTop: "10px" }}>Manage all system operations and data</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.tabsContainer}>
        <button style={styles.tabButton(activeTab === "stats")} onClick={() => handleTabChange("stats")}>📊 Statistics</button>
        <button style={styles.tabButton(activeTab === "orders")} onClick={() => handleTabChange("orders")}>📦 Orders</button>
        <button style={styles.tabButton(activeTab === "users")} onClick={() => handleTabChange("users")}>👥 Users</button>
        <button style={styles.tabButton(activeTab === "finance")} onClick={() => handleTabChange("finance")}>💰 Finance</button>
        <button style={styles.tabButton(activeTab === "metrics")} onClick={() => handleTabChange("metrics")}>📈 Metrics</button>
        <button style={styles.tabButton(activeTab === "tickets")} onClick={() => handleTabChange("tickets")}>🎫 Tickets</button>
        <button style={styles.tabButton(activeTab === "tracking")} onClick={() => handleTabChange("tracking")}>🗺️ Tracciamento</button>
      </div>

      {/* Statistics Tab */}
      {activeTab === "stats" && stats && (
        <div>
          <div style={styles.gridCards}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalOrders}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>€{stats.totalRevenue?.toFixed(2)}</div>
              <div style={styles.statLabel}>Total Revenue</div>
            </div>
          </div>

          <h3>Recent Orders</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>Customer</th>
                <th style={styles.tableHeaderCell}>Amount</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order.id}>
                  <td style={styles.tableCell}>#{order.id}</td>
                  <td style={styles.tableCell}>{order.name}</td>
                  <td style={styles.tableCell}>€{order.total_amount}</td>
                  <td style={styles.tableCell}>{order.status}</td>
                  <td style={styles.tableCell}>{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <div style={styles.inputGroup}>
            <select style={styles.select} value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <h3>Orders ({filteredOrders.length})</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>Customer</th>
                <th style={styles.tableHeaderCell}>Amount</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={styles.tableCell}>#{order.id}</td>
                  <td style={styles.tableCell}>{order.name}</td>
                  <td style={styles.tableCell}>€{order.total_amount}</td>
                  <td style={styles.tableCell}>{order.status}</td>
                  <td style={styles.tableCell}>{new Date(order.created_at).toLocaleDateString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <div style={styles.inputGroup}>
            <select style={styles.select} value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="all">All Users</option>
              <option value="customer">Customers</option>
              <option value="rider">Riders</option>
              <option value="manager">Managers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <h3>Users ({filteredUsers.length})</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>Name</th>
                <th style={styles.tableHeaderCell}>Email</th>
                <th style={styles.tableHeaderCell}>Role</th>
                <th style={styles.tableHeaderCell}>Date</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={styles.tableCell}>#{user.id}</td>
                  <td style={styles.tableCell}>{user.name}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>
                    {editingUser === user.id ? (
                      <select style={{ ...styles.select, width: "auto" }} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                        <option value="customer">Customer</option>
                        <option value="rider">Rider</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td style={styles.tableCell}>{new Date(user.created_at).toLocaleDateString('en-US')}</td>
                  <td style={styles.tableCell}>
                    {editingUser === user.id ? (
                      <>
                        <button style={styles.button} onClick={() => handleUpdateUserRole(user.id)}>Save</button>
                        <button style={{ ...styles.button, backgroundColor: "#999", marginLeft: "5px" }} onClick={() => setEditingUser(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button style={styles.actionButton(false)} onClick={() => { setEditingUser(user.id); setNewRole(user.role); }}>Edit</button>
                        <button
                          style={{ ...styles.actionButton(true), marginLeft: "5px", opacity: currentUser?.id === user.id ? 0.5 : 1, cursor: currentUser?.id === user.id ? "not-allowed" : "pointer" }}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={currentUser?.id === user.id}
                        >
                          {currentUser?.id === user.id ? "Can't Delete Self" : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === "finance" && finance && (
        <div>
          <div style={styles.gridCards}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                €{finance.totalRevenue ? Number(finance.totalRevenue).toFixed(2) : '0.00'}
              </div>
              <div style={styles.statLabel}>Total Revenue</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{finance.billPayments?.total || 0}</div>
              <div style={styles.statLabel}>Bill Payments</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                €{finance.billPayments?.amount ? Number(finance.billPayments.amount).toFixed(2) : '0.00'}
              </div>
              <div style={styles.statLabel}>Bills Total</div>
            </div>
          </div>

          <h3>Payment Methods</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Method</th>
                <th style={styles.tableHeaderCell}>Count</th>
                <th style={styles.tableHeaderCell}>Total</th>
              </tr>
            </thead>
            <tbody>
              {finance.paymentMethods?.map((pm, idx) => (
                <tr key={idx}>
                  <td style={styles.tableCell}>{pm.payment_method}</td>
                  <td style={styles.tableCell}>{pm.count}</td>
                  <td style={styles.tableCell}>€{pm.total ? Number(pm.total).toFixed(2) : '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: "30px" }}>Orders by Status</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Count</th>
              </tr>
            </thead>
            <tbody>
              {finance.ordersByStatus?.map((status, idx) => (
                <tr key={idx}>
                  <td style={styles.tableCell}>{status.status}</td>
                  <td style={styles.tableCell}>{status.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && metrics && (
        <div>
          <div style={styles.gridCards}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{metrics.pharmacy?.total_orders}</div>
              <div style={styles.statLabel}>Pharmacy Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{metrics.medicalTransports?.total_transports}</div>
              <div style={styles.statLabel}>Medical Transports</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{metrics.documentPickups?.total_pickups}</div>
              <div style={styles.statLabel}>Document Pickups</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{metrics.bills?.total_bills}</div>
              <div style={styles.statLabel}>Bills</div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && ticketStats && (
        <div>
          <div style={styles.gridCards}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{ticketStats.totalTickets}</div>
              <div style={styles.statLabel}>Total Tickets</div>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <select style={styles.select} value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)}>
              <option value="all">All Tickets</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <h3>Unresolved Tickets</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>Title</th>
                <th style={styles.tableHeaderCell}>Type</th>
                <th style={styles.tableHeaderCell}>Priority</th>
                <th style={styles.tableHeaderCell}>Date</th>
              </tr>
            </thead>
            <tbody>
              {ticketStats.unresolvedTickets?.map(ticket => (
                <tr key={ticket.id}>
                  <td style={styles.tableCell}>#{ticket.id}</td>
                  <td style={styles.tableCell}>{ticket.title}</td>
                  <td style={styles.tableCell}>{ticket.type}</td>
                  <td style={styles.tableCell}>{ticket.priority}</td>
                  <td style={styles.tableCell}>{new Date(ticket.created_at).toLocaleDateString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: "30px" }}>Tickets by Status</h3>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Count</th>
              </tr>
            </thead>
            <tbody>
              {ticketStats.byStatus?.map((status, idx) => (
                <tr key={idx}>
                  <td style={styles.tableCell}>{status.status}</td>
                  <td style={styles.tableCell}>{status.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === "tracking" && (
        <div>
          <ManagerTrackingDashboard />
        </div>
      )}
    </div>
  );
}
