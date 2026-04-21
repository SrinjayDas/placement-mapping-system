'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardClient({ initialDrives, companies, departments }) {
  const [drives, setDrives] = useState(initialDrives);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [companyOption, setCompanyOption] = useState('existing'); // 'existing' or 'new'
  const [formData, setFormData] = useState({
    roleTitle: '',
    companyId: companies[0]?.CompanyID || '',
    jobType: 'FullTime',
    ctc: '',
    date: '',
    location: '',
    maxIntake: '50',
    minCgpa: '7.0',
    maxBacklogs: '0',
    batchYear: new Date().getFullYear(),
    deptMode: 'ALL',
    targetDeptId: '',
    newCompanyName: '',
    newSector: '',
    newHQCity: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setEditMode(false);
    setEditingDriveId(null);
    setCompanyOption('existing');
    setFormData({
      roleTitle: '',
      companyId: companies[0]?.CompanyID || '',
      jobType: 'FullTime',
      ctc: '',
      date: '',
      location: '',
      maxIntake: '50',
      minCgpa: '7.0',
      maxBacklogs: '0',
      batchYear: new Date().getFullYear(),
      deptMode: 'ALL',
      targetDeptId: '',
      newCompanyName: '',
      newSector: '',
      newHQCity: ''
    });
    setShowForm(true);
  };

  const openEditForm = (drive) => {
    setEditMode(true);
    setEditingDriveId(drive.DriveID);
    setCompanyOption('existing');
    
    // Format date for input
    const dateObj = new Date(drive.DriveDate);
    const dateStr = dateObj.toISOString().split('T')[0];

    setFormData({
      roleTitle: drive.RoleTitle,
      companyId: drive.CompanyID,
      jobType: drive.JobType,
      ctc: drive.CTC_LPA,
      date: dateStr,
      location: drive.Location || '',
      maxIntake: drive.MaxIntake || 50,
      minCgpa: drive.MinCGPA,
      maxBacklogs: drive.MaxActiveBacklogs,
      batchYear: drive.AllowedBatchYear,
      deptMode: drive.DeptMode,
      targetDeptId: drive.ecDeptID || '',
      newCompanyName: '',
      newSector: '',
      newHQCity: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = '/api/admin/drives';
    const method = editMode ? 'PUT' : 'POST';
    const payload = {
       ...formData,
       driveId: editingDriveId,
       newCompanyName: companyOption === 'new' ? formData.newCompanyName : ''
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        router.refresh();
        alert(editMode ? 'Drive updated successfully!' : 'Drive added successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      alert('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>Manage Drives</h2>
        {!showForm && (
          <button onClick={openAddForm} className="btn-orange">
            + Create New Drive
          </button>
        )}
      </div>

      {showForm && (
        <div className="card-dark card-glow animate-fade-in" style={{ marginBottom: '4rem', padding: '3rem', border: `1px solid ${editMode ? 'var(--text-primary)' : 'var(--orange-base)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{editMode ? 'Editing Drive System' : 'Configuring New Drive'}</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: editMode ? 'var(--text-primary)' : 'var(--orange-base)' }}>Drive Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Role Title</label>
                    <input name="roleTitle" value={formData.roleTitle} onChange={handleInputChange} required className="admin-input" placeholder="Software Engineer" />
                  </div>
                  
                  {!editMode && (
                    <div style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '0.8rem' }}>Company Selection</p>
                      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" checked={companyOption === 'existing'} onChange={() => setCompanyOption('existing')} /> Existing
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" checked={companyOption === 'new'} onChange={() => setCompanyOption('new')} /> + New Company
                        </label>
                      </div>

                      {companyOption === 'existing' ? (
                        <select name="companyId" value={formData.companyId} onChange={handleInputChange} className="admin-input">
                          {companies.map(c => <option key={c.CompanyID} value={c.CompanyID}>{c.CompanyName}</option>)}
                        </select>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <input name="newCompanyName" value={formData.newCompanyName} onChange={handleInputChange} className="admin-input" placeholder="Company Name" required />
                          <input name="newSector" value={formData.newSector} onChange={handleInputChange} className="admin-input" placeholder="Sector" />
                          <input name="newHQCity" value={formData.newHQCity} onChange={handleInputChange} className="admin-input" placeholder="HQ City" />
                        </div>
                      )}
                    </div>
                  )}

                  {editMode && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Company</label>
                      <select name="companyId" value={formData.companyId} onChange={handleInputChange} className="admin-input">
                        {companies.map(c => <option key={c.CompanyID} value={c.CompanyID}>{c.CompanyName}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Job Type</label>
                       <select name="jobType" value={formData.jobType} onChange={handleInputChange} className="admin-input">
                          <option value="Intern">Intern</option>
                          <option value="FullTime">Full-Time</option>
                          <option value="Intern+FTE">Intern + FTE</option>
                       </select>
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>CTC (LPA)</label>
                       <input name="ctc" type="number" step="0.01" value={formData.ctc} onChange={handleInputChange} required className="admin-input" />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Drive Date</label>
                       <input name="date" type="date" value={formData.date} onChange={handleInputChange} required className="admin-input" />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Location</label>
                       <input name="location" value={formData.location} onChange={handleInputChange} className="admin-input" />
                    </div>
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Maximum Intake (Positions)</label>
                     <input name="maxIntake" type="number" value={formData.maxIntake} onChange={handleInputChange} required className="admin-input" />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: editMode ? 'var(--text-primary)' : 'var(--orange-base)' }}>Eligibility Criteria</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Min CGPA</label>
                       <input name="minCgpa" type="number" step="0.01" value={formData.minCgpa} onChange={handleInputChange} required className="admin-input" />
                    </div>
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Max Backlogs</label>
                       <input name="maxBacklogs" type="number" value={formData.maxBacklogs} onChange={handleInputChange} required className="admin-input" />
                    </div>
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Allowed Batch Year</label>
                     <input name="batchYear" type="number" value={formData.batchYear} onChange={handleInputChange} required className="admin-input" />
                  </div>

                  <div>
                     <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Department Restriction</label>
                     <select name="deptMode" value={formData.deptMode} onChange={handleInputChange} className="admin-input">
                        <option value="ALL">All Departments</option>
                        <option value="ONLY_ONE_DEPT">Specific Department Only</option>
                     </select>
                  </div>

                  {formData.deptMode === 'ONLY_ONE_DEPT' && (
                    <div>
                       <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Select Target Department</label>
                       <select name="targetDeptId" value={formData.targetDeptId} onChange={handleInputChange} className="admin-input">
                          <option value="">-- Choose Dept --</option>
                          {departments.map(d => <option key={d.DeptID} value={d.DeptID}>{d.DeptName}</option>)}
                       </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-orange" style={{ width: '100%', marginTop: '3rem', fontSize: '1.1rem', background: editMode ? 'var(--text-primary)' : undefined, color: editMode ? 'var(--bg-dark)' : undefined }}>
              {loading ? 'Processing System Update...' : editMode ? 'Save System Changes' : 'Confirm and Publish Drive'}
            </button>
          </form>
        </div>
      )}

      {/* DRIVES TABLE */}
      <div className="card-dark" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Drive / Role</th>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Package</th>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Intake</th>
              <th style={{ padding: '1.2rem 2rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialDrives.map(drive => (
              <tr key={drive.DriveID} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1.5rem 2rem' }}>
                   <div style={{ fontWeight: 600 }}>{drive.RoleTitle}</div>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{drive.JobType}</div>
                </td>
                <td style={{ padding: '1.5rem 2rem', color: 'var(--orange-base)', fontWeight: 600 }}>{drive.CompanyName}</td>
                <td style={{ padding: '1.5rem 2rem', fontSize: '0.9rem' }}>{new Date(drive.DriveDate).toLocaleDateString()}</td>
                <td style={{ padding: '1.5rem 2rem', fontWeight: 700 }}>{drive.CTC_LPA} LPA</td>
                <td style={{ padding: '1.5rem 2rem', color: 'var(--text-secondary)' }}>{drive.MaxIntake}</td>
                <td style={{ padding: '1.5rem 2rem' }}>
                   <button onClick={() => openEditForm(drive)} className="btn-orange" style={{ background: 'transparent', border: '1px solid var(--border-light)', padding: '6px 14px', fontSize: '0.8rem' }}>Edit System</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-light);
          padding: 10px 14px;
          border-radius: 6px;
          color: white;
          outline: none;
        }
        .admin-input:focus {
          border-color: var(--orange-base);
        }
      `}</style>
    </div>
  );
}
