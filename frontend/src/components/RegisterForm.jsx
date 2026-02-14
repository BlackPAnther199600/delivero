import { useState } from "react";
import { authAPI } from "../services/api";

export default function RegisterForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "customer"
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.register(formData.email, formData.password, formData.name, formData.role);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onRegisterSuccess(response.data.user);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center mb-3">✍️ Registrati</h2>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">👤 Nome Completo</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Luca Rossi"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">📧 Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tuo@email.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">🔒 Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">👥 Ruolo</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            <option value="customer">👤 Cliente</option>
            <option value="rider">🚗 Rider</option>
            <option value="manager">👨‍💼 Manager/Admin</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "⏳ Registrazione..." : "🚀 Registrati"}
        </button>
      </form>
    </div>
  );
}
