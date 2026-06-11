"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { ShoppingBag, X, Minus, Plus, Trash2, Calendar, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    setTableNumber,
    orderType,
    setOrderType,
    deliveryAddress,
    setDeliveryAddress,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemCount,
    assignPerson,
    clearCart,
  } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [splitBill, setSplitBill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [isVerifyingMembership, setIsVerifyingMembership] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [discountRules, setDiscountRules] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const fetchRules = async () => {
      const { data } = await supabase.from('discount_rules').select('*').eq('is_active', true);
      if (data) setDiscountRules(data);
    };
    fetchRules();
  }, []);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  let discountedSubtotal = subtotal;
  let activeDiscount: any = null;

  if (isMounted && discountRules.length > 0) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}:00`;

    const activeRule = discountRules.find(rule => {
      const isAfterStart = !rule.start_time || currentTimeStr >= rule.start_time;
      const isBeforeEnd = !rule.end_time || currentTimeStr <= rule.end_time;
      return isAfterStart && isBeforeEnd;
    });

    if (activeRule) {
      activeDiscount = activeRule;
      let calculatedTotal = 0;
      items.forEach(item => {
        const itemTotal = item.menuItem.price * item.quantity;
        if (!activeRule.applicable_category_id || item.menuItem.category_id === activeRule.applicable_category_id) {
          calculatedTotal += itemTotal * (1 - (activeRule.discount_percent / 100));
        } else {
          calculatedTotal += itemTotal;
        }
      });
      discountedSubtotal = calculatedTotal;
    }
  }

  let membershipDiscount = 0;
  if (activeMembership) {
    if (activeMembership.tier === 'Gold') {
      membershipDiscount = discountedSubtotal * 0.10; // 10% off
    } else if (activeMembership.tier === 'Platinum') {
      membershipDiscount = discountedSubtotal * 0.20; // 20% off
    }
  }

  discountedSubtotal -= membershipDiscount;

  let deliveryFee = orderType === 'delivery' && discountedSubtotal < 500 ? 50 : 0;
  if (activeMembership && activeMembership.tier === 'Platinum') {
    deliveryFee = 0; // Free delivery for Platinum
  }
  const finalTotal = discountedSubtotal + deliveryFee;

  const now = new Date();
  const minDateTime = isMounted ? new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : undefined;

  const handleVerifyMembership = async () => {
    if (!membershipNumber.trim()) return;
    setIsVerifyingMembership(true);
    setMembershipError("");
    try {
      const response = await fetch(`/api/memberships?membership_number=${encodeURIComponent(membershipNumber.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      if (data && data.length > 0 && data[0].status === 'active') {
        setActiveMembership(data[0]);
        toast.success(`Membership applied! (${data[0].tier} Tier)`);
      } else {
        setMembershipError("Invalid or inactive membership");
        setActiveMembership(null);
      }
    } catch (err: any) {
      setMembershipError("Failed to verify membership");
      setActiveMembership(null);
    } finally {
      setIsVerifyingMembership(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (orderType === "dine-in" && !tableNumber) {
      toast.error("Please select a table");
      return;
    }
    if (orderType === "delivery") {
      if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
        toast.error("Name, Phone, and Address are required for delivery");
        return;
      }
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: orderType,
          table_number: orderType === "dine-in" ? tableNumber : null,
          customer_name: customerName,
          customer_phone: orderType === "delivery" ? customerPhone : null,
          delivery_address: orderType === "delivery" ? deliveryAddress : null,
          delivery_fee: deliveryFee,
          special_instructions: specialInstructions,
          scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          items: items.map((item) => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            unit_price: item.menuItem.price,
            special_requests: item.special_requests,
            assigned_person: item.assigned_person,
          })),
          total_amount: finalTotal,
          membership_number: membershipNumber.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order");
      }

      const data = await response.json();
      clearCart();
      setIsOpen(false);
      toast.success("Order placed successfully!");
      
      const queryParams = new URLSearchParams({ id: data.orderId });
      if (data.stampUpdate) {
        queryParams.set("stamps", data.stampUpdate.newStamps);
        if (data.stampUpdate.freeCoffeeEarned) {
          queryParams.set("freeCoffee", "true");
        }
      }
      router.push(`/order/confirmation?${queryParams.toString()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        <button className="relative bg-coffee-800 text-cream p-3 rounded-full hover:bg-coffee-900 transition-colors shadow-lg">
          <ShoppingBag size={24} />
          {isMounted && itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </Drawer.Trigger>
      
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
        <Drawer.Content className="bg-cream flex flex-col rounded-l-[2rem] h-full w-[400px] max-w-[90vw] mt-24 fixed bottom-0 right-0 z-50 outline-none">
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <Drawer.Title className="text-2xl font-bold font-serif">Your Order</Drawer.Title>
              <Drawer.Close className="p-2 hover:bg-coffee-100 rounded-full transition-colors">
                <X size={24} />
              </Drawer.Close>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-coffee-400 space-y-4">
                  <ShoppingBag size={64} opacity={0.5} />
                  <p className="text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="bg-white p-4 rounded-2xl border border-coffee-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold">{item.menuItem.name}</h4>
                            {item.special_requests && (
                              <p className="text-sm text-coffee-600 italic">Note: {item.special_requests}</p>
                            )}
                            <div className="text-olive font-medium mt-1">
                              {formatPrice(item.menuItem.price * item.quantity)}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 h-fit"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-coffee-100">
                          <div className="flex items-center gap-2 bg-coffee-50 rounded-lg p-1">
                            <button
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-coffee-900 shadow-sm"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-coffee-900 shadow-sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          {splitBill && (
                            <div className="flex-1 ml-4 relative">
                              <User size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-coffee-400" />
                              <input
                                type="text"
                                placeholder="For who?"
                                value={item.assigned_person || ""}
                                onChange={(e) => assignPerson(item.id, e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 text-sm bg-coffee-50 border border-coffee-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-coffee-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-coffee-200">
                    <div className="flex bg-coffee-50 p-1 rounded-xl">
                      <button 
                        onClick={() => setOrderType('dine-in')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${orderType === 'dine-in' ? 'bg-coffee-800 text-cream shadow' : 'text-coffee-600 hover:bg-coffee-100'}`}
                      >
                        Dine-in
                      </button>
                      <button 
                        onClick={() => setOrderType('delivery')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${orderType === 'delivery' ? 'bg-coffee-800 text-cream shadow' : 'text-coffee-600 hover:bg-coffee-100'}`}
                      >
                        Home Delivery
                      </button>
                    </div>

                    {orderType === "dine-in" ? (
                      <div>
                        <label className="block text-sm font-medium mb-1 text-coffee-800 flex items-center gap-1">Table Number</label>
                        <select
                          value={tableNumber || ""}
                          onChange={(e) => setTableNumber(parseInt(e.target.value))}
                          className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                        >
                          <option value="" disabled>Select Table</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n} value={n}>Table {n}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        {discountedSubtotal >= 500 ? (
                          <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg border border-green-200 text-center">
                            🎉 You qualify for FREE Delivery!
                          </div>
                        ) : (
                          <div className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg border border-blue-200 text-center">
                            Add {formatPrice(500 - discountedSubtotal)} more for FREE Delivery! (Fee: ₹50)
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium mb-1 text-coffee-800">Phone Number *</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-coffee-800">Delivery Address *</label>
                          <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Full delivery address"
                            rows={2}
                            className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none resize-none"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-1 text-coffee-800">Your Name {orderType === "dine-in" && "(Optional)"}{orderType === "delivery" && "*"}</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-coffee-800">Membership Number (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={membershipNumber}
                          onChange={(e) => {
                            setMembershipNumber(e.target.value.toUpperCase());
                            setActiveMembership(null);
                            setMembershipError("");
                          }}
                          placeholder="CAFE-XXXX"
                          className="flex-1 border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none font-mono uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyMembership}
                          disabled={!membershipNumber.trim() || isVerifyingMembership}
                          className="bg-coffee-800 text-cream px-4 rounded-lg text-sm font-bold hover:bg-coffee-900 disabled:opacity-50"
                        >
                          {isVerifyingMembership ? "..." : "Apply"}
                        </button>
                      </div>
                      {membershipError && <p className="text-red-500 text-xs mt-1">{membershipError}</p>}
                      {activeMembership && <p className="text-green-600 text-xs mt-1 font-bold">{activeMembership.tier} Tier Applied</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-coffee-800">Order Notes</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any general instructions for the kitchen?"
                        rows={2}
                        className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-coffee-800 flex items-center gap-1">
                        <Calendar size={14} /> Schedule for later
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        min={minDateTime}
                        className="w-full border border-coffee-200 rounded-lg p-2.5 bg-coffee-50 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input 
                        type="checkbox" 
                        checked={splitBill}
                        onChange={(e) => setSplitBill(e.target.checked)}
                        className="w-4 h-4 rounded text-coffee-600 focus:ring-coffee-500 accent-coffee-800"
                      />
                      <span className="text-sm font-medium text-coffee-800">Split bill (assign items to people)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-coffee-300">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-coffee-800">Total</span>
                <div className="text-right">
                  {activeDiscount && (
                    <div className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mb-1 border border-amber-200 inline-block">
                      {activeDiscount.name} ({activeDiscount.discount_percent}% off)
                    </div>
                  )}
                  {activeMembership && membershipDiscount > 0 && (
                    <div className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full mb-1 border border-yellow-200 inline-block ml-2">
                      {activeMembership.tier} Discount: -{formatPrice(membershipDiscount)}
                    </div>
                  )}
                  {orderType === 'delivery' && deliveryFee > 0 ? (
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-1 border border-blue-200 inline-block ml-2">
                      + Delivery: {formatPrice(deliveryFee)}
                    </div>
                  ) : orderType === 'delivery' && activeMembership?.tier === 'Platinum' ? (
                    <div className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mb-1 border border-green-200 inline-block ml-2">
                      + Free Platinum Delivery
                    </div>
                  ) : null}
                  <div className="flex items-center justify-end gap-2">
                    {(activeDiscount || membershipDiscount > 0) && (
                      <span className="text-sm text-coffee-400 line-through">{formatPrice(subtotal + (orderType === 'delivery' && !activeMembership?.tier?.includes('Platinum') ? 50 : 0))}</span>
                    )}
                    <span className="text-2xl font-bold font-serif text-olive">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || isSubmitting}
                className="w-full bg-coffee-800 text-cream py-4 rounded-xl font-bold text-lg hover:bg-coffee-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
