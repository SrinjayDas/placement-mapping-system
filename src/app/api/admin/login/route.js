import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const [admins] = await db.query(
      'SELECT AdminID, Username FROM admin WHERE Username = ? AND Password = ?',
      [username, password]
    );

    if (admins.length === 0) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const admin = admins[0];
    
    // Set a simple admin session cookie
    (await cookies()).set('admin_session', admin.Username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
