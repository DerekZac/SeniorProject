import { ArrowUpRight, Clock } from 'lucide-react';

interface Props {
  title: string;
  source: string;
  timeAgo: string;
  url: string;
  imageUrl?: string;
}

export default function NewsCard({ title, source, timeAgo, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="data-row group flex items-baseline gap-4 md:gap-6"
      style={{ padding: '1.0625rem 0', borderBottom: '1px solid #21213A', textDecoration: 'none' }}
    >
      {/* Source */}
      <span
        className="section-label hidden sm:inline"
        style={{ width: '7rem', flexShrink: 0, lineHeight: 1.5 }}
      >
        {source}
      </span>

      {/* Headline */}
      <span
        className="row-title flex-1 line-clamp-1 transition-colors duration-150"
        style={{ fontSize: '0.9375rem', color: '#E8E8F0', lineHeight: 1.45, minWidth: 0 }}
      >
        {title}
      </span>

      {/* Time */}
      <span
        className="section-label hidden md:flex items-center gap-1"
        style={{ flexShrink: 0, lineHeight: 1 }}
      >
        <Clock size={11} />
        {timeAgo}
      </span>

      {/* Arrow */}
      <ArrowUpRight
        size={13}
        className="flex-shrink-0 transition-colors duration-150 group-hover:text-[#F7931A]"
        style={{ color: '#3A3A5A' }}
      />
    </a>
  );
}
