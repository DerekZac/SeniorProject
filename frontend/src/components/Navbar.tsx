import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Star, BarChart2, Newspaper, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const links = [
    { path: "/", label: "Home", icon: <TrendingUp size={16} /> },
    { path: "/watchlist", label: "Watchlist", icon: <Star size={16} /> },
    { path: "/compare", label: "Compare", icon: <BarChart2 size={16} /> },
    { path: "/news", label: "News", icon: <Newspaper size={16} /> },
  ];

  return (
    <nav className="bg-[#0D0F14] border-b border-[#1A1D27] sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#4B6BFB] rounded-lg flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="font-bold text-xl text-white">Crypton</span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? "bg-[#1A1D27] text-white"
                : "text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        to="/profile"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27] transition-colors"
      >
        <User size={16} />
        Profile
      </Link>
    </nav>
  );
}
