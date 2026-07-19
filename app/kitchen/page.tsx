"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { ChefHat, Check, AlertCircle, Clock, Truck } from "lucide-react";

type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: MenuItem })[];
};

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [preparingOrderId, setPreparingOrderId] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("15");

  const supabase = createClient();

  useEffect(() => {
    setCurrentTime(new Date());
    fetchOrders();

    const channel = supabase
      .channel("kitchen_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'served' || payload.new.status === 'completed') {
              setOrders(prev => prev.filter(o => o.id !== payload.new.id));
            } else {
              setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
            }
          } else {
            fetchOrders();
          }
        }
      )
      .subscribe();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .in("status", ["pending", "preparing"])
        .order("created_at", { ascending: true }); // Oldest first

      if (error) throw error;
      setOrders(data as OrderWithItems[]);
    } catch (error: any) {
      toast.error("Failed to fetch kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, estimatedReadyTime?: string) => {
    try {
      const bodyPayload: any = { status: newStatus };
      if (estimatedReadyTime) {
        bodyPayload.estimated_ready_time = estimatedReadyTime;
      }
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      // Optimistic update
      if (newStatus === "served") {
        setOrders(prev => prev.filter(o => o.id !== id));
        toast.success("Order ready to serve!");
      } else {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
      }
    } catch (error) {
      toast.error("Could not update order status");
    }
  };

  const dineInOrders = orders.filter(o => o.order_type !== "delivery");
  const deliveryOrders = orders.filter(o => o.order_type === "delivery");

  const renderOrderCard = (order: OrderWithItems) => {
    const timeSinceOrder = formatDistanceToNow(new Date(order.created_at));
    const isPending = order.status === "pending";
    
    // Highlight orders waiting for a long time
    const minutesWaiting = (new Date().getTime() - new Date(order.created_at).getTime()) / 60000;
    const isUrgent = isPending && minutesWaiting > 15;

    return (
      <div 
        key={order.id} 
        className={`rounded-2xl border-2 flex flex-col h-full bg-gray-800 overflow-hidden shadow-2xl ${
          isUrgent ? 'border-red-500/80 shadow-red-500/20' : 
          isPending ? 'border-amber-500/50' : 'border-blue-500/50'
        }`}
      >
        {/* Header */}
        <div className={`p-4 flex justify-between items-center ${
          isUrgent ? 'bg-red-900/40 text-red-100' :
          isPending ? 'bg-amber-900/30 text-amber-100' : 'bg-blue-900/30 text-blue-100'
        }`}>
          <div className="flex items-center gap-3">
            {order.order_type === 'delivery' ? (
              <span className="text-3xl font-bold flex items-center gap-2"><Truck size={28}/> Delivery</span>
            ) : (
              <span className="text-3xl font-bold">T{order.table_number}</span>
            )}
            <span className="uppercase text-xs font-bold tracking-wider px-2 py-1 rounded bg-black/30">
              {order.status}
            </span>
          </div>
          <div className={`font-mono font-medium flex items-center gap-1 ${isUrgent ? 'text-red-300' : 'text-gray-300'}`}>
            <Clock size={14} />
            {timeSinceOrder}
          </div>
        </div>

        {/* Items */}
        <div className="p-4 flex-1 overflow-y-auto">
          {order.special_instructions && (
            <div className="mb-4 p-3 bg-gray-700/50 border border-gray-600 rounded-lg flex gap-2">
              <AlertCircle size={20} className="text-yellow-400 shrink-0" />
              <p className="text-sm font-medium text-yellow-100">{order.special_instructions}</p>
            </div>
          )}

          <ul className="space-y-4">
            {order.order_items.map((item) => (
              <li key={item.id} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <span className="font-bold text-xl min-w-[2ch]">{item.quantity}</span>
                  <div className="flex-1">
                    <span className="text-lg font-medium">{item.menu_items?.name || "Unknown Item"}</span>
                    {item.special_requests && (
                      <p className="text-red-400 text-sm font-medium mt-1 uppercase tracking-wide">
                        ** {item.special_requests} **
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-700">
          {isPending ? (
            <button 
              onClick={() => setPreparingOrderId(order.id)}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg rounded-xl transition-colors active:scale-95"
            >
              Start Preparing
            </button>
          ) : (
            <button 
              onClick={() => updateStatus(order.id, 'served')}
              className={`w-full py-4 ${order.order_type === 'delivery' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-bold text-lg rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2`}
            >
              {order.order_type === 'delivery' ? (
                <><Truck size={24} /> Out for Delivery</>
              ) : (
                <><Check size={24} /> Ready to Serve</>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <ChefHat size={32} className="text-blue-400" />
          <h1 className="text-3xl font-bold tracking-wider">KITCHEN DISPLAY</h1>
        </div>
        <div className="text-xl font-mono text-gray-400 flex items-center gap-2">
          <Clock size={20} />
          {currentTime ? currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : "--:--"}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-500">
          <Check size={64} className="mb-4 opacity-50" />
          <h2 className="text-2xl font-medium">All Caught Up!</h2>
          <p>No pending orders at the moment.</p>
        </div>
      ) : (
        <div>
          {dineInOrders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-300 mb-6 flex items-center gap-2">
                <ChefHat className="text-blue-400" size={24} /> Dine-In Orders
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {dineInOrders.map(renderOrderCard)}
              </div>
            </div>
          )}

          {dineInOrders.length > 0 && deliveryOrders.length > 0 && (
            <hr className="border-gray-800 my-10" />
          )}

          {deliveryOrders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-300 mb-6 flex items-center gap-2">
                <Truck className="text-purple-400" size={24} /> Delivery Orders
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {deliveryOrders.map(renderOrderCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preparation Time Modal */}
      {preparingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-gray-700">
            <h3 className="text-xl font-bold tracking-wider text-gray-100 mb-2">SET PREP TIME</h3>
            <p className="text-sm text-gray-400 mb-4">Enter estimated preparation time in minutes.</p>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 bg-gray-900 text-gray-100 font-mono text-lg"
              autoFocus
              min="1"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setPreparingOrderId(null)} 
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-xl font-bold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!preparingOrderId) return;
                  const minutes = parseInt(prepTime, 10);
                  if (!isNaN(minutes) && minutes > 0) {
                    const estimatedReadyTime = new Date(Date.now() + minutes * 60000).toISOString();
                    updateStatus(preparingOrderId, 'preparing', estimatedReadyTime);
                    setPreparingOrderId(null);
                  } else {
                    toast.error("Invalid time entered.");
                  }
                }} 
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
