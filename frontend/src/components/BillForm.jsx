import { useState } from "react";
import { billsAPI } from "../services/api";

export default function BillForm({ onBillCreated }) {
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    dueDate: "",
    description: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await billsAPI.create(formData);
      setSuccess(true);
      setFormData({ type: "", amount: "", dueDate: "", description: "" });
      setTimeout(() => {
        setSuccess(false);
        onBillCreated && onBillCreated();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px" }}>
      <h2>Aggiungi Bolletta</h2>
      {success && <p style={{ color: "green" }}>Bolletta aggiunta con successo!</p>}
      {error && <p style={{ color: "red" }}>Errore: {error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Tipo:</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Es: Luce, Gas, Acqua"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Importo (€):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Data Scadenza:</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Descrizione:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", minHeight: "80px" }}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          style={{ padding: "10px 20px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Aggiunta..." : "Aggiungi Bolletta"}
        </button>
      </form>
    </div>
  );
}
