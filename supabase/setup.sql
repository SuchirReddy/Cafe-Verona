-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables to ensure a clean state
drop table if exists waitlist cascade;
drop table if exists demo_reset_state cascade;
drop table if exists discount_rules cascade;
drop table if exists menu_item_ingredients cascade;
drop table if exists inventory cascade;
drop table if exists feedback_ratings cascade;
drop table if exists loyalty_stamps cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists menu_items cascade;
drop table if exists menu_categories cascade;
drop table if exists tables cascade;

-- Create tables
create table tables (
  id uuid primary key default uuid_generate_v4(),
  table_number int unique not null,
  qr_code_url text
);

create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  display_order int not null
);

create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null,
  category_id uuid references menu_categories(id),
  image_url text,
  is_available boolean default true,
  stock_quantity int,
  preparation_time_minutes int not null default 5,
  allergen_list text[] default '{}',
  dietary_badges text[] default '{}',
  time_based_rules jsonb default '{}',
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number serial,
  table_number int references tables(table_number),
  order_type text default 'dine-in',
  delivery_address text,
  customer_phone text,
  delivery_fee numeric default 0,
  customer_name text,
  special_instructions text,
  status text check (status in ('pending', 'preparing', 'served', 'completed')) default 'pending',
  total_amount numeric not null,
  scheduled_for timestamptz,
  estimated_ready_time timestamptz,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null default 1,
  unit_price numeric not null,
  special_requests text,
  assigned_person text
);

create table loyalty_stamps (
  id uuid primary key default uuid_generate_v4(),
  table_number int unique references tables(table_number),
  stamps_earned int default 0,
  redeemed_at timestamptz
);

create table feedback_ratings (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table inventory (
  id uuid primary key default uuid_generate_v4(),
  ingredient_name text unique not null,
  stock numeric not null default 0,
  unit text not null,
  low_stock_threshold numeric default 10
);

create table menu_item_ingredients (
  id uuid primary key default uuid_generate_v4(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  inventory_id uuid references inventory(id) on delete cascade,
  quantity_used numeric not null
);

create table discount_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  discount_percent numeric not null,
  start_time time,
  end_time time,
  applicable_category_id uuid references menu_categories(id),
  is_active boolean default true
);

create table waitlist (
  id uuid primary key default uuid_generate_v4(),
  table_requested int references tables(table_number),
  party_size int not null,
  customer_name text not null,
  phone text,
  preferred_time text,
  status text check (status in ('waiting', 'notified', 'seated', 'cancelled')) default 'waiting',
  joined_at timestamptz default now()
);

create table demo_reset_state (
  id int primary key,
  is_demo_mode boolean default true
);

-- Enable RLS
alter table tables enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read access
create policy "Allow public read on tables" on tables for select using (true);
create policy "Allow public read on menu_categories" on menu_categories for select using (true);
create policy "Allow public read on menu_items" on menu_items for select using (true);
create policy "Allow public read on orders" on orders for select using (true);
create policy "Allow public read on order_items" on order_items for select using (true);

-- Public insert access for orders and order_items
create policy "Allow public insert on orders" on orders for insert with check (true);
create policy "Allow public update on orders" on orders for update using (true);
create policy "Allow public insert on order_items" on order_items for insert with check (true);

-- Stored procedure for inventory deduction
create or replace function deduct_inventory(inv_id uuid, qty numeric)
returns void as $$
begin
  update inventory
  set stock = stock - qty
  where id = inv_id;
end;
$$ language plpgsql;

-- Seed Data

-- Demo State
insert into demo_reset_state (id, is_demo_mode) values (1, true);

-- Tables
insert into tables (table_number, qr_code_url) values 
  (1, 'https://example.com/qr/1'),
  (2, 'https://example.com/qr/2'),
  (3, 'https://example.com/qr/3'),
  (4, 'https://example.com/qr/4'),
  (5, 'https://example.com/qr/5'),
  (6, 'https://example.com/qr/6'),
  (7, 'https://example.com/qr/7'),
  (8, 'https://example.com/qr/8'),
  (9, 'https://example.com/qr/9'),
  (10, 'https://example.com/qr/10');

-- Loyalty Stamps for tables
insert into loyalty_stamps (table_number, stamps_earned) values 
  (1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0), (10, 0);

-- Categories
do $$
declare
  cat_coffee uuid := uuid_generate_v4();
  cat_pastries uuid := uuid_generate_v4();
  cat_sandwiches uuid := uuid_generate_v4();
  cat_juices uuid := uuid_generate_v4();
  
  inv_coffee uuid := uuid_generate_v4();
  inv_milk uuid := uuid_generate_v4();
  inv_flour uuid := uuid_generate_v4();
  inv_butter uuid := uuid_generate_v4();
  inv_chicken uuid := uuid_generate_v4();
  inv_orange uuid := uuid_generate_v4();
  
  item_espresso uuid := uuid_generate_v4();
  item_cappuccino uuid := uuid_generate_v4();
  item_latte uuid := uuid_generate_v4();
  item_croissant uuid := uuid_generate_v4();
  item_muffin uuid := uuid_generate_v4();
  item_club uuid := uuid_generate_v4();
  item_oj uuid := uuid_generate_v4();
begin

  insert into menu_categories (id, name, display_order) values 
    (cat_coffee, 'Coffee', 1),
    (cat_pastries, 'Pastries', 2),
    (cat_sandwiches, 'Sandwiches', 3),
    (cat_juices, 'Juices', 4);

  -- Inventory
  insert into inventory (id, ingredient_name, stock, unit, low_stock_threshold) values
    (inv_coffee, 'Coffee Beans', 5000, 'g', 1000),
    (inv_milk, 'Milk', 20000, 'ml', 5000),
    (inv_flour, 'Flour', 10000, 'g', 2000),
    (inv_butter, 'Butter', 5000, 'g', 1000),
    (inv_chicken, 'Chicken', 50, 'portions', 10),
    (inv_orange, 'Oranges', 200, 'units', 50);

  -- Menu Items
  insert into menu_items (id, category_id, name, description, price, image_url, preparation_time_minutes, allergen_list, dietary_badges, time_based_rules) values
    (item_espresso, cat_coffee, 'Espresso', 'Rich and bold single shot of espresso.', 240, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800', 3, '{}', '{"Vegan", "Gluten-Free"}', '{}'),
    (item_cappuccino, cat_coffee, 'Cappuccino', 'Espresso with steamed milk and a thick layer of foam.', 360, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800', 5, '{"Dairy"}', '{"Vegetarian", "Gluten-Free"}', '{}'),
    (item_latte, cat_coffee, 'Latte', 'Espresso with lots of steamed milk and a light layer of foam.', 380, 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&q=80&w=800', 5, '{"Dairy"}', '{"Vegetarian", "Gluten-Free"}', '{}'),
    (item_croissant, cat_pastries, 'Butter Croissant', 'Flaky, buttery, freshly baked croissant.', 280, 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=800', 2, '{"Dairy", "Gluten", "Wheat"}', '{"Vegetarian"}', '{"available_hours": {"start": "07:00", "end": "11:00"}}'),
    (item_muffin, cat_pastries, 'Chocolate Chip Muffin', 'Moist muffin loaded with chocolate chips.', 320, 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=800', 2, '{"Dairy", "Gluten", "Wheat", "Eggs"}', '{"Vegetarian"}', '{}'),
    (item_avocado, cat_food, 'Avocado Toast', 'Smashed avocado on toasted sourdough with chili flakes.', 760, 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=800', 8, '{"Gluten", "Wheat"}', '{"Vegan"}', '{}'),
    (item_matcha, cat_specialty, 'Matcha Latte', 'Premium grade matcha green tea with steamed milk.', 400, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800', 4, '{"Dairy"}', '{"Vegetarian"}', '{}');

  -- Ingredients Links
  insert into menu_item_ingredients (menu_item_id, inventory_id, quantity_used) values
    (item_espresso, inv_coffee, 18),
    (item_cappuccino, inv_coffee, 18),
    (item_cappuccino, inv_milk, 150),
    (item_latte, inv_coffee, 18),
    (item_latte, inv_milk, 250),
    (item_croissant, inv_flour, 50),
    (item_croissant, inv_butter, 30),
    (item_club, inv_chicken, 1),
    (item_oj, inv_orange, 3);

  -- Discount Rule
  insert into discount_rules (name, discount_percent, start_time, end_time, applicable_category_id, is_active) values
    ('Happy Hour Coffee', 20.00, '15:00:00', '17:00:00', cat_coffee, true);

end $$;
