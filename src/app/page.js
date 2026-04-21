import React from 'react';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('student_session');
  const isLoggedIn = !!session;

  const [drivesQuery] = await db.query('SELECT COUNT(*) as count FROM drive');
  const [companiesQuery] = await db.query('SELECT COUNT(*) as count FROM company');
  const [studentsQuery] = await db.query('SELECT COUNT(*) as count FROM student');
  const [appsQuery] = await db.query('SELECT COUNT(*) as count FROM application');
  
  const stats = {
    drives: drivesQuery[0].count,
    companies: companiesQuery[0].count,
    students: studentsQuery[0].count,
    applications: appsQuery[0].count
  };

  return (
    <main>
      {/* STATS SECTION - Now the Main Entry Point */}
      <section className="section-padding container" id="stats" style={{textAlign: 'center', marginTop: '4rem', position: 'relative', zIndex: 10}}>
         <p style={{color: 'var(--orange-base)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600}}>System Overview</p>
         <h1 style={{fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 700}}>Active Placement Metrics</h1>
         <p className="text-dim" style={{maxWidth: '600px', margin: '0 auto 3rem'}}>Real-time database metrics tracking the performance and engagement of the current placement season.</p>

         <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '5rem'}}>
               <a href="/drives" className="btn-orange">View All Drives</a>
               {isLoggedIn ? (
                 <a href="/profile" className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--orange-base)', color: 'var(--orange-base)' }}>Go to Profile</a>
               ) : (
                 <a href="/login" className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--orange-base)', color: 'var(--orange-base)' }}>Student Login</a>
               )}
         </div>

         <div className="grid-2" style={{marginBottom: '2rem'}}>
            <div className="card-dark" style={{textAlign: 'left'}}>
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Total Drives Hosted</h3>
               <p className="text-dim" style={{fontSize: '0.9rem', marginBottom: '2rem'}}>A network of companies actively hiring.</p>
               <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                 <span style={{fontSize: '3rem', fontWeight: 700, color: 'var(--orange-base)'}}>{stats.drives}</span>
                 <span className="text-dim" style={{marginBottom: '12px'}}>active</span>
               </div>
               <div style={{position: 'absolute', bottom: -6, right: '10%', width: 120, height: 120, background: 'var(--orange-glow)', filter: 'blur(40px)'}}></div>
            </div>
            <div className="card-dark" style={{textAlign: 'left'}}>
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Participating Companies</h3>
               <p className="text-dim" style={{fontSize: '0.9rem', marginBottom: '2rem'}}>The best tech giants and startups.</p>
               <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                 <span style={{fontSize: '3rem', fontWeight: 700, color: 'var(--orange-base)'}}>{stats.companies}</span>
                 <span className="text-dim" style={{marginBottom: '12px'}}>registered</span>
               </div>
            </div>
         </div>
         
         <div className="grid-2">
            <div className="card-dark" style={{textAlign: 'left'}}>
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Total Students</h3>
               <p className="text-dim" style={{fontSize: '0.9rem', marginBottom: '2rem'}}>Our talented pool of candidates ready for the workforce.</p>
               <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                 <span style={{fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)'}}>{stats.students}</span>
                 <span className="text-dim" style={{marginBottom: '12px'}}>eligible</span>
               </div>
            </div>
            <div className="card-dark card-glow" style={{background: 'radial-gradient(ellipse at bottom, rgba(249,115,22,0.2) 0%, var(--bg-card) 60%)', textAlign: 'left'}}>
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--orange-base)'}}>Applications Submitted</h3>
               <p className="text-dim" style={{fontSize: '0.9rem', marginBottom: '2rem'}}>Massive engagement from students across all departments.</p>
               <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                 <span style={{fontSize: '3.5rem', fontWeight: 700, color: 'var(--text-primary)'}}>{stats.applications}</span>
                 <span className="text-dim" style={{marginBottom: '14px'}}>total</span>
               </div>
               <div style={{height: 40, borderBottom: '2px solid var(--orange-base)', position: 'relative', marginTop: '1rem'}}>
                  <div style={{position: 'absolute', bottom: -6, left: '80%', transform: 'translateX(-50%)', width: 12, height: 12, background: 'var(--text-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--orange-base)'}}></div>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
