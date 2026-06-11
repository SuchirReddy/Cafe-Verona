"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Star, Loader2, Calendar, ShoppingBag, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderContext {
  total_amount: number;
}

interface Feedback {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  orders: OrderContext;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  
  const supabase = createClient();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("feedback_ratings")
        .select(`
          *,
          orders (
            total_amount
          )
        `)
        .order("created_at", { ascending: false });
        
      if (data) {
        setFeedbacks(data as unknown as Feedback[]);
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filterRating === "all") return true;
    return fb.rating === filterRating;
  });

  // Calculate average rating
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 flex items-center gap-3">
            <MessageSquare className="text-coffee-600" /> Customer Feedback
          </h1>
          <p className="text-coffee-600 mt-2">Monitor ratings and comments from recent orders.</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-coffee-100 p-1">
          {["all", 5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterRating === rating
                  ? "bg-coffee-800 text-cream"
                  : "text-coffee-600 hover:bg-coffee-50"
              }`}
            >
              {rating === "all" ? "All" : `${rating} Stars`}
            </button>
          ))}
        </div>
      </div>

      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100 flex items-center gap-4">
            <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Star size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm text-coffee-500 font-medium uppercase tracking-wider">Average Rating</p>
              <p className="text-2xl font-bold text-coffee-900">{avgRating} / 5.0</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100 flex items-center gap-4">
            <div className="bg-olive/20 text-olive w-12 h-12 rounded-full flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-coffee-500 font-medium uppercase tracking-wider">Total Reviews</p>
              <p className="text-2xl font-bold text-coffee-900">{feedbacks.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100 flex items-center gap-4">
            <div className="bg-coffee-100 text-coffee-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Filter size={24} />
            </div>
            <div>
              <p className="text-sm text-coffee-500 font-medium uppercase tracking-wider">With Comments</p>
              <p className="text-2xl font-bold text-coffee-900">{feedbacks.filter(f => f.comment && f.comment.trim() !== "").length}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-coffee-800" size={40} />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white/60 rounded-3xl p-16 text-center border border-white">
          <MessageSquare className="mx-auto text-coffee-300 mb-4" size={48} />
          <h3 className="text-xl font-medium text-coffee-900 mb-2">No feedback found</h3>
          <p className="text-coffee-500">
            {filterRating === "all" 
              ? "You haven't received any customer feedback yet." 
              : `No ${filterRating}-star reviews match your filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeedbacks.map((fb) => (
            <div key={fb.id} className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < fb.rating ? "currentColor" : "none"} 
                      className={i < fb.rating ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-coffee-400">
                  <Calendar size={14} />
                  <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex-grow mb-6">
                {fb.comment && fb.comment.trim() !== "" ? (
                  <p className="text-coffee-800 italic">"{fb.comment}"</p>
                ) : (
                  <p className="text-coffee-400 italic text-sm">No written comment provided.</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-coffee-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-coffee-500">
                  <ShoppingBag size={16} />
                  <span>Order Total: <strong className="text-coffee-900">{fb.orders ? formatPrice(fb.orders.total_amount) : 'Unknown'}</strong></span>
                </div>
                <Link 
                  href={`/admin/receipt/${fb.order_id}`}
                  className="text-sm font-medium text-olive hover:text-olive/80 transition-colors"
                >
                  View Receipt
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
