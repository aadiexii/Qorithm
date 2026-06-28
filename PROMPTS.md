# Qorithm Prompts

## Reusable Templates

### 1. UI Refinement Pass

```text
Goal: Execute a UI-only refinement pass on [Component/Page] to align with our premium dark-mode, minimal educational style.
Constraints:
- Do not introduce new heavy dependencies (e.g., Framer Motion). Use Tailwind utilities.
- Do not break existing data wiring or server actions.
- Remove excessive glows, heavy blurs, or "AI-generated" aesthetics.
- Maintain responsive behavior and accessibility.
Output: Provide a summary of the specific utility classes changed and visual weight removed.
```

### 2. Admin Hardening Pass

```text
Goal: Conduct an admin hardening pass for [Feature].
Constraints:
- Ensure all read/write operations for this feature live strictly under `/admin/*`.
- Verify the `requireAdmin()` server guard is explicitly called in every server action.
- Ensure public interfaces associated with this feature do not leak internal IDs or state.
- Handle pagination and search via server-side DB queries, not client-side filtering.
Output: Confirm the security boundaries are intact and provide the execution results.
```

### 3. Docs Reconciliation Pass

```text
Goal: Update project documentation to reflect recent major architecture/UI changes.
Constraints:
- First, inspect the codebase and infer the truth from the code, not old docs.
- Update only existing markdown files (README, PRD, ARCH, TASKS, PROMPTS, LEARNINGS, DEPLOY).
- Keep content concise, factual, and implementation-grounded. No marketing fluff.
- If an old statement is contradicted by the current codebase, replace it immediately.
Output: List the files updated and note any major contradictions resolved.
```

### 4. Feature Addition Pass

```text
Goal: Add [Feature] with minimal, codebase-native changes.
Constraints:
- Inspect relevant routes, feature slices, schemas, server actions, and components before editing.
- Follow existing layered patterns under `src/components/<domain>/` and `src/components/actions/`.
- Keep auth and admin boundaries explicit; server mutations must validate session or admin role.
- Add or update focused validation, loading/error states, and docs only where behavior changes.
Output: Summarize files changed, user-facing behavior, and verification commands run.
```

### 5. Schema Change Pass

```text
Goal: Change the database schema for [Model/Feature].
Constraints:
- Update `src/services/Database/schema/*` first, then identify affected actions, scripts, and docs.
- Prefer Drizzle migrations via `npm run db:generate`; use manual scripts only for recovery or legacy reconciliation.
- Preserve existing data where possible and document any required one-off backfill.
- Run `npm run typecheck` after code changes.
Output: List schema changes, migration/backfill steps, and verification results.
```

### 6. Launch QA Pass

```text
Goal: Perform a production-readiness QA pass over the codebase.
Constraints:
- Run all static analysis (`npm run lint`, `npm run typecheck`).
- Execute a production build (`npm run build`).
- Ensure no mock data (`Math.random()`, fake metrics) exists in user-facing routes.
- Verify robust error boundaries (`error.tsx`) exist around critical fetching components.
Output: Provide the clean validation logs and highlight any patched warnings.
```

---

## Historical Archive

<details>
<summary>Click to view archived V1/V2 Sprint prompts</summary>

### Sprint 1A Prompt

_Archived_ - Addressed the initial problem table creation.

### Sprint 2B Prompt

_Archived_ - Addressed Codeforces sync and settings implementation.

### Sprint 3A Prompt

_Archived_ - Addressed the initial layout of the admin dashboard and CSV importing.

</details>
