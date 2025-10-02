-- Create trips table to store travel history
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  trip_type text not null check (trip_type in ('gps', 'manual')),
  distance numeric not null,
  fare numeric not null,
  currency text not null default '₱',
  timestamp bigint not null,
  
  -- GPS-specific fields (nullable for manual trips)
  start_lat numeric,
  start_lng numeric,
  end_lat numeric,
  end_lng numeric,
  route jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on device_id for faster queries
create index if not exists trips_device_id_idx on public.trips(device_id);
create index if not exists trips_timestamp_idx on public.trips(timestamp desc);

-- Enable Row Level Security
alter table public.trips enable row level security;

-- RLS Policies: Allow users to manage their own trips based on device_id
-- Since we're not using auth, we'll allow all operations but users should only
-- query/modify their own device_id trips in the application layer

create policy "Allow users to view trips by device_id"
  on public.trips for select
  using (true);

create policy "Allow users to insert trips"
  on public.trips for insert
  with check (true);

create policy "Allow users to delete trips by device_id"
  on public.trips for delete
  using (true);
