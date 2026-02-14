import React, { useState, useEffect } from 'react';
import './index.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowRegister(false);
  };

  // Determina quale dashboard mostrare in base al ruolo
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'customer':
        return <CustomerDashboard user={user} />;
      case 'rider':
        return <RiderDashboard user={user} />;
      case 'manager':
        return <AdminDashboard user={user} />;
      default:
        return <CustomerDashboard user={user} />;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'customer': return '👤 Consumatore';
      case 'rider': return '🚗 Rider';
      case 'manager': return '👨‍💼 Manager/Admin';
      default: return user?.role || '';
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          🚀 Delivero
        </div>
        
        {user ? (
          <div className="navbar-user" style={{ marginLeft: 'auto' }}>
            <div className="navbar-user-info">
              <span style={{ marginRight: '1rem' }}>
                👤 {user.name || user.email} - <strong>{getRoleLabel()}</strong>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="navbar-logout"
            >
              🚪 Logout
            </button>
          </div>
        ) : null}
      </nav>

      {/* Main Content */}
      <div className="app-content">
        {!user ? (
          <div className="form-container">
            <div className="hero text-center mb-3">
              <h1>Benvenuto in Delivero</h1>
              <p>La piattaforma di delivery all-in-one</p>
            </div>
            
            <div className="text-center mb-3">
              <button
                onClick={() => setShowRegister(!showRegister)}
                className={`btn ${showRegister ? 'btn-secondary' : 'btn-primary'}`}
              >
                {showRegister ? '📝 Vai al Login' : '✍️ Registrati'}
              </button>
            </div>

            <div className="card">
              {showRegister ? (
                <RegisterForm onRegisterSuccess={handleLoginSuccess} />
              ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              )}
            </div>
          </div>
        ) : (
          renderDashboard()
        )}
      </div>
    </div>
  );
}

export default App;
