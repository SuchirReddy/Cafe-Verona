"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem, MenuItem } from "@/types";
import { formatPrice, formatOrderNumber } from "@/lib/utils";
import { format } from "date-fns";
import { FileText, Download, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

type OrderWithItems = Order & {
  order_items: (OrderItem & { menu_items: MenuItem })[];
};

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              menu_items (*)
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setOrder(data as OrderWithItems);
      } catch (error) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const generatePDF = () => {
    if (!order) return;

    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      const safePrice = (amount: number) => `Rs. ${amount.toFixed(2)}`;

      // Fonts & Colors
      doc.setFont("helvetica", "bold");
      doc.setTextColor(101, 67, 45); // Coffee brown

      // Header
      doc.setFontSize(24);
      doc.text("Cafe Verona", 105, y, { align: "center" });
      y += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Official Receipt", 105, y, { align: "center" });
      y += 20;

      // Order Details
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Order ID:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(order.id, margin + 25, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Date:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(format(new Date(order.created_at), "PPP 'at' p"), margin + 15, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Table:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(order.table_number.toString(), margin + 15, y);
      y += 15;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, 190, y);
      y += 10;

      // Items Header
      doc.setFont("helvetica", "bold");
      doc.text("Qty", margin, y);
      doc.text("Item", margin + 15, y);
      doc.text("Price", 190, y, { align: "right" });
      y += 8;
      
      doc.line(margin, y, 190, y);
      y += 8;

      // Items List
      doc.setFont("helvetica", "normal");
      order.order_items.forEach((item) => {
        doc.text(item.quantity.toString(), margin, y);
        // Ensure menu item name doesn't contain unrenderable characters, though mostly safe
        const itemName = item.menu_items?.name ? item.menu_items.name.replace('ř', 'r') : "Unknown Item";
        doc.text(itemName, margin + 15, y);
        doc.text(safePrice(item.unit_price * item.quantity), 190, y, { align: "right" });
        y += 6;
        
        if (item.special_requests || item.assigned_person) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const notes = [];
          if (item.special_requests) notes.push(`Note: ${item.special_requests}`);
          if (item.assigned_person) notes.push(`For: ${item.assigned_person}`);
          doc.text(notes.join(" | "), margin + 15, y);
          y += 6;
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
        }
      });

      y += 5;
      doc.line(margin, y, 190, y);
      y += 10;

      // Special Instructions for order
      if (order.special_instructions) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        // basic wrapping or just truncate to avoid PDF errors for long strings
        const safeInstructions = order.special_instructions.substring(0, 80);
        doc.text(`Order Notes: ${safeInstructions}`, margin, y);
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      }

      // Total
      if (order.delivery_fee && order.delivery_fee > 0) {
        doc.text("Delivery Fee", 20, y);
        doc.text(safePrice(order.delivery_fee), 190, y, { align: "right" });
        y += 8;
      }

      doc.line(20, y, 190, y);
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Total Amount", 20, y);
      doc.text(safePrice(order.total_amount), 190, y, { align: "right" });

      // Footer
      y += 30;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your visit!", 105, y, { align: "center" });

      // Save
      doc.save(`receipt-${formatOrderNumber(order.id, order.created_at, order.order_number)}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 mb-8 font-medium">
        <ArrowLeft size={18} /> Back to Orders
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-coffee-200 p-8 md:p-12 relative overflow-hidden">
        {/* Receipt Edge Decoration */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, #ffffff 11px)', backgroundSize: '20px 20px' }}></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-coffee-800 mb-4" size={40} />
            <p className="text-coffee-600 font-medium">Loading receipt details...</p>
          </div>
        ) : !order ? (
          <div className="text-center py-20 text-coffee-500">
            Order not found.
          </div>
        ) : (
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden shadow-sm border border-coffee-200">
                <img src="/logo.png" alt="Cafe Verona Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold font-serif text-coffee-900 mb-1">Cafe Veřona</h1>
              <p className="text-coffee-500">Official Receipt</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm bg-coffee-50 p-6 rounded-xl border border-coffee-100">
              <div>
                <p className="text-coffee-500 font-medium mb-1">Order ID</p>
                <p className="font-mono text-coffee-900">{formatOrderNumber(order.id, order.created_at, order.order_number)}</p>
              </div>
              <div>
                <p className="text-coffee-500 font-medium mb-1">Date</p>
                <p className="text-coffee-900">{format(new Date(order.created_at), "PPp")}</p>
              </div>
              <div>
                <p className="text-coffee-500 font-medium mb-1">Table Number</p>
                <p className="font-bold text-coffee-900 text-lg">{order.table_number}</p>
              </div>
              <div>
                <p className="text-coffee-500 font-medium mb-1">Status</p>
                <span className="capitalize font-medium text-coffee-900 px-2 py-1 bg-white rounded-md border border-coffee-200 inline-block">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-coffee-900 border-b border-coffee-200 pb-2 mb-4">Items Ordered</h3>
              <ul className="space-y-4">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <span className="font-bold text-coffee-900 w-6">{item.quantity}x</span>
                      <div>
                        <p className="font-medium text-coffee-900">{item.menu_items?.name}</p>
                        {(item.special_requests || item.assigned_person) && (
                          <div className="flex gap-2 mt-1 text-xs text-coffee-500">
                            {item.special_requests && <span>Note: {item.special_requests}</span>}
                            {item.assigned_person && <span>For: {item.assigned_person}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-coffee-900">{formatPrice(item.unit_price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {order.special_instructions && (
              <div className="mb-8 bg-amber-50 text-amber-900 p-4 rounded-xl text-sm border border-amber-100">
                <strong>General Notes:</strong> {order.special_instructions}
              </div>
            )}

            <div className="mb-8 space-y-2">
              {order.delivery_fee !== null && order.delivery_fee !== undefined && order.delivery_fee > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-coffee-600">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold text-coffee-900 pt-4 border-t border-coffee-200">
                <span>Total Amount</span>
                <span className="text-olive">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="w-full bg-coffee-800 hover:bg-coffee-900 text-cream py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-md"
            >
              <Download size={24} /> Download PDF Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
