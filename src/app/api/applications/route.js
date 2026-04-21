import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT a.*, s.FullName, d.RoleTitle, c.CompanyName
      FROM application a
      JOIN student s ON a.RegisterNo = s.RegisterNo
      JOIN drive d ON a.DriveID = d.DriveID
      JOIN company c ON d.CompanyID = c.CompanyID
      ORDER BY a.AppliedOn DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
