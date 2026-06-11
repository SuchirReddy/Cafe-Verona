"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, AlertTriangle, CheckCircle2, Plus, Edit2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    ingredient_name: "",
    stock: 0,
    unit: "",
    low_stock_threshold: 10
  });

  const supabase = createClient();

  useEffect(() => {
    fetchInventory();

    const channel = supabase
      .channel("admin_inventory")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        () => fetchInventory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("ingredient_name", { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ ingredient_name: "", stock: 0, unit: "", low_stock_threshold: 10 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      ingredient_name: item.ingredient_name,
      stock: Number(item.stock),
      unit: item.unit,
      low_stock_threshold: Number(item.low_stock_threshold)
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("inventory")
          .update({
            ingredient_name: formData.ingredient_name,
            stock: formData.stock,
            unit: formData.unit,
            low_stock_threshold: formData.low_stock_threshold
          })
          .eq("id", editingItem.id);
        
        if (error) throw error;
        toast.success("Ingredient updated successfully");
      } else {
        const { error } = await supabase
          .from("inventory")
          .insert([{
            ingredient_name: formData.ingredient_name,
            stock: formData.stock,
            unit: formData.unit,
            low_stock_threshold: formData.low_stock_threshold
          }]);
        
        if (error) throw error;
        toast.success("Ingredient added successfully");
      }
      handleCloseModal();
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || "Failed to save ingredient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;

    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Ingredient deleted successfully");
      fetchInventory();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ingredient");
    }
  };

  const lowStockItems = inventory.filter(item => Number(item.stock) <= Number(item.low_stock_threshold));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Inventory Management</h1>
          <p className="text-coffee-600">Monitor and manage ingredient stock levels.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Add Ingredient
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h2 className="text-red-800 font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> Low Stock Alerts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-red-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.ingredient_name}</h3>
                      <p className="text-sm text-red-600 font-medium mt-1">
                        Stock: {item.stock} {item.unit} (Threshold: {item.low_stock_threshold})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Inventory */}
          <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 overflow-hidden">
            <div className="p-6 border-b border-coffee-100 flex items-center gap-2 bg-coffee-50/50">
              <Package size={20} className="text-coffee-500" />
              <h2 className="text-lg font-bold text-coffee-900">All Ingredients</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-coffee-900">
                <thead className="bg-coffee-50 text-coffee-700 uppercase font-medium border-b border-coffee-200">
                  <tr>
                    <th className="px-6 py-4">Ingredient Name</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Current Stock</th>
                    <th className="px-6 py-4 text-right">Threshold</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-100">
                  {inventory.map((item) => {
                    const isLow = Number(item.stock) <= Number(item.low_stock_threshold);
                    
                    return (
                      <tr key={item.id} className={`hover:bg-coffee-50/50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4 font-bold">{item.ingredient_name}</td>
                        <td className="px-6 py-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle size={14} /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 size={14} /> Good
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${isLow ? 'text-red-600' : ''}`}>
                          {item.stock} <span className="text-gray-500 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">
                          {item.low_stock_threshold} <span className="text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No ingredients found. Add some to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-xl text-gray-900">
                {editingItem ? "Edit Ingredient" : "Add Ingredient"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={formData.ingredient_name}
                  onChange={(e) => setFormData({...formData, ingredient_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                  placeholder="e.g. Coffee Beans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                    placeholder="e.g. kg, L, units"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({...formData, low_stock_threshold: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-xl font-medium hover:bg-coffee-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
