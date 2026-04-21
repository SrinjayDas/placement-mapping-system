import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('student_session');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const registerNo = session.value;
    const { driveId } = await request.json();

    if (!driveId) {
      return NextResponse.json({ error: 'Missing Drive ID' }, { status: 400 });
    }

    // Check if high-level eligibility is met (Optional safeguard)
    // Check if already applied
    const [existing] = await db.query(
      'SELECT ApplicationID FROM application WHERE RegisterNo = ? AND DriveID = ?',
      [registerNo, driveId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already applied for this drive' }, { status: 400 });
    }

    // Record the application
    await db.query(
      'INSERT INTO application (RegisterNo, DriveID, Status) VALUES (?, ?, ?)',
      [registerNo, driveId, 'APPLIED']
    );

    return NextResponse.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
