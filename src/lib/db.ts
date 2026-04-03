import { getCloudflareContext } from "@opennextjs/cloudflare";

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

async function getD1(): Promise<D1Like> {
  // Prefer sync context in Workers route handlers.
  try {
    const { env } = getCloudflareContext() as { env?: { DB?: D1Like } };
    if (env?.DB) {
      return env.DB;
    }
  } catch {
    // Ignore and try async context below.
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as { DB?: D1Like } | undefined)?.DB;
    if (db) {
      return db;
    }
  } catch {
    // Fall through to final explicit error.
  }

  throw new Error("D1 'DB' binding is unavailable. Use Cloudflare preview/deploy with DB binding configured.");
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
      location TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT ''
    )
  `).run();

  const scheduleColumns = await db
    .prepare("PRAGMA table_info(schedule_events)")
    .all<{ name: string }>();
  const hasUrlColumn = (scheduleColumns.results ?? []).some((column) => column.name === "url");
  if (!hasUrlColumn) {
    await db.prepare("ALTER TABLE schedule_events ADD COLUMN url TEXT NOT NULL DEFAULT ''").run();
  }

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
  url: string;
}

function normalizeEvent(event: Partial<ScheduleEvent> & { id: string; name: string }): ScheduleEvent {
  return {
    id: event.id,
    date: event.date ?? "",
    name: event.name,
    location: event.location ?? "",
    url: event.url ?? "",
  };
}

export async function getSchedule(): Promise<ScheduleEvent[]> {
  const db = await getD1();
  await ensureD1Schema(db);
  const result = await db
    .prepare("SELECT id, date, name, location, url FROM schedule_events ORDER BY rowid ASC")
    .all<ScheduleEvent>();

  return (result.results ?? []).map((event) => normalizeEvent(event));
}

export async function getEventById(id: string): Promise<ScheduleEvent | null> {
  const db = await getD1();
  await ensureD1Schema(db);
  const row = await db
    .prepare("SELECT id, date, name, location, url FROM schedule_events WHERE id = ?")
    .bind(id)
    .first<ScheduleEvent>();

  return row ? normalizeEvent(row) : null;
}

export async function addEvent(event: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent> {
  const newId = String(Date.now());
  const newEvent: ScheduleEvent = normalizeEvent({ ...event, id: newId, name: event.name });

  const db = await getD1();
  await ensureD1Schema(db);
  await db
    .prepare("INSERT INTO schedule_events (id, date, name, location, url) VALUES (?, ?, ?, ?, ?)")
    .bind(newEvent.id, newEvent.date, newEvent.name, newEvent.location, newEvent.url)
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
  if (event.url !== undefined) patch.url = event.url;

  const db = await getD1();
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
    .prepare("UPDATE schedule_events SET date = ?, name = ?, location = ?, url = ? WHERE id = ?")
    .bind(next.date, next.name, next.location, next.url, id)
    .run();

  return next;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await getD1();
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
