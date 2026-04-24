"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "./ui/logo";
import { cn } from "@/lib/utils";
import { LogOut, Sparkles } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_premium?: boolean;
}

const publicLinks = [{ href: "/", label: "Explore" }];
const authedLinks = [
  { href: "/dashboard", label: "Matches" },
  { href: "/hackathons", label: "Hackathons" },
  { href: "/teams", label: "Teams" },
  { href: "/requests", label: "Requests" },
  { href: "/chat", label: "Messages" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showListHackathonPopup, setShowListHackathonPopup] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const refreshAuth = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
        return;
      } catch {}
    }
    setUser(null);
  };

  useEffect(() => {
    refreshAuth();
    window.addEventListener("auth-change", refreshAuth);
    return () => window.removeEventListener("auth-change", refreshAuth);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const links = user ? (user.is_admin ? [] : authedLinks) : publicLinks;
  const displayName = user?.name || "";
  const initial = displayName.charAt(0).toUpperCase() || "H";
  const firstName = displayName.split(" ")[0] || "there";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Logo href="/" />

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 py-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive(l.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive(l.href) && (
                <span className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" />
              )}
              {l.label}
            </Link>
          ))}
          {user?.is_admin && (
            <Link
              href="/admin"
              className={cn(
                "relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[var(--ember)]",
                isActive("/admin")
                  ? "text-foreground"
                  : "hover:text-foreground",
              )}
            >
              {isActive("/admin") && (
                <span className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]" />
              )}
              Admin Dashboard
            </Link>
          )}
          {!user?.is_admin && (
            <button
              onClick={() => {
                setShowListHackathonPopup(true);
              }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/[0.06]"
            >
              <Sparkles size={12} className="text-[var(--ember)]" />
              List a Hackathon
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="group flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] py-1 pl-1 pr-3 text-sm transition-colors hover:bg-white/[0.06]"
                >
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.62_0.2_25))] text-xs font-semibold text-white">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </span>
                  <span className="hidden text-foreground sm:block">
                    {firstName}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full z-40 mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-white/[0.08] bg-popover/95 p-1 shadow-soft backdrop-blur-xl animate-fade-up">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.06]"
                      >
                        <Sparkles size={14} className="text-[var(--ember)]" />
                        Edit profile
                      </Link>
                      <Link
                        href={`/users/${user.id}`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.06]"
                      >
                        View public profile
                      </Link>
                      <div className="my-1 h-px bg-white/[0.06]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.86_0.12_55),oklch(0.68_0.2_25))] px-4 py-2 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      {user && (
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-5 pb-2 sm:px-6 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive(l.href)
                  ? "bg-white/[0.07] text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
          {user?.is_admin && (
            <Link
              href="/admin"
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors text-[var(--ember)]",
                isActive("/admin")
                  ? "bg-white/[0.07] text-foreground"
                  : "hover:text-foreground",
              )}
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              if (user?.is_admin) {
                router.push("/admin");
              } else {
                setShowListHackathonPopup(true);
              }
            }}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            List a Hackathon
          </button>
        </div>
      )}

      {showListHackathonPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-card p-6 shadow-soft animate-fade-up">
            <h3 className="font-display text-2xl font-semibold text-foreground">List your Hackathon</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Listing a hackathon requires a one-time payment of ₹199. Please fill out the form below to complete the payment and get your hackathon featured.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowListHackathonPopup(false)}
                className="rounded-full border border-white/[0.08] bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <Link
                href="https://forms.gle/AuwSKnRSKD5nrkED9"
                target="_blank"
                onClick={() => setShowListHackathonPopup(false)}
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] px-5 py-2.5 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px"
              >
                Continue to form
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
