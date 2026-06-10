import { ExternalLink } from "lucide-react";

interface Props {
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  imageUrl?: string;
}

export default function NewsCard({ title, source, timeAgo, url, imageUrl }: Props) {
  return (
    <div className="bg-[#1A1D27] border border-[#2A2D3A] rounded-xl p-4 flex gap-4 hover:border-[#4B6BFB]/50 transition-all">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2">{title}</p>
        <div className="flex items-center gap-2 text-[#8A8FA8] text-xs">
          <span>{source}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#8A8FA8] hover:text-white transition-colors flex-shrink-0 mt-1"
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
