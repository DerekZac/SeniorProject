type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogCategory = 'auth' | 'api' | 'nav' | 'security' | 'app';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  ts: string;
}

const buffer: LogEntry[] = [];
const MAX_ENTRIES = 200;

function emit(
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: Record<string, unknown>
): void {
  const entry: LogEntry = { level, category, message, data, ts: new Date().toISOString() };
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();

  const prefix = `[${entry.ts}] [${level.toUpperCase().padEnd(5)}] [${category}]`;
  if (level === 'error') console.error(prefix, message, ...(data ? [data] : []));
  else if (level === 'warn')  console.warn(prefix,  message, ...(data ? [data] : []));
  else                        console.log(prefix,   message, ...(data ? [data] : []));
}

export const logger = {
  debug: (cat: LogCategory, msg: string, d?: Record<string, unknown>) => emit('debug', cat, msg, d),
  info:  (cat: LogCategory, msg: string, d?: Record<string, unknown>) => emit('info',  cat, msg, d),
  warn:  (cat: LogCategory, msg: string, d?: Record<string, unknown>) => emit('warn',  cat, msg, d),
  error: (cat: LogCategory, msg: string, d?: Record<string, unknown>) => emit('error', cat, msg, d),
  getLogs: (): LogEntry[] => [...buffer],
};
