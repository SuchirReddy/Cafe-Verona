"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { format } from "date-fns";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import { Clock, Check, Truck, Phone, MapPin, Search } from "lucide-react";

type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: MenuItem })[];
};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    preparing: "bg-blue-100 text-blue-800 border-blue-200",
    served: "bg-purple-100 text-purple-800 border-purple-200", // "out for delivery"
    completed: "bg-green-100 text-green-800 border-green-200",
  };

  const labels = {
    pending: "Waiting",
    preparing: "In Kitchen",
    served: "Out for Delivery",
    completed: "Delivered",
  };

  const currentStyle = styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800 border-gray-200";
  const label = labels[status as keyof typeof labels] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStyle}`}>
      {label}
    </span>
  );
}

export default function AdminDeliveriesPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active"); // active, completed, all
  const [searchQuery, setSearchQuery] = useState("");
  const [preparingOrderId, setPreparingOrderId] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("15");

  const supabase = createClient();

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin_deliveries")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        .eq('order_type', 'delivery')
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as OrderWithItems[]);
    } catch (error: any) {
      toast.error("Failed to fetch deliveries");
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
      
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
      toast.success(`Delivery status updated`);
    } catch (error) {
      toast.error("Could not update delivery status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active" && order.status === "completed") return false;
    if (filter === "completed" && order.status !== "completed") return false;
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const phoneMatch = order.customer_phone?.toLowerCase().includes(searchLower);
      const nameMatch = order.customer_name?.toLowerCase().includes(searchLower);
      const addressMatch = order.delivery_address?.toLowerCase().includes(searchLower);
      const idMatch = order.id.toLowerCase().includes(searchLower);
      return phoneMatch || nameMatch || addressMatch || idMatch;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 flex items-center gap-3">
            <Truck className="text-blue-600" /> Deliveries
          </h1>
          <p className="text-coffee-600 mt-2">Manage home delivery logistics and dispatch.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={18} />
            <input 
              type="text"
              placeholder="Search address or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-coffee-200 rounded-xl outline-none focus:border-coffee-500 bg-white w-full sm:w-64"
            />
          </div>
          <div className="flex bg-white rounded-xl shadow-sm border border-coffee-100 p-1">
            {["active", "completed", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-coffee-800 text-cream"
                    : "text-coffee-600 hover:bg-coffee-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 bg-white/60 rounded-3xl p-16 text-center border border-white flex flex-col items-center justify-center">
          <Truck className="text-coffee-300 mb-4" size={64} />
          <h3 className="text-xl font-medium text-coffee-900 mb-2">No deliveries found</h3>
          <p className="text-coffee-500">There are no {filter} delivery orders matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pb-20">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-coffee-200 flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-coffee-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-coffee-900">Delivery Order</h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-coffee-500 font-mono">ID: {formatOrderNumber(order.id, order.created_at, order.order_number)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-coffee-500 justify-end mb-1">
                    <Clock size={14} />
                    {format(new Date(order.created_at), "h:mm a")}
                  </div>
                  <p className="text-xl font-bold font-serif text-olive">{formatPrice(order.total_amount)}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logistics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-coffee-800 border-b border-coffee-100 pb-2">Customer Details</h4>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                    <div className="flex items-start gap-3 text-coffee-800">
                      <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium leading-relaxed">{order.delivery_address}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-coffee-800">
                      <Phone size={18} className="text-blue-500 shrink-0" />
                      <p className="text-sm font-bold">{order.customer_phone}</p>
                    </div>

                    {order.customer_name && (
                      <p className="text-sm text-coffee-600 pl-7">Contact: {order.customer_name}</p>
                    )}
                  </div>

                  {order.special_instructions && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
                      <span className="font-semibold text-amber-800">Note: </span>
                      <span className="text-amber-700">{order.special_instructions}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-coffee-800 border-b border-coffee-100 pb-2 mb-3">Order Items</h4>
                  <ul className="space-y-3">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex gap-3 text-sm">
                        <span className="font-bold text-coffee-900 min-w-[20px]">{item.quantity}x</span>
                        <div className="flex-1 text-coffee-700">
                          <p>{item.menu_items?.name || "Unknown Item"}</p>
                          {item.special_requests && (
                            <p className="text-xs text-coffee-400 italic mt-0.5">Note: {item.special_requests}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-coffee-100 flex flex-wrap gap-3 items-center justify-between">
                <Link 
                  href={`/admin/receipt/${order.id}`}
                  className="px-4 py-2 text-sm font-medium text-coffee-600 hover:text-coffee-900 hover:bg-coffee-100 rounded-lg transition-colors"
                >
                  View Receipt
                </Link>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => setPreparingOrderId(order.id)} className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors">
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'served')} className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-2">
                      <Truck size={16} /> Send Out for Delivery
                    </button>
                  )}
                  {order.status === 'served' && (
                    <button onClick={() => updateStatus(order.id, 'completed')} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Check size={16} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preparation Time Modal */}
      {preparingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif text-coffee-900 mb-2">Set Preparation Time</h3>
            <p className="text-sm text-coffee-600 mb-4">Enter estimated preparation time in minutes.</p>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-500 mb-4 bg-coffee-50"
              autoFocus
              min="1"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setPreparingOrderId(null)} 
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
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
