"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { GridPattern } from "@/components/ui/grid-pattern";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      const safeNext = next && next.startsWith("/") ? next : "/dashboard";
      router.push(safeNext);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Editorial side */}
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">
        <GridPattern variant="dots" fade="radial" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.78_0.2_40/0.18),transparent_60%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md animate-fade-up">
            <p className="font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-foreground text-balance">
              Welcome <span className="font-serif italic font-normal text-ember-gradient">back</span>.
              <br />
              Your team is waiting.
            </p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Pick up conversations, review incoming requests, and keep building.
            </p>
          </div>
          <figure className="max-w-sm">
            <blockquote className="text-[13px] leading-relaxed text-muted-foreground">
              “Built our winning team in an hour. Three great people I'd never have met on Discord.”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,oklch(0.88_0.12_60),oklch(0.62_0.2_25))] text-[10px] font-bold text-white">
                SR
              </span>
              Sana R. — winner, TreeHacks '25
            </figcaption>
          </figure>
        </div>
      </aside>

      {/* Form */}
      <section className="relative flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 lg:hidden">
          <GridPattern variant="dots" fade="radial" />
        </div>
        <div className="relative z-10 w-full max-w-sm animate-fade-up">
          <div className="lg:hidden mb-10"><Logo /></div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <Field label="Email">
              <Mail size={15} className="text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </Field>

            <Field label="Password">
              <Lock size={15} className="text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] py-3 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 transition-all focus-within:border-[color-mix(in_oklch,var(--ember)_40%,transparent)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--ember)_30%,transparent)]">
        {children}
      </span>
    </label>
  );
}
