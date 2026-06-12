"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { Clock, Truck } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types";

export default function OrderTrackerButton() {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const { tableNumber, customerPhone } = useCartStore();
  const supabase = createClient();

  useEffect(() => {
    if (!tableNumber && !customerPhone) {
      setActiveOrders([]);
      return;
    }

    const fetchActiveOrders = async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .in("status", ["pending", "preparing", "served"]) // include served because out for delivery is still active for user
        .order("created_at", { ascending: false });

      if (tableNumber && customerPhone) {
        query = query.or(`table_number.eq.${tableNumber},customer_phone.eq.${customerPhone}`);
      } else if (tableNumber) {
        query = query.eq("table_number", tableNumber);
      } else if (customerPhone) {
        query = query.eq("customer_phone", customerPhone);
      }

      const { data } = await query;

      if (data) {
        const validOrders = (data as Order[]).filter((order) => {
          const isDelivery = order.order_type === 'delivery';
          if (order.status === 'completed' || (order.status === 'served' && !isDelivery)) {
            return false;
          }
          return true;
        });

        const uniqueActiveOrders: Order[] = [];
        const seenTypes = new Set<string>();
        for (const order of validOrders) {
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
  }, [tableNumber, customerPhone, supabase]);

  if (activeOrders.length === 0) return null;

  return (
    <div className="flex gap-3">
      {activeOrders.map(activeOrder => {
        const isDelivery = activeOrder.order_type === 'delivery';
        
        return (
          <Link 
            key={activeOrder.id}
            href={`/order/status?id=${activeOrder.id}`}
            className={`font-bold py-3 px-5 rounded-2xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg animate-pulse border ${
              isDelivery 
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300' 
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300'
            }`}
          >
            {isDelivery ? <Truck size={20} className="animate-bounce" /> : <Clock size={20} className="animate-spin-slow" />}
            <span className="hidden sm:inline">{isDelivery ? "Track Delivery" : "Track Order"}</span>
          </Link>
        );
      })}
    </div>
  );
}
