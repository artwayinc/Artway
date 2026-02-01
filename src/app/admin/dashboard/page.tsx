"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ScheduleEvent } from "@/lib/db";
import type { ContactMessage } from "@/lib/db";

type Tab = "schedule" | "messages";
type ReviewForm = {
  title: string;
  text: string;
  author: string;
  role: string;
  location: string;
  rating: string;
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab | "reviews">("schedule");
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
        <button
          className={`admin-tabs__tab ${activeTab === "reviews" ? "admin-tabs__tab--active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {activeTab === "schedule" && <ScheduleTab />}
      {activeTab === "messages" && <MessagesTab />}
      {activeTab === "reviews" && <ReviewsTab />}
    </div>
  );
}

function ScheduleTab() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    location: "",
    url: "",
  });

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
      setFormData({ date: "", name: "", location: "", url: "" });
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
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              placeholder="e.g., Jan 9 - 13"
            />
          </div>
          <div className="admin-schedule__field">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Event name"
              required
            />
          </div>
          <div className="admin-schedule__field">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Event location"
            />
          </div>
          <div className="admin-schedule__field">
            <label>Event URL (optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="admin-schedule__form-actions">
          <button
            onClick={handleSave}
            className="admin-schedule__button admin-schedule__button--primary"
          >
            {editingId ? "Update" : "Add"} Event
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({ date: "", name: "", location: "", url: "" });
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
                    <div className="admin-schedule__event-location">
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-schedule__event-actions">
                <button
                  onClick={() => {
                    setEditingId(event.id);
                    setFormData({
                      date: event.date,
                      name: event.name,
                      location: event.location,
                      url: event.url ?? "",
                    });
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
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadMessages();
  }, []);

  // Вычисляем значения для пагинации
  const totalPages = Math.ceil(messages.length / itemsPerPage);

  // Сбрасываем на первую страницу, если текущая страница больше доступных
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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
      // Если текущая страница стала пустой, переходим на предыдущую
      const totalPages = Math.ceil((messages.length - 1) / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMessages = messages.slice(startIndex, endIndex);

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
            <>
              {paginatedMessages.map((message) => (
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
                    <div className="admin-messages__item-name">
                      {message.name}
                    </div>
                    {!message.read && (
                      <span className="admin-messages__item-dot"></span>
                    )}
                  </div>
                  <div className="admin-messages__item-subject">
                    {message.subject}
                  </div>
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
              ))}
              {totalPages > 1 && (
                <div className="admin-messages__pagination">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="admin-messages__pagination-button"
                  >
                    Previous
                  </button>
                  <div className="admin-messages__pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="admin-messages__pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
              <p>
                <strong>From:</strong> {selectedMessage.name}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${selectedMessage.email}`}>
                  {selectedMessage.email}
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +{selectedMessage.phoneCountry}{" "}
                {selectedMessage.phone}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedMessage.createdAt).toLocaleString("en-US")}
              </p>
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

type ReviewItem = {
  id: string;
  rating: number;
  title: string;
  text: string;
  author: string;
  role: string;
  location: string;
};

function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReviewForm>({
    title: "",
    text: "",
    author: "",
    role: "",
    location: "",
    rating: "5",
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const payload = {
        ...formData,
        rating: Number(formData.rating || 5),
      };

      if (editingId) {
        await fetch("/api/reviews", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await loadReviews();
      setEditingId(null);
      setFormData({
        title: "",
        text: "",
        author: "",
        role: "",
        location: "",
        rating: "5",
      });
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Error saving review");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      await loadReviews();
      if (editingId === id) {
        setEditingId(null);
        setFormData({
          title: "",
          text: "",
          author: "",
          role: "",
          location: "",
          rating: "5",
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error deleting review");
    }
  }

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      <div className="admin-schedule__form">
        <h2>{editingId ? "Edit Review" : "Add New Review"}</h2>
        <div className="admin-schedule__form-grid">
          <div className="admin-schedule__field">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Review title"
              required
            />
          </div>
          <div className="admin-schedule__field">
            <label>Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: e.target.value })
              }
              placeholder="5"
            />
          </div>
          <div className="admin-schedule__field">
            <label>Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              placeholder="Name"
              required
            />
          </div>
          <div className="admin-schedule__field">
            <label>Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder="e.g., Private Collector"
            />
          </div>
          <div className="admin-schedule__field">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., New York City"
            />
          </div>
          <div
            className="admin-schedule__field"
            style={{ gridColumn: "1 / -1" }}
          >
            <label>Text *</label>
            <textarea
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              rows={6}
              placeholder="Review text"
              required
              style={{
                border: "1px solid var(--line)",
                padding: "10px 12px",
                fontFamily: "inherit",
                fontSize: "1rem",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
          </div>
        </div>
        <div className="admin-schedule__form-actions">
          <button
            onClick={handleSave}
            className="admin-schedule__button admin-schedule__button--primary"
          >
            {editingId ? "Update" : "Add"} Review
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  text: "",
                  author: "",
                  role: "",
                  location: "",
                  rating: "5",
                });
              }}
              className="admin-schedule__button"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="admin-schedule__list">
        <h2>Reviews ({reviews.length})</h2>
        <div className="admin-schedule__events">
          {reviews.map((r) => (
            <div key={r.id} className="admin-schedule__event">
              <div className="admin-schedule__event-content">
                <div className="admin-schedule__event-date">
                  {"★".repeat(Math.max(1, Math.min(5, r.rating || 5)))}
                </div>
                <div className="admin-schedule__event-info">
                  <div className="admin-schedule__event-name">{r.title}</div>
                  <div className="admin-schedule__event-location">
                    {r.author}
                    {r.role ? ` — ${r.role}` : ""}
                    {r.location ? `, ${r.location}` : ""}
                  </div>
                </div>
              </div>
              <div className="admin-schedule__event-actions">
                <button
                  onClick={() => {
                    setEditingId(r.id);
                    setFormData({
                      title: r.title,
                      text: r.text,
                      author: r.author,
                      role: r.role ?? "",
                      location: r.location ?? "",
                      rating: String(r.rating ?? 5),
                    });
                  }}
                  className="admin-schedule__button admin-schedule__button--small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
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
