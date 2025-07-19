import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const BASE_URL = "https://find-francesca-12182840987.europe-west2.run.app";
const CALENDAR_URL = `${BASE_URL}/calendarHandler`;

function Calendar() {
  const { idToken } = useAuth();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ from: "", to: "", name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idToken) return;
    axios
      .get(CALENDAR_URL, {
        headers: { Authorization: `Bearer ${idToken}` }
      })
      .then(res => setEntries(res.data))
      .catch(err => console.error("Error fetching calendar:", err));
  }, [idToken]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(CALENDAR_URL, form, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setForm({ from: "", to: "", name: "" });
      // Refresh entries
      const res = await axios.get(CALENDAR_URL, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setEntries(res.data);
    } catch (err) {
      alert("Error adding entry");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", textAlign: "left" }}>
      <h2>Car Access Calendar</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <label>
          From: <input type="date" name="from" value={form.from} onChange={handleChange} required />
        </label>
        <br />
        <label>
          To: <input type="date" name="to" value={form.to} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Name: <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit" disabled={loading}>Add Entry</button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc" }}>From</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>To</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Name</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(entries) ? entries : []).map(entry => (
            <tr key={entry.id}>
              <td style={{ borderBottom: "1px solid #eee" }}>{entry.from}</td>
              <td style={{ borderBottom: "1px solid #eee" }}>{entry.to}</td>
              <td style={{ borderBottom: "1px solid #eee" }}>{entry.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;