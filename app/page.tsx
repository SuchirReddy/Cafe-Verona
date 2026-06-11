import { createAdminClient } from "@/lib/supabase/admin";
import LandingPageClient from "@/components/LandingPageClient";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const supabase = createAdminClient();
  
  // Fetch the top 4 menu items to feature on the landing page
  const { data: popularItems, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .limit(4);

  // Fallback to empty array if fetch fails (client will show skeletons temporarily, 
  // though typically we'd just want to pass [] to avoid breaking)
  const itemsToPass = error ? [] : (popularItems || []);

  return <LandingPageClient popularItems={itemsToPass} />;
}
