import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface Props {
  large?: boolean;
}

export default function SearchBar({ large = false }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/results/${query.trim().toLowerCase()}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className={`relative flex items-center ${large ? "max-w-2xl mx-auto" : ""}`}>
        <Search
          size={large ? 20 : 16}
          className="absolute left-4 text-[#8A8FA8]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any cryptocurrency..."
          className={`w-full bg-white text-gray-900 rounded-xl pl-12 pr-4 outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#4B6BFB] transition-all ${
            large ? "py-4 text-base" : "py-2.5 text-sm"
          }`}
        />
      </div>
    </form>
  );
}
