"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Clock, Info } from "lucide-react";
import { MenuItem } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cn } from "@/lib/utils";
import toast from "react-hot-toast";

import Link from "next/link";

interface MenuCardProps {
  item: MenuItem;
  previewOnly?: boolean;
}

export default function MenuCard({ item, previewOnly = false }: MenuCardProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(item, quantity, specialInstructions);
    toast.success(`Added ${quantity} ${item.name} to cart`);
    setOpen(false);
    setQuantity(1);
    setSpecialInstructions("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="glass-card rounded-2xl overflow-hidden cursor-pointer card-hover flex flex-col h-full">
          <div className="relative h-48 w-full bg-coffee-200">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-coffee-600">
                No Image
              </div>
            )}
            {item.dietary_badges && item.dietary_badges.length > 0 && (
              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                {item.dietary_badges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-white/90 text-coffee-900 text-xs px-2 py-1 rounded-full font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold font-serif">{item.name}</h3>
              <span className="font-bold text-olive">{formatPrice(item.price)}</span>
            </div>
            <p className="text-coffee-700 text-sm mb-4 line-clamp-2 flex-grow">
              {item.description}
            </p>
            {previewOnly ? (
              <button className="w-full bg-white border border-coffee-800 text-coffee-800 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-coffee-50 transition-colors mt-auto">
                View Full Menu
              </button>
            ) : (
              <button className="w-full bg-coffee-800 text-cream py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-coffee-900 transition-colors mt-auto">
                <Plus size={18} /> Add to order
              </button>
            )}
          </div>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-cream rounded-2xl shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="relative h-64 w-full bg-coffee-200">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <Dialog.Close className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>
          
          <div className="p-6">
            <Dialog.Title className="text-2xl font-bold font-serif mb-2 flex justify-between items-center">
              <span>{item.name}</span>
              <span className="text-olive">{formatPrice(item.price)}</span>
            </Dialog.Title>
            
            <Dialog.Description className="text-coffee-700 mb-6">
              {item.description}
            </Dialog.Description>

            <div className="flex gap-4 mb-6 text-sm text-coffee-800">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{item.preparation_time_minutes} mins prep</span>
              </div>
              {item.allergen_list && item.allergen_list.length > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <Info size={16} />
                  <span>Allergens: {item.allergen_list.join(", ")}</span>
                </div>
              )}
            </div>

            {previewOnly ? (
              <div className="pt-4 border-t border-coffee-200 mt-6">
                <Link 
                  href="/menu"
                  className="w-full bg-coffee-800 text-cream py-3 rounded-xl font-medium hover:bg-coffee-900 transition-colors flex items-center justify-center"
                >
                  Explore Full Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Special Instructions</label>
                  <textarea
                    className="w-full border-coffee-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="e.g. extra hot, no sugar..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-coffee-200">
                  <div className="flex items-center gap-3 bg-white rounded-xl border border-coffee-200 p-1">
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-900"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-coffee-50 text-coffee-900"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="bg-coffee-800 text-cream px-8 py-3 rounded-xl font-medium hover:bg-coffee-900 transition-colors flex-1 ml-4"
                  >
                    Add to Cart - {formatPrice(item.price * quantity)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
