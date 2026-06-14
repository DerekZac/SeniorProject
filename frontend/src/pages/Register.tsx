import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Copy, Check } from 'lucide-react';
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

  const handleAccountStep = (e: React.FormEvent) => {
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

    const setup = generateTOTPSetup(username);
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-8 w-full max-w-sm">

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
            {step === 'mfa' ? <Shield size={24} className="text-white" /> : <TrendingUp size={24} className="text-white" />}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 'account' ? 'bg-[#4B6BFB]' : 'bg-[#00C896]'}`} />
          <div className={`w-8 h-px transition-colors ${step === 'mfa' ? 'bg-[#4B6BFB]' : 'bg-[#2A2D3A]'}`} />
          <div className={`w-2 h-2 rounded-full transition-colors ${step === 'mfa' ? 'bg-[#4B6BFB]' : 'bg-[#2A2D3A]'}`} />
        </div>

        <h1 className="text-xl font-bold text-white text-center mb-1">
          {step === 'account' ? 'Create your account' : 'Secure your account'}
        </h1>
        <p className="text-[#8A8FA8] text-sm text-center mb-6">
          {step === 'account'
            ? 'Join Crypton to track your coins'
            : 'Scan the QR code with Google Authenticator or Authy'}
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-lg px-3 py-2.5 mb-4">
            <AlertCircle size={15} className="text-[#FF4D4D] mt-0.5 flex-shrink-0" />
            <p className="text-[#FF4D4D] text-sm">{error}</p>
          </div>
        )}

        {step === 'account' && (
          <form onSubmit={handleAccountStep} className="flex flex-col gap-4">
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                placeholder="3–20 chars, letters/numbers/_"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2"
            >
              Next: Set Up 2FA →
            </button>
          </form>
        )}

        {step === 'mfa' && mfaSetup && (
          <form onSubmit={handleMFAStep} className="flex flex-col gap-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <QRCodeSVG value={mfaSetup.uri} size={170} fgColor="#0D0F14" />
            </div>

            {/* Manual secret */}
            <div className="bg-[#0D0F14] border border-[#2A2D3A] rounded-lg px-3 py-2.5">
              <p className="text-[#8A8FA8] text-xs mb-1">Can't scan? Enter this key manually:</p>
              <div className="flex items-center gap-2">
                <code className="text-[#4B6BFB] text-xs font-mono break-all flex-1">
                  {mfaSetup.secret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="text-[#8A8FA8] hover:text-white transition-colors flex-shrink-0"
                  title="Copy secret"
                >
                  {copied ? <Check size={14} className="text-[#00C896]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Verification */}
            <div>
              <label className="text-[#8A8FA8] text-sm mb-1 block">Enter the 6-digit code from your app</label>
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
              className="bg-[#00C896] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#00b085] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <CheckCircle2 size={15} />}
              Create Account
            </button>

            <button
              type="button"
              onClick={() => { setStep('account'); setError(''); setMfaToken(''); }}
              className="text-[#8A8FA8] text-sm hover:text-white text-center transition-colors"
            >
              ← Back
            </button>
          </form>
        )}

        {step === 'account' && (
          <div className="mt-6 text-center text-sm text-[#8A8FA8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4B6BFB] hover:underline">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
