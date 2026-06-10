import NewsCard from "../components/NewsCard";
import { mockNews } from "../lib/mockData";
import { Newspaper } from "lucide-react";

const allNews = [...mockNews, ...mockNews.map((n) => ({ ...n, id: n.id + 10 }))];

export default function News() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper size={20} className="text-[#4B6BFB]" />
        <div>
          <h1 className="text-2xl font-bold text-white">Latest Crypto News</h1>
          <p className="text-[#8A8FA8] text-sm">Updated every 30 minutes</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {allNews.map((item) => (
          <NewsCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
