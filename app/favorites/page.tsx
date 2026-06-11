"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MenuItem } from "@/types";
import MenuCard from "@/components/MenuCard";
import { Heart, Star } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      // 1. Get all order items to find popular ones
      const { data: orderItems, error: orderError } = await supabase
        .from("order_items")
        .select("menu_item_id, quantity");

      let topIds: string[] = [];

      if (!orderError && orderItems && orderItems.length > 0) {
        // Aggregate quantities
        const counts: Record<string, number> = {};
        orderItems.forEach(item => {
          counts[item.menu_item_id] = (counts[item.menu_item_id] || 0) + item.quantity;
        });

        // Sort and get top 6
        topIds = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(entry => entry[0]);
      }

      // 2. Fetch the actual menu items
      let query = supabase.from("menu_items").select("*").eq("is_available", true);
      
      if (topIds.length > 0) {
        query = query.in("id", topIds);
      } else {
        // Fallback to random/first items if no orders yet
        query = query.limit(6);
      }

      const { data, error } = await query;

      if (!error && data) {
        setFavorites(data as MenuItem[]);
      }
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
          <Heart fill="currentColor" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-coffee-900 mb-4 tracking-tight">
          Customer Favorites
        </h1>
        <p className="text-lg text-coffee-600">
          Discover our most loved and frequently ordered items. The perfect place to start if you can't decide!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item, idx) => (
            <div key={item.id} className="relative">
              {idx < 3 && (
                <div className="absolute -top-3 -left-3 z-10 bg-gold text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white rotate-[-10deg]">
                  #{idx + 1}
                </div>
              )}
              <MenuCard item={item} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center">
        <Link 
          href="/menu" 
          className="inline-flex items-center gap-2 bg-coffee-800 text-cream px-8 py-4 rounded-full font-bold text-lg hover:bg-coffee-900 transition-colors shadow-lg hover:shadow-xl"
        >
          Explore Full Menu
        </Link>
      </div>

    </div>
  );
}
