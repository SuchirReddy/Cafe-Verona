"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { format } from "date-fns";
import { Coffee, CheckCircle2, Clock, ChefHat, Check, MapPin, Star, Send } from "lucide-react";
import { formatOrderNumber, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: MenuItem })[];
};

const STATUS_STEPS = ["pending", "preparing", "served", "completed"];

function StatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const router = useRouter();
  const supabase = createClient();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/menu");
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data as OrderWithItems);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => prev ? { ...prev, ...(payload.new as Order) } : payload.new as any);
          if (payload.new.status === "served") {
            toast.success("Your order is served! Enjoy!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, router, supabase]);

  const submitFeedback = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          rating,
          comment
        })
      });
      
      if (!res.ok) throw new Error();
      
      setFeedbackSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (e) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
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
        <button onClick={() => router.push("/menu")} className="px-6 py-2 bg-coffee-800 text-cream rounded-xl">Back to Menu</button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen p-4 py-12 max-w-2xl mx-auto flex flex-col gap-8">
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <h1 className="text-3xl font-bold font-serif mb-6 text-coffee-900 text-center">
          Order Status
        </h1>
        
        <div className="mb-10 text-center space-y-2">
          <p className="text-coffee-600">Order #{formatOrderNumber(order.id, order.created_at, order.order_number)}</p>
          {order.order_type === 'delivery' ? (
            <p className="font-bold text-lg max-w-sm mx-auto">Delivery to: {order.delivery_address}</p>
          ) : (
            <p className="font-bold text-lg">Table {order.table_number}</p>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-coffee-200 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-olive -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              let Icon = Clock;
              if (step === "preparing") Icon = ChefHat;
              if (step === "served") Icon = order.order_type === 'delivery' ? Send : Coffee;
              if (step === "completed") Icon = CheckCircle2;

              return (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 shadow-sm relative
                      ${isCompleted ? "bg-olive text-white" : "bg-white text-coffee-300 border-2 border-coffee-200"}
                      ${isCurrent ? "ring-4 ring-olive/30 scale-110" : ""}
                    `}
                  >
                    {isCurrent && order.status !== "completed" && (
                      <span className="absolute inset-0 rounded-full border-4 border-olive/40 animate-ping"></span>
                    )}
                    <Icon size={24} className="relative z-10" />
                  </div>
                  <span className={`text-xs md:text-sm font-medium capitalize ${isCompleted ? "text-coffee-900" : "text-coffee-400"}`}>
                    {step === "served" && order.order_type === 'delivery' ? "out for delivery" : 
                     step === "completed" && order.order_type === 'delivery' ? "delivered" : 
                     step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-coffee-50 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-xl mb-2 capitalize text-coffee-900">
            {order.status === "pending" && "Waiting to be prepared"}
            {order.status === "preparing" && "Your order is being prepared"}
            {order.status === "served" && order.order_type === 'delivery' && "Your order is on the way!"}
            {order.status === "served" && order.order_type !== 'delivery' && "Enjoy your meal!"}
            {order.status === "completed" && "Order complete"}
          </h3>
          <p className="text-coffee-600">
            {order.estimated_ready_time && order.status !== "served" && order.status !== "completed" && (
              <>Estimated ready time: <span className="font-bold">{format(new Date(order.estimated_ready_time), "h:mm a")}</span></>
            )}
            {order.status === "served" && "We hope you enjoy it!"}
          </p>
        </div>

        {/* Order Items Summary */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mt-2 bg-white/50 rounded-2xl p-6 border border-coffee-100">
            <h3 className="font-bold text-lg mb-4 text-coffee-900 flex items-center justify-between">
              <span>Your Items</span>
              <span className="text-sm font-normal text-coffee-500">{order.order_items.length} items</span>
            </h3>
            <ul className="space-y-4">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-coffee-900 min-w-[24px]">{item.quantity}x</span>
                      <span className="font-medium text-coffee-800">{item.menu_items?.name || "Unknown Item"}</span>
                    </div>
                    {item.special_requests && (
                      <p className="text-xs text-coffee-500 italic mt-1 ml-8">Note: {item.special_requests}</p>
                    )}
                  </div>
                  <span className="text-coffee-700 font-medium ml-4 whitespace-nowrap">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            {(() => {
              const subtotal = order.order_items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
              const deliveryFee = order.order_type === 'delivery' ? (order.delivery_fee ?? 0) : 0;
              const discount = (subtotal + deliveryFee) - order.total_amount;

              return (
                <div className="mt-4 pt-4 border-t border-coffee-200 space-y-2">
                  <div className="flex justify-between items-center text-sm text-coffee-700">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm text-coffee-700">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  {discount > 0.01 && (
                    <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                      <span>Discount Applied</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-bold text-coffee-900 pt-2 border-t border-coffee-100">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Feedback Widget */}
      {(order.status === "served" || order.status === "completed") && !feedbackSubmitted && (
        <div className="glass-card rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
          <h3 className="text-2xl font-bold font-serif mb-2 text-center text-coffee-900">How was everything?</h3>
          <p className="text-coffee-600 text-center mb-6">We'd love to hear your feedback.</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={40} 
                  className={`${
                    (hoverRating || rating) >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-coffee-200"
                  } transition-colors`} 
                />
              </button>
            ))}
          </div>
          
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked or what could be better..."
            rows={3}
            className="w-full border border-coffee-200 rounded-xl p-3 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none mb-4 resize-none"
          />
          
          <button 
            onClick={submitFeedback}
            disabled={submitting || rating === 0}
            className="w-full bg-coffee-800 text-cream py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-coffee-900 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : <><Send size={18} /> Submit Feedback</>}
          </button>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="glass-card rounded-3xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2 text-coffee-900">Thank You!</h3>
          <p className="text-coffee-600">Your feedback helps us improve our service.</p>
          <button 
            onClick={() => router.push("/menu")}
            className="mt-6 px-6 py-2 border border-coffee-300 text-coffee-800 rounded-xl hover:bg-coffee-50 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StatusContent />
    </Suspense>
  );
}
