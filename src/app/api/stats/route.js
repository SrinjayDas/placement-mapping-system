import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [drives] = await db.query('SELECT COUNT(*) as count FROM drive');
    const [companies] = await db.query('SELECT COUNT(*) as count FROM company');
    const [students] = await db.query('SELECT COUNT(*) as count FROM student');
    const [applications] = await db.query('SELECT COUNT(*) as count FROM application');
    
    return NextResponse.json({
      drives: drives[0].count,
      companies: companies[0].count,
      students: students[0].count,
      applications: applications[0].count
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
