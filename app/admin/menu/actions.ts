"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveMenuItem(formData: any) {
  const supabase = createAdminClient();
  const { id, ...data } = formData;

  if (id) {
    const { error } = await supabase.from("menu_items").update(data).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("menu_items").insert(data);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { success: true };
}

export async function toggleMenuItemAvailability(id: string, is_available: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("menu_items").update({ is_available }).eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  return { success: true };
}
