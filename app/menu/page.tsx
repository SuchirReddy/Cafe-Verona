"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MenuCategory, MenuItem } from "@/types";
import { useCartStore } from "@/store/cartStore";
import MenuCard from "@/components/MenuCard";
import CartDrawer from "@/components/CartDrawer";
import OrderTrackerButton from "@/components/OrderTrackerButton";
import { Search, Filter, Coffee, ArrowUpDown } from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const tableParam = searchParams.get("table");
  const { tableNumber, setTableNumber } = useCartStore();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByPrice, setSortByPrice] = useState<"asc" | "desc">("asc");
  const [showAllergens, setShowAllergens] = useState(false);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [allAllergens, setAllAllergens] = useState<string[]>([]);

  useEffect(() => {
    if (tableParam && !isNaN(parseInt(tableParam))) {
      setTableNumber(parseInt(tableParam));
    }
  }, [tableParam, setTableNumber]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from("menu_categories").select("*").order("display_order"),
        supabase.from("menu_items").select("*").eq("is_available", true)
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (itemsRes.data) {
        setItems(itemsRes.data);
        const allergens = new Set<string>();
        itemsRes.data.forEach((item) => {
          if (item.allergen_list) {
            item.allergen_list.forEach((a: string) => allergens.add(a));
          }
        });
        setAllAllergens(Array.from(allergens));
      }
      setLoading(false);
    };

    fetchMenu();
  }, [supabase]);

  const toggleAllergen = (allergen: string) => {
    setExcludedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Filtering logic
  const filteredItems = items
    .filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.category_id !== activeCategory) return false;
      
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Allergen filter (exclude items that contain ANY of the excluded allergens)
      if (excludedAllergens.length > 0 && item.allergen_list) {
        const hasExcludedAllergen = item.allergen_list.some((a) => excludedAllergens.includes(a));
        if (hasExcludedAllergen) return false;
      }
      
      // Time-based rules filter
      if (item.time_based_rules && item.time_based_rules.available_hours) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const { start, end } = item.time_based_rules.available_hours;
        if (currentTime < start || currentTime > end) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      return sortByPrice === "asc" ? a.price - b.price : b.price - a.price;
    });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-4 pb-24 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 sticky top-4 z-40 bg-white/70 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-sm border border-white">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 text-coffee-900 flex items-center gap-3">
            <Coffee className="text-coffee-600" size={36} />
            Our Menu
          </h1>
          <p className="text-coffee-700 text-lg">
            {tableNumber ? `Ordering for Table ${tableNumber}` : "Please select a table to order"}
          </p>
          <div className="flex gap-4 mt-2">
            <a href="/membership/lookup" className="text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full transition-colors">
              Check Membership
            </a>
            <a href="/favorites" className="text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors">
              Favorites
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {!tableNumber && (
            <select 
              className="bg-white border border-coffee-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm font-medium"
              onChange={(e) => setTableNumber(parseInt(e.target.value))}
              value={tableNumber || ""}
            >
              <option value="" disabled>Select Table</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>Table {n}</option>
              ))}
            </select>
          )}
          <div className="fixed bottom-6 right-6 z-40 md:relative md:bottom-0 md:right-0 flex items-center gap-3">
            <OrderTrackerButton />
            <CartDrawer />
          </div>
        </div>
      </header>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm mb-8 border border-white/40">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <div className="relative">
              <button 
                onClick={() => setShowAllergens(!showAllergens)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border whitespace-nowrap transition-colors ${excludedAllergens.length > 0 ? 'bg-coffee-100 border-coffee-300 text-coffee-900 font-medium' : 'bg-white border-coffee-200 text-coffee-700 hover:bg-coffee-50'}`}
              >
                <Filter size={18} />
                Allergen Filter {excludedAllergens.length > 0 && `(${excludedAllergens.length})`}
              </button>
              
              {showAllergens && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-coffee-100 p-4 z-20">
                  <h4 className="font-bold text-coffee-900 mb-3 border-b pb-2">Exclude Allergens</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allAllergens.map(allergen => (
                      <label key={allergen} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={excludedAllergens.includes(allergen)}
                          onChange={() => toggleAllergen(allergen)}
                          className="w-4 h-4 text-coffee-600 rounded border-gray-300 focus:ring-coffee-500 accent-coffee-800"
                        />
                        <span className="text-sm">{allergen}</span>
                      </label>
                    ))}
                    {allAllergens.length === 0 && <span className="text-sm text-gray-500">No allergens found.</span>}
                  </div>
                  {excludedAllergens.length > 0 && (
                    <button 
                      onClick={() => setExcludedAllergens([])}
                      className="w-full text-center text-sm text-coffee-600 mt-3 pt-2 border-t hover:text-coffee-900"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={() => setSortByPrice(p => p === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border bg-white border-coffee-200 text-coffee-700 hover:bg-coffee-50 transition-colors whitespace-nowrap"
            >
              <ArrowUpDown size={18} />
              Price {sortByPrice === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto mt-6 pb-2 hide-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-6 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
              activeCategory === "all" 
                ? "bg-coffee-800 text-cream shadow-md" 
                : "bg-coffee-100/50 text-coffee-800 hover:bg-coffee-200"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
                activeCategory === cat.id 
                  ? "bg-coffee-800 text-cream shadow-md" 
                  : "bg-coffee-100/50 text-coffee-800 hover:bg-coffee-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white/40 rounded-2xl border border-white/60">
          <Coffee className="mx-auto text-coffee-300 mb-4" size={48} />
          <h3 className="text-xl font-medium text-coffee-800">No items found</h3>
          <p className="text-coffee-600">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
