"use client";

import { useState } from "react";
import { Coffee, Users, Phone, MapPin, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function WaitlistJoinPage() {
  const [formData, setFormData] = useState({
    customer_name: "",
    party_size: "2",
    phone: "",
    table_requested: "",
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
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          party_size: parseInt(formData.party_size),
          table_requested: formData.table_requested ? parseInt(formData.table_requested) : null
        }),
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-2">You're on the list!</h1>
          <p className="text-coffee-600 mb-8">
            Thank you, {formData.customer_name}. We'll let you know as soon as your table is ready.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setIsSuccess(false);
                setFormData({ customer_name: "", party_size: "2", phone: "", table_requested: "", preferred_time: "" });
              }}
              className="w-full bg-white text-coffee-800 border border-coffee-200 py-3 rounded-xl font-medium hover:bg-coffee-50 transition-colors"
            >
              Add Another Person
            </button>
            <Link href="/menu" className="w-full bg-coffee-800 text-cream py-3 rounded-xl font-medium hover:bg-coffee-900 transition-colors text-center">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-coffee-100 text-coffee-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee size={32} />
          </div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-2">Join Waitlist</h1>
          <p className="text-coffee-600">Enter your details to reserve your spot.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-coffee-800">Your Name *</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                value={formData.customer_name}
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-coffee-800">Party Size *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
              <input 
                required 
                type="number" 
                min="1"
                max="20"
                value={formData.party_size}
                onChange={e => setFormData({...formData, party_size: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-coffee-800">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-coffee-800">Preferred Time (Optional)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
              <input 
                type="time" 
                value={formData.preferred_time}
                onChange={e => setFormData({...formData, preferred_time: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-coffee-800">Requested Table (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
              <select 
                value={formData.table_requested}
                onChange={e => setFormData({...formData, table_requested: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-coffee-200 bg-white/80 focus:bg-white focus:ring-2 focus:ring-coffee-500 outline-none appearance-none"
              >
                <option value="">Any Table</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>Table {n}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-coffee-800 text-cream py-4 rounded-xl font-bold text-lg hover:bg-coffee-900 transition-colors disabled:opacity-50 mt-4 shadow-md"
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
      </div>
    </div>
  );
}
