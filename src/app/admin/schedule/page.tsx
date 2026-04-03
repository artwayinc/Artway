"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ScheduleEvent } from "@/lib/db";

export default function AdminSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: "", name: "", location: "" });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      const authResponse = await fetch("/api/auth/check");
      const authData = await authResponse.json();
      
      if (!authData.authenticated) {
        router.push("/admin");
        return;
      }
      
      // Redirect to dashboard
      router.push("/admin/dashboard");

      await loadEvents();
    } catch (error) {
      console.error("Error:", error);
      router.push("/admin");
    }
  }

  async function loadEvents() {
    try {
      const response = await fetch("/api/schedule");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async function handleAdd() {
    setEditingId(null);
    setFormData({ date: "", name: "", location: "" });
  }

  async function handleEdit(event: ScheduleEvent) {
    setEditingId(event.id);
    setFormData({ date: event.date, name: event.name, location: event.location });
  }

  async function handleSave() {
    try {
      if (editingId) {
        await fetch("/api/schedule", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
      } else {
        await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      await loadEvents();
      setEditingId(null);
      setFormData({ date: "", name: "", location: "" });
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
      await loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  }

  if (loading) {
    return <div className="admin-schedule">Loading...</div>;
  }

  return (
    <div className="admin-schedule">
      <div className="admin-schedule__header">
        <h1 className="admin-schedule__title">Manage Schedule</h1>
        <button onClick={handleLogout} className="admin-schedule__logout">
          Logout
        </button>
      </div>

      <div className="admin-schedule__form">
        <h2>{editingId ? "Edit Event" : "Add New Event"}</h2>
        <div className="admin-schedule__form-grid">
          <div className="admin-schedule__field">
            <label>Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="e.g., Jan 9 - 13"
            />
          </div>
          <div className="admin-schedule__field">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Event name"
              required
            />
          </div>
          <div className="admin-schedule__field">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Event location"
            />
          </div>
        </div>
        <div className="admin-schedule__form-actions">
          <button onClick={handleSave} className="admin-schedule__button admin-schedule__button--primary">
            {editingId ? "Update" : "Add"} Event
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ date: "", name: "", location: "" });
              }}
              className="admin-schedule__button"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="admin-schedule__list">
        <h2>Events ({events.length})</h2>
        <div className="admin-schedule__events">
          {events.map((event) => (
            <div key={event.id} className="admin-schedule__event">
              <div className="admin-schedule__event-content">
                <div className="admin-schedule__event-date">
                  {event.date || "—"}
                </div>
                <div className="admin-schedule__event-info">
                  <div className="admin-schedule__event-name">{event.name}</div>
                  {event.location && (
                    <div className="admin-schedule__event-location">{event.location}</div>
                  )}
                </div>
              </div>
              <div className="admin-schedule__event-actions">
                <button
                  onClick={() => handleEdit(event)}
                  className="admin-schedule__button admin-schedule__button--small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="admin-schedule__button admin-schedule__button--small admin-schedule__button--danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
