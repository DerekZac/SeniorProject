import { useParams } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import SentimentBadge from "../components/SentimentBadge";
import {
  mockSentimentHistory, mockSubredditBreakdown, mockPosts, mockKeywords
} from "../lib/mockData";

export default function Results() {
  const { coin } = useParams();
  const coinName = coin ? coin.charAt(0).toUpperCase() + coin.slice(1) : "Bitcoin";

  const sentiment = "Bullish" as const;
  const confidence = 87;
  const price = "$67,234";
  const change = 2.4;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{coinName}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className="text-[#00C896] font-medium">+{change}%</span>
            </div>
          </div>
          <div className="text-right">
            <SentimentBadge sentiment={sentiment} confidence={confidence} size="lg" />
            <div className="mt-2">
              <div className="w-48 bg-[#2A2D3A] rounded-full h-2 mt-2">
                <div
                  className="bg-[#00C896] h-2 rounded-full transition-all"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p className="text-[#8A8FA8] text-xs mt-1">Confidence Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Keywords */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Top Keywords Found</h2>
          <div className="mb-3">
            <p className="text-[#8A8FA8] text-xs mb-2">BULLISH</p>
            <div className="flex flex-wrap gap-2">
              {mockKeywords.bullish.map((kw) => (
                <span key={kw} className="bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/30 text-xs px-3 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#8A8FA8] text-xs mb-2">BEARISH</p>
            <div className="flex flex-wrap gap-2">
              {mockKeywords.bearish.map((kw) => (
                <span key={kw} className="bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30 text-xs px-3 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment History */}
        <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Sentiment History (7 Days)</h2>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={mockSentimentHistory}>
              <XAxis dataKey="day" stroke="#8A8FA8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8A8FA8" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="score" stroke="#4B6BFB" strokeWidth={2} dot={{ fill: "#4B6BFB", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subreddit Breakdown */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4">Subreddit Breakdown</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockSubredditBreakdown} layout="vertical">
            <XAxis type="number" domain={[0, 100]} stroke="#8A8FA8" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="subreddit" stroke="#8A8FA8" tick={{ fontSize: 11 }} width={130} />
            <Tooltip
              contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3A", borderRadius: "8px" }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {mockSubredditBreakdown.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.score >= 60 ? "#00C896" : entry.score >= 45 ? "#FFB830" : "#FF4D4D"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Post Feed */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Reddit Posts</h2>
          <div className="flex gap-2">
            <button className="bg-[#4B6BFB] text-white text-xs px-3 py-1.5 rounded-lg font-medium">Hot</button>
            <button className="text-[#8A8FA8] text-xs px-3 py-1.5 rounded-lg hover:text-white hover:bg-[#2A2D3A] transition-colors">New</button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {mockPosts.map((post) => (
            <div key={post.id} className="border border-[#2A2D3A] rounded-lg p-4 hover:border-[#4B6BFB]/30 transition-colors">
              <p className="text-white text-sm mb-2">{post.title}</p>
              <div className="flex items-center gap-3 text-[#8A8FA8] text-xs">
                <span className="flex items-center gap-1"><ArrowUp size={12} />{post.upvotes.toLocaleString()}</span>
                <span>{post.subreddit}</span>
                <span>{post.timeAgo}</span>
                <SentimentBadge sentiment={post.sentiment} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
