"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F0] to-[#E8DCCC] flex flex-col pt-12 pb-24 px-4 sm:px-6 font-sans">
      <div className="max-w-md w-full mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-coffee-600 hover:text-coffee-900 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-900 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Sparkles className="text-gold" />
            Cafe Veřona
          </h1>
          <p className="text-coffee-700 text-lg">Join our membership program to earn free coffee and exclusive rewards.</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_32px_rgba(107,76,58,0.1)] border border-white/50 mb-8">
          <h2 className="text-xl font-bold font-serif text-coffee-900 mb-4 text-center">Membership Benefits</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-white/80 p-4 rounded-xl border border-coffee-100">
              <h3 className="font-bold text-coffee-900 text-base">🥈 Silver</h3>
              <p className="mt-1 text-coffee-600">Earn 1 stamp per order. Collect 5 stamps to get a Free Coffee!</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
              <h3 className="font-bold text-yellow-900 text-base">🥇 Gold</h3>
              <p className="mt-1 text-yellow-800">Enjoy an automatic <strong>10% off</strong> your entire cart, plus standard stamps!</p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-slate-100 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base">💎 Platinum</h3>
              <p className="mt-1 text-gray-800">Enjoy an automatic <strong>20% off</strong> your entire cart AND <strong>Free Delivery</strong> on all orders!</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(107,76,58,0.1)] border border-white/50 relative overflow-hidden">
          {success ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-coffee-900 mb-2">Welcome, {name}!</h2>
              <p className="text-coffee-700 mb-6">Your membership has been created successfully.</p>
              
              <div className="bg-gradient-to-r from-coffee-900 to-coffee-800 rounded-2xl p-6 text-cream mb-8 shadow-lg transform hover:scale-[1.02] transition-transform">
                <p className="text-coffee-300 text-sm font-medium uppercase tracking-wider mb-1">Your Membership Number</p>
                <p className="text-3xl font-mono font-bold tracking-widest text-gold drop-shadow-md">{membershipNumber}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-yellow-800 text-sm text-left">
                <strong>Important:</strong> Please save this number. You will need it to earn stamps when you order.
              </div>

              <Link 
                href="/membership/lookup" 
                className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-yellow-500 text-coffee-900 font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Check Membership Status
                <ChevronRight size={20} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-coffee-900 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/80 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all placeholder:text-coffee-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-coffee-900 mb-2">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/80 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all placeholder:text-coffee-400"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-coffee-900 mb-2">Membership Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-white/80 border border-coffee-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all text-coffee-900 appearance-none"
                >
                  <option value="Silver">Silver (Free)</option>
                  <option value="Gold">Gold (Demo)</option>
                  <option value="Platinum">Platinum (Demo)</option>
                </select>
                <p className="text-xs text-coffee-500 mt-2">For demo purposes, all tiers are free to select.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-coffee-900 hover:bg-coffee-800 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Join Now"
                )}
              </button>
              
              <div className="text-center mt-6">
                <Link href="/membership/lookup" className="text-sm font-medium text-coffee-600 hover:text-coffee-900 underline underline-offset-4">
                  Already have a membership? Lookup here.
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
