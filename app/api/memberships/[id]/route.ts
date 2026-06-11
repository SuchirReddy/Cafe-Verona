import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch membership error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch membership' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();
    
    // allow updating name, email, tier, expiry_date, stamps_earned, status
    const allowedUpdates = ['customer_name', 'customer_email', 'tier', 'expiry_date', 'stamps_earned', 'status'];
    const updateData: any = {};
    
    allowedUpdates.forEach(key => {
      if (body[key] !== undefined) {
        updateData[key] = body[key] === "" && key === "customer_email" ? null : body[key];
      }
    });

    const { data, error } = await supabase
      .from('memberships')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update membership error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update membership' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete membership error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete membership' }, { status: 500 });
  }
}
