import * as OTPAuth from 'otpauth';
import { logger } from './logger';

// ── Password hashing — PBKDF2 + SHA-256 via Web Crypto API ──────────────────

const SALT_BYTES  = 16;
const ITERATIONS  = 100_000;
const KEY_BYTES   = 32;

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

// ── Storage types ─────────────────────────────────────────────────────────────

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
}

const USERS_KEY   = 'crypton_users';
const SESSION_KEY = 'crypton_session';
const SESSION_TTL = 24 * 60 * 60 * 1000;

// ── User persistence ──────────────────────────────────────────────────────────

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
      logger.info('auth', 'Session expired, cleared automatically');
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function persistSession(user: StoredUser): Session {
  const session: Session = {
    username:   user.username,
    email:      user.email,
    sessionId:  crypto.randomUUID(),
    expiresAt:  Date.now() + SESSION_TTL,
    mfaEnabled: user.mfaEnabled,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  logger.info('auth', 'Session created', { username: user.username, sessionId: session.sessionId });
  return session;
}

export function logout(): void {
  const s = getSession();
  if (s) logger.info('auth', 'User logged out', { username: s.username });
  sessionStorage.removeItem(SESSION_KEY);
}

// ── TOTP / MFA ────────────────────────────────────────────────────────────────

export function generateTOTPSetup(username: string): TOTPSetup {
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

// ── Auth operations ───────────────────────────────────────────────────────────

export async function register(
  username: string,
  email: string,
  password: string,
  mfaSecret: string,
  mfaToken: string
): Promise<Session> {
  const users = loadUsers();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error('Username must be 3–20 characters (letters, numbers, underscores).');
  }
  if (!email.includes('@') || !email.includes('.')) {
    throw new Error('Enter a valid email address.');
  }
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }
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
  logger.info('auth', 'New account registered', { username });
  return persistSession(user);
}

export async function loginStep1(username: string, password: string): Promise<StoredUser> {
  const user = findUser(username);
  if (!user) throw new Error('Invalid credentials');
  const ok = await verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!ok) throw new Error('Invalid credentials');
  return user;
}

export function loginStep2(user: StoredUser, token: string): Session {
  if (!user.mfaSecret) throw new Error('MFA not configured');
  if (!verifyTOTP(user.mfaSecret, token)) throw new Error('Invalid authenticator code');
  return persistSession(user);
}

export async function resetPassword(
  username: string,
  newPassword: string,
  mfaToken: string
): Promise<void> {
  const users = loadUsers();
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) throw new Error('No account found for that username.');
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');

  const user = users[idx];
  if (user.mfaEnabled && user.mfaSecret) {
    if (!verifyTOTP(user.mfaSecret, mfaToken)) {
      throw new Error('Invalid authenticator code.');
    }
  }

  const { hash, salt } = await hashPassword(newPassword);
  users[idx] = { ...user, passwordHash: hash, passwordSalt: salt };
  saveUsers(users);
  logger.info('auth', 'Password reset successful', { username });
}

export function getUserCreatedAt(username: string): string {
  const user = findUser(username);
  if (!user) return '';
  return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
