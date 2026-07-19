import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { id, password } = await request.json();

    const validId = process.env.ADMIN_ID || 'admin';
    const validPassword = process.env.ADMIN_PASS || 'password';

    if (id === validId && password === validPassword) {
      // Set secure cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/admin',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid ID or Password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
