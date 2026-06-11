"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tag, Plus, Trash2, Clock, Check, X, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";

interface DiscountRule {
  id: string;
  name: string;
  discount_percent: number;
  start_time: string | null;
  end_time: string | null;
  applicable_category_id: string | null;
  is_active: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
}

export default function AdminDiscountsPage() {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const [rulesRes, catRes] = await Promise.all([
      supabase.from("discount_rules").select("*").order("name"),
      supabase.from("menu_categories").select("*").order("display_order")
    ]);
    
    if (rulesRes.data) setRules(rulesRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("discount_rules")
        .update({ is_active: !currentStatus })
        .eq("id", id);
        
      if (error) throw error;
      toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'}`);
      setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
    } catch (error) {
      toast.error("Failed to update rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount rule?")) return;
    
    try {
      const { error } = await supabase
        .from("discount_rules")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      toast.success("Rule deleted successfully");
      setRules(rules.filter(r => r.id !== id));
    } catch (error) {
      toast.error("Failed to delete rule");
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !discountPercent) {
      toast.error("Name and Discount Percentage are required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("discount_rules")
        .insert({
          name,
          discount_percent: parseFloat(discountPercent),
          start_time: startTime || null,
          end_time: endTime || null,
          applicable_category_id: categoryId || null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Discount rule created successfully");
      setRules([...rules, data]);
      setIsModalOpen(false);
      
      // Reset form
      setName("");
      setDiscountPercent("");
      setStartTime("");
      setEndTime("");
      setCategoryId("");
    } catch (error) {
      toast.error("Failed to create discount rule");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 flex items-center gap-3">
            <Tag className="text-coffee-600" /> Discounts & Promos
          </h1>
          <p className="text-coffee-600 mt-2">Manage happy hours and category discounts.</p>
        </div>
        
        <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-coffee-800 text-cream px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-coffee-900 transition-colors shadow-sm">
              <Plus size={20} /> Add New Rule
            </button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-cream rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-2xl font-bold font-serif text-coffee-900">
                  New Discount Rule
                </Dialog.Title>
                <Dialog.Close className="p-2 hover:bg-coffee-100 rounded-full transition-colors text-coffee-600">
                  <X size={20} />
                </Dialog.Close>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-800 mb-1">Promo Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Happy Hour Coffee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-coffee-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-coffee-800 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="20"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full border border-coffee-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-coffee-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-coffee-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-coffee-800 mb-1">Applicable Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-coffee-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="flex-1 bg-white border border-coffee-200 text-coffee-800 py-3 rounded-xl font-medium hover:bg-coffee-50 transition-colors">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button type="submit" className="flex-1 bg-coffee-800 text-cream py-3 rounded-xl font-medium hover:bg-coffee-900 transition-colors shadow-sm">
                    Create Rule
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-coffee-800" size={40} />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white/60 rounded-3xl p-16 text-center border border-white">
          <Tag className="mx-auto text-coffee-300 mb-4" size={48} />
          <h3 className="text-xl font-medium text-coffee-900 mb-2">No discount rules</h3>
          <p className="text-coffee-500">Create your first happy hour or promotion to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rules.map((rule) => {
            const categoryName = categories.find(c => c.id === rule.applicable_category_id)?.name || "All Categories";
            
            return (
              <div key={rule.id} className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-coffee-900">{rule.name}</h3>
                    <span className="inline-block mt-1 text-sm font-medium bg-olive/10 text-olive px-2.5 py-0.5 rounded-full">
                      {rule.discount_percent}% OFF
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      rule.is_active ? 'bg-olive' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-3 flex-grow mt-2">
                  <div className="flex items-center gap-2 text-coffee-600 text-sm">
                    <Clock size={16} />
                    <span>
                      {rule.start_time && rule.end_time 
                        ? `${rule.start_time.slice(0, 5)} - ${rule.end_time.slice(0, 5)} daily` 
                        : "Always active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-coffee-600 text-sm">
                    <Tag size={16} />
                    <span>Applies to: <strong className="text-coffee-800">{categoryName}</strong></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-coffee-50 flex justify-end">
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
