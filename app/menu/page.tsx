"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MenuCategory, MenuItem } from "@/types";
import { useCartStore } from "@/store/cartStore";
import MenuCard from "@/components/MenuCard";
import CartDrawer from "@/components/CartDrawer";
import OrderTrackerButton from "@/components/OrderTrackerButton";
import TableSelect from "@/components/TableSelect";
import { Search, Filter, Coffee, ArrowUpDown, Award, Heart, ChevronLeft, ChevronRight, LayoutGrid, CupSoda, Cake, Croissant, Utensils, Leaf } from "lucide-react";

const getCategoryStyle = (catName: string) => {
  const name = catName.toLowerCase();
  
  if (name.includes('pastry') || name.includes('pastries') || name.includes('croissant') || name.includes('bakery') || name.includes('cake') || name.includes('dessert') || name.includes('sweet')) {
    return {
      image: "/category_pastries.png",
    };
  }

  if (name.includes('juice') || name.includes('smoothie')) {
    return {
      image: "/category_juices.png",
    };
  }

  if (name.includes('food') || name.includes('sandwich') || name.includes('savory') || name.includes('breakfast') || name.includes('bites')) {
    return {
      image: "/category_foods.png",
    };
  }
  
  if (name.includes('drink') || name.includes('beverage') || name.includes('coffee') || name.includes('cold') || name.includes('tea') || name.includes('frappe') || name.includes('matcha')) {
    return {
      image: "/category_drinks.png",
    };
  }
  
  return {
    image: "/category_drinks.png",
  };
};

function MenuContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const tableParam = searchParams.get("table");
  const { tableNumber, setTableNumber } = useCartStore();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  // Filters and state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
    setVisibleCount(20);
  }, [activeCategory, searchQuery, sortByPrice, excludedAllergens]);

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
      if (activeCategory && activeCategory !== "all" && item.category_id !== activeCategory) return false;

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

  const visibleItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-4 pb-24 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pt-4">
        <div className="flex flex-col gap-2">
          {tableNumber ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#623E2A]/10 text-[#623E2A] rounded-full text-xs font-bold tracking-widest uppercase w-fit mb-2">
              <div className="w-2 h-2 rounded-full bg-[#623E2A] animate-pulse"></div>
              Table {tableNumber}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-widest uppercase w-fit mb-2">
              Select a table
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-[#623E2A] flex items-center gap-4 tracking-tight leading-none">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
              <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
            </div>
            Menu.
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <a href="/membership/lookup" className="hidden md:flex items-center gap-2 text-sm font-bold text-[#623E2A] hover:bg-[#623E2A]/5 px-5 py-2.5 rounded-full transition-all border border-[#623E2A]/20">
            <Award size={18} />
            Membership
          </a>
          {!tableNumber && (
            <TableSelect
              value={tableNumber}
              onChange={(val) => setTableNumber(val)}
              className="w-40 shadow-sm"
            />
          )}
          <div className="hidden md:flex items-center gap-3">
            <OrderTrackerButton />
            <a href="/favorites" className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-white border border-[#E8E2D2] shadow-sm hover:shadow-md hover:scale-105 transition-all text-coffee-800 hover:text-rose-500 hover:border-rose-200 group" title="Favorites">
              <Heart size={22} className="transition-colors group-hover:fill-rose-50" />
            </a>
            <CartDrawer />
          </div>
        </div>
      </header>

      {/* Mobile floating bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[92vw] max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-full p-3 px-6 transition-all">
        <OrderTrackerButton />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ml-4 md:ml-6 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl bg-cream z-10 flex items-center justify-center">
          <img src="/logo.png" alt="Cafe Verona" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-3">
          <a href="/favorites" className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-rose-100 shadow-sm hover:scale-105 transition-all text-rose-500">
            <Heart size={22} />
          </a>
          <CartDrawer />
        </div>
      </div>

      <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-md mb-8 border border-white/60">
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

      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <>
          {!activeCategory && !searchQuery ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-16 px-2">
              <button
                onClick={() => setActiveCategory("all")}
                className="relative bg-[#DFBFA0] border border-[#623E2A] rounded-[2rem] p-5 pt-12 md:pt-16 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left flex flex-col justify-end min-h-[160px] md:min-h-[180px] group mt-8 md:mt-12"
              >
                <div className={`absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-lg bg-[#F9F6F0] transition-transform group-hover:scale-105 duration-300`}>
                  <img src="/category_all.png" alt="All Items" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-end w-full mt-4">
                  <h3 className="text-lg md:text-2xl font-medium text-[#623E2A] leading-tight tracking-tight">All Items</h3>
                  <span className="bg-[#623E2A] text-[#DFBFA0] text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 rounded-full font-medium tracking-wide shadow-sm group-hover:bg-[#4A2E1F] transition-colors">Show</span>
                </div>
              </button>
              {categories.map((cat) => {
                const style = getCategoryStyle(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="relative bg-[#DFBFA0] border border-[#623E2A] rounded-[2rem] p-5 pt-12 md:pt-16 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left flex flex-col justify-end min-h-[160px] md:min-h-[180px] group mt-8 md:mt-12"
                  >
                    <div className={`absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-lg bg-[#F9F6F0] transition-transform group-hover:scale-105 duration-300`}>
                      <img src={style.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-end w-full mt-4">
                      <div>
                        <h3 className="text-lg md:text-2xl font-medium text-[#623E2A] leading-tight tracking-tight">{cat.name}</h3>
                      </div>
                      <span className="bg-[#623E2A] text-[#DFBFA0] text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 rounded-full font-medium tracking-wide shadow-sm group-hover:bg-[#4A2E1F] transition-colors">Show</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {activeCategory && !searchQuery && (
                <div className="flex gap-2 overflow-x-auto mt-4 mb-8 pb-2 hide-scrollbar">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-full whitespace-nowrap font-bold transition-all bg-white border border-[#E8E2D2] text-[#2C331F] hover:bg-black/5 shadow-sm"
                  >
                    <ChevronLeft size={18} />
                    Categories Grid
                  </button>
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`px-6 py-2.5 rounded-full whitespace-nowrap font-bold transition-all border ${activeCategory === "all"
                        ? "bg-[#985923] text-white border-transparent shadow-md"
                        : "bg-white border-[#E8E2D2] text-[#2C331F] hover:bg-black/5 shadow-sm"
                      }`}
                  >
                    All Items
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-6 py-2.5 rounded-full whitespace-nowrap font-bold transition-all border ${activeCategory === cat.id
                          ? "bg-[#985923] text-white border-transparent shadow-md"
                          : "bg-white border-[#E8E2D2] text-[#2C331F] hover:bg-black/5 shadow-sm"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && (
                <div className="mb-8 mt-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#2C331F]">Search Results for "{searchQuery}"</h2>
                  {activeCategory && (
                     <button
                      onClick={() => setActiveCategory(null)}
                      className="text-sm font-bold text-[#985923] hover:underline"
                    >
                      Clear Category Filter
                    </button>
                  )}
                </div>
              )}
              
              {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/60 shadow-sm mt-8">
                  <Coffee className="mx-auto text-coffee-300 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-[#2C331F] mb-2">No items found</h3>
                  <p className="text-[#2C331F]/70 font-medium">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {visibleItems.map((item) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                  {visibleCount < filteredItems.length && (
                    <div className="flex justify-center mt-12 mb-8">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 20)}
                        className="bg-[#985923] text-white px-8 py-4 rounded-xl font-bold shadow-md hover:bg-[#7D491C] transition-all hover:scale-105"
                      >
                        Load More Items
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
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
