"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ScheduleEvent } from "@/lib/db";
import type { ContactMessage } from "@/lib/db";

type Tab = "schedule" | "messages";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push("/admin");
        return;
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/admin");
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

  if (loading) {
    return <div className="admin-schedule">Loading...</div>;
  }

  return (
    <div className="admin-schedule">
      <div className="admin-schedule__header">
        <h1 className="admin-schedule__title">Admin Dashboard</h1>
        <button onClick={handleLogout} className="admin-schedule__logout">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tabs__tab ${activeTab === "schedule" ? "admin-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("schedule")}
        >
          Schedule
        </button>
        <button
          className={`admin-tabs__tab ${activeTab === "messages" ? "admin-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
      </div>

      {activeTab === "schedule" && <ScheduleTab />}
      {activeTab === "messages" && <MessagesTab />}
    </div>
  );
}

function ScheduleTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ date: "", name: "", location: "" });

  useEffect(() => {
    loadEvents();
  }, []);

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
    return <div>Loading events...</div>;
  }

  return (
    <div>
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
                  onClick={() => {
                    setEditingId(event.id);
                    setFormData({ date: event.date, name: event.name, location: event.location });
                  }}
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

function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      await loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: true });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
      await loadMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Error deleting message");
    }
  }

  if (loading) {
    return <div>Loading messages...</div>;
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-messages">
      <div className="admin-messages__header">
        <h2>Messages ({messages.length})</h2>
        {unreadCount > 0 && (
          <span className="admin-messages__badge">{unreadCount} unread</span>
        )}
      </div>

      <div className="admin-messages__container">
        <div className="admin-messages__list">
          {messages.length === 0 ? (
            <p className="admin-messages__empty">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`admin-messages__item ${!message.read ? "admin-messages__item--unread" : ""} ${selectedMessage?.id === message.id ? "admin-messages__item--selected" : ""}`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read) {
                    handleMarkAsRead(message.id);
                  }
                }}
              >
                <div className="admin-messages__item-header">
                  <div className="admin-messages__item-name">{message.name}</div>
                  {!message.read && <span className="admin-messages__item-dot"></span>}
                </div>
                <div className="admin-messages__item-subject">{message.subject}</div>
                <div className="admin-messages__item-date">
                  {new Date(message.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedMessage && (
          <div className="admin-messages__detail">
            <div className="admin-messages__detail-header">
              <h3>{selectedMessage.subject}</h3>
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="admin-schedule__button admin-schedule__button--small admin-schedule__button--danger"
              >
                Delete
              </button>
            </div>
            <div className="admin-messages__detail-info">
              <p><strong>From:</strong> {selectedMessage.name}</p>
              <p><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
              <p><strong>Phone:</strong> +{selectedMessage.phoneCountry} {selectedMessage.phone}</p>
              <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString("en-US")}</p>
            </div>
            <div className="admin-messages__detail-message">
              <p>{selectedMessage.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
