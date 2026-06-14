/**
 * Client-side NLP sentiment analysis engine.
 * Scores text using bullish/bearish keyword matching and returns
 * a confidence score (0–100) and top keywords found.
 */

import type { Sentiment } from './api';

const BULLISH = new Set([
  'moon', 'mooning', 'bullish', 'buy', 'buying', 'bought', 'accumulate',
  'accumulating', 'rally', 'rallying', 'breakout', 'pump', 'pumping', 'surge',
  'surging', 'gains', 'gain', 'profit', 'profitable', 'rise', 'rising', 'higher',
  'strong', 'strength', 'hodl', 'hold', 'holding', 'support', 'ath', 'long',
  'bull', 'bullrun', 'uptrend', 'undervalued', 'cheap', 'dip', 'opportunity',
  'growth', 'growing', 'confidence', 'optimistic', 'positive', 'potential',
  'adoption', 'institutional', 'etf', 'approved', 'launch', 'partnership',
  'upgrade', 'staking', 'reward', 'yield', 'recovery', 'rebound', 'breakout',
  'milestone', 'mainstream', 'record', 'high', 'winning', 'success',
]);

const BEARISH = new Set([
  'dump', 'dumping', 'crash', 'crashing', 'bearish', 'sell', 'selling', 'sold',
  'correction', 'overbought', 'down', 'fall', 'falling', 'drop', 'dropping',
  'loss', 'losses', 'short', 'shorting', 'red', 'panic', 'fear', 'bear',
  'bubble', 'overvalued', 'scam', 'dead', 'dying', 'rug', 'rugpull',
  'avoid', 'warning', 'risk', 'risky', 'dangerous', 'manipulation',
  'ban', 'banned', 'regulation', 'lawsuit', 'sec', 'hack', 'hacked',
  'exploit', 'stolen', 'liquidated', 'liquidation', 'rekt', 'fail',
  'failing', 'worst', 'terrible', 'awful', 'overrated', 'ponzi',
]);

interface TextScore {
  bullishWords: string[];
  bearishWords: string[];
}

function scoreText(text: string): TextScore {
  const words = text.toLowerCase().split(/\W+/);
  const bullishWords: string[] = [];
  const bearishWords: string[] = [];
  for (const w of words) {
    if (BULLISH.has(w)) bullishWords.push(w);
    if (BEARISH.has(w)) bearishWords.push(w);
  }
  return { bullishWords, bearishWords };
}

function topWords(words: string[], n: number): string[] {
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

export interface SentimentAnalysis {
  sentiment: Sentiment;
  confidence: number;
  keywords: { bullish: string[]; bearish: string[] };
}

export function analyzeSentiment(texts: string[]): SentimentAnalysis {
  let totalBullish = 0;
  let totalBearish = 0;
  const allBullish: string[] = [];
  const allBearish: string[] = [];

  for (const text of texts) {
    const { bullishWords, bearishWords } = scoreText(text);
    totalBullish += bullishWords.length;
    totalBearish += bearishWords.length;
    allBullish.push(...bullishWords);
    allBearish.push(...bearishWords);
  }

  const total = totalBullish + totalBearish;
  let confidence = 50;
  let sentiment: Sentiment = 'Mixed';

  if (total > 0) {
    confidence = Math.round((totalBullish / total) * 100);
    if (confidence >= 60) sentiment = 'Bullish';
    else if (confidence <= 40) sentiment = 'Bearish';
  }

  return {
    sentiment,
    confidence,
    keywords: {
      bullish: topWords(allBullish, 8),
      bearish: topWords(allBearish, 7),
    },
  };
}
