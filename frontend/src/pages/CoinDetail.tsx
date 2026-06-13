import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUp, ExternalLink, Flame, Star } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import SentimentBadge from "../components/SentimentBadge";
import { api, type CoinSentimentResult } from "../lib/api";
import { useApp } from "../context/AppContext";

type SortMode = "hot" | "new";

export default function CoinDetail() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData] = useState<CoinSentimentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("hot");
  const { isWatchlisted, toggleWatchlist } = useApp();

  useEffect(() => {
    setLoading(true);
    api.getCoinSentiment(coin ?? "bitcoin").then(d => {
      setData(d);
      setLoading(false);
    });
  }, [coin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#4B6BFB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#8A8FA8] text-sm">Loading coin data...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { name, ticker, sentiment, confidence, price, change, sentimentHistory, posts, topPost } = data;
  const changePositive = change >= 0;
  const watchlisted = isWatchlisted(ticker);

  const sortedPosts = sort === "hot"
    ? [...posts].sort((a, b) => b.upvotes - a.upvotes)
    : [...posts].sort((a, b) => a.id - b.id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{name}</h1>
              <span className="text-[#8A8FA8] text-lg font-medium">{ticker}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className={`font-medium ${changePositive ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
                {changePositive ? "+" : ""}{change}% (24h)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SentimentBadge sentiment={sentiment} confidence={confidence} size="lg" />
            <button
              onClick={() => toggleWatchlist(ticker)}
              className={`p-2.5 rounded-xl border transition-all ${
                watchlisted
                  ? "bg-[#FFB830]/10 border-[#FFB830]/40 text-[#FFB830]"
                  : "border-[#2A2D3A] text-[#8A8FA8] hover:text-white hover:border-[#4B6BFB]/40"
              }`}
              title={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Star size={18} fill={watchlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Sentiment History */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">Sentiment History — Last 7 Days</h2>
        <p className="text-[#8A8FA8] text-xs mb-4">Score 0–100 where 100 = maximum bullish</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={sentimentHistory} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="day" stroke="#8A8FA8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#8A8FA8" tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: "8px", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#4B6BFB" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#4B6BFB"
              strokeWidth={2.5}
              dot={{ fill: "#4B6BFB", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#4B6BFB" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Post */}
      {topPost && (
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-400" />
            <h2 className="text-white font-semibold">Most Upvoted Reddit Post</h2>
          </div>
          <div className="border border-[#2A2D3A] rounded-lg p-4 hover:border-[#4B6BFB]/30 transition-colors">
            <p className="text-white font-medium mb-3 leading-relaxed">{topPost.title}</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-[#8A8FA8] text-sm">
                <span className="flex items-center gap-1.5 text-[#00C896] font-medium">
                  <ArrowUp size={14} />
                  {topPost.upvotes.toLocaleString()} upvotes
                </span>
                <span className="text-[#4B6BFB]">{topPost.subreddit}</span>
                <span>{topPost.timeAgo}</span>
              </div>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#4B6BFB] text-sm hover:underline"
              >
                View on Reddit <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Post Feed */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Reddit Posts</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSort("hot")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sort === "hot" ? "bg-[#4B6BFB] text-white" : "text-[#8A8FA8] hover:text-white hover:bg-[#2A2D3A]"
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => setSort("new")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sort === "new" ? "bg-[#4B6BFB] text-white" : "text-[#8A8FA8] hover:text-white hover:bg-[#2A2D3A]"
              }`}
            >
              New
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {sortedPosts.map((post) => (
            <div key={post.id} className="border border-[#2A2D3A] rounded-lg p-4 hover:border-[#4B6BFB]/30 transition-colors">
              <p className="text-white text-sm mb-3 leading-relaxed">{post.title}</p>
              <div className="flex items-center gap-4 text-[#8A8FA8] text-xs">
                <span className="flex items-center gap-1"><ArrowUp size={12} />{post.upvotes.toLocaleString()}</span>
                <span className="text-[#4B6BFB]">{post.subreddit}</span>
                <span>{post.timeAgo}</span>
                <span className="ml-auto">
                  <SentimentBadge sentiment={post.sentiment} size="sm" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to={`/results/${coin}`}
          className="text-[#8A8FA8] text-sm hover:text-white transition-colors"
        >
          ← Back to Search Results
        </Link>
      </div>
    </div>
  );
}
