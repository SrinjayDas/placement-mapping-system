import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT d.*, c.CompanyName, c.Sector 
      FROM drive d
      JOIN company c ON d.CompanyID = c.CompanyID
      ORDER BY d.DriveDate DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
