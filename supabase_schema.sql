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