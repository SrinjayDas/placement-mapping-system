import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const [rows] = await db.query('SELECT * FROM department ORDER BY DeptName');
  return NextResponse.json(rows);
}

export async function POST(request) {
  try {
     const cookieStore = await cookies();
     if (!cookieStore.get('admin_session')) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

     const { roleTitle, companyId, jobType, ctc, date, location, maxIntake, minCgpa, maxBacklogs, batchYear, deptMode, targetDeptId, newCompanyName, newSector, newHQCity } = await request.json();

     let finalCompanyId = companyId;

     // 1. Handle New Company Creation
     if (newCompanyName) {
        const [res] = await db.query('INSERT INTO company (CompanyName, Sector, HQCity) VALUES (?, ?, ?)', [newCompanyName, newSector, newHQCity]);
        finalCompanyId = res.insertId;
     }

     // 2. Insert Drive
     const [driveRes] = await db.query(
        'INSERT INTO drive (CompanyID, RoleTitle, JobType, CTC_LPA, DriveDate, Location, MaxIntake) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [finalCompanyId, roleTitle, jobType, ctc, date, location, maxIntake || 50]
     );
     const driveId = driveRes.insertId;

     // 3. Insert Eligibility Criteria
     await db.query(
        'INSERT INTO eligibility_criteria (DriveID, MinCGPA, MaxActiveBacklogs, AllowedBatchYear, DeptMode, DeptID) VALUES (?, ?, ?, ?, ?, ?)',
        [driveId, minCgpa, maxBacklogs, batchYear, deptMode, targetDeptId || null]
     );

     return NextResponse.json({ success: true, driveId });
  } catch (error) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
     const cookieStore = await cookies();
     if (!cookieStore.get('admin_session')) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

     const { driveId, roleTitle, companyId, jobType, ctc, date, location, maxIntake, minCgpa, maxBacklogs, batchYear, deptMode, targetDeptId } = await request.json();

     // 1. Update Drive
     await db.query(
        'UPDATE drive SET CompanyID = ?, RoleTitle = ?, JobType = ?, CTC_LPA = ?, DriveDate = ?, Location = ?, MaxIntake = ? WHERE DriveID = ?',
        [companyId, roleTitle, jobType, ctc, date, location, maxIntake, driveId]
     );

     // 2. Update Eligibility Criteria
     await db.query(
        'UPDATE eligibility_criteria SET MinCGPA = ?, MaxActiveBacklogs = ?, AllowedBatchYear = ?, DeptMode = ?, DeptID = ? WHERE DriveID = ?',
        [minCgpa, maxBacklogs, batchYear, deptMode, targetDeptId || null, driveId]
     );

     return NextResponse.json({ success: true });
  } catch (error) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

