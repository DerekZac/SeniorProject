import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginStep1, loginStep2, AuthServiceError, type StoredUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { logger } from '../lib/logger';
import {
  checkLoginRateLimit,
  recordFailedAttempt,
  clearAttempts,
  getRemainingAttempts,
} from '../lib/rateLimit';

export default function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken]         = useState('');
  const [step, setStep]                 = useState<'credentials' | 'mfa'>('credentials');
  const [pendingUser, setPendingUser]   = useState<StoredUser | null>(null);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const { refresh } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = (location.state as { from?: string })?.from ?? '/';

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const rl = checkLoginRateLimit(username);
    if (!rl.allowed) {
      const mins = Math.ceil((rl.waitMs ?? 900_000) / 60_000);
      setError(`Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`);
      logger.warn('security', 'Login blocked by rate limiter', { username });
      return;
    }

    setLoading(true);
    try {
      const user = await loginStep1(username, password);
      clearAttempts(username);
      logger.info('auth', 'Credentials verified', { username });
      setPendingUser(user);
      setStep('mfa');
    } catch (err) {
      // An outage is not a failed credential — don't spend a lockout attempt on it.
      if (err instanceof AuthServiceError) {
        logger.error('auth', 'Login unavailable — account service unreachable', { username });
        setError(err.message);
        return;
      }
      recordFailedAttempt(username);
      const left = getRemainingAttempts(username);
      logger.warn('security', 'Failed login attempt', { username, attemptsLeft: left });
      if (left <= 2 && left > 0) {
        setError(`Invalid credentials. ${left} attempt${left !== 1 ? 's' : ''} remaining before lockout.`);
      } else if (left <= 0) {
        setError('Account locked for 15 minutes due to too many failed attempts.');
      } else {
        setError('Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    setError('');
    setLoading(true);
    try {
      await loginStep2(pendingUser, mfaToken);
      logger.info('auth', 'MFA verified — login complete', { username: pendingUser.username });
      refresh();
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof AuthServiceError) {
        logger.error('auth', 'MFA unavailable — account service unreachable', { username: pendingUser.username });
        setError(err.message);
        return;
      }
      logger.warn('security', 'MFA code rejected', { username: pendingUser.username });
      setError('Invalid authenticator code. Check your app and try again.');
      setMfaToken('');
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

        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '0.375rem' }}>
          {step === 'credentials' ? 'Sign in' : 'Two-factor verification'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#5A5A7A', textAlign: 'center', marginBottom: '2rem' }}>
          {step === 'credentials'
            ? 'Enter your credentials to continue'
            : <>Open your authenticator app for <strong style={{ color: '#E8E8F0' }}>{pendingUser?.username}</strong></>}
        </p>

        {error && (
          <div style={{ display: 'flex', gap: '0.625rem', background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.25)', borderRadius: '8px', padding: '0.75rem 0.875rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={15} style={{ color: '#FF3355', marginTop: '0.125rem', flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#FF3355' }}>{error}</p>
          </div>
        )}

        {step === 'credentials' && (
          <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>
                Username
              </label>
              <input
                className="auth-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A7A', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: '0.25rem' }}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              Continue →
            </button>
          </form>
        )}

        {step === 'mfa' && (
          <form onSubmit={handleMFA} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>
                6-Digit Code
              </label>
              <input
                className="auth-input is-mono"
                value={mfaToken}
                onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>
            <button type="submit" disabled={loading || mfaToken.length !== 6} className="auth-btn">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Verify & Sign In
            </button>
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={() => { setStep('credentials'); setError(''); setMfaToken(''); }}
            >
              ← Back to credentials
            </button>
          </form>
        )}

        {step === 'credentials' && (
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem' }}>
            <Link to="/register" style={{ color: '#F7931A', textDecoration: 'none' }}>Create account</Link>
            <span style={{ color: '#21213A' }}>·</span>
            <Link to="/forgot-password" style={{ color: '#5A5A7A', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
        )}
      </div>
    </div>
  );
}
