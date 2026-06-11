"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MenuCategory } from "@/types";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { saveCategory, deleteCategory } from "./actions";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    display_order: "0",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleOpenModal = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        display_order: category.display_order.toString(),
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        display_order: (categories.length * 10).toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        display_order: parseInt(formData.display_order) || 0,
      };

      if (editingCategory) {
        payload.id = editingCategory.id;
      }

      await saveCategory(payload);
      toast.success(editingCategory ? "Category updated" : "Category created");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        toast.success("Category deleted");
        fetchCategories();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Categories</h1>
          <p className="text-coffee-600">Manage your menu categories and their display order.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-coffee-800 text-cream px-4 py-2 rounded-xl font-medium hover:bg-coffee-900 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 overflow-hidden">
          <table className="w-full text-left text-sm text-coffee-900">
            <thead className="bg-coffee-50 text-coffee-700 uppercase font-medium border-b border-coffee-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Order</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-coffee-500">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-coffee-50/50">
                    <td className="px-6 py-4 text-center font-medium text-coffee-500">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cream p-6 rounded-3xl shadow-xl w-full max-w-md z-50">
            <Dialog.Title className="text-2xl font-bold font-serif mb-6 text-coffee-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </Dialog.Title>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-coffee-800">Category Name *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
                  placeholder="e.g. Hot Drinks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-coffee-800">Display Order *</label>
                <input 
                  required 
                  type="number" 
                  value={formData.display_order} 
                  onChange={e => setFormData({...formData, display_order: e.target.value})} 
                  className="w-full rounded-xl border border-coffee-200 p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 outline-none" 
                />
                <p className="text-xs text-coffee-500 mt-1">Lower numbers appear first.</p>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-coffee-200">
                <Dialog.Close type="button" className="px-6 py-2.5 border border-coffee-300 text-coffee-800 rounded-xl font-medium hover:bg-coffee-100 transition-colors">
                  Cancel
                </Dialog.Close>
                <button type="submit" className="px-6 py-2.5 bg-coffee-800 text-cream rounded-xl font-medium hover:bg-coffee-900 transition-colors">
                  Save Category
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
