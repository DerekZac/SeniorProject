import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateTOTPSetup, register } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { logger } from '../lib/logger';

export default function Register() {
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep]                 = useState<'account' | 'mfa'>('account');
  const [mfaSetup, setMfaSetup]         = useState<{ secret: string; uri: string } | null>(null);
  const [mfaToken, setMfaToken]         = useState('');
  const [copied, setCopied]             = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const { refresh } = useAuth();
  const navigate    = useNavigate();

const handleAccountStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('Username must be 3–20 characters (letters, numbers, underscores).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const setup = await generateTOTPSetup(username);
    setMfaSetup(setup);
    setStep('mfa');
    logger.info('auth', 'Account step complete, generating TOTP setup', { username });
  };

  const handleMFAStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSetup) return;
    setError('');
    setLoading(true);
    try {
      await register(username, email, password, mfaSetup.secret, mfaToken);
      logger.info('auth', 'Registration complete', { username });
      refresh();
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (!mfaSetup) return;
    navigator.clipboard.writeText(mfaSetup.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1.5rem 3rem' }}>
      <div style={{ background: '#16162A', border: '1px solid #21213A', borderRadius: '12px', padding: '2.5rem 2rem', width: '100%', maxWidth: '22rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Crypt<span style={{ color: '#F7931A' }}>on</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span className="section-label" style={{ color: step === 'account' ? '#F7931A' : '#00E676' }}>
            Step {step === 'account' ? '1' : '2'} of 2
          </span>
          <div style={{ flex: 1, height: '1px', background: '#21213A' }} />
          <span className="section-label">{step === 'account' ? 'Account' : 'Authenticator'}</span>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', textAlign: 'center', marginBottom: '0.375rem' }}>
          {step === 'account' ? 'Create your account' : 'Secure your account'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#5A5A7A', textAlign: 'center', marginBottom: '2rem' }}>
          {step === 'account'
            ? 'Join Crypton to track your coins'
            : 'Scan the QR code with Google Authenticator or Authy'}
        </p>

        {error && (
          <div style={{ display: 'flex', gap: '0.625rem', background: 'rgba(255,51,85,0.08)', border: '1px solid rgba(255,51,85,0.25)', borderRadius: '8px', padding: '0.75rem 0.875rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={15} style={{ color: '#FF3355', marginTop: '0.125rem', flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#FF3355' }}>{error}</p>
          </div>
        )}

        {step === 'account' && (
          <form onSubmit={handleAccountStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Username</label>
              <input
                className="auth-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="3–20 chars, letters/numbers/_"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Email</label>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>Confirm Password</label>
              <input
                className="auth-input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="auth-btn" style={{ marginTop: '0.25rem' }}>
              Next: Set Up 2FA →
            </button>
          </form>
        )}

        {step === 'mfa' && mfaSetup && (
          <form onSubmit={handleMFAStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.25rem', background: '#FFFFFF', borderRadius: '10px' }}>
              <QRCodeSVG value={mfaSetup.uri} size={160} fgColor="#08080F" />
            </div>

            <div style={{ background: '#0F0F1A', border: '1px solid #21213A', borderRadius: '8px', padding: '0.75rem 0.875rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#5A5A7A', marginBottom: '0.375rem' }}>Can't scan? Enter this key manually:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <code style={{ fontSize: '0.75rem', fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace", color: '#F7931A', wordBreak: 'break-all', flex: 1 }}>
                  {mfaSetup.secret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5A5A7A', flexShrink: 0, padding: 0, display: 'flex' }}
                  title="Copy secret"
                >
                  {copied ? <Check size={14} style={{ color: '#00E676' }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', color: '#5A5A7A', display: 'block', marginBottom: '0.375rem' }}>
                6-digit code from your app
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
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <CheckCircle2 size={15} />}
              Create Account
            </button>
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={() => { setStep('account'); setError(''); setMfaToken(''); }}
            >
              ← Back
            </button>
          </form>
        )}

        {step === 'account' && (
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#5A5A7A' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#F7931A', textDecoration: 'none' }}>Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
