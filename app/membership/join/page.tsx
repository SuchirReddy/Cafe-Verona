"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Sparkles, Star, Award, Crown } from "lucide-react";

export default function JoinMembershipPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Silver");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_name: name, customer_email: email, tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create membership");
      }

      setMembershipNumber(data.membership_number);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans selection:bg-[#985923] selection:text-white flex flex-col md:flex-row">
      {/* Left Form Area */}
      <div className="w-full md:w-1/2 min-h-screen bg-[#FAF8F3] relative z-10 flex flex-col p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <Link href="/" className="inline-flex items-center text-[#2C331F] hover:text-[#985923] mb-10 transition-colors font-bold text-xs tracking-widest w-fit group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>
        
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-[#2C331F] mb-4 tracking-tighter leading-tight flex items-center gap-3">
              <Sparkles className="text-[#985923]" size={36} />
              The Club
            </h1>
            <p className="text-[#2C331F]/80 text-base md:text-lg font-medium leading-relaxed">
              Join the Cafe Verona membership program to unlock exclusive rewards, complimentary artisanal coffee, and VIP experiences.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E8E2D2] mb-8 relative overflow-hidden">
            {success ? (
              <div className="text-center py-6 animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-[#F9F6F0] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#E8E2D2]">
                  <CheckCircle2 size={40} className="text-[#985923]" />
                </div>
                <h2 className="text-3xl font-black text-[#2C331F] mb-2 tracking-tighter">Welcome, {name}!</h2>
                <p className="text-[#2C331F]/70 font-medium mb-8">Your VIP membership is now active.</p>
                
                <div className="bg-[#111] rounded-2xl p-6 text-white mb-8 shadow-xl transform hover:scale-[1.02] transition-transform relative overflow-hidden group border border-white/10">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#985923] rounded-full filter blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Your Membership Number</p>
                  <p className="text-3xl font-mono font-bold tracking-widest text-[#985923] relative z-10">{membershipNumber}</p>
                </div>

                <div className="bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl p-4 mb-8 text-[#2C331F]/80 text-sm font-medium text-left">
                  <strong className="text-[#985923]">Important:</strong> Save this number to earn stamps and claim rewards when you order.
                </div>

                <Link 
                  href="/membership/lookup" 
                  className="w-full flex items-center justify-center gap-2 bg-[#985923] text-white font-bold text-sm tracking-widest py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg hover:bg-[#7D491C]"
                >
                  VIEW DASHBOARD
                  <ChevronRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="relative z-10">
                {/* Benefits Preview */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="min-w-[200px] snap-start bg-[#FAF8F3] p-4 rounded-2xl border border-[#E8E2D2] flex-shrink-0">
                    <Star className="text-[#985923] mb-2" size={20} />
                    <h3 className="font-bold text-[#2C331F] text-sm mb-1">Silver</h3>
                    <p className="text-[11px] text-[#2C331F]/70 font-medium">Free coffee every 5 stamps</p>
                  </div>
                  <div className="min-w-[200px] snap-start bg-white p-4 rounded-2xl border border-[#E8E2D2] shadow-sm flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#985923]/5 rounded-bl-full"></div>
                    <Award className="text-[#985923] mb-2" size={20} />
                    <h3 className="font-bold text-[#2C331F] text-sm mb-1">Gold</h3>
                    <p className="text-[11px] text-[#2C331F]/70 font-medium">10% off your entire cart</p>
                  </div>
                  <div className="min-w-[200px] snap-start bg-[#111] p-4 rounded-2xl border border-[#111] shadow-md flex-shrink-0 relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#985923]/20 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                    <Crown className="text-[#985923] mb-2 relative z-10" size={20} />
                    <h3 className="font-bold text-white text-sm mb-1 relative z-10">Platinum</h3>
                    <p className="text-[11px] text-white/70 font-medium relative z-10">20% off & Free Delivery</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] placeholder:text-[#2C331F]/30"
                      placeholder="e.g. Nysa Devgan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] placeholder:text-[#2C331F]/30"
                      placeholder="e.g. nysa@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Membership Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] appearance-none cursor-pointer"
                    >
                      <option value="Silver">Silver (Free)</option>
                      <option value="Gold">Gold (Demo)</option>
                      <option value="Platinum">Platinum (Demo)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#985923] hover:bg-[#7D491C] text-white font-bold text-sm tracking-widest py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        CREATING...
                      </>
                    ) : (
                      "JOIN THE CLUB"
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                    <Link href="/membership/lookup" className="text-xs font-bold tracking-widest text-[#2C331F]/60 hover:text-[#985923] uppercase transition-colors">
                      Already a member? Login
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Image Area (Desktop Only) */}
      <div className="hidden md:block w-1/2 min-h-screen relative border-l border-[#111]">
        <img src="/hero_baristas.png" alt="Membership" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl max-w-sm border border-white/20">
          <div className="flex gap-1 text-[#985923] mb-3">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <p className="text-[#2C331F] font-serif font-medium text-lg leading-snug italic mb-4">
            "The Platinum membership is absolutely worth it. Skipping the line and getting free delivery makes my mornings effortless."
          </p>
          <p className="text-[#2C331F]/60 font-bold text-xs tracking-widest uppercase">— ARYA S.</p>
        </div>
      </div>
    </div>
  );
}
