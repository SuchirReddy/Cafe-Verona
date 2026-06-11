"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Coffee, 
  ClipboardList, 
  MenuSquare, 
  TrendingUp, 
  QrCode, 
  Users, 
  Award, 
  IdCard,
  Package, 
  RotateCcw,
  Tag,
  MessageSquare,
  Truck,
  FolderTree,
  ChefHat,
  LayoutGrid,
  MonitorSmartphone,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchLowStock = async () => {
      const { data } = await supabase.from("inventory").select("stock_quantity, low_stock_threshold");
      if (data) {
        const count = data.filter((item: any) => Number(item.stock_quantity) <= Number(item.low_stock_threshold)).length;
        setLowStockCount(count);
      }
    };

    fetchLowStock();

    const channel = supabase
      .channel("admin_layout_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        () => fetchLowStock()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navLinks = [
    { name: "Kitchen Display", href: "/kitchen", icon: ChefHat },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
    { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
    { name: "Menu", href: "/admin/menu", icon: LayoutGrid },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Sales", href: "/admin/sales", icon: TrendingUp },
    { name: "Tables & QR", href: "/admin/tables", icon: QrCode },
    { name: "Waitlist", href: "/admin/waitlist", icon: Users },
    { name: "Memberships", href: "/admin/memberships", icon: IdCard },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { name: "Discounts", href: "/admin/discounts", icon: Tag },
    { name: "Demo Reset", href: "/admin/demo", icon: RotateCcw },
  ];

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-coffee-900 text-cream flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-coffee-800">
          <Coffee className="text-gold" size={32} />
          <h1 className="text-2xl font-bold font-serif tracking-wide">Cafe Veřona</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-coffee-800 text-gold" 
                    : "text-coffee-100 hover:bg-coffee-800 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-gold" : "text-coffee-300"} />
                <span className="flex-1">{link.name}</span>
                {link.name === "Inventory" && lowStockCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-coffee-800 space-y-2">
          <p className="text-xs text-coffee-400 px-2 font-medium uppercase tracking-wider">Customer App Links</p>
          <Link href="/membership/lookup" className="flex items-center justify-start gap-3 w-full px-4 py-2 bg-coffee-800 rounded-lg text-sm text-coffee-200 hover:text-white transition-colors">
            ☕ Memberships
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F9F6F0] to-[#E8DCCC]">
        {children}
      </main>

      {/* Mobile Nav (simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-coffee-900 border-t border-coffee-800 flex overflow-x-auto z-50">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[72px] p-2 ${isActive ? 'text-gold' : 'text-coffee-300'}`}
            >
              <div className="relative">
                <Icon size={20} />
                {link.name === "Inventory" && lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
