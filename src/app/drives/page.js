import { db } from '@/lib/db';
import Link from 'next/link';
import { cookies } from 'next/headers';
import UnifiedApplyButton from './UnifiedApplyButton';

export const dynamic = 'force-dynamic';

export default async function Drives() {
  const cookieStore = await cookies();
  const session = cookieStore.get('student_session');
  let student = null;
  let appliedDriveIds = [];

  if (session) {
    const registerNo = session.value;
    const [students] = await db.query('SELECT * FROM student WHERE RegisterNo = ?', [registerNo]);
    if (students.length > 0) {
      student = students[0];
      const [apps] = await db.query('SELECT DriveID FROM application WHERE RegisterNo = ?', [registerNo]);
      appliedDriveIds = apps.map(a => a.DriveID);
    }
  }

  const [drivesQuery] = await db.query(`
      SELECT d.*, c.CompanyName, c.Sector, c.HQCity, 
             ec.MinCGPA, ec.MaxActiveBacklogs, ec.AllowedBatchYear, ec.DeptMode, ec.DeptID as ecDeptID
      FROM drive d
      JOIN company c ON d.CompanyID = c.CompanyID
      LEFT JOIN eligibility_criteria ec ON d.DriveID = ec.DriveID
      ORDER BY d.DriveDate DESC
  `);

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', marginTop: '4rem' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Opportunity Hub</p>
          <h2 style={{ fontSize: '3rem', fontWeight: 600 }}>Active Drives</h2>
        </div>
        <Link href="/" className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
          Back to Dashboard
        </Link>
      </div>

      <div className="grid-3">
        {drivesQuery.map(drive => {
          const driveDate = new Date(drive.DriveDate);
          const isUpcoming = driveDate > new Date();
          const hasApplied = appliedDriveIds.includes(drive.DriveID);
          
          let eligibilityLabel = '';
          let isEligible = true;

          if (student) {
            if (student.CGPA < drive.MinCGPA) {
              isEligible = false;
              eligibilityLabel = `Min CGPA ${drive.MinCGPA} Required`;
            } else if (student.ActiveBacklogs > drive.MaxActiveBacklogs) {
              isEligible = false;
              eligibilityLabel = `Max ${drive.MaxActiveBacklogs} Backlogs Allowed`;
            } else if (student.BatchYear !== drive.AllowedBatchYear) {
              isEligible = false;
              eligibilityLabel = `Only for ${drive.AllowedBatchYear} Batch`;
            } else if (drive.DeptMode === 'ONLY_ONE_DEPT' && student.DeptID !== drive.ecDeptID) {
              isEligible = false;
              eligibilityLabel = 'Restricted Department';
            }
          }

          return (
            <div key={drive.DriveID} className="card-dark card-glow" style={{ display: 'flex', flexDirection: 'column', minHeight: '430px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div className="glow-icon-wrap" style={{ width: '48px', height: '48px', marginBottom: 0 }}>
                  <div style={{ width: 12, height: 12, background: isEligible ? 'var(--orange-base)' : 'var(--text-muted)', borderRadius: '3px', transform: 'rotate(45deg)', boxShadow: isEligible ? '0 0 10px var(--orange-base)' : 'none' }}></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {isUpcoming ? (
                    <span className="status-badge" style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--orange-base)', border: '1px solid var(--border-orange)' }}>Upcoming</span>
                  ) : (
                    <span className="status-badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>Completed</span>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.25rem' }}>{drive.CompanyName}</h3>
                <p className="text-gradient-accent" style={{ fontSize: '1.1rem', fontWeight: 500 }}>{drive.RoleTitle}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{driveDate.toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Package</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{drive.CTC_LPA} LPA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Intake</span>
                   <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{drive.MaxIntake} Positions</span>
                </div>
                {!isEligible && student && (
                  <div style={{ marginTop: '0.5rem', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 500 }}>{eligibilityLabel}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <UnifiedApplyButton 
                   driveId={drive.DriveID} 
                   isLoggedIn={!!student} 
                   isEligible={isEligible} 
                   hasApplied={hasApplied} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
