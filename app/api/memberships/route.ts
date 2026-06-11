import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { customer_name, customer_email, tier = 'Silver', stamps_earned, expiry_date: provided_expiry, status, membership_number: provided_membership_number } = body;

    if (!customer_name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    let membership_number = provided_membership_number;

    if (!membership_number) {
      // 1. Generate membership number (CAFE-XXXX)
      // Get count of existing memberships to increment
      const { count, error: countError } = await supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const nextId = (count || 0) + 1;
      membership_number = `CAFE-${nextId.toString().padStart(4, '0')}`;
    }

    // Expiry date 1 year from now
    const expiry_date = new Date();
    expiry_date.setFullYear(expiry_date.getFullYear() + 1);

    const { data, error } = await supabase
      .from('memberships')
      .insert({
        membership_number,
        customer_name,
        customer_email: customer_email || null,
        tier,
        stamps_earned: stamps_earned !== undefined ? stamps_earned : 0,
        expiry_date: provided_expiry || expiry_date.toISOString().split('T')[0],
        status: status || 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create membership error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create membership' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const membership_number = searchParams.get('membership_number');
    const status = searchParams.get('status');

    let query = supabase.from('memberships').select('*').order('created_at', { ascending: false });

    if (membership_number) {
      query = query.eq('membership_number', membership_number);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch memberships error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch memberships' }, { status: 500 });
  }
}
