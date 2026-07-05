"use client";

import { useState } from "react";
import { Users, Phone, MapPin, CheckCircle2, Clock, Calendar, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function WaitlistJoinPage() {
  const [formData, setFormData] = useState({
    customer_name: "",
    party_size: "2",
    phone: "",
    table_requested: "",
    preferred_date: "",
    preferred_time: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.party_size) {
      toast.error("Name and party size are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const preferredDateTime = [formData.preferred_date, formData.preferred_time].filter(Boolean).join(" ");

      const payload = {
        customer_name: formData.customer_name,
        party_size: parseInt(formData.party_size),
        phone: formData.phone,
        table_requested: formData.table_requested ? parseInt(formData.table_requested) : null,
        preferred_time: preferredDateTime || null,
      };

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to join waitlist");

      setIsSuccess(true);
      toast.success("Successfully joined the waitlist!");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans selection:bg-[#985923] selection:text-white flex flex-col md:flex-row">
      {/* Left Form Area */}
      <div className="w-full md:w-1/2 min-h-screen bg-[#FAF8F3] relative z-10 flex flex-col p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="inline-flex items-center text-[#2C331F] hover:text-[#985923] transition-colors font-bold text-xs tracking-widest group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            BACK TO HOME
          </Link>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm border border-white">
              <img src="/logo.png" alt="Cafe Verona" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold font-serif text-[#2C331F] tracking-wide text-sm">Cafe Veřona</span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-[#2C331F] mb-4 tracking-tighter leading-tight flex items-center gap-3">
              <Sparkles className="text-[#985923]" size={36} />
              Reservation
            </h1>
            <p className="text-[#2C331F]/80 text-base md:text-lg font-medium leading-relaxed">
              Reserve your table at Cafe Verona. Experience the perfect ambiance with our artisanal blends.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E8E2D2] mb-8 relative overflow-hidden">
            {isSuccess ? (
              <div className="text-center py-6 animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-[#F9F6F0] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#E8E2D2]">
                  <CheckCircle2 size={40} className="text-[#985923]" />
                </div>
                <h2 className="text-3xl font-black text-[#2C331F] mb-2 tracking-tighter">You're on the list!</h2>
                <p className="text-[#2C331F]/70 font-medium mb-8">
                  Thank you, {formData.customer_name}. We'll have everything ready for you.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ customer_name: "", party_size: "2", phone: "", table_requested: "", preferred_date: "", preferred_time: "" });
                    }}
                    className="w-full bg-[#FAF8F3] text-[#2C331F] border border-[#E8E2D2] py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-black/5 transition-colors uppercase"
                  >
                    Make Another Booking
                  </button>
                  <Link href="/menu" className="w-full flex items-center justify-center bg-[#985923] text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-[#7D491C] transition-colors shadow-md uppercase">
                    Browse Menu
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] placeholder:text-[#2C331F]/30"
                    placeholder="Your Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Party Size *</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C331F]/40" size={18} />
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={formData.party_size}
                        onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Table</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C331F]/40" size={18} />
                      <select
                        value={formData.table_requested}
                        onChange={(e) => setFormData({ ...formData, table_requested: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] appearance-none cursor-pointer"
                      >
                        <option value="">Any Table</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>Table {n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C331F]/40" size={18} />
                      <input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C331F]/40" size={18} />
                      <input
                        type="time"
                        value={formData.preferred_time}
                        onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C331F] tracking-widest mb-2 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C331F]/40" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#E8E2D2] rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#985923]/50 focus:border-[#985923] transition-all font-medium text-[#2C331F] placeholder:text-[#2C331F]/30"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#985923] hover:bg-[#7D491C] text-white font-bold text-sm tracking-widest py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      RESERVING...
                    </>
                  ) : (
                    "CONFIRM RESERVATION"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Image Area (Desktop Only) */}
      <div className="hidden md:block w-1/2 min-h-screen relative border-l border-[#111]">
        <img src="/hero_coffee_cup.png" alt="Reservation" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl max-w-sm border border-white/20">
          <p className="text-[#2C331F] font-serif font-medium text-lg leading-snug italic mb-4">
            "The ambiance is absolutely lovely and securing a table in advance was a breeze. Best cafe experience in Jubilee Hills!"
          </p>
          <p className="text-[#2C331F]/60 font-bold text-xs tracking-widest uppercase">— PRIYA M.</p>
        </div>
      </div>
    </div>
  );
}
