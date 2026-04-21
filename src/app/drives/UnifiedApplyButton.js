'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnifiedApplyButton({ driveId, isLoggedIn, isEligible, hasApplied }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <Link href="/login" className="btn-orange" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
        Sign in to Apply
      </Link>
    );
  }

  if (hasApplied) {
    return (
      <button disabled className="btn-orange" style={{ width: '100%', opacity: 0.5, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--border-light)' }}>
        ✓ Applied
      </button>
    );
  }

  if (!isEligible) {
    return (
      <button disabled className="btn-orange" style={{ width: '100%', opacity: 0.5, background: 'transparent', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--border-light)' }}>
        Ineligible
      </button>
    );
  }

  const handleApply = async () => {
    if (!confirm('Are you sure you want to apply for this drive?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to apply');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleApply}
      disabled={loading}
      className="btn-orange" 
      style={{ 
        width: '100%',
        opacity: loading ? 0.7 : 1,
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Applying...' : 'Apply Now'}
    </button>
  );
}
