# Contributing to Crypton

## Branch Strategy

| Branch | Purpose | Direct Push |
|--------|---------|-------------|
| `main` | Stable, production-ready | ❌ PRs only |
| `develop` | Integration — all features land here first | ❌ PRs only |
| `feature/<name>` | New features — branch off `develop` | ✅ |
| `hotfix/<name>` | Urgent production fixes — branch off `main` | ✅ |

```
main ◄─── develop ◄─── feature/coin-search
                  ◄─── feature/mfa-auth
main ◄─── hotfix/news-api-fix
```

## Standard Workflow

```bash
# 1. Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Work, commit often
git add <files>
git commit -m "feat: describe what you did"

# 3. Push and open PR → develop
git push origin feature/your-feature-name
# Then open a PR on GitHub targeting develop

# 4. After review + CI passes, merge to develop
# 5. When develop is stable, open a release PR: develop → main
```

## Commit Message Format

```
<type>: <short description>
```

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure (no behavior change) |
| `style` | Formatting, Tailwind classes |
| `docs` | README, comments, docs only |
| `test` | Adding or fixing tests |
| `chore` | Dependencies, config, CI |

Examples:
```
feat: add coin comparison side-by-side view
fix: resolve CryptoCompare CORS error with HN Algolia fallback
chore: upgrade otpauth to v9.3
```

## CI Requirements

Every PR must pass:
- **TypeScript check** — `npx tsc --noEmit` (zero errors)
- **Production build** — `npm run build` succeeds
- **Dependency audit** — no high/critical vulnerabilities

## Code Standards

- All data fetching goes through `src/lib/api.ts` — never fetch directly in components
- Auth state goes through `useAuth()` hook — never read sessionStorage directly in components
- New pages must be added to the route list in `App.tsx`
- Protected pages (require login) wrap with `<ProtectedRoute>`
- No hardcoded data — if you add a new coin it goes in `src/lib/coinMapping.ts`
