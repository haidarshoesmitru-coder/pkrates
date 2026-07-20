-- =========================================================
-- 007_prize_bonds.sql
-- Prize Bonds: event-sourced by nature. Draws are scheduled/
-- recorded via their own submission flow; winners are bulk-
-- imported per draw via a separate submission flow, matching
-- the "Manual Update Workflow — bulk manual entry" pattern.
-- =========================================================

create table prize_bond_denominations (
    id smallint primary key generated always as identity,
    face_value numeric(12,0) unique not null
);

-- ---------------------------------------------------------
-- Draws
-- ---------------------------------------------------------
create table prize_bond_draws (
    id uuid primary key default gen_random_uuid(),
    denomination_id smallint not null references prize_bond_denominations(id),
    draw_number integer not null check (draw_number > 0),
    city_id smallint not null references cities(id),
    draw_date date not null,
    status text not null default 'scheduled' check (status in
        ('scheduled','completed','postponed','cancelled')),
    source_id uuid references sources(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    created_at timestamptz not null default now(),
    unique (denomination_id, draw_number),
    constraint chk_pbd_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_prize_bond_draws_date on prize_bond_draws (draw_date);
create index idx_prize_bond_draws_denomination on prize_bond_draws (denomination_id, draw_number desc);

create table prize_bond_draw_submissions (
    id uuid primary key default gen_random_uuid(),
    denomination_id smallint not null references prize_bond_denominations(id),
    draw_number integer not null check (draw_number > 0),
    city_id smallint not null references cities(id),
    draw_date date not null,
    draw_status text not null default 'scheduled' check (draw_status in
        ('scheduled','completed','postponed','cancelled')),
    source_id uuid not null references sources(id),
    correcting_draw_id uuid references prize_bond_draws(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_pbds_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_pb_draw_submissions_pending on prize_bond_draw_submissions (denomination_id) where status = 'pending';

-- ---------------------------------------------------------
-- Winners (published) — bulk rows per draw
-- ---------------------------------------------------------
create table prize_bond_winners (
    id uuid primary key default gen_random_uuid(),
    draw_id uuid not null references prize_bond_draws(id) on delete cascade,
    prize_tier smallint not null check (prize_tier between 1 and 4),
    bond_number text not null,
    prize_amount numeric(14,2) check (prize_amount > 0),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    created_at timestamptz not null default now(),
    constraint chk_pbw_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_prize_bond_number_search on prize_bond_winners using gin (bond_number gin_trgm_ops);
create index idx_prize_bond_draw_lookup on prize_bond_winners (draw_id, prize_tier);

-- ---------------------------------------------------------
-- Winner bulk-import staging — one row per (draw, batch)
-- holding the raw extracted list pending review, promoted to
-- individual prize_bond_winners rows on approval.
-- ---------------------------------------------------------
create table prize_bond_winner_submissions (
    id uuid primary key default gen_random_uuid(),
    draw_id uuid not null references prize_bond_draws(id) on delete cascade,
    source_id uuid not null references sources(id),
    winners_payload jsonb not null,   -- [{ "prize_tier": 1, "bond_number": "...", "prize_amount": 15000000 }, ...]
    winners_count integer generated always as (
        case when jsonb_typeof(winners_payload) = 'array' then jsonb_array_length(winners_payload) else null end
    ) stored,
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_pbws_payload_is_array check (jsonb_typeof(winners_payload) = 'array'),
    constraint chk_pbws_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_pb_winner_submissions_pending on prize_bond_winner_submissions (draw_id) where status = 'pending';
