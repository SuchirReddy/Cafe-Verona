"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function resetDemoData() {
  const supabase = createAdminClient();

  // Due to foreign key constraints, order_items must be deleted before orders
  // But wait, setup.sql had "on delete cascade" for order_items.order_id
  // So deleting orders will delete order_items. We'll delete both to be safe.
  
  await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all
  await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("feedback_ratings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("waitlist").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("memberships").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Re-seed memberships
  await supabase.from("memberships").insert([
    { membership_number: 'CAFE-0001', customer_name: 'Alice Johnson', customer_email: 'alice@example.com', tier: 'Gold', stamps_earned: 3, expiry_date: '2025-12-31', status: 'active' },
    { membership_number: 'CAFE-0002', customer_name: 'Bob Smith', customer_email: 'bob@example.com', tier: 'Silver', stamps_earned: 1, expiry_date: '2025-06-30', status: 'active' }
  ]);

  // Reset inventory to seed values
  const seedInventory = [
    { ingredient_name: 'Espresso Beans', stock_quantity: 5000, unit: 'g', low_stock_threshold: 1000 },
    { ingredient_name: 'Whole Milk', stock_quantity: 10000, unit: 'ml', low_stock_threshold: 2000 },
    { ingredient_name: 'Oat Milk', stock_quantity: 5000, unit: 'ml', low_stock_threshold: 1000 },
    { ingredient_name: 'Vanilla Syrup', stock_quantity: 1000, unit: 'ml', low_stock_threshold: 200 },
    { ingredient_name: 'Caramel Syrup', stock_quantity: 1000, unit: 'ml', low_stock_threshold: 200 },
    { ingredient_name: 'Matcha Powder', stock_quantity: 1000, unit: 'g', low_stock_threshold: 200 },
    { ingredient_name: 'Avocado', stock_quantity: 50, unit: 'pcs', low_stock_threshold: 10 },
    { ingredient_name: 'Sourdough Bread', stock_quantity: 30, unit: 'loaf', low_stock_threshold: 5 },
    { ingredient_name: 'Croissant', stock_quantity: 40, unit: 'pcs', low_stock_threshold: 10 },
    { ingredient_name: 'Eggs', stock_quantity: 100, unit: 'pcs', low_stock_threshold: 20 },
  ];

  // We should truncate inventory or update existing. Let's delete all and re-insert.
  // Wait, menu_item_ingredients references inventory_id. If we delete inventory, it cascades and deletes menu_item_ingredients!
  // Instead, we must UPDATE the inventory stock levels by name to avoid breaking foreign keys.
  
  for (const item of seedInventory) {
    await supabase
      .from("inventory")
      .update({ stock_quantity: item.stock_quantity })
      .eq("ingredient_name", item.ingredient_name);
  }

  // Ensure demo_reset_state is true
  // Insert or update id=1
  await supabase
    .from("demo_reset_state")
    .upsert({ id: 1, is_demo_mode: true });

  revalidatePath("/", "layout");
  return { success: true };
}
