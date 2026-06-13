import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>

        {submitted ? (
          <div className="text-center">
            <CheckCircle size={40} className="text-[#00C896] mx-auto mb-3" />
            <h1 className="text-xl font-bold text-white mb-2">Check your inbox</h1>
            <p className="text-[#8A8FA8] text-sm mb-6">
              If an account exists for <span className="text-white">{value}</span>, a reset link has been sent.
            </p>
            <Link to="/login" className="text-[#4B6BFB] text-sm hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white text-center mb-2">Reset your password</h1>
            <p className="text-[#8A8FA8] text-sm text-center mb-6">
              Enter your username or email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[#8A8FA8] text-sm mb-1 block">Username or Email</label>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
                  placeholder="Enter username or email"
                />
              </div>
              <button
                type="submit"
                className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#8A8FA8]">
              Remember your password?{" "}
              <Link to="/login" className="text-[#4B6BFB] hover:underline">Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
