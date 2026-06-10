import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
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
        <h1 className="text-xl font-bold text-white text-center mb-6">Sign in to Crypton</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-[#8A8FA8] text-sm mb-1 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-[#8A8FA8] text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0D0F14] border border-[#2A2D3A] text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#4B6BFB] transition-colors"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="bg-[#4B6BFB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#3a5ae8] transition-colors mt-2"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#8A8FA8]">
          <Link to="/register" className="text-[#4B6BFB] hover:underline">Create an account</Link>
          <span className="mx-2">•</span>
          <Link to="/login" className="text-[#4B6BFB] hover:underline">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
