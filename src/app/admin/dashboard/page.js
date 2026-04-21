import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch all data for the dashboard
  const [drives] = await db.query(`
    SELECT d.*, c.CompanyName, ec.MinCGPA, ec.MaxActiveBacklogs, ec.AllowedBatchYear, ec.DeptMode, ec.DeptID as ecDeptID
    FROM drive d
    JOIN company c ON d.CompanyID = c.CompanyID
    LEFT JOIN eligibility_criteria ec ON d.DriveID = ec.DriveID
    ORDER BY d.DriveDate DESC
  `);

  const [companies] = await db.query('SELECT * FROM company ORDER BY CompanyName');
  const [departments] = await db.query('SELECT * FROM department ORDER BY DeptName');

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '8rem', paddingTop: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>System Control</p>
          <h1 className="display-1" style={{ fontSize: '3.5rem', marginBottom: 0 }}>Admin Dashboard</h1>
        </div>
        <form action="/api/admin/logout" method="POST">
           <button type="submit" className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
             Terminate Session
           </button>
        </form>
      </div>

      <AdminDashboardClient initialDrives={drives} companies={companies} departments={departments} />
    </main>
  );
}
