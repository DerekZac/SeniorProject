import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { NewsItem } from '../lib/api';

export interface SavedArticle {
  url: string;
  title: string;
  source: string;
  timeAgo: string;
  savedAt: string;
}

interface SavedNewsContextValue {
  saved: SavedArticle[];
  isSaved: (url: string) => boolean;
  toggleSave: (item: NewsItem) => void;
  remove: (url: string) => void;
  clearAll: () => void;
}

const SavedNewsContext = createContext<SavedNewsContextValue | null>(null);
const STORAGE_KEY = 'crypton_saved_news';

function load(): SavedArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedArticle[]) : [];
  } catch {
    return [];
  }
}

export function SavedNewsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedArticle[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const isSaved = (url: string) => saved.some(s => s.url === url);

  const toggleSave = (item: NewsItem) =>
    setSaved(prev =>
      prev.some(s => s.url === item.url)
        ? prev.filter(s => s.url !== item.url)
        : [{ url: item.url, title: item.title, source: item.source, timeAgo: item.timeAgo, savedAt: new Date().toISOString() }, ...prev],
    );

  const remove = (url: string) => setSaved(prev => prev.filter(s => s.url !== url));
  const clearAll = () => setSaved([]);

  return (
    <SavedNewsContext.Provider value={{ saved, isSaved, toggleSave, remove, clearAll }}>
      {children}
    </SavedNewsContext.Provider>
  );
}

export function useSavedNews(): SavedNewsContextValue {
  const ctx = useContext(SavedNewsContext);
  if (!ctx) throw new Error('useSavedNews must be used inside <SavedNewsProvider>');
  return ctx;
}
