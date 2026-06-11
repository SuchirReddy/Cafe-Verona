export interface Table {
  id: string;
  table_number: number;
  qr_code_url: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_available: boolean;
  stock_quantity: number | null;
  preparation_time_minutes: number;
  allergen_list: string[];
  dietary_badges: string[];
  time_based_rules: any;
  created_at: string;
}

export interface CartItem {
  id: string; // local id for the cart item
  menuItem: MenuItem;
  quantity: number;
  special_requests?: string;
  assigned_person?: string;
}

export interface Order {
  id: string;
  table_number: number;
  customer_name: string | null;
  special_instructions: string | null;
  status: 'pending' | 'preparing' | 'served' | 'completed';
  total_amount: number;
  scheduled_for: string | null;
  estimated_ready_time: string | null;
  created_at: string;
  order_number?: number;
  order_type?: "dine-in" | "delivery";
  delivery_address?: string | null;
  customer_phone?: string | null;
  delivery_fee?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_requests: string | null;
  assigned_person: string | null;
}
