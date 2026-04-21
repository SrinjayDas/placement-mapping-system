'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerNo, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/profile');
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
      <div className="card-dark card-glow" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="glow-icon-wrap" style={{ margin: '0 auto 1.5rem' }}>
            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '4px', transform: 'rotate(45deg)', boxShadow: '0 0 15px var(--orange-base)' }}></div>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Student Login</h2>
          <p className="text-dim">Access your personalized placement portal</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Register Number</label>
            <input
              type="text"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-light)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange-base)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
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
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--orange-base)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-orange"
            style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tip: Your password is the same as your Register Number.
        </p>
      </div>
    </main>
  );
}
