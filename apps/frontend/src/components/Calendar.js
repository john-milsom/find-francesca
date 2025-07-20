import React, { useState, useEffect, useRef } from "react";
import CalendarView from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useAuth } from "./AuthContext";
import moment from "moment";
import "./Calendar.css";

const CALENDAR_API_URL = "https://find-francesca-12182840987.europe-west2.run.app/calendar";

function Calendar() {
  const { idToken } = useAuth();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(null); // No date selected by default
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState({ from: "", to: "", name: "" });
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef();

  useEffect(() => {
    if (!idToken) return;
    axios
      .get(CALENDAR_API_URL, {
        headers: { Authorization: `Bearer ${idToken}` }
      })
      .then(res => setEntries(res.data))
      .catch(err => console.error("Error fetching calendar:", err));
  }, [idToken]);

  // Find entries for a given date
  const getEntriesForDate = (date) => {
    if (!date) return [];
    return entries.filter(entry => {
      const fromDate = moment(entry.from, "YYYY-MM-DD").toDate();
      const toDate = moment(entry.to, "YYYY-MM-DD").toDate();
      return (
        date >= fromDate &&
        date <= toDate
      );
    });
  };

  // Handle opening the popup and prepopulate form
  const handleNewEntryClick = () => {
    const dayStr = moment(date).format("YYYY-MM-DD");
    setForm({ from: dayStr, to: dayStr, name: "" });
    setShowPopup(true);
  };

  // Handle form changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(CALENDAR_API_URL, form, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setShowPopup(false);
      setForm({ from: "", to: "", name: "" });
      // Refresh entries
      const res = await axios.get(CALENDAR_API_URL, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setEntries(res.data);
    } catch (err) {
      alert("Error adding entry");
    }
    setLoading(false);
  };

  // Handle delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    setLoading(true);
    try {
      await axios.delete(CALENDAR_API_URL, {
        data: { id },
        headers: { Authorization: `Bearer ${idToken}` }
      });
      // Refresh entries
      const res = await axios.get(CALENDAR_API_URL, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setEntries(res.data);
    } catch (err) {
      alert("Error deleting entry");
    }
    setLoading(false);
  };

  // Unselect date if clicking the same date or clicking outside the calendar
  const handleCalendarChange = (selectedDate) => {
    if (date && selectedDate && moment(date).isSame(selectedDate, "day")) {
      setDate(null);
    } else {
      setDate(selectedDate);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        !showPopup
      ) {
        setDate(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="calendar-container" ref={calendarRef}>
      <CalendarView
        value={date}
        onChange={handleCalendarChange}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const dayEntries = getEntriesForDate(date);
            return dayEntries.length > 0 ? (
              <ul className="calendar-entries-list">
                {dayEntries.map((entry, idx) => (
                  <li key={idx}>{entry.name}</li>
                ))}
              </ul>
            ) : null;
          }
        }}
      />
      {date && (
        <>
          <div className="selected-date">
            <strong>Entries for {date.toDateString()}:</strong>
            <ul>
              {getEntriesForDate(date).map((entry, idx) => (
                <li key={entry.id || idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <span>
                    {entry.name} ({entry.from} to {entry.to})
                  </span>
                  <button
                    className="default-btn"
                    style={{ background: "#e57373", color: "#fff", marginLeft: 12, padding: "2px 10px", fontSize: "0.9em" }}
                    onClick={() => handleDeleteEntry(entry.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="default-btn"
            style={{ marginTop: 24 }}
            onClick={handleNewEntryClick}
          >
            New Entry
          </button>
        </>
      )}
      {/* Popup for adding entry */}
      {showPopup && (
        <div className="calendar-popup">
          <div className="calendar-popup-content">
            <h3>Add Calendar Entry</h3>
            <form onSubmit={handleSubmit}>
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
              <button type="submit" className="default-btn" disabled={loading}>
                Add Entry
              </button>
              <button
                type="button"
                className="default-btn"
                style={{ background: "#bbb", marginLeft: 8 }}
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;