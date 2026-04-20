"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pwStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ["—", "Weak", "Fair", "Good", "Strong"][pwStrength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-change"));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[1fr_1.05fr]">
      <section className="relative flex items-center justify-center px-6 py-20 order-2 lg:order-1">
        <div className="absolute inset-0 lg:hidden">
          <GridPattern variant="dots" fade="radial" />
        </div>
        <div className="relative z-10 w-full max-w-sm animate-fade-up">
          <div className="lg:hidden mb-10"><Logo /></div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have one?{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <Field label="Full name">
              <User2 size={15} className="text-muted-foreground" />
              <input
                required
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </Field>

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

            <div>
              <Field label="Password">
                <Lock size={15} className="text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="At least 8 characters"
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
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < pwStrength
                          ? "bg-[color-mix(in_oklch,var(--ember)_80%,transparent)]"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono tabular-nums text-muted-foreground min-w-[48px] text-right">
                  {strengthLabel}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,oklch(0.82_0.16_55),oklch(0.68_0.2_25))] py-3 text-sm font-medium text-white shadow-ember transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating your account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="pt-2 text-[11px] text-muted-foreground">
              By creating an account you agree to behave like a good hackathon teammate.
            </p>
          </form>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-white/[0.06] lg:order-2 lg:block">
        <GridPattern variant="dots" fade="radial" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,oklch(0.78_0.2_40/0.18),transparent_60%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md animate-fade-up">
            <p className="font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-foreground text-balance">
              A home for every{" "}
              <span className="font-serif italic font-normal text-ember-gradient">hackathon</span>{" "}
              you join.
            </p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Skill-aware matching, team chat, and profiles built for shipping — not for a recruiter.
            </p>
          </div>
          <ul className="max-w-sm space-y-2 text-sm text-muted-foreground">
            <CheckRow>Matched on stack, not on vibes</CheckRow>
            <CheckRow>Realtime chat that doesn't get lost</CheckRow>
            <CheckRow>Free, forever</CheckRow>
          </ul>
        </div>
      </aside>
    </div>
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

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-5 w-5 place-items-center rounded-full border border-[color-mix(in_oklch,var(--mint)_40%,transparent)] bg-[color-mix(in_oklch,var(--mint)_14%,transparent)] text-[color-mix(in_oklch,var(--mint)_90%,white)]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1.5 5.2L4 7.7L8.7 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {children}
    </li>
  );
}
