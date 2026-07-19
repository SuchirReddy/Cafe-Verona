"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (res.ok) {
        toast.success("Login successful");
        router.push("/admin/orders");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0] p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-coffee-800 rounded-full filter blur-[120px] opacity-[0.1]"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold rounded-full filter blur-[120px] opacity-[0.1]"></div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-coffee-100 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-coffee-800 mb-4 shadow-sm">
            <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 tracking-wide">Admin Portal</h1>
          <p className="text-coffee-500 font-medium text-sm mt-2">Sign in to manage Cafe Veřona</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-coffee-800 ml-1">Admin ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-coffee-400" />
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter your ID"
                className="w-full pl-11 pr-4 py-3.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-all outline-none font-medium text-coffee-900 placeholder:font-normal placeholder:text-coffee-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-coffee-800 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-coffee-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3.5 bg-coffee-50 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-all outline-none font-medium text-coffee-900 placeholder:font-normal placeholder:text-coffee-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coffee-800 text-cream py-4 rounded-xl font-bold tracking-widest text-sm hover:bg-coffee-900 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
