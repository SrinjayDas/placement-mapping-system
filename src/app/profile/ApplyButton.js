'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyButton({ driveId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        padding: '10px 20px',
        opacity: loading ? 0.7 : 1,
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Applying...' : 'Apply Now'}
    </button>
  );
}
