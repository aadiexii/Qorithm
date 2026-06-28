import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Menu, LayoutDashboard, Lock } from "lucide-react";
import { getCurrentSession } from "@/services/Auth/auth";

import { buttonVariants } from "@/components/molecules/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/molecules/sheet";
import { cn } from "@/utils/tailwind";

export async function SiteHeader() {
  const session = await getCurrentSession();
  const isAdmin = session?.user?.role === "admin";
  const isAuthenticated = !!session;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/sheet", label: "Sheet" },
    { href: "/OA", label: "OA" },
  ];

  return (
    <header className="border-border/40 sticky top-4 z-50 mx-auto mt-4 mb-0 w-[calc(100%-2rem)] max-w-5xl rounded-full border bg-black/70 shadow-sm backdrop-blur-xl md:w-full">
      <div className="w-full px-4 py-3 md:px-6">
        <div className="relative flex items-center justify-between">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-10 w-10 p-0 md:hidden",
                )}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="hover:text-accent flex items-center gap-2 py-2 text-lg font-medium transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="hover:text-accent flex items-center gap-2 py-2 text-lg font-medium transition-colors"
                    >
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="text-muted-foreground flex cursor-pointer items-center gap-2 py-2 text-lg font-medium opacity-60 transition-colors hover:opacity-100"
                    >
                      Dashboard <Lock className="ml-auto h-4 w-4" />
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-accent flex items-center gap-2 py-2 text-lg font-medium transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight transition-all duration-300 ease-out"
            >
              Qorithm.
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="text-muted-foreground flex cursor-pointer items-center gap-1.5 text-sm font-medium opacity-60 blur-[0.5px] transition-colors hover:opacity-100 hover:blur-none"
                title="Sign in required"
              >
                Dashboard <Lock className="h-3 w-3" />
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-accent hover:text-accent/80 text-sm font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Auth buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Link
                href="/sign-in"
                className={cn(buttonVariants(), "rounded-full px-6")}
              >
                Sign In
              </Link>
            ) : (
              <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
