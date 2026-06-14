# Security Policy

## Reporting a Vulnerability

Please **do not** open a public GitHub Issue for security vulnerabilities.

Instead, report them directly to a maintainer or open a private security advisory:
**GitHub → Security → Advisories → New draft advisory**

We will respond within 48 hours and aim to patch critical issues within 7 days.

## Implemented Security Measures

### Authentication
| Control | Implementation |
|---------|---------------|
| Password hashing | PBKDF2 + SHA-256 + 16-byte random salt, 100,000 iterations (Web Crypto API) |
| Passwords at rest | Hashed only — plaintext is never stored or logged |
| Multi-factor authentication | TOTP (RFC 6238) — required for all accounts; compatible with Google Authenticator and Authy |
| MFA setup | TOTP secret generated client-side; QR code displayed via `qrcode.react` |
| Session storage | `sessionStorage` (tab-scoped, cleared on close) with 24-hour TTL |
| Session ID | `crypto.randomUUID()` — cryptographically random |

### Login Protection
| Control | Implementation |
|---------|---------------|
| Rate limiting | Max 5 failed attempts per 15 minutes per username; lockout with countdown |
| Credential error messages | Generic "Invalid credentials" — no username enumeration |
| Input validation | Username regex, min password length, email format checked before submit |

### Frontend Security
| Control | Implementation |
|---------|---------------|
| XSS prevention | React JSX escaping; no `dangerouslySetInnerHTML` |
| Dependency auditing | `npm audit --audit-level=high` runs on every CI check |
| External links | All outbound links use `rel="noopener noreferrer"` |
| Environment secrets | API keys loaded from `.env` (never committed); `.env.example` documents all vars |

## Supported Versions

| Branch | Supported |
|--------|-----------|
| `main` | ✅ Active |
| `develop` | ✅ Active |
| Older feature branches | ❌ |
