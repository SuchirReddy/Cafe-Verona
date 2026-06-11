"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Users, Clock, Check, Bell, X, User } from "lucide-react";
import { updateWaitlistStatus } from "./actions";

export default function AdminWaitlistPage() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchWaitlist();

    const channel = supabase
      .channel("admin_waitlist")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waitlist" },
        () => {
          fetchWaitlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await fetch("/api/waitlist");
      const data = await res.json();
      if (data.waitlist) {
        setWaitlist(data.waitlist);
      }
    } catch (error) {
      toast.error("Failed to fetch waitlist");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateWaitlistStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      fetchWaitlist();
    } catch (error) {
      toast.error("Could not update status");
    }
  };

  const activeWaitlist = waitlist.filter(w => w.status === 'waiting' || w.status === 'notified');
  const pastWaitlist = waitlist.filter(w => w.status === 'seated' || w.status === 'cancelled');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Waitlist Management</h1>
        <p className="text-coffee-600">Manage waiting customers and table assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2">
            <Clock size={20} className="text-olive" /> Currently Waiting
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-800"></div>
            </div>
          ) : activeWaitlist.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-coffee-200">
              <Users className="mx-auto text-coffee-300 mb-3" size={32} />
              <p className="text-coffee-500 font-medium">Waitlist is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeWaitlist.map((entry) => (
                <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm border border-coffee-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-coffee-100 text-coffee-800 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {entry.party_size}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-coffee-900">{entry.customer_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-coffee-500 mt-1">
                        <span>{formatDistanceToNow(new Date(entry.joined_at))} ago</span>
                        {entry.phone && <span>• {entry.phone}</span>}
                        {entry.preferred_time && <span className="font-medium text-amber-600">• Prefers {entry.preferred_time}</span>}
                        {entry.table_requested && <span className="font-medium text-olive">• Requested T{entry.table_requested}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    {entry.status === 'waiting' && (
                      <button 
                        onClick={() => handleStatusUpdate(entry.id, 'notified')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Bell size={16} /> Notify
                      </button>
                    )}
                    
                    {(entry.status === 'waiting' || entry.status === 'notified') && (
                      <button 
                        onClick={() => handleStatusUpdate(entry.id, 'seated')}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check size={16} /> Seated
                      </button>
                    )}

                    <button 
                      onClick={() => handleStatusUpdate(entry.id, 'cancelled')}
                      className="px-3 py-2 text-coffee-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                      title="Cancel"
                    >
                      <X size={20} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2 mb-6">
            <Check size={20} className="text-coffee-400" /> Recent History
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 overflow-hidden">
            {pastWaitlist.length === 0 ? (
              <div className="p-8 text-center text-coffee-500 text-sm">No recent history</div>
            ) : (
              <div className="divide-y divide-coffee-100">
                {pastWaitlist.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-4 flex justify-between items-center opacity-70">
                    <div>
                      <p className="font-medium text-coffee-900">{entry.customer_name} <span className="text-xs text-coffee-500 ml-1">({entry.party_size} px)</span></p>
                      <p className="text-xs text-coffee-400">{formatDistanceToNow(new Date(entry.joined_at))} ago</p>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${entry.status === 'seated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
