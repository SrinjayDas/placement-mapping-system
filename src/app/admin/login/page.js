'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-dark card-glow" style={{ width: '100%', maxWidth: '450px', padding: '3rem', border: '1px solid var(--text-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="glow-icon-wrap" style={{ margin: '0 auto 1.5rem', borderColor: 'var(--text-primary)' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
             </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Admin Access</h2>
          <p className="text-dim">Secure administrative control panel</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-light)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-light)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
              }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-orange"
            style={{ marginTop: '1rem', width: '100%', background: 'var(--text-primary)', color: 'var(--bg-dark)', borderColor: 'var(--text-primary)' }}
          >
            {loading ? 'Verifying...' : 'System Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
