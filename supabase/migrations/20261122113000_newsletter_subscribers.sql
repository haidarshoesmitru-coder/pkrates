-- =========================================================
-- 20261122113000_newsletter_subscribers.sql
-- Backs the homepage "Get Rate Alerts" / daily-digest signup.
-- Until now the form only pretended to subscribe (client-side
-- success message, nothing stored). Subscriptions are written
-- by app/api/newsletter/route.ts via the service-role client;
-- RLS is enabled with NO public policies, so the anon/auth
-- roles can neither read nor write this table directly.
--
-- Idempotent: safe to run more than once.
-- =========================================================

create table if not exists newsletter_subscribers (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    subscribed_at timestamptz not null default now(),
    unsubscribed_at timestamptz
);

alter table newsletter_subscribers enable row level security;
-- Intentionally no policies: service-role only.
