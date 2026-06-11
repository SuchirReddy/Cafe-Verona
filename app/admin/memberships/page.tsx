"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coffee, Search, Plus, Edit2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Membership {
  id: string;
  membership_number: string;
  customer_name: string;
  customer_email: string | null;
  tier: string;
  stamps_earned: number;
  expiry_date: string;
  status: string;
  created_at: string;
}

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    membership_number: "",
    customer_name: "",
    customer_email: "",
    tier: "Silver",
    stamps_earned: 0,
    expiry_date: "",
    status: "active"
  });

  const fetchMemberships = async () => {
    try {
      const response = await fetch("/api/memberships");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMemberships(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load memberships");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();

    const channel = supabase
      .channel('admin_memberships')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memberships' },
        () => {
          fetchMemberships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleRedeem = async (id: string) => {
    if (!confirm("Are you sure you want to redeem these stamps and reset to 0?")) return;
    try {
      const response = await fetch(`/api/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stamps_earned: 0 })
      });
      if (!response.ok) throw new Error("Failed to redeem stamps");
      toast.success("Stamps redeemed successfully!");
      fetchMemberships();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMembership) return;
    try {
      const response = await fetch(`/api/memberships/${editingMembership.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Failed to update membership");
      toast.success("Membership updated successfully!");
      setIsEditModalOpen(false);
      fetchMemberships();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this membership? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/memberships/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete membership");
      toast.success("Membership deleted successfully!");
      fetchMemberships();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Failed to create membership");
      toast.success("Membership created successfully!");
      setIsCreateModalOpen(false);
      fetchMemberships();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditModal = (membership: Membership) => {
    setEditingMembership(membership);
    setFormData({
      membership_number: membership.membership_number,
      customer_name: membership.customer_name,
      customer_email: membership.customer_email || "",
      tier: membership.tier,
      stamps_earned: membership.stamps_earned,
      expiry_date: membership.expiry_date,
      status: membership.status
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormData({
      membership_number: "",
      customer_name: "",
      customer_email: "",
      tier: "Silver",
      stamps_earned: 0,
      expiry_date: nextYear.toISOString().split("T")[0],
      status: "active"
    });
    setIsCreateModalOpen(true);
  };

  const filteredMemberships = memberships.filter(m => {
    const matchesSearch = m.membership_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900">Memberships</h1>
          <p className="text-coffee-600">Manage customer loyalty and membership tiers</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-coffee-900 text-cream px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-coffee-800 transition-colors shadow-sm"
        >
          <Plus size={20} />
          New Membership
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-coffee-100 flex gap-4 bg-coffee-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={20} />
            <input
              type="text"
              placeholder="Search by number or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-coffee-50 text-coffee-800 text-sm uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Membership #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Tier</th>
                <th className="px-6 py-4">Stamps</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-coffee-500">
                    <RefreshCw className="animate-spin inline-block mr-2" size={20} />
                    Loading memberships...
                  </td>
                </tr>
              ) : filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-coffee-500">
                    No memberships found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMemberships.map((membership) => (
                  <tr key={membership.id} className="hover:bg-coffee-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-coffee-900">
                      {membership.membership_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-coffee-900">{membership.customer_name}</div>
                      <div className="text-coffee-500 text-xs">{membership.customer_email || "No email"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        membership.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                        membership.tier === 'Platinum' ? 'bg-gray-200 text-gray-800' :
                        'bg-coffee-100 text-coffee-800'
                      }`}>
                        {membership.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 rounded-full ${i < membership.stamps_earned ? 'bg-gold' : 'bg-coffee-200'}`}></div>
                        ))}
                      </div>
                      <div className="text-xs text-coffee-500 mt-1">{membership.stamps_earned}/5 stamps</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        membership.status === 'active' ? 'text-green-600' : 
                        membership.status === 'expired' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {membership.status === 'active' ? <CheckCircle2 size={14} /> : 
                         membership.status === 'expired' ? <AlertCircle size={14} /> : <XCircle size={14} />}
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      {membership.stamps_earned >= 5 && (
                        <button
                          onClick={() => handleRedeem(membership.id)}
                          className="bg-gold/20 text-yellow-800 hover:bg-gold/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Redeem Reward
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(membership)}
                        className="text-coffee-600 hover:bg-coffee-100 p-1.5 rounded-lg transition-colors"
                        title="Edit Membership"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(membership.id)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete Membership"
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
      </div>

      {/* Edit/Create Modal */}
      {(isEditModalOpen || isCreateModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-coffee-100 flex justify-between items-center bg-coffee-50">
              <h2 className="text-xl font-bold font-serif text-coffee-900">
                {isEditModalOpen ? "Edit Membership" : "New Membership"}
              </h2>
              <button 
                onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}
                className="text-coffee-400 hover:text-coffee-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleSaveEdit : handleCreate} className="p-6 space-y-4">
              {isEditModalOpen && editingMembership && (
                <div className="bg-coffee-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-coffee-600">Membership Number</p>
                  <p className="font-mono font-bold text-coffee-900 text-lg">{editingMembership.membership_number}</p>
                </div>
              )}

              {isCreateModalOpen && (
                <div>
                  <label className="block text-sm font-bold text-coffee-800 mb-1">Membership Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.membership_number}
                    onChange={(e) => setFormData({...formData, membership_number: e.target.value})}
                    placeholder="Leave blank to auto-generate"
                    className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-coffee-800 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-coffee-800 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-coffee-800 mb-1">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                  >
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-800 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-coffee-800 mb-1">Stamps Earned (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.stamps_earned}
                    onChange={(e) => setFormData({...formData, stamps_earned: parseInt(e.target.value)})}
                    className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-coffee-800 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full border border-coffee-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coffee-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-coffee-100 mt-6">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setIsCreateModalOpen(false); }}
                  className="px-4 py-2 font-medium text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-coffee-900 text-cream font-bold rounded-lg hover:bg-coffee-800 transition-colors shadow-sm"
                >
                  {isEditModalOpen ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
