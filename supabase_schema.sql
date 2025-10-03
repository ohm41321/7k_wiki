create table public.users (
  id uuid references auth.users(id) primary key,
  email text,
  name text,
  created_at timestamp with time zone default now()
) TABLESPACE pg_default;

create table public.posts (
  id bigint generated always as identity not null,
  created_at timestamp with time zone not null default now(),
  title text not null,
  slug text not null,
  content text null,
  author_name text null,
  game text null,
  category text null,
  tags text[] null,
  imageurls text[] null,
  author_id uuid null,
  constraint posts_pkey primary key (id),
  constraint posts_slug_key unique (slug),
  constraint posts_author_id_fkey foreign KEY (author_id) references auth.users (id)
) TABLESPACE pg_default;

create table public.comments (
  id bigint generated always as identity not null,
  created_at timestamp with time zone not null default now(),
  content text not null,
  author_name text not null,
  post_id bigint not null,
  constraint comments_pkey primary key (id),
  constraint comments_post_id_fkey foreign KEY (post_id) references posts (id) on delete CASCADE
) TABLESPACE pg_default;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
exception
  when others then
    -- If insert fails, log error but don't fail the user creation
    raise warning 'Failed to create public user record: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
-- Temporarily disabled to test signup
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- Enable RLS on users table
alter table public.users enable row level security;

-- Allow users to read their own data
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

-- Allow the trigger function to insert (this is needed because the trigger runs as security definer)
create policy "Trigger can insert users" on public.users
  for insert with check (true);