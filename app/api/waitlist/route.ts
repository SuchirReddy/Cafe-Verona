import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { party_size, customer_name, phone, table_requested, preferred_time } = body;

    if (!party_size || !customer_name) {
      return NextResponse.json({ error: 'Party size and name are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        party_size,
        customer_name,
        phone: phone || null,
        table_requested: table_requested || null,
        preferred_time: preferred_time || null,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, waitlist: data });
  } catch (error: any) {
    console.error('Waitlist join error:', error);
    return NextResponse.json({ error: error.message || 'Failed to join waitlist' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('joined_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ waitlist: data });
  } catch (error: any) {
    console.error('Fetch waitlist error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch waitlist' }, { status: 500 });
  }
}
