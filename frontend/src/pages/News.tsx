import { useEffect, useState } from "react";
import { Newspaper, Loader2 } from "lucide-react";
import NewsCard from "../components/NewsCard";
import { api, type NewsItem } from "../lib/api";

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getNews()
      .then(setNews)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper size={20} className="text-[#4B6BFB]" />
        <div>
          <h1 className="text-2xl font-bold text-white">Latest Crypto News</h1>
          <p className="text-[#8A8FA8] text-sm">Live headlines from CryptoCompare</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#4B6BFB]" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-20 text-[#8A8FA8]">
          <p>Could not load news. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {news.map(item => (
            <NewsCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
