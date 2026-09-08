-- Shree Sports & Ortho Clinic — database schema
--
-- Run this once against the Supabase project:
--   Supabase dashboard → SQL Editor → New query → paste → Run
--
-- Safe to run again; every statement is guarded with "if not exists".
-- After this, run `npm run db:seed` to load the starting health-library
-- articles.

-- ── Appointments ────────────────────────────────────────────────────────
create table if not exists appointments (
  id          text primary key,
  name        text not null,
  phone       text not null,
  email       text not null,
  age         text not null default '',
  type        text not null,                 -- display label, e.g. "New consultation"
  date        text not null,                 -- ISO date, e.g. 2026-09-02
  time        text not null,                 -- slot label, e.g. 11:00 AM
  status      text not null default 'PENDING',
  reason      text not null default '',
  history     text not null default '',
  reference   text not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists appointments_date_idx on appointments (date);

-- ── Health-library articles ─────────────────────────────────────────────
create table if not exists articles (
  key         text primary key,
  title       text not null,
  category    text not null,
  read        text not null default '4 min read',
  date        text not null default '',
  author      text not null default 'Dr. Neel',
  excerpt     text not null default '',
  image       jsonb not null default '{"src":"","alt":""}'::jsonb,
  body        jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create index if not exists articles_updated_at_idx on articles (updated_at desc);

-- ── Booking one-time verification codes ─────────────────────────────────
create table if not exists otp_codes (
  id          text primary key,
  email       text not null,
  phone       text not null,
  code        text not null,
  attempts    integer not null default 0,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

create index if not exists otp_codes_email_idx on otp_codes (email);
create index if not exists otp_codes_expires_at_idx on otp_codes (expires_at);

-- ── Weekly clinic hours ────────────────────────────────────────────────
-- One row per weekday (0 = Sunday … 6 = Saturday). `windows` is an array of
-- [startMinute, endMinute] pairs from midnight, e.g. [[480,840],[1140,1260]]
-- is 08:00–14:00 and 19:00–21:00. The booking slot grid and the staff
-- availability screen both read this table. Missing rows fall back to the
-- default windows in code, so the app works before this is seeded.
create table if not exists schedule_hours (
  weekday  integer primary key check (weekday between 0 and 6),
  is_open  boolean not null default true,
  windows  jsonb   not null default '[[480,840],[1140,1260]]'::jsonb
);

-- ── Closures and blocked time ─────────────────────────────────────────
-- A full-day closure (from_min / to_min null) or a blocked time range on
-- one date. Slots inside a closure are removed from the booking grid.
create table if not exists schedule_closures (
  id         text primary key,
  date       text not null,          -- ISO yyyy-mm-dd
  reason     text not null default '',
  from_min   integer,                -- null with to_min null = whole day
  to_min     integer,
  created_at timestamptz not null default now()
);

create index if not exists schedule_closures_date_idx on schedule_closures (date);

-- Seed the seven weekday rows with the default hours (safe to re-run).
insert into schedule_hours (weekday) values (0),(1),(2),(3),(4),(5),(6)
on conflict (weekday) do nothing;
