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

    // 2. Handle Membership & Stamps
    let membershipId = null;
    let stampUpdate = null;

    if (membership_number) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('id, status, stamps_earned')
        .eq('membership_number', membership_number)
        .single();

      if (membership && membership.status === 'active') {
        membershipId = membership.id;
        
        let newStamps = membership.stamps_earned + 1;
        let freeCoffeeEarned = false;

        if (newStamps >= 5) {
          freeCoffeeEarned = true;
          newStamps = 0; // reset
        }

        await supabase
          .from('memberships')
          .update({ stamps_earned: newStamps })
          .eq('id', membership.id);

        stampUpdate = {
          newStamps,
          freeCoffeeEarned
        };
      }
    }

    // 3. Insert into orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number,
        order_type: order_type || 'dine-in',
        delivery_address,
        customer_phone,
        delivery_fee,
        customer_name,
        special_instructions,
        status: 'pending',
        total_amount,
        scheduled_for: scheduled_for || null,
        estimated_ready_time: estimatedReadyTime.toISOString(),
        membership_id: membershipId
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    const orderId = orderData.id;

    // 4. Insert into order_items
    const orderItemsToInsert = items.map((item: any) => ({
      order_id: orderId,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      special_requests: item.special_requests,
      assigned_person: item.assigned_person
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    // 5. Inventory Deduction
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('menu_item_ingredients')
      .select('menu_item_id, inventory_id, quantity_used')
      .in('menu_item_id', itemIds);

    if (!ingredientsError && ingredientsData) {
      for (const item of items) {
        const itemIngredients = ingredientsData.filter(ing => ing.menu_item_id === item.menu_item_id);
        for (const ing of itemIngredients) {
          const totalQtyToDeduct = ing.quantity_used * item.quantity;
          await supabase.rpc('deduct_inventory', {
            inv_id: ing.inventory_id,
            qty: totalQtyToDeduct
          });
        }
      }
    }

    return NextResponse.json({ 
      orderId, 
      estimatedReadyTime: estimatedReadyTime.toISOString(),
      stampUpdate
    });
  } catch (error: any) {
    console.error('Order placement error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
