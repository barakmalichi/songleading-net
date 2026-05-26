create table if not exists public.toolkit_items (
  id text primary key,
  kind text not null check (kind in ('article', 'activity', 'song')),
  slug text not null,
  title text not null,
  excerpt text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'published', 'rejected')),
  source_type text not null default 'official' check (source_type in ('official', 'community')),
  content jsonb not null default '{}'::jsonb,
  author_id text,
  author_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (kind, slug)
);

create index if not exists toolkit_items_kind_status_idx on public.toolkit_items (kind, status);
create index if not exists toolkit_items_updated_at_idx on public.toolkit_items (updated_at desc);
