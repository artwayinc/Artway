/**
 * Cloudflare D1 storage. Used when CF_PAGES=1 and D1 binding is available.
 * Types match db-json / db.ts (ScheduleEvent, ContactMessage, Review).
 */

import type { ContactMessage, Review, ScheduleEvent } from "./db-json";

export type { ContactMessage, Review, ScheduleEvent };

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(col?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: { changes: number; last_row_id: number };
}

function getDbFromEnv(env: unknown): D1Database | null {
  if (!env || typeof env !== "object") return null;
  const e = env as Record<string, unknown>;
  if (e.DB && typeof (e.DB as D1Database).prepare === "function") {
    return e.DB as D1Database;
  }
  return null;
}

export function hasD1Binding(env: unknown): boolean {
  return getDbFromEnv(env) !== null;
}

export function createD1Store(env: unknown) {
  const db = getDbFromEnv(env);
  if (!db) throw new Error("D1 binding not available");

  return {
    // Schedule
    async getSchedule(): Promise<ScheduleEvent[]> {
      const r = await db.prepare("SELECT id, date, name, location, url, sort_order FROM schedule ORDER BY sort_order ASC, id ASC").all<ScheduleEventRow>();
      return (r.results ?? []).map(rowToSchedule);
    },
    async saveSchedule(events: ScheduleEvent[]): Promise<void> {
      await db.batch(
        events.map((e, i) =>
          db
            .prepare(
              "INSERT OR REPLACE INTO schedule (id, date, name, location, url, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
            )
            .bind(e.id, e.date, e.name, e.location, e.url ?? null, i)
        )
      );
    },
    async getEventById(id: string): Promise<ScheduleEvent | null> {
      const row = await db.prepare("SELECT id, date, name, location, url FROM schedule WHERE id = ?").bind(id).first<ScheduleEventRow>();
      return row ? rowToSchedule(row) : null;
    },
    async addEvent(event: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> {
      const id = String(Date.now());
      const maxOrder = await db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM schedule").first<{ n: number }>();
      const sortOrder = maxOrder?.n ?? 0;
      await db.prepare("INSERT INTO schedule (id, date, name, location, url, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(
        id, event.date, event.name, event.location, event.url ?? null, sortOrder
      );
      return { ...event, id };
    },
    async updateEvent(id: string, event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> {
      const cur = await db.prepare("SELECT id, date, name, location, url FROM schedule WHERE id = ?").bind(id).first<ScheduleEventRow>();
      if (!cur) return null;
      const urlVal = event.url !== undefined ? event.url : cur.url;
      const updated: ScheduleEvent = {
        id,
        date: event.date ?? cur.date,
        name: event.name ?? cur.name,
        location: event.location ?? cur.location,
        ...(urlVal != null && urlVal !== "" ? { url: urlVal } : {}),
      };
      await db.prepare("UPDATE schedule SET date = ?, name = ?, location = ?, url = ? WHERE id = ?").bind(
        updated.date, updated.name, updated.location, urlVal ?? null, id
      );
      return updated;
    },
    async deleteEvent(id: string): Promise<boolean> {
      const r = await db.prepare("DELETE FROM schedule WHERE id = ?").bind(id).run();
      return r.meta.changes > 0;
    },
    async reorderSchedule(orderedIds: string[]): Promise<ScheduleEvent[]> {
      const events = await this.getSchedule();
      const map = new Map(events.map((e) => [e.id, e]));
      const reordered: ScheduleEvent[] = [];
      for (let i = 0; i < orderedIds.length; i++) {
        const e = map.get(orderedIds[i]);
        if (e) {
          reordered.push(e);
          map.delete(orderedIds[i]);
        }
      }
      for (const e of map.values()) reordered.push(e);
      await this.saveSchedule(reordered);
      return reordered;
    },

    // Messages
    async getMessages(): Promise<ContactMessage[]> {
      const r = await db.prepare("SELECT id, name, email, phone, phone_country, subject, message, created_at, read FROM messages ORDER BY created_at DESC").all<ContactMessageRow>();
      return (r.results ?? []).map(rowToMessage);
    },
    async saveMessages(): Promise<void> {
      // D1 is the source of truth; no-op for compatibility
    },
    async addMessage(message: Omit<ContactMessage, "id" | "createdAt" | "read">): Promise<ContactMessage> {
      const id = String(Date.now());
      const createdAt = new Date().toISOString();
      await db.prepare(
        "INSERT INTO messages (id, name, email, phone, phone_country, subject, message, created_at, read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)"
      ).bind(id, message.name, message.email, message.phone, message.phoneCountry, message.subject, message.message, createdAt);
      return { ...message, id, createdAt, read: false };
    },
    async markMessageAsRead(id: string): Promise<boolean> {
      const r = await db.prepare("UPDATE messages SET read = 1 WHERE id = ?").bind(id).run();
      return r.meta.changes > 0;
    },
    async deleteMessage(id: string): Promise<boolean> {
      const r = await db.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
      return r.meta.changes > 0;
    },

    // Reviews
    async getReviews(): Promise<Review[]> {
      const r = await db.prepare("SELECT id, rating, title, text, author, role, location, image FROM reviews ORDER BY sort_order ASC, id ASC").all<ReviewRow>();
      return (r.results ?? []).map(rowToReview);
    },
    async saveReviews(): Promise<void> {
      // no-op
    },
    async addReview(review: Omit<Review, "id">): Promise<Review> {
      const id = String(Date.now());
      const maxOrder = await db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM reviews").first<{ n: number }>();
      const sortOrder = maxOrder?.n ?? 0;
      await db.prepare(
        "INSERT INTO reviews (id, rating, title, text, author, role, location, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, review.rating, review.title, review.text, review.author, review.role, review.location, review.image ?? null, sortOrder);
      return { ...review, id };
    },
    async updateReview(id: string, review: Partial<Review>): Promise<Review | null> {
      const cur = await db.prepare("SELECT id, rating, title, text, author, role, location, image FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
      if (!cur) return null;
      const imageVal = review?.image !== undefined ? review.image : cur.image;
      const updated: Review = {
        id,
        rating: review.rating ?? cur.rating,
        title: review.title ?? cur.title,
        text: review.text ?? cur.text,
        author: review.author ?? cur.author,
        role: review.role ?? cur.role,
        location: review.location ?? cur.location,
        ...(imageVal != null && imageVal !== "" ? { image: imageVal } : {}),
      };
      await db.prepare(
        "UPDATE reviews SET rating = ?, title = ?, text = ?, author = ?, role = ?, location = ?, image = ? WHERE id = ?"
      ).bind(updated.rating, updated.title, updated.text, updated.author, updated.role, updated.location, imageVal ?? null, id);
      return updated;
    },
    async deleteReview(id: string): Promise<boolean> {
      const r = await db.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
      return r.meta.changes > 0;
    },
    async reorderReviews(orderedIds: string[]): Promise<Review[]> {
      const reviews = await this.getReviews();
      const map = new Map(reviews.map((r) => [r.id, r]));
      const reordered: Review[] = [];
      for (let i = 0; i < orderedIds.length; i++) {
        const r = map.get(orderedIds[i]);
        if (r) {
          reordered.push(r);
          map.delete(orderedIds[i]);
        }
      }
      for (const r of map.values()) reordered.push(r);
      await db.batch(
        reordered.map((r, i) =>
          db.prepare("UPDATE reviews SET sort_order = ? WHERE id = ?").bind(i, r.id)
        )
      );
      return reordered;
    },
  };
}

type ScheduleEventRow = { id: string; date: string; name: string; location: string; url: string | null; sort_order?: number };
type ContactMessageRow = { id: string; name: string; email: string; phone: string; phone_country: string; subject: string; message: string; created_at: string; read: number };
type ReviewRow = { id: string; rating: number; title: string; text: string; author: string; role: string; location: string; image: string | null };

function rowToSchedule(r: ScheduleEventRow): ScheduleEvent {
  return {
    id: r.id,
    date: r.date,
    name: r.name,
    location: r.location,
    ...(r.url ? { url: r.url } : {}),
  };
}

function rowToMessage(r: ContactMessageRow): ContactMessage {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    phoneCountry: r.phone_country,
    subject: r.subject,
    message: r.message,
    createdAt: r.created_at,
    read: r.read === 1,
  };
}

function rowToReview(r: ReviewRow): Review {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    text: r.text,
    author: r.author,
    role: r.role,
    location: r.location,
    ...(r.image ? { image: r.image } : {}),
  };
}
