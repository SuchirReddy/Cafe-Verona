"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateWaitlistStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("waitlist").update({ status }).eq("id", id);
  
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/waitlist");
  return { success: true };
}
