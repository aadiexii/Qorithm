Verification Results
Check	Result
npm run typecheck	✅ 0 errors
npm run build	✅ Succeeded — 9 static pages, all routes ƒ Dynamic
What happened during the build
The first build attempt hit Error: Unauthorized on /admin — Clerk's auth.protect() inside AdminLayout threw when Next.js tried to statically prerender it at build time (no request context). The fix:

Added export const dynamic = "force-dynamic" to 

admin/layout.tsx
 — this tells Next.js to server-render all admin routes at request time, never at build time.
The build now correctly shows every route as ƒ (Dynamic), confirming they all render on-demand with full request context, including Clerk auth