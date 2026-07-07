You are performing a senior-level production readiness audit of the 
entire Qorithm codebase. This is a Next.js 15 + TypeScript + Drizzle 
ORM + Clerk + PostgreSQL + Supabase application deployed on Vercel.

The goal is zero shortcuts, zero fragile patterns, zero security holes.
Treat this as if 100,000 users are hitting the app tomorrow. Every 
single issue must be caught now — not in production.

Be exhaustive. Do not summarize. Do not skip files. Report every issue 
no matter how small.

═══════════════════════════════════════════════════
## 1. DATABASE LAYER (Drizzle + PostgreSQL)
═══════════════════════════════════════════════════
- Every INSERT — is conflict handling present? No raw inserts that 
  can throw on duplicate keys
- Every query in a loop — flag all N+1 patterns, replace with 
  batch queries or joins
- Missing indexes — every column used in WHERE, JOIN, ORDER BY, 
  GROUP BY must be indexed
- Related writes — are they wrapped in transactions? A partial write 
  failure should never leave the DB in an inconsistent state
- Connection pooling — is it configured for serverless? Vercel 
  functions are stateless, raw pg connections will exhaust the pool. 
  Verify pgBouncer or Supabase connection pooler is being used
- Any hardcoded SQL strings or string interpolation in queries — 
  SQL injection risk
- Migrations — are they safe to run without downtime? Check for 
  locking operations on large tables
- Soft deletes vs hard deletes — is anything being permanently 
  deleted that shouldn't be?
- Are timestamps (created_at, updated_at) consistently present on 
  all tables?

═══════════════════════════════════════════════════
## 2. AUTHENTICATION & AUTHORIZATION (Clerk)
═══════════════════════════════════════════════════
- Every protected route — verify auth.protect() is called server-side, 
  not just hidden on the client
- Admin routes — is the role check happening in server code? 
  Client-side role checks are bypassable
- Webhook handlers — is Clerk webhook signature verified using 
  svix before processing any payload?
- User ID source — is userId always taken from the Clerk session, 
  never from request body or query params?
- Any place a user can access another user's data by changing an ID 
  — IDOR vulnerability audit
- Session expiry — what happens when a Clerk session expires mid-use?
- Are Clerk errors handled gracefully or do they crash the page?

═══════════════════════════════════════════════════
## 3. API ROUTES & SERVER ACTIONS
═══════════════════════════════════════════════════
- Every API route — input validated with Zod before any processing
- Every server action — is the user authenticated before execution?
  Unauthenticated users must never be able to trigger server actions
- Missing try-catch — every async operation must have error handling
- Rate limiting — any route that can be called in a loop 
  (sign in, submit, search) needs rate limiting
- Are all server actions returning minimal data — only what the 
  client actually needs?
- HTTP methods — are routes restricted to correct methods 
  (POST only for mutations, GET for reads)?
- Any API route that performs a heavy operation synchronously — 
  should be offloaded to a background job
- Idempotency — can the same request be safely sent twice without 
  side effects (especially payments, submissions)?

═══════════════════════════════════════════════════
## 4. REQUEST & RESPONSE SECURITY
═══════════════════════════════════════════════════
- Every API response — whitelist the fields returned. Never return 
  a full DB row. Strip internal IDs, system fields, hashed values
- Raw Postgres errors — must never reach the client. Table names, 
  column names, constraint names are internal details
- Stack traces — must never appear in production API responses
- Auth tokens — must only travel via Authorization headers, never 
  in URL query params or response bodies
- console.log audit — find every console.log, console.error, 
  console.warn in the codebase. Remove or replace with a proper 
  logger that is disabled in production. Logs must never contain 
  user PII, tokens, or request bodies
- Search params / URL params — no sensitive identifiers (email, 
  user ID, token) in URLs. URLs are logged everywhere
- IDOR audit — for every endpoint that takes an ID param, verify 
  the requesting user owns that resource
- Response headers — verify the following are set in next.config.js:
    X-DNS-Prefetch-Control: off
    X-Frame-Options: SAMEORIGIN
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
    Strict-Transport-Security: max-age=63072000; includeSubDomains
    Content-Security-Policy: (configured appropriately)
- Remove X-Powered-By header — reveals tech stack
- Clerk JWT — verify it is passed via headers only, never logged
- CORS — API routes must only accept requests from 
  www.qorithm.site, not wildcard *

═══════════════════════════════════════════════════
## 5. ENVIRONMENT VARIABLES & SECRETS
═══════════════════════════════════════════════════
- Every env var — validated at startup using a schema (Zod or t3-env)
  App must fail loudly on boot if a required var is missing, not 
  silently at runtime
- NEXT_PUBLIC_ audit — every variable with this prefix is exposed 
  to the browser bundle. Verify no secrets have this prefix
- .env.example — is it up to date with all required vars?
- .gitignore — verify .env, .env.local, .env.production are all 
  listed and never committed
- Secrets in code — grep for hardcoded API keys, passwords, 
  connection strings anywhere in the codebase

═══════════════════════════════════════════════════
## 6. EXTERNAL API CALLS (Codeforces, AtCoder, etc.)
═══════════════════════════════════════════════════
- Every external fetch — does it have a timeout set? A hanging 
  external call will block a Vercel function until it times out
- What happens if Codeforces/AtCoder is down? The page must not 
  crash — graceful fallback required
- Response validation — is the shape of external API responses 
  validated before use? APIs change without notice
- Retry logic — for transient failures, is there exponential backoff?
- Caching — are external API responses cached appropriately? 
  Do not hammer external APIs on every request
- API keys for external services — stored in env vars, rotated, 
  never logged

═══════════════════════════════════════════════════
## 7. TYPE SAFETY
═══════════════════════════════════════════════════
- Find every usage of `any` type — list file and line number
- Find every type assertion (`as SomeType`) — each one is a 
  potential runtime crash waiting to happen
- Find every `@ts-ignore` and `@ts-nocheck` — these must be 
  justified or removed
- Runtime validation — is all external data (API responses, 
  form inputs, URL params) validated with Zod schemas?
- Drizzle schema — does it match the actual DB schema exactly?
  Any drift will cause silent bugs

═══════════════════════════════════════════════════
## 8. ERROR HANDLING
═══════════════════════════════════════════════════
- Every page — does it have an error.tsx boundary?
- Every try-catch that does nothing — catching and swallowing 
  errors silently is worse than not catching at all
- User-facing error messages — must be helpful but must not 
  expose internals ("Something went wrong" not 
  "relation users does not exist")
- Global error boundary — is there a root error.tsx?
- 404 handling — is there a not-found.tsx for invalid routes?
- Async errors in useEffect — are they caught and handled?

═══════════════════════════════════════════════════
## 9. FRONTEND & REACT
═══════════════════════════════════════════════════
- Every useEffect — correct dependency array, no stale closures
- Every data fetch — loading state, error state, empty state all 
  handled. No component that assumes data always exists
- User-generated content rendering — any dangerouslySetInnerHTML 
  or unescaped content is an XSS vulnerability
- Server vs Client components — identify every "use client" that 
  doesn't need to be one. Unnecessary client components increase 
  bundle size
- Memory leaks — event listeners, subscriptions, timers must be 
  cleaned up in useEffect return functions
- Forms — are they protected against double submission?
- Optimistic updates — if used, is rollback handled on failure?

═══════════════════════════════════════════════════
## 10. PERFORMANCE
═══════════════════════════════════════════════════
- Every image — using next/image with explicit width, height, 
  and priority on above-the-fold images?
- Bundle size — any large library imported for a single utility 
  function? (moment.js, lodash full bundle, etc.)
- Suspense boundaries — are heavy components wrapped so they 
  don't block the page render?
- Static vs dynamic — are pages that don't need to be dynamic 
  being force-rendered dynamically? Check for unnecessary 
  export const dynamic = 'force-dynamic'
- Database queries on every request for data that rarely changes 
  — should be cached with unstable_cache or revalidate
- Vercel function size — are any functions approaching the 50MB 
  limit due to large dependencies?

═══════════════════════════════════════════════════
## 11. SECURITY MISCELLANEOUS
═══════════════════════════════════════════════════
- npm audit — run it and report all vulnerabilities, 
  especially high and critical
- Dependency versions — any package that is significantly 
  outdated with known CVEs?
- File uploads — if present, is file type validated server-side 
  (not just MIME type which can be spoofed), size limited, 
  and stored outside the webroot?
- Open redirects — any redirect that uses a user-supplied URL 
  without validation?
- Clickjacking — X-Frame-Options header set?
- Mass assignment — when updating a DB record from request body, 
  are only allowed fields picked? Never spread the entire 
  request body into a DB update

═══════════════════════════════════════════════════
## 12. OBSERVABILITY & OPERATIONS
═══════════════════════════════════════════════════
- Is there any error monitoring set up (Sentry or equivalent)?
  Silent production errors are invisible without it
- Are there health check endpoints for critical services 
  (DB connection, external APIs)?
- Are slow queries being logged or monitored?
- Is there any alerting if error rate spikes?

═══════════════════════════════════════════════════
## OUTPUT FORMAT (strictly follow this)
═══════════════════════════════════════════════════
For every issue found:

SEVERITY: CRITICAL | HIGH | MEDIUM | LOW
FILE: exact/path/to/file.ts (line number)
ISSUE: what is wrong
IMPACT AT SCALE: what breaks when this hits 100k users
FIX: exact code change required

Sort all issues by severity. CRITICAL first.
Do not group or summarize. One entry per issue.
Do not skip any file. Scan everything including 
config files, scripts, and drizzle schema.