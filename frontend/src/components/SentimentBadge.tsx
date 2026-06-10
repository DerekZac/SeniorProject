import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Sentiment = "Bullish" | "Bearish" | "Mixed";

interface Props {
  sentiment: Sentiment;
  confidence?: number;
  size?: "sm" | "md" | "lg";
}

export default function SentimentBadge({ sentiment, confidence, size = "md" }: Props) {
  const config = {
    Bullish: {
      color: "text-[#00C896]",
      bg: "bg-[#00C896]/10 border border-[#00C896]/30",
      icon: <TrendingUp size={size === "lg" ? 20 : 14} />,
    },
    Bearish: {
      color: "text-[#FF4D4D]",
      bg: "bg-[#FF4D4D]/10 border border-[#FF4D4D]/30",
      icon: <TrendingDown size={size === "lg" ? 20 : 14} />,
    },
    Mixed: {
      color: "text-[#FFB830]",
      bg: "bg-[#FFB830]/10 border border-[#FFB830]/30",
      icon: <Minus size={size === "lg" ? 20 : 14} />,
    },
  };

  const { color, bg, icon } = config[sentiment];

  const sizeClass = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${color} ${bg} ${sizeClass}`}>
      {icon}
      {sentiment}
      {confidence !== undefined && (
        <span className="opacity-70">{confidence}%</span>
      )}
    </span>
  );
}
