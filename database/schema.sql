-- InsightBot AI initial Supabase schema.
-- Run this in the Supabase SQL Editor before starting the backend.
-- Embedding model/dimension is not finalized. Keep this as unbounded `vector` for now;
-- before production embedding generation/vector indexes, add the selected dimension
-- (for example vector(N)) that exactly matches the chosen Gemini embedding model.
create extension if not exists vector;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size >= 0),
  storage_path text not null unique,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  chunk_index integer not null check (chunk_index >= 0),
  embedding vector,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_created_idx on public.documents (user_id, created_at desc);
create index if not exists document_chunks_document_idx on public.document_chunks (document_id, chunk_index);
create index if not exists document_chunks_user_idx on public.document_chunks (user_id);
create index if not exists conversations_user_updated_idx on public.conversations (user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "documents_manage_own" on public.documents;
create policy "documents_manage_own" on public.documents for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "document_chunks_manage_own" on public.document_chunks;
create policy "document_chunks_manage_own" on public.document_chunks for all to authenticated
  using (auth.uid() = user_id and exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()))
  with check (auth.uid() = user_id and exists (select 1 from public.documents d where d.id = document_id and d.user_id = auth.uid()));
drop policy if exists "conversations_manage_own" on public.conversations;
create policy "conversations_manage_own" on public.conversations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "messages_manage_own" on public.messages;
create policy "messages_manage_own" on public.messages for all to authenticated
  using (auth.uid() = user_id and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
  with check (auth.uid() = user_id and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

-- The private `documents` Storage bucket is created by the backend on startup.
-- The backend owns file access and verifies document ownership for each operation.
