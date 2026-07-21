import * as OTPAuth from 'otpauth';
import { logger } from './logger';

// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_BACKEND = API_URL !== '';

/**
 * The account service could not be reached or gave an unusable response. Distinct
 * from a credential rejection: callers should not count this against login
 * lockout, because the user may well have typed the right password.
 */
export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

/**
 * POST to the auth backend. Registration and login go through this exclusively —
 * there is no local fallback, so a backend that is down surfaces as an error the
 * user sees rather than an account that only exists in this browser.
 */
async function postAuth<T>(path: string, body: unknown): Promise<T> {
  if (!USE_BACKEND) {
    throw new AuthServiceError('Account service is not configured. Please contact support.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
  } catch (e: unknown) {
    logger.error('auth', `Auth request to ${path} could not reach the backend`, {
      error: e instanceof Error ? e.message : String(e),
    });
    throw new AuthServiceError('Could not reach the account service. Check your connection and try again.');
  }

  // A 502/504 from Railway returns HTML, so never assume the body is JSON.
  let data: { success?: boolean; message?: string } & Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    logger.error('auth', `Auth request to ${path} returned a non-JSON response`, { status: res.status });
    throw new AuthServiceError('The account service returned an unexpected response. Please try again shortly.');
  }

  // 5xx is the service failing, not the user's credentials being wrong.
  if (res.status >= 500) {
    logger.error('auth', `Auth request to ${path} failed server-side`, { status: res.status });
    throw new AuthServiceError('The account service is temporarily unavailable. Please try again shortly.');
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'The account service rejected the request. Please try again.');
  }

  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredUser {
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  createdAt: string;
}

export interface Session {
  username: string;
  email: string;
  sessionId: string;
  expiresAt: number;
  mfaEnabled: boolean;
}

export interface TOTPSetup {
  secret: string;
  uri: string;
  qrCode?: string;
}

const SESSION_KEY = 'crypton_session';
const SESSION_TTL = 24 * 60 * 60 * 1000;

// ── Password hashing ──────────────────────────────────────────────────────────

const SALT_BYTES = 16;
const ITERATIONS = 100_000;
const KEY_BYTES  = 32;

async function hashPassword(
  password: string,
  saltInput?: Uint8Array
): Promise<{ hash: string; salt: string }> {
  const salt = saltInput ?? crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_BYTES * 8
  );
  return {
    hash: btoa(String.fromCharCode(...new Uint8Array(bits))),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

// ── Local storage ─────────────────────────────────────────────────────────────

const USERS_KEY = 'crypton_users';

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(username: string): StoredUser | undefined {
  return loadUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
}

// ── Session management ────────────────────────────────────────────────────────

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s: Session = JSON.parse(raw);
    if (Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      logger.info('auth', 'Session expired');
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function persistSession(username: string, email: string, mfaEnabled: boolean): Session {
  const session: Session = {
    username,
    email,
    sessionId:  crypto.randomUUID(),
    expiresAt:  Date.now() + SESSION_TTL,
    mfaEnabled,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  logger.info('auth', 'Session created', { username });
  return session;
}

export function logout(): void {
  const s = getSession();
  if (s) logger.info('auth', 'User logged out', { username: s.username });
  sessionStorage.removeItem(SESSION_KEY);
}

// ── TOTP / MFA ────────────────────────────────────────────────────────────────

export async function generateTOTPSetup(username: string): Promise<TOTPSetup> {
  const totp = new OTPAuth.TOTP({
    issuer:    'Crypton',
    label:     username,
    algorithm: 'SHA1',
    digits:    6,
    period:    30,
    secret:    new OTPAuth.Secret({ size: 20 }),
  });
  return { secret: totp.secret.base32, uri: totp.toString() };
}

export function verifyTOTP(secret: string, token: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer:    'Crypton',
      algorithm: 'SHA1',
      digits:    6,
      period:    30,
      secret:    OTPAuth.Secret.fromBase32(secret),
    });
    return totp.validate({ token: token.replace(/\s/g, ''), window: 1 }) !== null;
  } catch {
    return false;
  }
}

// ── Register ──────────────────────────────────────────────────────────────────

export async function register(
  username: string,
  email: string,
  password: string,
  mfaSecret: string,
  mfaToken: string
): Promise<Session> {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error('Username must be 3-20 characters (letters, numbers, underscores).');
  }
  if (!email.includes('@') || !email.includes('.')) {
    throw new Error('Enter a valid email address.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  await postAuth('/api/auth/register', { username, email, password, mfaSecret, mfaToken });
  logger.info('auth', 'Registered via backend', { username });
  return persistSession(username, email, true);
}

// ── Login Step 1 ──────────────────────────────────────────────────────────────

export async function loginStep1(username: string, password: string): Promise<StoredUser> {
  const data = await postAuth<{ username: string; requiresMfa: boolean }>(
    '/api/auth/login/step1',
    { username, password }
  );
  logger.info('auth', 'Step1 verified via backend', { username });
  return {
    username: data.username,
    email:    '',
    passwordHash: '',
    passwordSalt: '',
    mfaEnabled: data.requiresMfa,
    createdAt: new Date().toISOString(),
  };
}

// ── Login Step 2 ──────────────────────────────────────────────────────────────

export async function loginStep2(user: StoredUser, token: string): Promise<Session> {
  const data = await postAuth<{ user: { username: string; email?: string } }>(
    '/api/auth/login/step2',
    { username: user.username, mfaToken: token }
  );
  logger.info('auth', 'MFA verified via backend', { username: user.username });
  return persistSession(data.user.username, data.user.email || '', true);
}

// ── Reset Password ────────────────────────────────────────────────────────────

export async function resetPassword(
  username: string,
  newPassword: string,
  mfaToken: string
): Promise<void> {
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, newPassword, mfaToken }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      logger.info('auth', 'Password reset via backend', { username });
      return;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg && !msg.includes('fetch') && !msg.includes('Failed') && !msg.includes('NetworkError')) {
        throw new Error(msg);
      }
      logger.warn('auth', 'Backend reset failed, falling back to local', { error: msg });
    }
  }

  const users = loadUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) throw new Error('No account found for that username.');

  const user = users[idx];
  if (user.mfaEnabled && user.mfaSecret) {
    if (!verifyTOTP(user.mfaSecret, mfaToken)) {
      throw new Error('Invalid authenticator code.');
    }
  }

  const { hash, salt } = await hashPassword(newPassword);
  users[idx] = { ...user, passwordHash: hash, passwordSalt: salt };
  saveUsers(users);
  logger.info('auth', 'Password reset locally', { username });
}

// ── Get user created at ───────────────────────────────────────────────────────

export function getUserCreatedAt(username: string): string {
  const user = findUser(username);
  if (user) return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}