import * as OTPAuth from 'otpauth';
import { logger } from './logger';

// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_BACKEND = API_URL !== '';

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

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const saltBytes = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
  const result = await hashPassword(password, saltBytes);
  return result.hash === hash;
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

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password, mfaSecret, mfaToken }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      logger.info('auth', 'Registered via backend', { username });
      return persistSession(username, email, true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg && !msg.includes('fetch') && !msg.includes('Failed') && !msg.includes('NetworkError')) {
        throw new Error(msg);
      }
      logger.warn('auth', 'Backend register failed, falling back to local', { error: msg });
    }
  }

  const users = loadUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username is already taken.');
  }
  if (!verifyTOTP(mfaSecret, mfaToken)) {
    throw new Error('Invalid authenticator code. Make sure your app clock is synced.');
  }

  const { hash, salt } = await hashPassword(password);
  const user: StoredUser = {
    username,
    email,
    passwordHash: hash,
    passwordSalt: salt,
    mfaEnabled:   true,
    mfaSecret,
    createdAt:    new Date().toISOString(),
  };

  saveUsers([...users, user]);
  logger.info('auth', 'Registered locally', { username });
  return persistSession(username, email, true);
}

// ── Login Step 1 ──────────────────────────────────────────────────────────────

export async function loginStep1(username: string, password: string): Promise<StoredUser> {
  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/step1`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      logger.info('auth', 'Step1 verified via backend', { username });
      return {
        username: data.username,
        email:    '',
        passwordHash: '',
        passwordSalt: '',
        mfaEnabled: data.requiresMfa,
        createdAt: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg && !msg.includes('fetch') && !msg.includes('Failed') && !msg.includes('NetworkError')) {
        throw new Error(msg);
      }
      logger.warn('auth', 'Backend step1 failed, falling back to local', { error: msg });
    }
  }

  const user = findUser(username);
  if (!user) throw new Error('Invalid credentials');
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) throw new Error('Invalid credentials');
  return user;
}

// ── Login Step 2 ──────────────────────────────────────────────────────────────

export async function loginStep2(user: StoredUser, token: string): Promise<Session> {
  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_URL}/api/auth/login/step2`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: user.username, mfaToken: token }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      logger.info('auth', 'MFA verified via backend', { username: user.username });
      return persistSession(data.user.username, data.user.email || '', true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg && !msg.includes('fetch') && !msg.includes('Failed') && !msg.includes('NetworkError')) {
        throw new Error(msg);
      }
      logger.warn('auth', 'Backend step2 failed, falling back to local', { error: msg });
    }
  }

  if (!user.mfaSecret) throw new Error('MFA not configured');
  if (!verifyTOTP(user.mfaSecret, token)) throw new Error('Invalid authenticator code');
  return persistSession(user.username, user.email, user.mfaEnabled);
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