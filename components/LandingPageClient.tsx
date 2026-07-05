"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coffee, QrCode, Timer, Gift, Star, ArrowRight, Menu, X, MapPin, Phone, Mail } from "lucide-react";
import { MenuItem } from "@/types";
import MenuCard from "@/components/MenuCard";

export default function LandingPageClient({ popularItems }: { popularItems: MenuItem[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight - 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans selection:bg-coffee-200">
      {/* Sticky Navbar */}
      <div className={`fixed top-4 w-full z-50 px-4 flex justify-center pointer-events-none transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
        <nav
          className={`${isScrolled ? 'pointer-events-auto translate-y-0' : 'pointer-events-none -translate-y-4'} w-full max-w-6xl transition-all duration-300 rounded-full px-6 ${isScrolled
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
      <section className="relative min-h-screen flex flex-col md:flex-row bg-[#111]">
        {/* Left Pane */}
        <div className="w-full md:w-1/2 min-h-screen bg-[#FAF8F3] p-4 md:p-8 flex flex-col relative z-10">
          {/* Internal Navbar for Hero */}
          <div className="hidden md:flex justify-between items-center py-3 px-4 bg-white/60 backdrop-blur-md border border-[#E8E2D2] rounded-full shadow-sm mb-12 md:mb-auto -mt-2 md:-mt-4">
            <div className="flex items-center gap-4 relative">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-[#2C331F] hover:bg-black/5 rounded-full transition-colors z-10"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Desktop Hero Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8E2D2] p-6 flex flex-col gap-4 min-w-[200px] z-50">
                  <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Menu</Link>
                  <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Join Waitlist</Link>
                  <Link href="/membership/join" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Membership</Link>
                </div>
              )}
              <Link href="/" className="flex items-center gap-2 group hidden sm:flex">
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-white">
                  <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold font-serif text-[#2C331F] tracking-wide">Cafe Veřona</span>
              </Link>
            </div>

            <Link href="/waitlist" className="bg-gradient-to-r from-[#985923] to-[#804818] text-white px-6 py-2.5 rounded-full font-bold tracking-widest text-xs hover:shadow-lg hover:scale-105 transition-all border border-[#7D491C]/50 flex items-center gap-2">
              RESERVATION <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Top Bar (Hero) */}
          <div className="md:hidden flex justify-between items-center mb-6 mt-2 px-2 relative z-50">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-white">
                <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold font-serif text-[#2C331F] tracking-wide">Cafe Veřona</span>
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-[#2C331F] bg-white/50 hover:bg-black/5 rounded-full transition-colors border border-[#E8E2D2]"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              {/* Mobile Hero Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8E2D2] p-6 flex flex-col gap-4 min-w-[200px] z-50">
                  <Link href="/menu" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Menu</Link>
                  <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Join Waitlist</Link>
                  <Link href="/membership/join" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2C331F] font-bold text-lg hover:text-[#985923] transition-colors">Membership</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hours Pill (Above Image) */}
          <div className="md:hidden mx-auto bg-white text-[#2C331F] border border-[#E8E2D2] px-6 py-2.5 rounded-2xl text-[10px] font-medium whitespace-nowrap shadow-sm mb-4 mt-2 w-fit">
            Mon-Fri: 11 AM – 10 PM, Weekends: 10 AM – 11 PM
          </div>

          {/* Mobile Image Pane */}
          <div className="w-full min-h-[50vh] relative md:hidden rounded-3xl overflow-hidden mb-8 shadow-sm border border-[#E8E2D2]">
            <img
              src="/hero_artisan.png"
              alt="Barista pouring latte art"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>

            <a href="https://www.google.com/maps/search/?api=1&query=Cafe+Verona,+100ft+Road,+Jubilee+Hills,+Hyderabad" target="_blank" rel="noopener noreferrer" className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#FAF8F3] rounded-2xl p-4 shadow-xl flex flex-col gap-3 hover:-translate-y-1 transition-transform group cursor-pointer">
              <div className="flex justify-between items-center border-b border-[#E8E2D2] pb-2">
                <span className="font-bold text-[#2C331F] text-lg">Find our location</span>
                <ArrowRight size={16} className="-rotate-45 text-[#2C331F] group-hover:text-[#985923] transition-colors" />
              </div>
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="w-5 h-5 text-[#2C331F] flex-shrink-0 mt-0.5 group-hover:text-[#985923] transition-colors" />
                <p className="text-[#2C331F] text-xs font-medium leading-relaxed group-hover:text-[#985923] transition-colors">
                  Cafe Verona, 100ft Road, Jubilee Hills, Hyderabad
                </p>
              </div>
            </a>
          </div>

          {/* Main Hero Content */}
          <div className="flex-1 flex flex-col justify-center max-w-xl w-full mx-auto px-2 md:px-4 mt-4 md:mt-20">
            <h1 className="text-6xl md:text-[6.5rem] font-black text-[#2C331F] leading-[0.9] tracking-tighter mb-8">
              <span className="flex items-center gap-4 md:gap-6 flex-wrap">
                <img src="/hero_coffee_cup.png" alt="Coffee" className="w-16 h-16 md:w-28 md:h-28 rounded-3xl object-cover shadow-sm" />
                Coffee &
              </span>
              <span className="flex items-center gap-4 md:gap-6 flex-wrap mt-2 md:mt-4">
                Breakfast
                <img src="/hero_pastries.png" alt="Pastries" className="w-16 h-16 md:w-28 md:h-28 rounded-3xl object-cover shadow-sm" />
              </span>
            </h1>

            <p className="text-[#2C331F] text-lg mb-10 max-w-[420px] leading-relaxed font-medium">
              Cafe Veřona in Jubilee Hills, is a great place to meet up with friends over a cup of coffee. We take pride in serving quality brews and aim to create a warm, welcoming space for every guest.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/waitlist" className="inline-block bg-[#985923] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-xs md:text-sm tracking-widest hover:bg-[#7D491C] transition-colors shadow-md text-center flex-1 sm:flex-none">
                MAKE A RESERVATION
              </Link>
              <Link href="/menu" className="inline-block bg-transparent text-[#2C331F] border-2 border-[#2C331F] px-6 py-2.5 md:px-8 md:py-3.5 rounded-xl font-bold text-xs md:text-sm tracking-widest hover:bg-black/5 transition-colors shadow-sm text-center flex-1 sm:flex-none">
                BROWSE MENU
              </Link>
            </div>
          </div>

          {/* Bottom Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 max-w-2xl mx-auto w-full">
            {/* Left Card */}
            <div className="bg-[#FAF8F3] border border-[#E8E2D2] rounded-3xl p-7 flex flex-col justify-between shadow-sm">
              <p className="text-[#2C331F] text-sm leading-relaxed mb-6 font-medium">
                Experience the refined world of coffee and delectable cuisine, crafted with passion by our expert owner-baristas
              </p>
              <div>
                <p className="font-bold text-[#2C331F] text-lg mb-6">Hyderabad.</p>
                <Link href="#features" className="inline-block bg-[#985923] text-white px-6 py-3 rounded-lg font-bold text-xs tracking-wider hover:bg-[#7D491C] transition-colors shadow-sm">
                  MORE ABOUT US
                </Link>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-[#FAF8F3] border border-[#E8E2D2] rounded-3xl p-0 flex flex-col shadow-sm overflow-hidden text-sm">
              <a href="tel:+911234567890" className="flex-1 flex justify-between items-center px-6 py-4 border-b border-[#E8E2D2] hover:bg-black/5 transition-colors group">
                <span className="text-[#2C331F] font-medium tracking-wide flex items-center gap-2"><Phone size={18} /> CALL</span>
                <span className="text-[#985923] font-bold flex items-center gap-2">
                  +91 1234 567 890 <ArrowRight size={16} className="-rotate-45" />
                </span>
              </a>
              <a href="mailto:hello@cafeverona.com" className="flex-1 flex justify-between items-center px-6 py-4 border-b border-[#E8E2D2] hover:bg-black/5 transition-colors group">
                <span className="text-[#2C331F] font-medium tracking-wide flex items-center gap-2"><Mail size={18} /> MAIL</span>
                <span className="text-[#985923] font-bold flex items-center gap-2">
                  hello@cafeverona.com <ArrowRight size={16} className="-rotate-45" />
                </span>
              </a>
              <a href="#" className="flex-1 flex justify-between items-center px-6 py-4 hover:bg-black/5 transition-colors group">
                <span className="text-[#2C331F] font-medium tracking-wide flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> 
                  IG
                </span>
                <span className="text-[#985923] font-bold flex items-center gap-2">
                  @cafeverona <ArrowRight size={16} className="-rotate-45" />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Pane (Desktop Only) */}
        <div className="hidden md:block w-full md:w-1/2 min-h-[50vh] md:min-h-screen relative md:border-l border-[#111]">
          <img
            src="/hero_artisan.png"
            alt="Barista pouring latte art"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>

          {/* Top Floating Pill */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-2xl text-sm font-medium whitespace-nowrap shadow-2xl">
            Mon-Fri: 11 AM – 10 PM, Weekends: 10 AM – 11 PM
          </div>

          {/* Bottom Floating Location Card */}
          <a href="https://www.google.com/maps/search/?api=1&query=Cafe+Verona,+100ft+Road,+Jubilee+Hills,+Hyderabad" target="_blank" rel="noopener noreferrer" className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#FAF8F3] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 hover:-translate-y-1 transition-transform group cursor-pointer">
            <div className="flex justify-between items-center border-b border-[#E8E2D2] pb-4">
              <span className="font-bold text-[#2C331F] text-xl">Find our location</span>
              <ArrowRight size={20} className="-rotate-45 text-[#2C331F] group-hover:text-[#985923] transition-colors" />
            </div>
            <div className="flex items-start gap-4 pt-2">
              <MapPin className="w-6 h-6 text-[#2C331F] flex-shrink-0 mt-0.5 group-hover:text-[#985923] transition-colors" />
              <p className="text-[#2C331F] text-sm font-medium leading-relaxed group-hover:text-[#985923] transition-colors">
                Cafe Verona, 100ft Road, Jubilee Hills, Hyderabad
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-[#2C331F] leading-tight tracking-tighter mb-6">
              Why Order With Us?
            </h2>
            <p className="text-lg md:text-xl text-[#2C331F]/80 font-medium leading-relaxed">
              Experience the future of cafe dining with our seamless digital ordering system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#FAF8F3] p-8 md:p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 border border-[#E8E2D2] flex flex-col shadow-sm hover:shadow-lg group">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-[#E8E2D2] group-hover:scale-110 transition-transform duration-500">
                <QrCode className="text-[#985923]" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#2C331F] mb-4 tracking-wide">QR Table Ordering</h3>
              <p className="text-[#2C331F]/80 text-base leading-relaxed font-medium">Skip the line entirely. Just scan the QR code on your table to view our digital menu and order instantly.</p>
            </div>

            <div className="bg-[#FAF8F3] p-8 md:p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 border border-[#E8E2D2] flex flex-col shadow-sm hover:shadow-lg group">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-[#E8E2D2] group-hover:scale-110 transition-transform duration-500">
                <Timer className="text-[#985923]" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#2C331F] mb-4 tracking-wide">Live Order Tracking</h3>
              <p className="text-[#2C331F]/80 text-base leading-relaxed font-medium">Know exactly when your coffee is being brewed. Watch the status of your order update in real-time.</p>
            </div>

            <div className="bg-[#FAF8F3] p-8 md:p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-300 border border-[#E8E2D2] flex flex-col shadow-sm hover:shadow-lg group">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-[#E8E2D2] group-hover:scale-110 transition-transform duration-500">
                <Gift className="text-[#985923]" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#2C331F] mb-4 tracking-wide">Membership Rewards</h3>
              <p className="text-[#2C331F]/80 text-base leading-relaxed font-medium">Every cup counts. Join our membership program, earn stamps with each order, and redeem them for free drinks.</p>
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
      <section className="py-24 md:py-32 bg-[#FAF8F3] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white p-12 md:p-24 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col items-center text-center group border border-[#E8E2D2]">
            {/* Background Glows (Subtle on light background) */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#985923] rounded-full filter blur-[100px] opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700"></div>

            <div className="w-20 h-20 bg-[#FAF8F3] rounded-2xl flex items-center justify-center mb-10 border border-[#E8E2D2] shadow-sm group-hover:scale-110 transition-transform duration-500 relative z-10">
              <QrCode className="text-[#985923]" size={40} />
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-[#2C331F] mb-6 tracking-tighter leading-tight max-w-3xl relative z-10">
              Ready for the perfect coffee break?
            </h2>
            <p className="text-[#2C331F]/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
              Scan a QR code on your table or click below to start ordering. We can't wait to serve you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto relative z-10">
              <Link href="/menu" className="w-full sm:w-auto bg-[#985923] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-[#7D491C] transition-all shadow-md text-center">
                START ORDER
              </Link>
              <Link href="/waitlist" className="w-full sm:w-auto bg-transparent border-2 border-[#2C331F] text-[#2C331F] px-8 py-3.5 rounded-xl font-bold text-sm tracking-widest hover:bg-black/5 transition-all text-center">
                JOIN WAITLIST
              </Link>
              <Link href="/membership/join" className="w-full sm:w-auto bg-white border border-[#E8E2D2] text-[#985923] px-8 py-4 rounded-xl font-bold text-sm tracking-widest hover:bg-[#FAF8F3] transition-all shadow-sm text-center">
                MEMBERSHIP
              </Link>
            </div>
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
      {/* Mobile Floating Menu Button */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <Link href="/menu" className="flex items-center gap-2 px-8 py-3.5 bg-[#985923] text-white rounded-full shadow-2xl shadow-[#985923]/30 hover:scale-105 transition-transform font-bold tracking-widest text-sm border border-white/20">
          <Menu size={18} /> MENU
        </Link>
      </div>
    </div>
  );
}
