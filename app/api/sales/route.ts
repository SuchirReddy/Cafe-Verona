import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    
    const supabase = createAdminClient();
    
    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      // all_time
      startDate = new Date(0); 
    }

    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, table_number, order_type, total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .neq('status', 'cancelled');

    if (ordersError) throw ordersError;

    // Fetch order items for these orders
    const orderIds = orders?.map(o => o.id) || [];
    let orderItems: any[] = [];
    
    if (orderIds.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity, menu_item_id, menu_items(name)')
        .in('order_id', orderIds);
        
      if (itemsError) throw itemsError;
      orderItems = itemsData || [];
    }

    // Calculate metrics
    const totalSales = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const orderCount = orders?.length || 0;

    // Sales per table
    const tableSalesMap: Record<string, number> = {};
    orders?.forEach(o => {
      const t = o.order_type === 'delivery' ? 'Home Delivery' : `Table ${o.table_number}`;
      tableSalesMap[t] = (tableSalesMap[t] || 0) + Number(o.total_amount);
    });
    
    const salesPerTable = Object.entries(tableSalesMap)
      .map(([table, total]) => ({ table, total }))
      .sort((a, b) => b.total - a.total);

    // Popular items
    const itemQuantityMap: Record<string, { name: string, quantity: number }> = {};
    orderItems.forEach(item => {
      const name = item.menu_items?.name || 'Unknown';
      if (!itemQuantityMap[item.menu_item_id]) {
        itemQuantityMap[item.menu_item_id] = { name, quantity: 0 };
      }
      itemQuantityMap[item.menu_item_id].quantity += item.quantity;
    });

    const popularItems = Object.values(itemQuantityMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(item => ({ name: item.name, value: item.quantity })); // 'value' for Recharts PieChart

    return NextResponse.json({
      totalSales,
      orderCount,
      salesPerTable,
      popularItems
    });
  } catch (error: any) {
    console.error('Sales analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch sales data' }, { status: 500 });
  }
}
