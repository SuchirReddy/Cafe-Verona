"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order } from "@/types";
import { format } from "date-fns";
import { CheckCircle2, Clock, MapPin, ArrowRight, RotateCcw, Menu } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const newStamps = searchParams.get("stamps");
  const freeCoffeeEarned = searchParams.get("freeCoffee") === "true";
  const router = useRouter();
  const supabase = createClient();
  const addItem = useCartStore((state) => state.addItem);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/menu");
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId, router, supabase]);

  const handleReorder = async () => {
    if (!orderId) return;
    try {
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select("*, menu_items(*)")
        .eq("order_id", orderId);

      if (error) throw error;

      if (orderItems) {
        orderItems.forEach((item: any) => {
          if (item.menu_items) {
            addItem(item.menu_items, item.quantity, item.special_requests || "");
          }
        });
        toast.success("Items added to your cart");
        router.push("/menu");
      }
    } catch (e) {
      toast.error("Failed to reorder items");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <button 
          onClick={() => router.push("/menu")}
          className="px-6 py-2 bg-coffee-800 text-cream rounded-xl"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="glass-card w-full rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2 text-coffee-900">
          Order Confirmed!
        </h1>
        <p className="text-coffee-600 mb-8">
          Thank you{order.customer_name ? `, ${order.customer_name}` : ""}. Your order has been successfully placed.
        </p>

        {(newStamps || freeCoffeeEarned) && (
          <div className="bg-gradient-to-r from-yellow-50 to-gold/10 border border-gold/30 rounded-2xl p-4 mb-8 text-coffee-900 shadow-sm animate-fade-in w-full max-w-sm">
            {freeCoffeeEarned ? (
              <>
                <div className="flex items-center justify-center gap-2 font-bold text-lg mb-1">
                  <span className="text-xl">🎉</span> You earned a FREE coffee!
                </div>
                <p className="text-sm text-coffee-700">Show your membership to the staff.</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 font-bold text-lg mb-1">
                  <CheckCircle2 size={18} className="text-gold" /> Stamp Added!
                </div>
                <p className="text-sm text-coffee-700">You now have {newStamps} stamps.</p>
              </>
            )}
          </div>
        )}

        <div className="w-full bg-white/60 rounded-2xl p-6 mb-8 text-left space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-coffee-100 p-2 rounded-xl text-coffee-800 mt-1">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-sm text-coffee-500">Table</p>
              <p className="font-bold text-lg">Table {order.table_number}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-coffee-100 p-2 rounded-xl text-coffee-800 mt-1">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm text-coffee-500">Estimated Ready Time</p>
              <p className="font-bold text-lg">
                {order.estimated_ready_time 
                  ? format(new Date(order.estimated_ready_time), "h:mm a") 
                  : "Shortly"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-coffee-200">
            <p className="text-sm text-coffee-500 mb-1">Order ID</p>
            <p className="font-mono text-sm break-all">{formatOrderNumber(order.id, order.created_at, order.order_number)}</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={() => router.push(`/order/status?id=${order.id}`)}
            className="w-full bg-coffee-800 text-cream py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-coffee-900 transition-colors shadow-md"
          >
            Track Order Status <ArrowRight size={20} />
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleReorder}
              className="flex-1 bg-white text-coffee-800 border border-coffee-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-coffee-50 transition-colors"
            >
              <RotateCcw size={18} /> Reorder
            </button>
            
            <button 
              onClick={() => router.push("/menu")}
              className="flex-1 bg-white text-coffee-800 border border-coffee-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-coffee-50 transition-colors"
            >
              <Menu size={18} /> Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
