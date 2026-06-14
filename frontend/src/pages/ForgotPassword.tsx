import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../lib/auth';
import { logger } from '../lib/logger';

export default function ForgotPassword() {
  const [step, setStep]             = useState<'find' | 'reset' | 'done'>('find');
  const [username, setUsername]     = useState('');
  const [mfaToken, setMfaToken]     = useState('');
  const [newPassword, setNewPass]   = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-8 w-full max-w-sm">

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>

        {step === 'done' ? (
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto text-[#00C896] mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Password Updated</h1>
            <p className="text-[#8A8FA8] text-sm mb-6">
              Your password has been reset successfully.
            </p>
            <Link
              to="/login"
              className="bg-[#4B6BFB] text-white py-2.5 px-6 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white text-center mb-1">Reset Password</h1>
            <p className="text-[#8A8FA8] text-sm text-center mb-6">
              {step === 'find'
                ? 'Enter your username to get started'
                : 'Set your new password and verify with your authenticator app'}
            </p>

            {error && (
              <div className="flex items-start gap-2 bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle size={15} className="text-[#FF4D4D] mt-0.5 flex-shrink-0" />
                <p className="text-[#FF4D4D] text-sm">{error}</p>
              </div>
            )}

            {step === 'find' && (
              <form onSubmit={handleFind} className="flex flex-col gap-4">
                <div>
                  <label className="text-[#8A8FA8] text-sm mb-1 block">Username</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                    placeholder="Your username"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2"
                >
                  Continue →
                </button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="flex flex-col gap-4">
                <div>
                  <label className="text-[#8A8FA8] text-sm mb-1 block">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                      placeholder="At least 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8FA8] hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
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
                    placeholder="Repeat new password"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#8A8FA8] text-sm mb-1 block">Authenticator Code</label>
                  <input
                    value={mfaToken}
                    onChange={e => setMfaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-3 text-xl font-mono outline-none focus:border-[#4B6BFB] transition-colors tracking-[0.5em] text-center"
                    placeholder="000000"
                    maxLength={6}
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
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('find'); setError(''); }}
                  className="text-[#8A8FA8] text-sm hover:text-white text-center transition-colors"
                >
                  ← Back
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-[#8A8FA8]">
              Remember it?{' '}
              <Link to="/login" className="text-[#4B6BFB] hover:underline">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
