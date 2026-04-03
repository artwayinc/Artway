import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ContactMessage, Review, ScheduleEvent } from "./db-json";

export type { ScheduleEvent, ContactMessage, Review };

export type DataStore = {
  getSchedule(): Promise<ScheduleEvent[]>;
  saveSchedule(events: ScheduleEvent[]): Promise<void>;
  getEventById(id: string): Promise<ScheduleEvent | null>;
  addEvent(event: Omit<ScheduleEvent, "id">): Promise<ScheduleEvent>;
  updateEvent(id: string, event: Partial<ScheduleEvent>): Promise<ScheduleEvent | null>;
  deleteEvent(id: string): Promise<boolean>;
  reorderSchedule(orderedIds: string[]): Promise<ScheduleEvent[]>;
  getMessages(): Promise<ContactMessage[]>;
  addMessage(message: Omit<ContactMessage, "id" | "createdAt" | "read">): Promise<ContactMessage>;
  markMessageAsRead(id: string): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;
  getReviews(): Promise<Review[]>;
  addReview(review: Omit<Review, "id">): Promise<Review>;
  updateReview(id: string, review: Partial<Review>): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;
  reorderReviews(orderedIds: string[]): Promise<Review[]>;
};

/**
 * Returns Cloudflare env (with D1 binding) when running on Cloudflare; otherwise undefined.
 * Supports OpenNext (@opennextjs/cloudflare) and legacy next-on-pages.
 */
export async function getCloudflareEnv(): Promise<unknown> {
  try {
    const { env } = getCloudflareContext() as { env?: unknown };
    if (env) return env;
  } catch {
    // ignore and try async context
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env) return env;
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Returns the D1 data store for the current environment.
 * JSON file storage is no longer used at runtime.
 */
export async function getStore(env?: unknown): Promise<DataStore> {
  const d1 = await import("./db-d1");
  const resolvedEnv = env ?? (await getCloudflareEnv());
  if (resolvedEnv && d1.hasD1Binding(resolvedEnv)) {
    return d1.createD1Store(resolvedEnv) as DataStore;
  }

  throw new Error("D1 'DB' binding is unavailable. Deploy/preview with Cloudflare D1 binding configured.");
}
