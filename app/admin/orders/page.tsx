"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { format } from "date-fns";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import { Clock, FileText, Check, ChefHat, Coffee, AlertCircle, ClipboardList, Truck, Phone } from "lucide-react";

type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: MenuItem })[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("admin_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders(); // Re-fetch on any order change
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
        .eq('order_type', 'dine-in')
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as OrderWithItems[]);
    } catch (error: any) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Order status updated to ${newStatus}`);
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus as any } : o))
      );
    } catch (error) {
      toast.error("Could not update order status");
    }
  };

  const filteredOrders = orders.filter(o => {
    if (tableFilter !== "all" && o.table_number.toString() !== tableFilter) return false;
    if (statusFilter === "active" && o.status === "completed") return false;
    if (statusFilter === "completed" && o.status !== "completed") return false;
    return true;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { color: string, icon: any }> = {
      pending: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertCircle },
      preparing: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: ChefHat },
      served: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Coffee },
      completed: { color: "bg-green-100 text-green-800 border-green-200", icon: Check },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 w-fit capitalize ${config.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Orders Management</h1>
          <p className="text-coffee-600">Track and manage customer orders.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-white rounded-xl shadow-sm border border-coffee-100 p-1">
            {["active", "completed", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  statusFilter === f
                    ? "bg-coffee-800 text-cream"
                    : "text-coffee-600 hover:bg-coffee-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-coffee-200">
          <label className="text-sm font-medium text-coffee-700 pl-2">Filter Table:</label>
          <select 
            value={tableFilter} 
            onChange={(e) => setTableFilter(e.target.value)}
            className="bg-coffee-50 border-none rounded-lg py-1.5 px-3 focus:ring-0 text-sm font-medium outline-none cursor-pointer"
          >
            <option value="all">All Tables</option>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n.toString()}>Table {n}</option>
            ))}
          </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center border border-coffee-200">
          <ClipboardList className="mx-auto text-coffee-300 mb-4" size={48} />
          <h3 className="text-xl font-medium text-coffee-800">No orders found</h3>
          <p className="text-coffee-500">There are currently no orders for this filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200 flex flex-col lg:flex-row gap-6">
              
              {/* Order Info */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      {order.order_type === 'delivery' ? (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                          <Truck size={18} /> Delivery
                        </div>
                      ) : (
                        <h3 className="text-xl font-bold text-coffee-900">Table {order.table_number}</h3>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-coffee-500 font-mono">ID: {formatOrderNumber(order.id, order.created_at, order.order_number)}</p>
                    {order.customer_name && (
                      <p className="text-sm text-coffee-700 mt-1">Customer: <span className="font-medium">{order.customer_name}</span></p>
                    )}
                    {order.order_type === 'delivery' && (
                      <div className="mt-2 space-y-1 bg-coffee-50 p-3 rounded-lg border border-coffee-100">
                        {order.customer_phone && (
                          <p className="text-sm text-coffee-700 flex items-center gap-2">
                            <Phone size={14} className="text-coffee-400" /> {order.customer_phone}
                          </p>
                        )}
                        {order.delivery_address && (
                          <p className="text-sm text-coffee-700 font-medium">
                            {order.delivery_address}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-serif text-olive">{formatPrice(order.total_amount)}</p>
                    <p className="text-xs text-coffee-500 mt-1 flex items-center gap-1 justify-end">
                      <Clock size={12} /> {format(new Date(order.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>

                {order.special_instructions && (
                  <div className="bg-amber-50 border border-amber-100 text-amber-900 p-3 rounded-xl text-sm">
                    <strong>Notes:</strong> {order.special_instructions}
                  </div>
                )}

                <div className="border-t border-coffee-100 pt-4">
                  <h4 className="text-sm font-bold text-coffee-800 mb-2 uppercase tracking-wider">Order Items</h4>
                  <ul className="space-y-2">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="text-sm flex justify-between">
                        <div>
                          <span className="font-bold text-coffee-900">{item.quantity}x</span> {item.menu_items?.name || "Unknown Item"}
                          {item.special_requests && (
                            <span className="block text-xs text-coffee-500 ml-5 italic">Note: {item.special_requests}</span>
                          )}
                        </div>
                        <span className="text-coffee-600">{formatPrice(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:w-64 flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-coffee-100 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                <h4 className="text-sm font-bold text-coffee-800 mb-2 uppercase tracking-wider">Actions</h4>
                
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Start Preparing
                  </button>
                )}
                
                {(order.status === 'pending' || order.status === 'preparing') && (
                  <button onClick={() => updateStatus(order.id, 'served')} className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                    {order.order_type === 'delivery' ? 'Send out for Delivery' : 'Mark as Served'}
                  </button>
                )}

                {order.status === 'served' && (
                  <button onClick={() => updateStatus(order.id, 'completed')} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                    Complete Order
                  </button>
                )}

                <Link 
                  href={`/admin/receipt/${order.id}`}
                  className="w-full py-2.5 bg-coffee-100 text-coffee-800 rounded-xl font-medium hover:bg-coffee-200 transition-colors flex items-center justify-center gap-2 mt-auto"
                >
                  <FileText size={18} /> Receipt PDF
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
