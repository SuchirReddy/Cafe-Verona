"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { Clock, Truck, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order } from "@/types";

export default function OrderTrackerButton() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const { tableNumber } = useCartStore();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!tableNumber) {
      setActiveOrders([]);
      return;
    }

    const fetchActiveOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "preparing"])
        .eq("table_number", tableNumber)
        .eq("order_type", "dine-in")
        .order("created_at", { ascending: false });

      if (data) {
        const uniqueActiveOrders: Order[] = [];
        const seenTypes = new Set<string>();
        for (const order of data as Order[]) {
          const type = order.order_type || 'unknown';
          if (!seenTypes.has(type)) {
            seenTypes.add(type);
            uniqueActiveOrders.push(order);
          }
        }
        setActiveOrders(uniqueActiveOrders);
      } else {
        setActiveOrders([]);
      }
    };

    fetchActiveOrders();

    const channel = supabase
      .channel(`menu_order_tracker_${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchActiveOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableNumber, supabase]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    let query = supabase.from("orders").select("id").order("created_at", { ascending: false }).limit(1);
    
    const parts = orderNumber.split("-");
    const serial = parseInt(parts.length === 3 ? parts[2] : orderNumber, 10);
    
    if (!isNaN(serial)) {
      query = query.eq("order_number", serial);
    } else {
      query = query.ilike("id", `${orderNumber}%`);
    }

    const { data } = await query;
    
    if (data && data.length > 0) {
      setIsOpen(false);
      router.push(`/order/status?id=${data[0].id}`);
    } else {
      setError("Order not found.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {activeOrders.map(activeOrder => (
          <Link 
            key={activeOrder.id}
            href={`/order/status?id=${activeOrder.id}`}
            className="font-bold py-3 px-5 sm:py-3.5 sm:px-6 rounded-full flex items-center gap-2 transition-all shadow-sm hover:shadow-md border border-[#E8E2D2] bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-200 hover:-translate-y-0.5 group shrink-0"
          >
            <Clock size={20} className="animate-spin-slow group-hover:text-amber-800" />
            <span className="hidden sm:inline tracking-wide text-sm">Track Order</span>
          </Link>
        ))}

        <button 
          onClick={() => setIsOpen(true)}
          className="font-bold w-12 h-12 sm:w-auto sm:py-3.5 sm:px-6 rounded-full flex items-center justify-center sm:justify-start gap-2 transition-all shadow-sm hover:shadow-md border bg-white border-[#E8E2D2] text-[#623E2A] hover:bg-[#F9F6F0] hover:border-[#DFBFA0] hover:-translate-y-0.5 group shrink-0"
        >
          <Truck size={22} className="transition-transform group-hover:scale-105" />
          <span className="hidden sm:inline tracking-wide text-sm">Track Delivery</span>
        </button>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold font-serif text-coffee-900 mb-4">Track Delivery</h3>
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-800 mb-1">Order Number</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. 2026-07-0042 or 42"
                  className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-coffee-50"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-coffee-800 text-cream py-3 rounded-xl font-bold hover:bg-coffee-900 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? "Searching..." : <><Search size={18} /> Track</>}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
