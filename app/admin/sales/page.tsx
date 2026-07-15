"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

export default function AdminSalesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all">("all");

  const COLORS = ['#65432d', '#99643d', '#c59b5f', '#d2b47e', '#556B2F'];

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sales?period=${period}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [period]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Sales Analytics</h1>
          <p className="text-coffee-600">Track your cafe's performance.</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-coffee-200 p-1">
          {(["today", "week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                period === p 
                  ? "bg-coffee-800 text-cream" 
                  : "text-coffee-600 hover:bg-coffee-50"
              }`}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200 flex items-center gap-6">
              <div className="w-16 h-16 bg-olive/10 text-olive rounded-full flex items-center justify-center shrink-0">
                <DollarSign size={32} />
              </div>
              <div>
                <p className="text-coffee-500 font-medium mb-1">Total Revenue</p>
                <h2 className="text-4xl font-bold font-serif text-coffee-900">{formatPrice(data.totalSales)}</h2>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200 flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <ShoppingBag size={32} />
              </div>
              <div>
                <p className="text-coffee-500 font-medium mb-1">Total Orders</p>
                <h2 className="text-4xl font-bold font-serif text-coffee-900">{data.orderCount}</h2>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Per Table Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200">
              <h3 className="text-lg font-bold text-coffee-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-coffee-500" /> Revenue by Source
              </h3>
              <div className="h-80 w-full">
                {data.salesPerTable.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesPerTable} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="table" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        cursor={{fill: '#f3f4f6'}}
                        formatter={(value: any) => [formatPrice(value), "Revenue"]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="total" fill="#c59b5f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-coffee-400">No data available</div>
                )}
              </div>
            </div>

            {/* Popular Items Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-200">
              <h3 className="text-lg font-bold text-coffee-900 mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-coffee-500" /> Top Popular Items
              </h3>
              <div className="h-80 w-full">
                {data.popularItems.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.popularItems}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.popularItems.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value} units`, "Sold"]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-coffee-400">No data available</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
