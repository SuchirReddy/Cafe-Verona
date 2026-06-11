"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Coffee, Loader2, Search, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Membership {
  id: string;
  membership_number: string;
  customer_name: string;
  tier: string;
  stamps_earned: number;
  expiry_date: string;
  status: string;
}

export default function LookupMembershipPage() {
  const [membershipNumber, setMembershipNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipNumber.trim()) return;

    setIsLoading(true);
    setError("");
    setMembership(null);

    try {
      const response = await fetch(`/api/memberships?membership_number=${encodeURIComponent(membershipNumber.trim())}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to find membership");

      if (data && data.length > 0) {
        setMembership(data[0]);
      } else {
        setError("Membership not found. Please check the number and try again.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!membership) return;
    if (!confirm("Are you sure you want to cancel your membership? You will lose all your stamps and benefits.")) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/memberships/${membership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!response.ok) throw new Error("Failed to cancel membership");
      toast.success("Membership cancelled successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription for live stamp updates
  useEffect(() => {
    if (!membership) return;

    const channel = supabase
      .channel(`membership_${membership.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "memberships",
          filter: `id=eq.${membership.id}`,
        },
        (payload) => {
          setMembership(payload.new as Membership);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [membership?.id, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F0] to-[#E8DCCC] flex flex-col pt-12 pb-24 px-4 sm:px-6 font-sans">
      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-coffee-600 hover:text-coffee-900 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <Link href="/membership/join" className="text-sm font-medium text-gold hover:text-yellow-600 transition-colors">
            Join Now
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-900 mb-4 tracking-tight">
            My Membership
          </h1>
          <p className="text-coffee-700">Enter your membership number to view your stamps and rewards.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(107,76,58,0.1)] border border-white/50 mb-8">
          <form onSubmit={handleLookup} className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-coffee-400" />
              </div>
              <input
                type="text"
                required
                value={membershipNumber}
                onChange={(e) => setMembershipNumber(e.target.value.toUpperCase())}
                className="w-full bg-white/80 border border-coffee-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all placeholder:text-coffee-400 font-mono text-lg uppercase"
                placeholder="CAFE-XXXX"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !membershipNumber.trim()}
              className="bg-coffee-900 hover:bg-coffee-800 text-white font-bold px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Lookup"}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {membership && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(107,76,58,0.15)] border border-white/50 animate-fade-in relative">
            {/* Status Banner */}
            {membership.status !== 'active' && (
              <div className="bg-red-500 text-white text-center py-2 text-sm font-bold uppercase tracking-widest">
                Membership {membership.status}
              </div>
            )}
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-coffee-900">{membership.customer_name}</h2>
                  <p className="text-coffee-500 font-mono mt-1">{membership.membership_number}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  membership.tier === 'Gold' ? 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-900' :
                  membership.tier === 'Platinum' ? 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900' :
                  'bg-coffee-100 text-coffee-800'
                }`}>
                  {membership.tier}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-bold text-coffee-900">Your Stamps</h3>
                  <span className="text-coffee-500 text-sm font-medium">{membership.stamps_earned} / 5</span>
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`flex-1 aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        i < membership.stamps_earned 
                          ? 'bg-gold border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] transform scale-110' 
                          : 'bg-coffee-50 border-coffee-200 shadow-inner opacity-60'
                      }`}
                    >
                      <Coffee 
                        size={28} 
                        className={i < membership.stamps_earned ? 'text-coffee-900 drop-shadow-sm' : 'text-coffee-200'} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              {membership.stamps_earned >= 5 && membership.status === 'active' && (
                <div className="bg-gradient-to-r from-yellow-100 to-gold/20 border border-gold/30 rounded-2xl p-5 mb-8 flex items-center gap-4 animate-pulse-slow">
                  <div className="bg-gold text-coffee-900 rounded-full p-3 shadow-md">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-coffee-900 text-lg">Free Coffee Earned!</h4>
                    <p className="text-coffee-800 text-sm">Show this screen to the staff to redeem.</p>
                  </div>
                </div>
              )}

              <div className="border-t border-coffee-100 pt-6 mb-6">
                <h3 className="text-lg font-bold text-coffee-900 mb-4">Your Tier Benefits</h3>
                <div className="space-y-3 text-sm">
                  <div className={`p-4 rounded-xl border transition-colors ${membership.tier === 'Silver' ? 'bg-coffee-50 border-coffee-200' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                    <h4 className={`font-bold ${membership.tier === 'Silver' ? 'text-coffee-900' : 'text-gray-600'}`}>🥈 Silver</h4>
                    <p className={`mt-1 ${membership.tier === 'Silver' ? 'text-coffee-700' : 'text-gray-500'}`}>Earn 1 stamp per order. 5 stamps = Free Coffee.</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition-colors ${membership.tier === 'Gold' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                    <h4 className={`font-bold ${membership.tier === 'Gold' ? 'text-yellow-900' : 'text-gray-600'}`}>🥇 Gold</h4>
                    <p className={`mt-1 ${membership.tier === 'Gold' ? 'text-yellow-800' : 'text-gray-500'}`}>10% off your entire cart automatically, plus stamps!</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition-colors ${membership.tier === 'Platinum' ? 'bg-gradient-to-r from-gray-50 to-slate-100 border-gray-300 shadow-sm' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                    <h4 className={`font-bold ${membership.tier === 'Platinum' ? 'text-gray-900' : 'text-gray-600'}`}>💎 Platinum</h4>
                    <p className={`mt-1 ${membership.tier === 'Platinum' ? 'text-gray-800' : 'text-gray-500'}`}>20% off your entire cart AND Free Delivery on all orders!</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-coffee-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-coffee-500">
                  Expiry Date: <span className="font-medium text-coffee-800">{formatDate(membership.expiry_date)}</span>
                </p>
                {membership.status === 'active' && (
                  <button 
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Cancel Membership
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
