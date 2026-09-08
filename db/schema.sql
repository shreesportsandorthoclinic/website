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
