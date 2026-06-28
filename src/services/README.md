# `src/services/`

Active integration service modules:

- **Database/** — Drizzle ORM client (`client.ts`) and schema definitions (`schema/`)
- **Platforms/** — Platform adapters for Codeforces and AtCoder sync
- **Auth/** — Clerk-backed server utilities: `auth.ts` (session guards, admin checks), `env.ts` (validated env vars)
