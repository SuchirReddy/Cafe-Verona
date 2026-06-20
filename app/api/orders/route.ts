import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const {
      table_number,
      order_type,
      delivery_address,
      customer_phone,
      delivery_fee,
      customer_name,
      special_instructions,
      scheduled_for,
      items,
      total_amount,
      membership_number
    } = body;

    if (scheduled_for) {
      const scheduledDate = new Date(scheduled_for);
      const now = new Date();
      now.setMinutes(now.getMinutes() - 5); // 5 minute buffer
      if (scheduledDate < now) {
        return NextResponse.json({ error: 'Scheduled time cannot be in the past' }, { status: 400 });
      }
    }

    // 1. Fetch menu items to get prep times and ingredients
    const itemIds = items.map((item: any) => item.menu_item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, preparation_time_minutes')
      .in('id', itemIds);

    if (menuError) throw menuError;

    // Calculate estimated ready time based on max prep time
    let maxPrepTime = 5; // default
    if (menuItems && menuItems.length > 0) {
      maxPrepTime = Math.max(...menuItems.map(item => item.preparation_time_minutes || 0));
    }
    
    const estimatedReadyTime = new Date();
    estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + maxPrepTime);

    // 2. Execute process_checkout RPC
    const payload = {
      table_number,
      order_type,
      delivery_address,
      customer_phone,
      delivery_fee,
      customer_name,
      special_instructions,
      scheduled_for,
      estimated_ready_time: estimatedReadyTime.toISOString(),
      membership_number,
      total_amount,
      items
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('process_checkout', {
      payload
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ 
      orderId: rpcData.orderId, 
      estimatedReadyTime: estimatedReadyTime.toISOString(),
      stampUpdate: rpcData.stampUpdate
    });
  } catch (error: any) {
    console.error('Order placement error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
