import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white text-center mb-6">Create your account</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-[#8A8FA8] text-sm mb-1 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="text-[#8A8FA8] text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="text-[#8A8FA8] text-sm mb-1 block">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#8A8FA8]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#4B6BFB] hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
