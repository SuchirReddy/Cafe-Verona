"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coffee, QrCode, Timer, Gift, Star, ArrowRight, Menu, X } from "lucide-react";
import { MenuItem } from "@/types";
import MenuCard from "@/components/MenuCard";

export default function LandingPageClient({ popularItems }: { popularItems: MenuItem[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans selection:bg-coffee-200">
      {/* Sticky Navbar */}
      <div className="fixed top-4 w-full z-50 px-4 flex justify-center pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-6xl transition-all duration-300 rounded-full px-6 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-3 border border-coffee-100"
            : "bg-white/40 backdrop-blur-md shadow-sm py-4 border border-white/60"
            }`}
        >
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform border-2 border-white">
                <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold font-serif text-coffee-900">Cafe Veřona</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 font-medium text-coffee-800">
              <a href="#features" className="hover:text-olive transition-colors">Features</a>
              <a href="#menu-preview" className="hover:text-olive transition-colors">Favorites</a>
              <a href="#testimonials" className="hover:text-olive transition-colors">Reviews</a>
              <Link href="/membership/lookup" className="hover:text-olive transition-colors">Membership</Link>
              <Link href="/menu" className="bg-coffee-800 text-white px-6 py-2.5 rounded-full hover:bg-coffee-900 transition-colors shadow-md">
                Order Now
              </Link>
            </div>
            {/* Mobile menu button (simplified for now) */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-coffee-900 bg-white/50 rounded-full hover:bg-white/80 transition-colors">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-coffee-100 p-6 flex flex-col gap-6 mx-4">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-coffee-900 font-bold text-lg hover:text-coffee-600 transition-colors">Features</a>
              <a href="#menu-preview" onClick={() => setIsMobileMenuOpen(false)} className="text-coffee-900 font-bold text-lg hover:text-coffee-600 transition-colors">Favorites</a>
              <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="text-coffee-900 font-bold text-lg hover:text-coffee-600 transition-colors">Reviews</a>
              <Link href="/membership/lookup" onClick={() => setIsMobileMenuOpen(false)} className="text-coffee-900 font-bold text-lg hover:text-coffee-600 transition-colors">Membership</Link>
              <div className="h-px bg-coffee-200 w-full my-2"></div>
              <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)} className="bg-coffee-800 text-white px-6 py-4 rounded-xl font-bold text-center hover:bg-coffee-900 shadow-md transition-all">
                Order Now
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-br from-[#E8DCCC] to-[#F9F6F0]">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-coffee-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-olive rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left order-2 md:order-1 mt-8 md:mt-0">
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-coffee-900 leading-tight mb-6">
              The Art of Coffee, <br className="hidden md:block" /> <span className="text-[#B8860B]">Redefined</span>
            </h1>
            <p className="text-xl text-coffee-700 mb-10 max-w-2xl mx-auto md:mx-0">
              Experience our curated selection of premium roasts and artisanal pastries. Order seamlessly from your table without the wait.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link href="/menu" className="w-full sm:w-auto bg-gradient-to-r from-coffee-800 to-coffee-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                Browse Menu <ArrowRight size={20} />
              </Link>
              <Link href="/waitlist" className="w-full sm:w-auto bg-white border-2 border-coffee-800 text-coffee-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-coffee-50 transition-colors text-center">
                Reserve a Table
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center relative order-1 md:order-2 mt-8 md:mt-0">
            {/* Custom floating animation using inline style since tailwind doesn't have float by default */}
            <style jsx>{`
              @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(2deg); }
                100% { transform: translateY(0px) rotate(0deg); }
              }
              .animate-float {
                animation: float 6s ease-in-out infinite;
              }
            `}</style>
            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-white/40 backdrop-blur-md rounded-full blur-xl"></div>
              <img src="/logo.png" alt="Cafe Verona Logo" className="w-64 h-64 md:w-80 md:h-80 rounded-full relative z-10 drop-shadow-2xl border-8 border-white/50 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-coffee-900 mb-4">Why Order With Us?</h2>
            <p className="text-lg text-coffee-600">Experience the future of cafe dining with our seamless digital ordering system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card bg-cream p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-coffee-100">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <QrCode className="text-olive" size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-coffee-900 mb-3">QR Table Ordering</h3>
              <p className="text-coffee-600">Skip the line entirely. Just scan the QR code on your table to view our digital menu and order instantly.</p>
            </div>

            <div className="glass-card bg-cream p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-coffee-100">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Timer className="text-olive" size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-coffee-900 mb-3">Live Order Tracking</h3>
              <p className="text-coffee-600">Know exactly when your coffee is being brewed. Watch the status of your order update in real-time.</p>
            </div>

            <div className="glass-card bg-cream p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border border-coffee-100">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Gift className="text-olive" size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-coffee-900 mb-3">Membership Rewards</h3>
              <p className="text-coffee-600">Every cup counts. Join our membership program, earn stamps with each order, and redeem them for free drinks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu-preview" className="py-24 bg-[#F9F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-coffee-900 mb-4">Our Favorites</h2>
              <p className="text-lg text-coffee-600">A glimpse into what our community loves the most.</p>
            </div>
            <Link href="/menu" className="text-olive font-medium flex items-center gap-2 hover:gap-3 transition-all">
              View Full Menu <ArrowRight size={18} />
            </Link>
          </div>

          {popularItems.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white/50 animate-pulse rounded-2xl h-80 border border-coffee-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {popularItems.map((item) => (
                <MenuCard key={item.id} item={item} previewOnly={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-[#E8DCCC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-center text-coffee-900 mb-16">What Our Guests Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Rahul S.", quote: "The best latte I've had in years. Ordering from the table made my morning meeting so much smoother!" },
              { name: "Nysa D.", quote: "Their digital menu is incredibly slick. The loyalty program keeps me coming back every single day." },
              { name: "Elsa R.", quote: "Amazing ambiance and even better coffee. The avocado toast is an absolute must-try." }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} fill="currentColor" size={18} />)}
                </div>
                <p className="text-coffee-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-coffee-200 rounded-full flex items-center justify-center font-bold text-coffee-800">
                    {testimonial.name.charAt(0)}
                  </div>
                  <span className="font-bold text-coffee-900">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 bg-gradient-to-b from-coffee-900 to-coffee-800 p-12 md:p-20 rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6">Ready for the perfect coffee break?</h2>
          <p className="text-coffee-200 text-lg mb-10 max-w-2xl mx-auto">
            Scan a QR code on your table or click below to start ordering. We can't wait to serve you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/menu" className="bg-white text-coffee-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-cream transition-colors">
              Start Order
            </Link>
            <Link href="/waitlist" className="bg-transparent border border-coffee-400 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              Join Waitlist
            </Link>
            <Link href="/membership/join" className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-lg px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-xl transition-all mt-4 sm:mt-0 border border-yellow-600/50">
              Join Membership
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F9F6F0] text-coffee-800 py-16 border-t border-coffee-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-coffee-800">
                <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold font-serif text-coffee-900">Cafe Veřona</span>
            </div>
            <p className="text-coffee-600 max-w-xs leading-relaxed">
              Crafting perfect moments, one cup at a time. Experience modern dining with our premium digital service.
            </p>
          </div>

          <div>
            <h4 className="text-coffee-900 font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/menu" className="text-coffee-600 hover:text-coffee-900 transition-colors">Full Menu</Link></li>
              <li><Link href="/waitlist" className="text-coffee-600 hover:text-coffee-900 transition-colors">Join Waitlist</Link></li>
              <li><Link href="/membership/lookup" className="text-coffee-600 hover:text-coffee-900 transition-colors">Membership</Link></li>
              <li><Link href="/kitchen" className="text-coffee-600 hover:text-coffee-900 transition-colors">Kitchen Display</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-coffee-900 font-bold mb-6 tracking-wider uppercase text-sm">Contact Us</h4>
            <ul className="space-y-4 text-coffee-600">
              <li>Cafe Verona, 100ft Road</li>
              <li>Jubilee Hills, Hyderabad</li>
              <li>hello@cafeverona.com</li>
              <li>+91 1234567890</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-coffee-200 flex flex-col md:flex-row justify-between items-center text-sm text-coffee-500">
          <p>© 2024 Cafe Veřona. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/admin/orders" className="hover:text-coffee-900 transition-colors">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
