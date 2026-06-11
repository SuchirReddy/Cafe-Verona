"use client";

import { useState } from "react";
import { resetDemoData } from "./actions";
import { RotateCcw, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminDemoPage() {
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm("WARNING: This will delete all orders, waitlist entries, and feedback. It will also reset inventory to default seed values. Are you absolutely sure?")) {
      return;
    }

    setIsResetting(true);
    try {
      await resetDemoData();
      toast.success("Demo data reset successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to reset demo data.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center">
      <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} />
        </div>
        
        <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-4">Reset Demo Data</h1>
        
        <p className="text-coffee-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          This action will purge all transactional data from the database to restore the cafe to its initial fresh state. 
        </p>

        <div className="bg-red-50 text-red-800 text-left p-6 rounded-2xl mb-8 max-w-lg mx-auto">
          <h3 className="font-bold mb-2">What will happen:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm font-medium">
            <li>Delete all Customer Orders & Order Items</li>
            <li>Delete all Waitlist Entries</li>
            <li>Delete all Feedback Ratings</li>
            <li>Reset Loyalty Stamps to zero</li>
            <li>Restore Inventory Stock to default levels</li>
          </ul>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors w-full sm:w-auto mx-auto shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className={isResetting ? "animate-spin" : ""} size={24} />
          {isResetting ? "Resetting Database..." : "Proceed with Reset"}
        </button>
      </div>
    </div>
  );
}
