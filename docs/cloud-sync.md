# Cloud sync setup

Songleading can run without accounts. To sync lineups and slides across devices, connect a Supabase project and add these environment variables to the deployed site:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Then run this SQL in Supabase:

```sql
create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lineup_state jsonb not null default '{}'::jsonb,
  studio_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

drop policy if exists "Users can read own workspace" on public.user_workspaces;
drop policy if exists "Users can insert own workspace" on public.user_workspaces;
drop policy if exists "Users can update own workspace" on public.user_workspaces;

create policy "Users can read own workspace"
on public.user_workspaces
for select
using (auth.uid() = user_id);

create policy "Users can insert own workspace"
on public.user_workspaces
for insert
with check (auth.uid() = user_id);

create policy "Users can update own workspace"
on public.user_workspaces
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  email text not null default '',
  topic text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
```

The app stores one workspace row per user. That row contains the lineup app state and the slide studio state, so a lineup song can keep its connected slide song and status.

The admin portal at `/admin` is private to `barakmalichi@gmail.com`. It uses the Supabase service role key on the server to read contact messages and user details, so keep `SUPABASE_SERVICE_ROLE_KEY` only in Vercel environment variables and never expose it in client code.
