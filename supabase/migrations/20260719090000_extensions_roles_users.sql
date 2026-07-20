-- =========================================================
-- 001_extensions_roles_users.sql
-- Extensions, role/user model, domain access grants, cities,
-- and the helper functions RLS policies rely on throughout.
-- =========================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------
-- Roles
-- ---------------------------------------------------------
create table roles (
    id smallint primary key generated always as identity,
    name text unique not null check (name in
        ('super_admin','admin','reviewer','editor','ingestion_agent','analyst'))
);

insert into roles (name) values
    ('super_admin'), ('admin'), ('reviewer'), ('editor'), ('ingestion_agent'), ('analyst');

-- ---------------------------------------------------------
-- Users (1:1 extension of auth.users)
-- ---------------------------------------------------------
create table users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique not null references auth.users(id) on delete cascade,
    full_name text not null,
    email text unique not null,
    role_id smallint not null references roles(id),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_users_auth_user_id on users (auth_user_id);
create index idx_users_role_id on users (role_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_users_set_updated_at
before update on users
for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- Per-user domain access grants (Editor/Reviewer scoping)
-- ---------------------------------------------------------
create table user_domain_access (
    user_id uuid not null references users(id) on delete cascade,
    domain text not null check (domain in
        ('gold','currency','petrol','crypto','prize_bonds','cement','steel')),
    granted_by uuid references users(id),
    granted_at timestamptz not null default now(),
    primary key (user_id, domain)
);

-- ---------------------------------------------------------
-- Cities (shared dimension across gold/currency-n/a/cement/steel/prize_bonds)
-- ---------------------------------------------------------
create table cities (
    id smallint primary key generated always as identity,
    name text unique not null,
    slug text unique not null,
    province text,
    display_order smallint default 100
);

-- ---------------------------------------------------------
-- Helper functions used throughout RLS policies (011/012)
-- All are STABLE + SECURITY DEFINER so they can read `users`
-- regardless of the calling role's own row-level grants.
-- ---------------------------------------------------------
create or replace function current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select id from users where auth_user_id = auth.uid();
$$;

create or replace function current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select r.name
    from users u
    join roles r on r.id = u.role_id
    where u.auth_user_id = auth.uid()
      and u.is_active = true;
$$;

create or replace function has_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select current_app_role() = target_role;
$$;

create or replace function is_admin_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select current_app_role() in ('super_admin', 'admin');
$$;

create or replace function can_review(target_domain text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        current_app_role() in ('super_admin', 'admin')
        or (
            current_app_role() = 'reviewer'
            and exists (
                select 1 from user_domain_access uda
                join users u on u.id = uda.user_id
                where u.auth_user_id = auth.uid()
                  and uda.domain = target_domain
            )
        );
$$;

create or replace function can_edit(target_domain text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        current_app_role() in ('super_admin', 'admin')
        or (
            current_app_role() in ('reviewer', 'editor')
            and exists (
                select 1 from user_domain_access uda
                join users u on u.id = uda.user_id
                where u.auth_user_id = auth.uid()
                  and uda.domain = target_domain
            )
        );
$$;
