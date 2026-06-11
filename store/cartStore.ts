import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '@/types';
import { generateAnonymousId } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  tableNumber: number | null;
  setTableNumber: (table: number) => void;
  orderType: "dine-in" | "delivery";
  setOrderType: (type: "dine-in" | "delivery") => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  
  addItem: (item: MenuItem, quantity?: number, specialRequests?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  assignPerson: (id: string, personName: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      orderType: "dine-in",
      deliveryAddress: "",
      customerName: "",
      customerPhone: "",

      setTableNumber: (table) => set({ tableNumber: table }),
      setOrderType: (type) => set({ orderType: type }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      addItem: (menuItem, quantity = 1, specialRequests = '') => {
        set((state) => {
          // Check if identical item (same menu item and same special requests) exists
          const existingItemIndex = state.items.findIndex(
            (item) => item.menuItem.id === menuItem.id && item.special_requests === specialRequests
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                id: generateAnonymousId(),
                menuItem,
                quantity,
                special_requests: specialRequests,
              },
            ],
          };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      assignPerson: (id, personName) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, assigned_person: personName } : item
          ),
        }));
      },
    }),
    {
      name: 'cafe-cart-storage',
    }
  )
);
