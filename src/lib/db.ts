import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const scheduleFile = path.join(dataDir, "schedule.json");
const reviewsFile = path.join(dataDir, "reviews.json");

export interface ScheduleEvent {
  id: string;
  date: string;
  name: string;
  location: string;
  url?: string;
}

export function getSchedule(): ScheduleEvent[] {
  try {
    if (!fs.existsSync(scheduleFile)) {
      return [];
    }
    const data = fs.readFileSync(scheduleFile, "utf-8");
    const parsed = JSON.parse(data) as unknown;
    // Делаем поле url опциональным для обратной совместимости
    return Array.isArray(parsed) ? (parsed as ScheduleEvent[]) : [];
  } catch (error) {
    console.error("Error reading schedule:", error);
    return [];
  }
}

export function saveSchedule(events: ScheduleEvent[]): void {
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

export function getEventById(id: string): ScheduleEvent | null {
  const events = getSchedule();
  return events.find((event) => event.id === id) || null;
}

export function addEvent(event: Omit<ScheduleEvent, "id">): ScheduleEvent {
  const events = getSchedule();
  const newId = String(Date.now());
  const newEvent: ScheduleEvent = { ...event, id: newId };
  events.push(newEvent);
  saveSchedule(events);
  return newEvent;
}

export function updateEvent(
  id: string,
  event: Partial<ScheduleEvent>,
): ScheduleEvent | null {
  const events = getSchedule();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) {
    return null;
  }
  events[index] = { ...events[index], ...event };
  saveSchedule(events);
  return events[index];
}

export function deleteEvent(id: string): boolean {
  const events = getSchedule();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) {
    return false;
  }
  saveSchedule(filtered);
  return true;
}

// Messages functions
const messagesFile = path.join(dataDir, "messages.json");

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

export function getMessages(): ContactMessage[] {
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

export function saveMessages(messages: ContactMessage[]): void {
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

export function addMessage(
  message: Omit<ContactMessage, "id" | "createdAt" | "read">,
): ContactMessage {
  const messages = getMessages();
  const newId = String(Date.now());
  const newMessage: ContactMessage = {
    ...message,
    id: newId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  messages.unshift(newMessage); // Добавляем в начало
  saveMessages(messages);
  return newMessage;
}

export function markMessageAsRead(id: string): boolean {
  const messages = getMessages();
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) {
    return false;
  }
  messages[index].read = true;
  saveMessages(messages);
  return true;
}

export function deleteMessage(id: string): boolean {
  const messages = getMessages();
  const filtered = messages.filter((m) => m.id !== id);
  if (filtered.length === messages.length) {
    return false;
  }
  saveMessages(filtered);
  return true;
}

// Reviews functions
export interface Review {
  id: string;
  rating: number; // 1..5
  title: string;
  text: string;
  author: string;
  role: string;
  location: string;
}

export function getReviews(): Review[] {
  try {
    if (!fs.existsSync(reviewsFile)) {
      return [];
    }
    const data = fs.readFileSync(reviewsFile, "utf-8");
    const parsed = JSON.parse(data) as unknown;
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch (error) {
    console.error("Error reading reviews:", error);
    return [];
  }
}

export function saveReviews(reviews: Review[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving reviews:", error);
    throw error;
  }
}

export function addReview(review: Omit<Review, "id">): Review {
  const reviews = getReviews();
  const newId = String(Date.now());
  const newReview: Review = { ...review, id: newId };
  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

export function updateReview(
  id: string,
  review: Partial<Review>,
): Review | null {
  const reviews = getReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) {
    return null;
  }
  reviews[index] = { ...reviews[index], ...review, id };
  saveReviews(reviews);
  return reviews[index];
}

export function deleteReview(id: string): boolean {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) {
    return false;
  }
  saveReviews(filtered);
  return true;
}
