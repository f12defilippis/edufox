-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing table if exists
drop table if exists profiles;
drop type if exists user_role;

-- Create enum for user roles
create type user_role as enum ('Studente', 'Docente');

-- Create profiles table
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'Studente',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_user_id unique (user_id)
);

-- Set up RLS
alter table profiles enable row level security;

-- Create indexes
create index profiles_user_id_idx on profiles(user_id);

-- Set up updated_at trigger
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on profiles
  for each row
  execute function handle_updated_at();