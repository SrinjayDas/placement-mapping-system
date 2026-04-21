import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT s.*, d.DeptName
      FROM student s
      JOIN department d ON s.DeptID = d.DeptID
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
