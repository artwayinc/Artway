-- Cloudflare D1: выполнить один раз после создания БД
-- npx wrangler d1 execute artway-db --remote --file=./scripts/d1-schema.sql

CREATE TABLE IF NOT EXISTS schedule (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_country TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
