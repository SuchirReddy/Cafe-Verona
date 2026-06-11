"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MenuCategory, MenuItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Power, PowerOff } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { saveMenuItem, deleteMenuItem, toggleMenuItemAvailability } from "./actions";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    image_url: "",
    preparation_time_minutes: "5",
    allergen_list: "",
    dietary_badges: "",
    stock_quantity: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([
      supabase.from("menu_items").select("*, menu_categories(name)").order("created_at", { ascending: false }),
      supabase.from("menu_categories").select("*").order("display_order"),
    ]);

    if (itemsRes.data) setItems(itemsRes.data as any[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category_id: item.category_id,
        description: item.description || "",
        image_url: item.image_url || "",
        preparation_time_minutes: item.preparation_time_minutes.toString(),
        allergen_list: item.allergen_list?.join(", ") || "",
        dietary_badges: item.dietary_badges?.join(", ") || "",
        stock_quantity: item.stock_quantity?.toString() || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: "",
        category_id: categories.length > 0 ? categories[0].id : "",
        description: "",
        image_url: "",
        preparation_time_minutes: "5",
        allergen_list: "",
        dietary_badges: "",
        stock_quantity: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        description: formData.description,
        image_url: formData.image_url,
        preparation_time_minutes: parseInt(formData.preparation_time_minutes),
        allergen_list: formData.allergen_list ? formData.allergen_list.split(",").map(s => s.trim()).filter(Boolean) : [],
        dietary_badges: formData.dietary_badges ? formData.dietary_badges.split(",").map(s => s.trim()).filter(Boolean) : [],
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
      };

      if (editingItem) {
        payload.id = editingItem.id;
      }

      await saveMenuItem(payload);
      toast.success("Menu item saved successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save menu item");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(id);
        toast.success("Item deleted");
        fetchData();
      } catch (error: any) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleToggle = async (id: string, isAvailable: boolean) => {
    try {
      await toggleMenuItemAvailability(id, !isAvailable);
      toast.success(`Item ${!isAvailable ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to toggle availability");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Menu Management</h1>
          <p className="text-coffee-600">Manage your cafe's menu items.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-coffee-800 text-cream px-4 py-2 rounded-xl font-medium hover:bg-coffee-900 flex items-center gap-2"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-coffee-900">
              <thead className="bg-coffee-50 text-coffee-700 uppercase font-medium border-b border-coffee-200">
                <tr>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-coffee-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-coffee-500 text-xs truncate max-w-[200px]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">{item.menu_categories?.name}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(item.price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggle(item.id, item.is_available)}
                        className="p-2 text-coffee-600 hover:bg-coffee-100 rounded-lg transition-colors"
                        title="Toggle Availability"
                      >
                        {item.is_available ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cream p-6 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
            <Dialog.Title className="text-2xl font-bold font-serif mb-6 text-coffee-900">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </Dialog.Title>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white">
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preparation Time (mins) *</label>
                  <input required type="number" value={formData.preparation_time_minutes} onChange={e => setFormData({...formData, preparation_time_minutes: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Allergens (comma separated)</label>
                  <input type="text" value={formData.allergen_list} onChange={e => setFormData({...formData, allergen_list: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" placeholder="e.g. Dairy, Nuts" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dietary Badges (comma separated)</label>
                  <input type="text" value={formData.dietary_badges} onChange={e => setFormData({...formData, dietary_badges: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" placeholder="e.g. Vegan, Gluten-Free" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white" placeholder="Leave empty for infinite" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-coffee-200">
                <Dialog.Close type="button" className="px-6 py-2.5 border border-coffee-300 text-coffee-800 rounded-xl font-medium hover:bg-coffee-100 transition-colors">
                  Cancel
                </Dialog.Close>
                <button type="submit" className="px-6 py-2.5 bg-coffee-800 text-cream rounded-xl font-medium hover:bg-coffee-900 transition-colors">
                  Save Item
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
