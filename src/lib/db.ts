import fs from "fs";
import path from "path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const dataDir = path.join(process.cwd(), "data");
const scheduleFile = path.join(dataDir, "schedule.json");
const messagesFile = path.join(dataDir, "messages.json");

type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: <T = unknown>() => Promise<{ results?: T[] }>;
      all: <T = unknown>() => Promise<{ results?: T[] }>;
      first: <T = unknown>() => Promise<T | null>;
    };
    run: <T = unknown>() => Promise<{ results?: T[] }>;
    all: <T = unknown>() => Promise<{ results?: T[] }>;
    first: <T = unknown>() => Promise<T | null>;
  };
};

let d1SchemaReady = false;

async function getD1(): Promise<D1Like | null> {
  // getCloudflareContext() throws when called outside Workers runtime (local dev).
  // If it succeeds but DB is missing => we're in Workers with a misconfigured binding.
  try {
    const { env } = getCloudflareContext() as { env?: { DB?: D1Like } };
    if (env?.DB) {
      return env.DB;
    }
    throw new Error("D1 'DB' binding is not configured in wrangler.jsonc / Cloudflare dashboard");
  } catch (e) {
    // If the error is our own throw above, re-throw it
    if (e instanceof Error && e.message.startsWith("D1 'DB'")) {
      throw e;
    }
    // Otherwise getCloudflareContext() itself threw => local dev, use file fallback
    return null;
  }
}

async function ensureD1Schema(db: D1Like): Promise<void> {
  if (d1SchemaReady) {
    return;
  }

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT ''
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      phone_country TEXT NOT NULL DEFAULT 'US',
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0
    )
  `).run();

  d1SchemaReady = true;
}

export interface ScheduleEvent {
  id: string;
  date: string;
  name: string;
  location: string;
}

function getScheduleFromFile(): ScheduleEvent[] {
  try {
    if (!fs.existsSync(scheduleFile)) {
      return [];
    }
    const data = fs.readFileSync(scheduleFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading schedule:", error);
    return [];
  }
}

function saveScheduleToFile(events: ScheduleEvent[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(scheduleFile, JSON.stringify(events, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
}

export async function getSchedule(): Promise<ScheduleEvent[]> {
  const db = await getD1();
  if (!db) {
    return getScheduleFromFile();
  }

  await ensureD1Schema(db);
  const result = await db
    .prepare("SELECT id, date, name, location FROM schedule_events ORDER BY rowid ASC")
    .all<ScheduleEvent>();

  return result.results ?? [];
}

export async function getEventById(id: string): Promise<ScheduleEvent | null> {
  const db = await getD1();
  if (!db) {
    const events = getScheduleFromFile();
    return events.find((event) => event.id === id) || null;
  }

  await ensureD1Schema(db);
  const row = await db
    .prepare("SELECT id, date, name, location FROM schedule_events WHERE id = ?")
    .bind(id)
    .first<ScheduleEvent>();

  return row ?? null;
}

export async function addEvent(event: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> {
  const newId = String(Date.now());
  const newEvent: ScheduleEvent = { ...event, id: newId };

  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const events = getScheduleFromFile();
    events.push(newEvent);
    saveScheduleToFile(events);
    return newEvent;
  }

  await ensureD1Schema(db);
  await db
    .prepare("INSERT INTO schedule_events (id, date, name, location) VALUES (?, ?, ?, ?)")
    .bind(newEvent.id, newEvent.date, newEvent.name, newEvent.location)
    .run();

  return newEvent;
}

export async function updateEvent(
  id: string,
  event: Partial<ScheduleEvent>,
): Promise<ScheduleEvent | null> {
  const patch: Partial<ScheduleEvent> = {};
  if (event.date !== undefined) patch.date = event.date;
  if (event.name !== undefined) patch.name = event.name;
  if (event.location !== undefined) patch.location = event.location;

  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const events = getScheduleFromFile();
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    events[index] = { ...events[index], ...patch };
    saveScheduleToFile(events);
    return events[index];
  }

  await ensureD1Schema(db);
  const current = await getEventById(id);
  if (!current) {
    return null;
  }

  const next: ScheduleEvent = {
    ...current,
    ...patch,
    id: current.id,
  };

  await db
    .prepare("UPDATE schedule_events SET date = ?, name = ?, location = ? WHERE id = ?")
    .bind(next.date, next.name, next.location, id)
    .run();

  return next;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const events = getScheduleFromFile();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    saveScheduleToFile(filtered);
    return true;
  }

  await ensureD1Schema(db);
  const found = await getEventById(id);
  if (!found) {
    return false;
  }

  await db.prepare("DELETE FROM schedule_events WHERE id = ?").bind(id).run();
  return true;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountry: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_country: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: number;
};

function getMessagesFromFile(): ContactMessage[] {
  try {
    if (!fs.existsSync(messagesFile)) {
      return [];
    }
    const data = fs.readFileSync(messagesFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading messages:", error);
    return [];
  }
}

function saveMessagesToFile(messages: ContactMessage[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving messages:", error);
    throw error;
  }
}

function mapMessageRow(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    phoneCountry: row.phone_country,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
    read: row.is_read === 1,
  };
}

export async function getMessages(): Promise<ContactMessage[]> {
  const db = await getD1();
  if (!db) {
    return getMessagesFromFile();
  }

  await ensureD1Schema(db);
  const result = await db
    .prepare(
      "SELECT id, name, email, phone, phone_country, subject, message, created_at, is_read FROM contact_messages ORDER BY datetime(created_at) DESC",
    )
    .all<ContactMessageRow>();

  return (result.results ?? []).map(mapMessageRow);
}

export async function addMessage(
  message: Omit<ContactMessage, "id" | "createdAt" | "read">,
): Promise<ContactMessage> {
  const newId = String(Date.now());
  const newMessage: ContactMessage = {
    ...message,
    id: newId,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const messages = getMessagesFromFile();
    messages.unshift(newMessage);
    saveMessagesToFile(messages);
    return newMessage;
  }

  await ensureD1Schema(db);
  await db
    .prepare(
      "INSERT INTO contact_messages (id, name, email, phone, phone_country, subject, message, created_at, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      newMessage.id,
      newMessage.name,
      newMessage.email,
      newMessage.phone,
      newMessage.phoneCountry,
      newMessage.subject,
      newMessage.message,
      newMessage.createdAt,
      0,
    )
    .run();

  return newMessage;
}

export async function markMessageAsRead(id: string): Promise<boolean> {
  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const messages = getMessagesFromFile();
    const index = messages.findIndex((m) => m.id === id);
    if (index === -1) return false;
    messages[index].read = true;
    saveMessagesToFile(messages);
    return true;
  }

  await ensureD1Schema(db);
  const existing = await db
    .prepare("SELECT id FROM contact_messages WHERE id = ?")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return false;
  }

  await db
    .prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?")
    .bind(id)
    .run();

  return true;
}

export async function deleteMessage(id: string): Promise<boolean> {
  const db = await getD1();
  if (!db) {
    // Local dev only — Workers runtime throws before reaching here
    const messages = getMessagesFromFile();
    const filtered = messages.filter((m) => m.id !== id);
    if (filtered.length === messages.length) return false;
    saveMessagesToFile(filtered);
    return true;
  }

  await ensureD1Schema(db);
  const existing = await db
    .prepare("SELECT id FROM contact_messages WHERE id = ?")
    .bind(id)
    .first<{ id: string }>();

  if (!existing) {
    return false;
  }

  await db.prepare("DELETE FROM contact_messages WHERE id = ?").bind(id).run();
  return true;
}
