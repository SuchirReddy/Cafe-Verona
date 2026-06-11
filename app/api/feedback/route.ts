import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { order_id, rating, comment } = body;

    if (!order_id || !rating) {
      return NextResponse.json({ error: 'Order ID and rating are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feedback_ratings')
      .insert({
        order_id,
        rating,
        comment
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, feedbackId: data.id });
  } catch (error: any) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
