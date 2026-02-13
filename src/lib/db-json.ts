/**
 * JSON-file storage (Vercel / Node). Used when not on Cloudflare.
 */
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const scheduleFile = path.join(dataDir, "schedule.json");
const reviewsFile = path.join(dataDir, "reviews.json");
const messagesFile = path.join(dataDir, "messages.json");

export interface ScheduleEvent {
  id: string;
  date: string;
  name: string;
  location: string;
  url?: string;
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

export interface Review {
  id: string;
  rating: number;
  title: string;
  text: string;
  author: string;
  role: string;
  location: string;
  image?: string;
}

export function getSchedule(): ScheduleEvent[] {
  try {
    if (!fs.existsSync(scheduleFile)) return [];
    const data = fs.readFileSync(scheduleFile, "utf-8");
    const parsed = JSON.parse(data) as unknown;
    return Array.isArray(parsed) ? (parsed as ScheduleEvent[]) : [];
  } catch (error) {
    console.error("Error reading schedule:", error);
    return [];
  }
}

export function saveSchedule(events: ScheduleEvent[]): void {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(scheduleFile, JSON.stringify(events, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
}

export function getMessages(): ContactMessage[] {
  try {
    if (!fs.existsSync(messagesFile)) return [];
    const data = fs.readFileSync(messagesFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading messages:", error);
    return [];
  }
}

export function saveMessages(messages: ContactMessage[]): void {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving messages:", error);
    throw error;
  }
}

export function getReviews(): Review[] {
  try {
    if (!fs.existsSync(reviewsFile)) return [];
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
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving reviews:", error);
    throw error;
  }
}
