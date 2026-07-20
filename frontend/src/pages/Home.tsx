import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Store, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import TickerStrip from '../components/TickerStrip';
import MarketOverview from '../components/MarketOverview';
import { api, type Coin, type NewsItem } from '../lib/api';
import { GUIDES } from '../lib/learnData';
import { EXCHANGES } from '../lib/exchangeData';
import { useApp } from '../context/AppContext';
import { formatUsdToDisplay } from '../lib/displayCurrency';

function SectionRule({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.75rem' }}>
      <span className="section-label">{label}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--bg-surface)' }} />
      {action}
    </div>
  );
}

function CoinRow({ coin }: { coin: Coin }) {
  const navigate = useNavigate();
  const { displayCurrency, currencyRates } = useApp();
  const up       = coin.change >= 0;
  const price    = formatUsdToDisplay(coin.priceUsd, displayCurrency, currencyRates);

  return (
    <div
      className="data-row group flex items-center gap-3"
      style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      onClick={() => navigate(`/results/${coin.ticker.toLowerCase()}`)}
    >
      <span
        className="row-title num transition-colors duration-150"
        style={{ width: '3.25rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-strong)', flexShrink: 0 }}
      >
        {coin.ticker}
      </span>
      <span className="flex-1 truncate" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        {coin.name}
      </span>
      <span className="num" style={{ fontSize: '0.875rem', color: 'var(--text-strong)', flexShrink: 0 }}>
        {price}
      </span>
      <span
        className="num"
        style={{ width: '3.75rem', textAlign: 'right', fontSize: '0.8125rem', color: up ? '#00E676' : '#FF3355', flexShrink: 0 }}
      >
        {up ? '+' : ''}{coin.change}%
      </span>
      <ArrowUpRight size={12} style={{ color: 'var(--border-hover)', flexShrink: 0 }} className="group-hover:text-[#F7931A] transition-colors duration-150" />
    </div>
  );
}

function FeaturedArticle({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
      style={{ display: 'block', textDecoration: 'none', padding: '2rem 0', borderBottom: '1px solid var(--border)' }}
    >
      <p className="section-label" style={{ marginBottom: '1rem' }}>
        {item.source} · {item.timeAgo}
      </p>
      <h3
        style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, lineHeight: 1.22, letterSpacing: '-0.02em', color: 'var(--text-strong)', maxWidth: '54ch', transition: 'color 0.15s ease' }}
        className="group-hover:text-[#F7931A] transition-colors"
      >
        {item.title}
      </h3>
      <div
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 500, transition: 'color 0.15s ease' }}
        className="group-hover:text-[#F7931A] transition-colors"
      >
        Read the article <ArrowUpRight size={13} />
      </div>
    </a>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="data-row group flex items-baseline gap-4 md:gap-6"
      style={{ padding: '1.0625rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
    >
      <span className="section-label hidden sm:inline" style={{ width: '7rem', flexShrink: 0 }}>{item.source}</span>
      <span
        className="row-title flex-1 line-clamp-1 transition-colors duration-150"
        style={{ fontSize: '0.9375rem', color: 'var(--text-strong)', lineHeight: 1.4, minWidth: 0 }}
      >
        {item.title}
      </span>
      <span className="section-label hidden md:block" style={{ flexShrink: 0 }}>{item.timeAgo}</span>
      <ArrowUpRight size={13} className="flex-shrink-0 transition-colors duration-150 group-hover:text-[#F7931A]" style={{ color: 'var(--border-hover)' }} />
    </a>
  );
}

const FEATURED_GUIDES = GUIDES.slice(0, 3);
const FEATURED_EXCHANGES = EXCHANGES.filter(e => e.tag === 'popular').slice(0, 3);

// ─── Crypto Personality Quiz ─────────────────────────────────────────────────

const QUIZ_API = import.meta.env.VITE_PYTHON_API_URL || 'https://merry-stillness-production-b20d.up.railway.app';

const QUIZ_ACCENT = '#4B6BFB';

const QUIZ_QUESTIONS: { question: string; options: string[] }[] = [
  {
    question: 'Your portfolio drops 30% overnight. What do you do?',
    options: ['Buy more at a discount', 'Hold and wait it out', 'Sell some to limit losses', 'Sell everything'],
  },
  {
    question: 'How long do you plan to hold your investments?',
    options: ['Days or weeks', 'A few months', 'Several years', 'A decade or more'],
  },
  {
    question: 'How much research do you do before investing?',
    options: ['Read the whitepaper and on-chain data', 'Skim news and analysis', 'Ask friends or follow influencers', 'Go with my gut'],
  },
  {
    question: 'Which idea appeals to you most?',
    options: ['A digital store of value', 'A platform for building apps', 'Fast, cheap global payments', 'A strong community and culture'],
  },
  {
    question: 'How do you feel about price swings?',
    options: ['They are exciting opportunities', 'Manageable if the thesis holds', 'Stressful but tolerable', 'I would rather avoid them'],
  },
  {
    question: 'How would you spread your money?',
    options: ['One high-conviction bet', 'Two or three core picks', 'A diversified basket of five to ten', 'A little bit of everything'],
  },
  {
    question: 'What matters most when picking a project?',
    options: ['A long, proven track record', 'The underlying technology', 'Low fees and fast transactions', 'An active community'],
  },
  {
    question: 'How often do you check prices?',
    options: ['Constantly throughout the day', 'Once a day', 'Once a week', 'Rarely — I set it and forget it'],
  },
  {
    question: 'A new coin is trending on social media. Your move?',
    options: ['Buy early before the crowd', 'Research it thoroughly first', 'Wait until it proves itself', 'Ignore it entirely'],
  },
  {
    question: 'What is your main goal with crypto?',
    options: ['Preserve wealth long term', 'Steady, reliable growth', 'Life-changing gains', 'Learn and experiment'],
  },
];

type QuizResult = {
  personality_type: string;
  description: string;
  coin_recommendations: { coin: string; reason: string }[];
};

function PersonalityQuiz() {
  const [stage, setStage]     = useState<'intro' | 'active' | 'loading' | 'error' | 'done'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult]   = useState<QuizResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '2rem',
  };

  async function submit(finalAnswers: string[]) {
    setStage('loading');
    setError(null);

    try {
      const res = await fetch(`${QUIZ_API}/personality-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers.map((answer, i) => ({
            question: QUIZ_QUESTIONS[i].question,
            answer,
          })),
        }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setResult(await res.json() as QuizResult);
      setStage('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStage('error');
    }
  }

  function choose(option: string) {
    const next = [...answers.slice(0, current), option];
    setAnswers(next);
    setHovered(null);

    if (current + 1 < QUIZ_QUESTIONS.length) {
      setCurrent(current + 1);
    } else {
      submit(next);
    }
  }

  function reset() {
    setStage('intro');
    setCurrent(0);
    setAnswers([]);
    setResult(null);
    setError(null);
    setHovered(null);
  }

  // ── Intro ──
  if (stage === 'intro') {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <Sparkles size={15} style={{ color: QUIZ_ACCENT, flexShrink: 0 }} />
          <span className="section-label" style={{ color: QUIZ_ACCENT }}>10 questions · about a minute</span>
        </div>
        <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          What's Your Crypto Personality?
        </h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '60ch', marginBottom: '1.75rem' }}>
          Answer a few quick questions about how you think about risk, research, and time horizon — and we'll match you with an investor profile plus three coins that suit your style.
        </p>
        <button
          onClick={() => setStage('active')}
          style={{ background: QUIZ_ACCENT, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Take the Quiz
        </button>
      </div>
    );
  }

  // ── Loading ──
  if (stage === 'loading') {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem' }}>
        <Loader2 size={22} style={{ color: QUIZ_ACCENT, margin: '0 auto 1rem', display: 'block' }} className="animate-spin" />
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-strong)', marginBottom: '0.375rem' }}>Analyzing your answers…</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>This usually takes a few seconds.</p>
      </div>
    );
  }

  // ── Error ──
  if (stage === 'error') {
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-strong)', marginBottom: '0.5rem' }}>We couldn't build your profile.</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => submit(answers)}
            style={{ background: QUIZ_ACCENT, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
          <button
            onClick={reset}
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ── Result ──
  if (stage === 'done' && result) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <Sparkles size={15} style={{ color: QUIZ_ACCENT, flexShrink: 0 }} />
          <span className="section-label" style={{ color: QUIZ_ACCENT }}>Your profile</span>
        </div>

        <h3 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          {result.personality_type}
        </h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.7, maxWidth: '62ch', paddingLeft: '1rem', borderLeft: `2px solid ${QUIZ_ACCENT}` }}>
          {result.description}
        </p>

        {result.coin_recommendations?.length > 0 && (
          <>
            <p className="section-label" style={{ margin: '2rem 0 1rem' }}>Coins that suit you</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.coin_recommendations.map(rec => (
                <div
                  key={rec.coin}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}
                >
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.5rem' }}>
                    {rec.coin}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.75rem' }}>
          <button
            onClick={reset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}
          >
            <RotateCcw size={13} /> Retake quiz
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            For education only — not financial advice.
          </span>
        </div>
      </div>
    );
  }

  // ── Active question ──
  const q = QUIZ_QUESTIONS[current];
  const progress = ((current + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="section-label" style={{ color: QUIZ_ACCENT }}>
          Question {current + 1} of {QUIZ_QUESTIONS.length}
        </span>
        {current > 0 && (
          <button
            onClick={() => { setCurrent(current - 1); setHovered(null); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer', padding: 0 }}
          >
            ← Back
          </button>
        )}
      </div>

      <div style={{ height: '2px', background: 'var(--border)', borderRadius: '2px', marginBottom: '1.75rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: QUIZ_ACCENT, transition: 'width 0.25s ease' }} />
      </div>

      <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '1.5rem', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
        {q.question}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {q.options.map((option, i) => (
          <button
            key={option}
            onClick={() => choose(option)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              textAlign: 'left',
              width: '100%',
              background: hovered === i ? 'rgba(75,107,251,0.08)' : 'var(--bg)',
              border: `1px solid ${hovered === i ? QUIZ_ACCENT : 'var(--border)'}`,
              borderRadius: '12px',
              padding: '0.9375rem 1.125rem',
              fontSize: '0.9375rem',
              color: 'var(--text-strong)',
              cursor: 'pointer',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [coins, setCoins]               = useState<Coin[]>([]);
  const [news, setNews]                 = useState<NewsItem[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [loadingNews, setLoadingNews]   = useState(true);

  useEffect(() => {
    api.getTrending().then(setCoins).finally(() => setLoadingCoins(false));
    api.getNews().then(setNews).finally(() => setLoadingNews(false));
  }, []);

  return (
    <div>
      {!loadingCoins && coins.length > 0 && <TickerStrip coins={coins} />}

      {/* ── Hero ────────────────────────────────── */}
      <section style={{ padding: '7rem 0 5.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="hero-grid">

            {/* Left — headline */}
            <div>
              <p className="section-label" style={{ marginBottom: '1.875rem' }}>
                Your Crypto Intelligence Hub
              </p>
              <h1 className="hero-display" style={{ marginBottom: '2.75rem' }}>
                Everything Crypto,<br />One Place.
              </h1>
              <p
                style={{ fontSize: '1.0625rem', lineHeight: 1.74, color: 'var(--text)', paddingLeft: '1.25rem', borderLeft: '2px solid var(--border)', maxWidth: '40ch' }}
              >
                Live prices, trusted news, exchange reviews, regulatory guides, and educational resources — built for everyone from beginners to experienced traders.
              </p>
            </div>

            {/* Right — search */}
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>
                Search any coin for live market data
              </p>
              <SearchBar large />
              <div style={{ marginTop: '1.75rem' }}>
                <p className="section-label" style={{ marginBottom: '0.75rem' }}>
                  Popular coins
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {['Bitcoin', 'Ethereum', 'Solana', 'XRP'].map(c => (
                    <Link
                      key={c}
                      to={`/results/${c.toLowerCase()}`}
                      className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                      style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                    >
                      {c}
                      <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Market Snapshot (global stats + top movers) ── */}
      <MarketOverview />

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Market Overview ────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Market Overview"
            action={
              <Link
                to="/compare"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
              >
                Compare coins
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          {loadingCoins ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-row" style={{ height: '52px', opacity: 1 - i * 0.11 }} />
              ))}
            </div>
          ) : (
            <>
              <div
                className="hidden md:flex items-center gap-3"
                style={{ padding: '0 0 0.625rem', borderBottom: '1px solid #21213A' }}
              >
                <span className="section-label" style={{ width: '3.25rem', flexShrink: 0 }}>Coin</span>
                <span className="section-label flex-1">Name</span>
                <span className="section-label">Price</span>
                <span className="section-label" style={{ width: '3.75rem', textAlign: 'right' }}>24h</span>
                <span style={{ width: '0.75rem', flexShrink: 0 }} />
              </div>
              {coins.map(coin => <CoinRow key={coin.ticker} coin={coin} />)}
            </>
          )}
        </div>
      </section>

      <div style={{ borderTop: '1px solid #21213A' }} />

      {/* ── Start Learning ─────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Start Learning"
            action={
              <Link
                to="/learn"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: '#5A5A7A', textDecoration: 'none', flexShrink: 0 }}
              >
                All guides
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_GUIDES.map(guide => (
              <Link
                key={guide.id}
                to={`/learn#${guide.id}`}
                style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}
                className="group transition-all hover:border-[rgba(247,147,26,0.3)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <BookOpen size={15} style={{ color: '#F7931A', flexShrink: 0 }} />
                  <span className="section-label" style={{ color: 'var(--signin-color)' }}>{guide.readTime}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '0.5rem', lineHeight: 1.3 }}
                  className="group-hover:text-[#F7931A] transition-colors"
                >
                  {guide.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}
                  className="line-clamp-2"
                >
                  {guide.summary}
                </p>
                <div className="flex items-center gap-1 mt-3" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Read guide <ArrowUpRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Where to Buy ────────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="Where to Buy"
            action={
              <Link
                to="/exchanges"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
              >
                Compare all exchanges
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_EXCHANGES.map(ex => (
              <a
                key={ex.id}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}
                className="group transition-all hover:border-[rgba(247,147,26,0.3)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '2rem', height: '2rem', background: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#F7931A', flexShrink: 0 }}>
                    {ex.logo}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-strong)' }} className="group-hover:text-[#F7931A] transition-colors">{ex.name}</span>
                  <Store size={12} style={{ color: 'var(--border-hover)', marginLeft: 'auto' }} className="group-hover:text-[#F7931A] transition-colors" />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{ex.bestFor}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maker <span style={{ color: 'var(--text-strong)' }}>{ex.fees.maker}</span></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Taker <span style={{ color: 'var(--text-strong)' }}>{ex.fees.taker}</span></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── Discover Your Style ─────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule label="Discover Your Style" />
          <PersonalityQuiz />
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* ── In the News ──────────────────────────── */}
      <section style={{ padding: '4.5rem 0 6.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <SectionRule
            label="In the News"
            action={
              <Link
                to="/news"
                className="group inline-flex items-center gap-1 transition-colors duration-150 hover:text-[#F7931A]"
                style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none', flexShrink: 0 }}
              >
                All articles
                <ArrowUpRight size={12} className="transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px" />
              </Link>
            }
          />

          {loadingNews ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-row" style={{ height: '68px', opacity: 1 - i * 0.14 }} />
              ))}
            </div>
          ) : (
            <>
              {news[0]         && <FeaturedArticle item={news[0]} />}
              {news.slice(1, 7).map(item => <NewsRow key={item.id} item={item} />)}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
