import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { registerNo, password } = await request.json();

    if (!registerNo || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const [users] = await db.query(
      'SELECT RegisterNo, FullName FROM student WHERE RegisterNo = ? AND Password = ?',
      [registerNo, password]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid register number or password' }, { status: 401 });
    }

    const user = users[0];
    
    // Set a simple session cookie
    (await cookies()).set('student_session', user.RegisterNo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
