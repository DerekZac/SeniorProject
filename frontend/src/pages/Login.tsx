import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Shield, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { loginStep1, loginStep2, type StoredUser } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { logger } from '../lib/logger';
import {
  checkLoginRateLimit,
  recordFailedAttempt,
  clearAttempts,
  getRemainingAttempts,
} from '../lib/rateLimit';

const MAX_ATTEMPTS = 5;

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
    } catch {
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
      loginStep2(pendingUser, mfaToken);
      logger.info('auth', 'MFA verified — login complete', { username: pendingUser.username });
      refresh();
      navigate(from, { replace: true });
    } catch {
      logger.warn('security', 'MFA code rejected', { username: pendingUser.username });
      setError('Invalid authenticator code. Check your app and try again.');
      setMfaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-8 w-full max-w-sm">

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
            {step === 'mfa'
              ? <Shield size={24} className="text-white" />
              : <TrendingUp size={24} className="text-white" />}
          </div>
        </div>

        <h1 className="text-xl font-bold text-white text-center mb-1">
          {step === 'credentials' ? 'Sign in to Crypton' : 'Two-Factor Authentication'}
        </h1>
        <p className="text-[#8A8FA8] text-sm text-center mb-6">
          {step === 'credentials'
            ? 'Enter your credentials to continue'
            : <>Open your authenticator app for <strong className="text-white">{pendingUser?.username}</strong></>}
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle size={15} className="text-[#FF4D4D] mt-0.5 flex-shrink-0" />
            <p className="text-[#FF4D4D] text-sm">{error}</p>
          </div>
        )}

        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="flex flex-col gap-4">
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8FA8] hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Continue →
            </button>
          </form>
        )}

        {step === 'mfa' && (
          <form onSubmit={handleMFA} className="flex flex-col gap-4">
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">6-Digit Code</label>
              <input
                value={mfaToken}
                onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-3 text-xl font-mono outline-none focus:border-[#4B6BFB] transition-colors tracking-[0.5em] text-center"
                placeholder="000000"
                maxLength={6}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || mfaToken.length !== 6}
              className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Verify & Sign In
            </button>
            <button
              type="button"
              onClick={() => { setStep('credentials'); setError(''); setMfaToken(''); }}
              className="text-[#8A8FA8] text-sm hover:text-white text-center transition-colors"
            >
              ← Back to credentials
            </button>
          </form>
        )}

        {step === 'credentials' && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-[#8A8FA8]">
            <Link to="/register" className="text-[#4B6BFB] hover:underline">Create account</Link>
            <span>•</span>
            <Link to="/forgot-password" className="text-[#4B6BFB] hover:underline">Forgot password?</Link>
          </div>
        )}
      </div>
    </div>
  );
}
