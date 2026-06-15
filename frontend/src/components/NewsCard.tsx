import { Clock, ExternalLink } from 'lucide-react';

interface Props {
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  imageUrl?: string;
}

export default function NewsCard({ title, source, timeAgo, url, imageUrl }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-xl p-4 transition-all card-interactive"
      style={{ background: '#16162A', border: '1px solid #21213A', textDecoration: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(247,147,26,0.35)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#21213A')}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
        />
      ) : (
        <div
          className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-xl font-bold"
          style={{ background: 'rgba(247,147,26,0.10)', color: '#F7931A' }}
        >
          ₿
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#F7931A] transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#5A5A7A' }}>
          <span className="font-medium" style={{ color: '#F7931A' }}>{source}</span>
          <span>·</span>
          <Clock size={11} />
          <span>{timeAgo}</span>
        </div>
      </div>

      <ExternalLink
        size={14}
        className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: '#F7931A' }}
      />
    </a>
  );
}
