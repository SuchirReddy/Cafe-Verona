"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveCategory(payload: any) {
  const supabase = createAdminClient();

  if (payload.id) {
    const { error } = await supabase
      .from("menu_categories")
      .update(payload)
      .eq("id", payload.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("menu_categories")
      .insert([payload]);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  
  if (error) {
    if (error.code === '23503') { // Foreign key constraint violation
      throw new Error("Cannot delete category because it has menu items. Reassign or delete the items first.");
    }
    throw new Error(error.message);
  }
  
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
}
