/**
 * Screen 2 — Coin Search Results
 *
 * Shows the high-level sentiment verdict, confidence meter, keyword pills,
 * and subreddit breakdown. Links to Screen 3 (CoinDetail) for the full picture.
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import SentimentBadge from "../components/SentimentBadge";
import { api, type CoinSentimentResult } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function Results() {
  const { coin } = useParams<{ coin: string }>();
  const [data, setData] = useState<CoinSentimentResult | null>(null);
  const [loading, setLoading] = useState(true);
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
          <p className="text-[#8A8FA8] text-sm">Analyzing Reddit sentiment...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { name, ticker, sentiment, confidence, price, change, keywords, subredditBreakdown } = data;
  const changePositive = change >= 0;
  const sentimentColor =
    sentiment === "Bullish" ? "#00C896" : sentiment === "Bearish" ? "#FF4D4D" : "#FFB830";
  const watchlisted = isWatchlisted(ticker);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Sentiment Verdict Card */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl p-8 mb-6 text-center relative">
        {/* Watchlist star */}
        <button
          onClick={() => toggleWatchlist(ticker)}
          className={`absolute top-5 right-5 p-2 rounded-lg border transition-all ${
            watchlisted
              ? "bg-[#FFB830]/10 border-[#FFB830]/40 text-[#FFB830]"
              : "border-[#2A2D3A] text-[#8A8FA8] hover:text-white hover:border-[#4B6BFB]/40"
          }`}
        >
          <Star size={17} fill={watchlisted ? "currentColor" : "none"} />
        </button>

        <div className="mb-5">
          <p className="text-[#8A8FA8] text-sm mb-3 uppercase tracking-widest font-medium">Sentiment Verdict</p>
          <SentimentBadge sentiment={sentiment} size="lg" />
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div>
            <div className="text-3xl font-bold text-white">{price}</div>
            <div className={`text-sm font-medium mt-0.5 ${changePositive ? "text-[#00C896]" : "text-[#FF4D4D]"}`}>
              {changePositive ? "+" : ""}{change}% (24h)
            </div>
          </div>
          <div className="w-px h-12 bg-[#2A2D3A]" />
          <div>
            <div className="text-3xl font-bold" style={{ color: sentimentColor }}>{confidence}%</div>
            <div className="text-[#8A8FA8] text-sm mt-0.5">Confidence</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-sm mx-auto">
          <div className="w-full bg-[#2A2D3A] rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${confidence}%`, background: sentimentColor }}
            />
          </div>
          <div className="flex justify-between text-[#8A8FA8] text-xs mt-1.5">
            <span>Bearish</span>
            <span className="font-medium" style={{ color: sentimentColor }}>Confidence Score</span>
            <span>Bullish</span>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-5">Top Keywords Found in Reddit Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-[#00C896] text-xs font-semibold mb-3 uppercase tracking-widest">Bullish Signals</p>
            <div className="flex flex-wrap gap-2">
              {keywords.bullish.map((kw) => (
                <span
                  key={kw}
                  className="bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/30 text-sm px-4 py-1.5 rounded-full font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#FF4D4D] text-xs font-semibold mb-3 uppercase tracking-widest">Bearish Signals</p>
            <div className="flex flex-wrap gap-2">
              {keywords.bearish.map((kw) => (
                <span
                  key={kw}
                  className="bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30 text-sm px-4 py-1.5 rounded-full font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subreddit Breakdown */}
      <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-5">Subreddit Breakdown</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={subredditBreakdown} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" domain={[0, 100]} stroke="#8A8FA8" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis type="category" dataKey="subreddit" stroke="#8A8FA8" tick={{ fontSize: 11 }} width={140} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0D0F14", border: "1px solid #2A2D3A", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(v: number) => [`${v}%`, "Score"]}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {subredditBreakdown.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.score >= 60 ? "#00C896" : entry.score >= 45 ? "#FFB830" : "#FF4D4D"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CTA to Coin Detail */}
      <Link
        to={`/coin/${coin}`}
        className="flex items-center justify-center gap-2 w-full bg-[#4B6BFB] text-white py-3.5 rounded-xl font-semibold hover:bg-[#3a5ae8] transition-colors"
      >
        View Full {name} Detail <ArrowRight size={18} />
      </Link>
    </div>
  );
}
