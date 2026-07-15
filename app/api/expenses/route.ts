import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist, return empty array for demo purposes
        return NextResponse.json([]);
      }
      throw error;
    }

    return NextResponse.json(expenses || []);
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expense_type, description, amount, expense_date } = body;
    
    if (!expense_type || !description || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          expense_type,
          description,
          amount,
          expense_date: expense_date || new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '42P01') {
         return NextResponse.json({ error: 'Database table "expenses" does not exist. Please run the updated setup.sql in your Supabase dashboard.' }, { status: 500 });
      }
      throw error;
    }

    return NextResponse.json(data?.[0] || null);
  } catch (error: any) {
    console.error('Add expense error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add expense' }, { status: 500 });
  }
}
