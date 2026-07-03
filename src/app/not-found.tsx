import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-bold text-accent">
          404
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Page not found
        </h1>
        <p className="text-base text-slate-400">
          The page you are looking for does not exist.
        </p>
      </div>
      <div className="mt-8">
        <Link
          href="/"
          className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex h-10 items-center justify-center rounded-lg px-6 text-sm font-semibold transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
