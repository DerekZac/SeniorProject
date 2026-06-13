import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useApp } from "../context/AppContext";

interface Props {
  large?: boolean;
}

export default function SearchBar({ large = false }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { addToSearchHistory } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addToSearchHistory(trimmed);
    navigate(`/results/${trimmed.toLowerCase()}`);
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className={large ? "w-full max-w-2xl mx-auto" : "w-full"}>
      <div className="relative flex items-center">
        <Search
          size={large ? 20 : 16}
          className="absolute left-4 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any cryptocurrency..."
          className={`w-full bg-white text-gray-900 rounded-xl pl-12 pr-4 outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#4B6BFB]/60 transition-all shadow-lg ${
            large ? "py-4 text-base" : "py-2.5 text-sm"
          }`}
        />
      </div>
    </form>
  );
}
