interface BucketState {
  count: number;
  firstAt: number;
  lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS   = 15 * 60 * 1000;
const LOCKOUT_MS  = 15 * 60 * 1000;

const buckets = new Map<string, BucketState>();

export function checkLoginRateLimit(username: string): { allowed: boolean; waitMs?: number } {
  const key = username.toLowerCase();
  const now = Date.now();
  const state = buckets.get(key);

  if (!state) return { allowed: true };

  if (state.lockedUntil && now < state.lockedUntil) {
    return { allowed: false, waitMs: state.lockedUntil - now };
  }

  if (now - state.firstAt > WINDOW_MS) {
    buckets.delete(key);
    return { allowed: true };
  }

  if (state.count >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    buckets.set(key, { ...state, lockedUntil });
    return { allowed: false, waitMs: LOCKOUT_MS };
  }

  return { allowed: true };
}

export function recordFailedAttempt(username: string): number {
  const key = username.toLowerCase();
  const now = Date.now();
  const state = buckets.get(key);

  if (!state || now - state.firstAt > WINDOW_MS) {
    buckets.set(key, { count: 1, firstAt: now });
    return 1;
  }

  const newCount = state.count + 1;
  buckets.set(key, { ...state, count: newCount });
  return newCount;
}

export function clearAttempts(username: string): void {
  buckets.delete(username.toLowerCase());
}

export function getRemainingAttempts(username: string): number {
  const key = username.toLowerCase();
  const state = buckets.get(key);
  if (!state) return MAX_ATTEMPTS;
  if (Date.now() - state.firstAt > WINDOW_MS) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - state.count);
}
