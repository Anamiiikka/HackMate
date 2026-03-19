"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");
    setIsAuthenticated(!!token);
    if (userStr) {
      try {
        setUserName(JSON.parse(userStr).name);
      } catch (e) {}
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">HackMate</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className={`text-sm tracking-wide transition-colors ${pathname === "/" ? "text-white" : "text-neutral-400 hover:text-white"}`}>
            Explore
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className={`text-sm tracking-wide transition-colors ${pathname.includes("/dashboard") ? "text-white" : "text-neutral-400 hover:text-white"}`}>
                Dashboard
              </Link>
              <div className="h-4 w-px bg-white/20 mx-2" />
              <span className="text-sm text-neutral-300">Hi, {userName.split(" ")[0]}</span>
              <button 
                onClick={handleLogout}
                className="text-sm text-neutral-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="h-4 w-px bg-white/20 mx-2" />
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Log In
              </Link>
              <Link href="/register" className="text-sm font-medium bg-white text-black px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
