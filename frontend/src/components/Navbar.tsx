import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Star, BarChart2, Newspaper, User } from "lucide-react";

const NAV_LINKS = [
  { path: "/", label: "Home", icon: TrendingUp },
  { path: "/watchlist", label: "Watchlist", icon: Star },
  { path: "/compare", label: "Compare", icon: BarChart2 },
  { path: "/news", label: "News", icon: Newspaper },
];

function isActive(pathname: string, path: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b bg-[#0D0F14] border-[#1A1D27]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-[#4B6BFB] rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-white" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">Crypton</span>
      </Link>

      {/* Center links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ path, label, icon: Icon }) => {
          const active = isActive(pathname, path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1A1D27] text-white"
                  : "text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]/60"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Profile */}
      <Link
        to="/profile"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive(pathname, "/profile")
            ? "bg-[#1A1D27] text-white"
            : "text-[#8A8FA8] hover:text-white hover:bg-[#1A1D27]/60"
        }`}
      >
        <User size={15} />
        Profile
      </Link>
    </nav>
  );
}
