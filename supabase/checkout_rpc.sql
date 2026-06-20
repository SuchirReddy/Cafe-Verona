create or replace function process_checkout(payload jsonb)
returns json as $$
declare
  new_order_id uuid;
  v_membership_id uuid;
  v_status text;
  v_stamps_earned int;
  v_new_stamps int := 0;
  v_free_coffee boolean := false;
  v_item jsonb;
begin
  -- 1. Handle Membership safely with row lock
  if (payload->>'membership_number') is not null then
    select id, status, stamps_earned into v_membership_id, v_status, v_stamps_earned
    from memberships
    where membership_number = payload->>'membership_number'
    for update; -- Lock row to prevent race conditions

    if v_status = 'active' then
      v_new_stamps := v_stamps_earned + 1;
      if v_new_stamps >= 5 then
        v_free_coffee := true;
        v_new_stamps := 0;
      end if;

      update memberships
      set stamps_earned = v_new_stamps
      where id = v_membership_id;
    else
      v_membership_id := null;
    end if;
  end if;

  -- 2. Insert Order
  insert into orders (
    table_number,
    order_type,
    delivery_address,
    customer_phone,
    delivery_fee,
    customer_name,
    special_instructions,
    status,
    total_amount,
    scheduled_for,
    estimated_ready_time,
    membership_id
  ) values (
    (payload->>'table_number')::int,
    coalesce(payload->>'order_type', 'dine-in'),
    payload->>'delivery_address',
    payload->>'customer_phone',
    coalesce((payload->>'delivery_fee')::numeric, 0),
    payload->>'customer_name',
    payload->>'special_instructions',
    'pending',
    (payload->>'total_amount')::numeric,
    case when (payload->>'scheduled_for') is not null then (payload->>'scheduled_for')::timestamptz else null end,
    case when (payload->>'estimated_ready_time') is not null then (payload->>'estimated_ready_time')::timestamptz else null end,
    v_membership_id
  ) returning id into new_order_id;

  -- 3. Insert Order Items
  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    insert into order_items (
      order_id,
      menu_item_id,
      quantity,
      unit_price,
      special_requests,
      assigned_person
    ) values (
      new_order_id,
      (v_item->>'menu_item_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      v_item->>'special_requests',
      v_item->>'assigned_person'
    );
  end loop;

  -- 4. Bulk Update Inventory
  with order_item_aggregates as (
    select
      (item->>'menu_item_id')::uuid as menu_item_id,
      sum((item->>'quantity')::numeric) as qty
    from jsonb_array_elements(payload->'items') as item
    group by 1
  ),
  ingredient_deductions as (
    select
      mii.inventory_id,
      sum(mii.quantity_used * oia.qty) as total_deduction
    from menu_item_ingredients mii
    join order_item_aggregates oia on oia.menu_item_id = mii.menu_item_id
    group by mii.inventory_id
  )
  update inventory i
  set stock = i.stock - id.total_deduction
  from ingredient_deductions id
  where i.id = id.inventory_id;

  return json_build_object(
    'orderId', new_order_id,
    'stampUpdate', case when v_membership_id is not null then
                     json_build_object('newStamps', v_new_stamps, 'freeCoffeeEarned', v_free_coffee)
                   else null end
  );
end;
$$ language plpgsql;
