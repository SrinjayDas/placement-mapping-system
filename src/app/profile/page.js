import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import ApplyButton from './ApplyButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('student_session');

  if (!session) {
    redirect('/login');
  }

  const registerNo = session.value;

  // 1. Fetch Student Details
  const [students] = await db.query(`
    SELECT s.*, d.DeptName 
    FROM student s
    JOIN department d ON s.DeptID = d.DeptID
    WHERE s.RegisterNo = ?
  `, [registerNo]);

  if (students.length === 0) {
    redirect('/login');
  }

  const student = students[0];

  // 2. Fetch My Applications
  const [applications] = await db.query(`
    SELECT a.*, d.RoleTitle, d.DriveID, c.CompanyName, d.CTC_LPA, d.DriveDate
    FROM application a
    JOIN drive d ON a.DriveID = d.DriveID
    JOIN company c ON d.CompanyID = c.CompanyID
    WHERE a.RegisterNo = ?
    ORDER BY a.AppliedOn DESC
  `, [registerNo]);

  const appliedDriveIds = applications.map(a => a.DriveID);

  // 3. Fetch ALL upcoming drives with criteria
  const [allUpcomingDrives] = await db.query(`
    SELECT d.*, c.CompanyName, ec.MinCGPA, ec.MaxActiveBacklogs, ec.AllowedBatchYear, ec.DeptMode, ec.DeptID as ecDeptId
    FROM drive d
    JOIN company c ON d.CompanyID = c.CompanyID
    JOIN eligibility_criteria ec ON d.DriveID = ec.DriveID
    WHERE d.DriveDate >= CURDATE()
    ORDER BY d.DriveDate ASC
  `);

  // 4. Categorize Drives
  const unappliedDrives = allUpcomingDrives.filter(d => !appliedDriveIds.includes(d.DriveID));
  
  const eligibleDrives = [];
  const ineligibleDrives = [];

  unappliedDrives.forEach(drive => {
    const reasons = [];
    if (student.CGPA < parseFloat(drive.MinCGPA)) reasons.push(`Min CGPA ${drive.MinCGPA} Required`);
    if (student.ActiveBacklogs > drive.MaxActiveBacklogs) reasons.push(`Max ${drive.MaxActiveBacklogs} Backlogs Allowed`);
    if (student.BatchYear !== drive.AllowedBatchYear) reasons.push(`Only for ${drive.AllowedBatchYear} Batch`);
    if (drive.DeptMode === 'ONLY_ONE_DEPT' && student.DeptID !== drive.ecDeptId) reasons.push(`Restricted to specific department`);

    if (reasons.length === 0) {
      eligibleDrives.push(drive);
    } else {
      ineligibleDrives.push({ ...drive, reasons });
    }
  });

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', marginTop: '4rem' }}>
        <div>
          <p style={{ color: 'var(--orange-base)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Student Portal</p>
          <h1 className="display-1" style={{ fontSize: '3.5rem', marginBottom: 0 }}>Welcome, {student.FullName.split(' ')[0]}</h1>
        </div>
        <form action="/api/logout" method="POST">
             <button type="submit" className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
               Sign Out
             </button>
        </form>
      </div>

      {/* STATS STRIP */}
      <div className="grid-3" style={{ marginBottom: '6rem' }}>
         <div className="card-dark card-glow">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Academic Standing</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
               <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{student.CGPA}</span>
               <div>
                  <p style={{ color: 'var(--orange-base)', fontWeight: 600 }}>CGPA</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student.ActiveBacklogs} Backlogs</p>
               </div>
            </div>
         </div>
         <div className="card-dark">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Department</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{student.DeptName}</h3>
            <p className="text-dim" style={{ fontSize: '0.9rem', marginTop: '4px' }}>Batch of {student.BatchYear}</p>
         </div>
         <div className="card-dark">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Opportunities</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{eligibleDrives.length} Open</h3>
            <p className="text-dim" style={{ fontSize: '0.9rem', marginTop: '4px' }}>Matches your profile</p>
         </div>
      </div>

      {/* ELIGIBLE DRIVES SECTION */}
      <div style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Eligible for You</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Matching your current standing</span>
        </div>
        
        <div className="grid-3">
          {eligibleDrives.map(drive => (
            <div key={drive.DriveID} className="card-dark card-glow" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px', border: '1px solid var(--border-orange)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="glow-icon-wrap" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}>
                  <div style={{ width: 10, height: 10, background: '#fff', borderRadius: '3px', transform: 'rotate(45deg)', boxShadow: '0 0 10px var(--orange-base)' }}></div>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{drive.CompanyName}</h3>
                <p className="text-gradient-accent" style={{ fontSize: '1.1rem', fontWeight: 500 }}>{drive.RoleTitle}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ color: 'var(--text-primary)' }}>{new Date(drive.DriveDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Required CGPA</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>✓ {parseFloat(drive.MinCGPA).toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Intake</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{drive.MaxIntake} Positions</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{drive.CTC_LPA} LPA</p>
                </div>
                <ApplyButton driveId={drive.DriveID} />
              </div>
            </div>
          ))}
          {eligibleDrives.length === 0 && (
            <div className="card-dark" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem' }}>
              <p className="text-dim">No new eligible drives matching your profile were found.</p>
            </div>
          )}
        </div>
      </div>

      {/* INELIGIBLE DRIVES SECTION (Transparency) */}
      {ineligibleDrives.length > 0 && (
        <div style={{ marginBottom: '6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, opacity: 0.6 }}>Other Opportunities</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drives where you don't meet requirements</span>
          </div>
          
          <div className="grid-3" style={{ opacity: 0.7 }}>
            {ineligibleDrives.map(drive => (
              <div key={drive.DriveID} className="card-dark" style={{ display: 'flex', flexDirection: 'column', minHeight: '380px', filter: 'grayscale(0.5)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-muted)' }}>{drive.CompanyName}</h3>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>{drive.RoleTitle}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                   {drive.reasons.map((reason, i) => (
                     <div key={i} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>
                        ✕ {reason}
                     </div>
                   ))}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{drive.CTC_LPA} LPA</p>
                  <button disabled className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'not-allowed' }}>Ineligible</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY APPLICATIONS SECTION */}
      <div style={{ marginBottom: '6rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>My Applications</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map(app => (
            <div key={app.ApplicationID} className="card-dark" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                   <div style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }}></div>
                </div>
                <div>
                   <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{app.RoleTitle}</h4>
                   <p className="text-dim" style={{ fontSize: '0.9rem' }}>{app.CompanyName} &bull; Applied on {new Date(app.AppliedOn).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '3rem' }}>
                <div>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Package</p>
                   <p style={{ fontWeight: 600 }}>{app.CTC_LPA} LPA</p>
                </div>
                <span className={`status-badge ${app.Status.toLowerCase().replace(/ /g, '-')}`} 
                      style={{ 
                        background: app.Status === 'SELECTED' ? 'rgba(16, 185, 129, 0.1)' : app.Status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                        color: app.Status === 'SELECTED' ? '#10b981' : app.Status === 'REJECTED' ? '#ef4444' : 'var(--orange-base)',
                        border: `1px solid ${app.Status === 'SELECTED' ? 'rgba(16, 185, 129, 0.2)' : app.Status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-orange)'}`
                      }}>
                  {app.Status}
                </span>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="card-dark" style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="text-dim">You have no active applications.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
