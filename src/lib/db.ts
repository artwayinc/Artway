/**
 * Unified storage: on Cloudflare (CF_PAGES) uses D1, otherwise JSON files.
 * API unchanged for callers; use getStore(env) in API routes and then call store methods.
 */

import * as json from "./db-json";

export type { ScheduleEvent, ContactMessage, Review } from "./db-json";

export type DataStore = {
  getSchedule(): Promise<json.ScheduleEvent[]>;
  saveSchedule(events: json.ScheduleEvent[]): Promise<void>;
  getEventById(id: string): Promise<json.ScheduleEvent | null>;
  addEvent(event: Omit<json.ScheduleEvent, "id">): Promise<json.ScheduleEvent>;
  updateEvent(id: string, event: Partial<json.ScheduleEvent>): Promise<json.ScheduleEvent | null>;
  deleteEvent(id: string): Promise<boolean>;
  reorderSchedule(orderedIds: string[]): Promise<json.ScheduleEvent[]>;
  getMessages(): Promise<json.ContactMessage[]>;
  addMessage(message: Omit<json.ContactMessage, "id" | "createdAt" | "read">): Promise<json.ContactMessage>;
  markMessageAsRead(id: string): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;
  getReviews(): Promise<json.Review[]>;
  addReview(review: Omit<json.Review, "id">): Promise<json.Review>;
  updateReview(id: string, review: Partial<json.Review>): Promise<json.Review | null>;
  deleteReview(id: string): Promise<boolean>;
  reorderReviews(orderedIds: string[]): Promise<json.Review[]>;
};

function createJsonStore(): DataStore {
  return {
    getSchedule: () => Promise.resolve(json.getSchedule()),
    saveSchedule: (events) => {
      json.saveSchedule(events);
      return Promise.resolve();
    },
    getEventById: (id) => Promise.resolve(json.getSchedule().find((e) => e.id === id) ?? null),
    addEvent: (event) => {
      const events = json.getSchedule();
      const newId = String(Date.now());
      const newEvent = { ...event, id: newId };
      events.push(newEvent);
      json.saveSchedule(events);
      return Promise.resolve(newEvent);
    },
    updateEvent: (id, event) => {
      const events = json.getSchedule();
      const index = events.findIndex((e) => e.id === id);
      if (index === -1) return Promise.resolve(null);
      events[index] = { ...events[index], ...event, id };
      json.saveSchedule(events);
      return Promise.resolve(events[index]);
    },
    deleteEvent: (id) => {
      const events = json.getSchedule().filter((e) => e.id !== id);
      if (events.length === json.getSchedule().length) return Promise.resolve(false);
      json.saveSchedule(events);
      return Promise.resolve(true);
    },
    reorderSchedule: (orderedIds) => {
      const events = json.getSchedule();
      const map = new Map(events.map((e) => [e.id, e]));
      const reordered: json.ScheduleEvent[] = [];
      for (const id of orderedIds) {
        const e = map.get(id);
        if (e) {
          reordered.push(e);
          map.delete(id);
        }
      }
      for (const e of map.values()) reordered.push(e);
      json.saveSchedule(reordered);
      return Promise.resolve(reordered);
    },
    getMessages: () => Promise.resolve(json.getMessages()),
    addMessage: (message) => {
      const messages = json.getMessages();
      const newId = String(Date.now());
      const newMessage: json.ContactMessage = {
        ...message,
        id: newId,
        createdAt: new Date().toISOString(),
        read: false,
      };
      messages.unshift(newMessage);
      json.saveMessages(messages);
      return Promise.resolve(newMessage);
    },
    markMessageAsRead: (id) => {
      const messages = json.getMessages();
      const index = messages.findIndex((m) => m.id === id);
      if (index === -1) return Promise.resolve(false);
      messages[index].read = true;
      json.saveMessages(messages);
      return Promise.resolve(true);
    },
    deleteMessage: (id) => {
      const messages = json.getMessages().filter((m) => m.id !== id);
      if (messages.length === json.getMessages().length) return Promise.resolve(false);
      json.saveMessages(messages);
      return Promise.resolve(true);
    },
    getReviews: () => Promise.resolve(json.getReviews()),
    addReview: (review) => {
      const reviews = json.getReviews();
      const newId = String(Date.now());
      const newReview = { ...review, id: newId };
      reviews.unshift(newReview);
      json.saveReviews(reviews);
      return Promise.resolve(newReview);
    },
    updateReview: (id, review) => {
      const reviews = json.getReviews();
      const index = reviews.findIndex((r) => r.id === id);
      if (index === -1) return Promise.resolve(null);
      reviews[index] = { ...reviews[index], ...review, id };
      json.saveReviews(reviews);
      return Promise.resolve(reviews[index]);
    },
    deleteReview: (id) => {
      const reviews = json.getReviews().filter((r) => r.id !== id);
      if (reviews.length === json.getReviews().length) return Promise.resolve(false);
      json.saveReviews(reviews);
      return Promise.resolve(true);
    },
    reorderReviews: (orderedIds) => {
      const reviews = json.getReviews();
      const map = new Map(reviews.map((r) => [r.id, r]));
      const reordered: json.Review[] = [];
      for (const id of orderedIds) {
        const r = map.get(id);
        if (r) {
          reordered.push(r);
          map.delete(id);
        }
      }
      for (const r of map.values()) reordered.push(r);
      json.saveReviews(reordered);
      return Promise.resolve(reordered);
    },
  };
}

/**
 * Returns Cloudflare env (with D1 binding) when running on Cloudflare; otherwise undefined.
 * Supports OpenNext (@opennextjs/cloudflare) and legacy next-on-pages.
 */
export async function getCloudflareEnv(): Promise<unknown> {
  try {
    const openNext = await import("@opennextjs/cloudflare").catch(() => null);
    if (openNext?.getCloudflareContext) {
      const ctx = openNext.getCloudflareContext();
      if (ctx?.env) return ctx.env;
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Returns the data store for the current environment.
 * - On Cloudflare (CF_PAGES=1): pass env from getCloudflareEnv() → uses D1.
 * - Otherwise (Vercel, local): pass undefined → uses JSON files.
 */
export async function getStore(env?: unknown): Promise<DataStore> {
  if (env) {
    const d1 = await import("./db-d1");
    if (d1.hasD1Binding(env)) return d1.createD1Store(env);
  }
  return createJsonStore();
}
