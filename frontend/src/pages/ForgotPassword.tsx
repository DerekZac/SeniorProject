import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../lib/auth';
import { logger } from '../lib/logger';

export default function ForgotPassword() {
  const [step, setStep]           = useState<'find' | 'reset' | 'done'>('find');
  const [username, setUsername]   = useState('');
  const [mfaToken, setMfaToken]   = useState('');
  const [newPassword, setNewPass] = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(username, newPassword, mfaToken);
      logger.info('auth', 'Password reset successful', { username });
      setStep('done');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#16162A', border: '1px solid #21213A', borderRadius: '12px', padding: '2.5rem 2rem', width: '100%', maxWidth: '22rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Crypt<span style={{ color: '#F7931A' }}>on</span>
          </span>
        </div>

        {step === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={40} style={{ margin: '0 auto 1rem', color: '#00E676', display: 'block' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>Password Updated</h1>
            <p style={{ fontSize: '0.875rem', color: '#5A5A7A', marginBottom: '2rem' }}>
              Your password has been reset successfully.
            </p>
            <Link to="/login" className="auth-btn" style={{ display: 'inline-flex', width: 'auto', padding: '0.75rem 2rem', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '0.375rem' }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5A5A7A', textAlign: 'center', marginBottom: '2rem' }}>
              {step === 'find'
                ? 'Enter your username to get started'
                : 'Set your new password and verify with your authenticator'}
            </p>

            {error && (
              <div style={{ display: 'flex', gap: '0.625rem', background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.25)', borderRadius: '8px', padding: '0.75rem 0.875rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={15} style={{ color: '#FF3355', marginTop: '0.125rem', flexShrink: 0 }} />
                <p style={{ fontSize: '0.875rem', color: '#FF3355' }}>{error}</p>
              </div>
            )}

            {step === 'find' && (
              <form onSubmit={handleFind} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Username</label>
                  <input
                    className="auth-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your username"
                    autoComplete="username"
                    required
                  />
                </div>
                <button type="submit" className="auth-btn" style={{ marginTop: '0.25rem' }}>
                  Continue →
                </button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="auth-input"
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPass(e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      tabIndex={-1}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A7A', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Confirm Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Authenticator Code</label>
                  <input
                    className="auth-input is-mono"
                    value={mfaToken}
                    onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                <button type="submit" disabled={loading || mfaToken.length !== 6} className="auth-btn">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Reset Password
                </button>
                <button
                  type="button"
                  className="auth-btn-secondary"
                  onClick={() => { setStep('find'); setError(''); }}
                >
                  ← Back
                </button>
              </form>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#5A5A7A' }}>
              Remember it?{' '}
              <Link to="/login" style={{ color: '#F7931A', textDecoration: 'none' }}>Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
