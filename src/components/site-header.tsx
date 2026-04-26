import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Menu, LayoutDashboard } from "lucide-react";
import { getCurrentSession } from "@/server/auth";

import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const session = await getCurrentSession();
  const isAdmin = session?.user?.role === "admin";
  const isAuthenticated = !!session;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/problems", label: "Problems" },
    { href: "/sheet", label: "Sheet" },
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto mt-4 mb-0 w-[calc(100%-2rem)] max-w-5xl rounded-full border border-border/40 bg-black/70 shadow-sm backdrop-blur-xl md:w-full">
      <div className="w-full px-4 md:px-6 py-3">
        <div className="flex items-center justify-between relative">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 md:hidden")}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map(({ href, label }) => (
                    <Link key={href} href={href} className="flex items-center gap-2 py-2 text-lg font-medium transition-colors hover:text-accent">
                      {label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <Link href="/dashboard" className="flex items-center gap-2 py-2 text-lg font-medium transition-colors hover:text-accent">
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Link>
                  )}
                  {isAuthenticated && (
                    <Link href="/settings" className="flex items-center gap-2 py-2 text-lg font-medium transition-colors hover:text-accent">
                      Settings
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 py-2 text-lg font-medium text-accent transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 transition-all duration-300 ease-out text-xl font-bold tracking-tight">
              Qorithm.
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/settings" className="text-sm font-medium transition-colors text-muted-foreground hover:text-foreground">
                Settings
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-accent transition-colors hover:text-accent/80">
                Admin
              </Link>
            )}
          </nav>

          {/* Right: Auth buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Link href="/sign-in" className={cn(buttonVariants(), "rounded-full px-6")}>
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
