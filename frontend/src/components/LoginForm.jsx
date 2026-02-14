import { useState } from "react";
import { authAPI } from "../services/api";

export default function LoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
      const response = await authAPI.login(formData.email, formData.password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-center mb-3">🔐 Accedi</h2>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
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
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "⏳ Accesso in corso..." : "🚀 Accedi"}
        </button>
      </form>
    </div>
  );
}
