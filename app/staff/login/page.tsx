"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { clinic } from "@/lib/content";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/staff";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Sign in failed.");
        setBusy(false);
        return;
      }
      router.replace(next.startsWith("/staff") ? next : "/staff");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
    }
  }

  return (
    <form style={{ width: "100%", maxWidth: 360, display: "grid", gap: 18 }} onSubmit={submit}>
      <h2 style={{ fontSize: 28, letterSpacing: "-0.025em", margin: "0 0 4px" }}>Staff sign in</h2>
      <div className="field">
        <label htmlFor="ad-user" style={{ fontSize: 13 }}>
          Email
        </label>
        <input
          className="input"
          id="ad-user"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic"
          style={{ minHeight: 48, fontSize: 16, borderRadius: 20 }}
        />
      </div>
      <div className="field">
        <label htmlFor="ad-pass" style={{ fontSize: 13 }}>
          Password
        </label>
        <input
          className="input"
          id="ad-pass"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ minHeight: 48, fontSize: 16, borderRadius: 20 }}
        />
      </div>
      {error && (
        <p style={{ fontSize: 14, color: "var(--color-accent-2-700)", margin: 0 }}>{error}</p>
      )}
      <button
        className="btn btn-primary"
        type="submit"
        disabled={busy}
        style={{ fontSize: 12, padding: "16px 28px" }}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <Link href="/" style={{ fontSize: 14 }}>
        ← Back to the website
      </Link>
    </form>
  );
}

export default function StaffLoginPage() {
  return (
    <main
      className="two"
      style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          background: "var(--color-accent-800)",
          color: "#ffffff",
          gap: 48,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/images/logo.jpeg"
            alt=""
            style={{
              height: 52,
              width: "auto",
              display: "block",
              flex: "none",
              background: "#ffffff",
              borderRadius: 12,
              padding: 6,
            }}
          />
          <div>
            <p style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: "var(--font-heading)" }}>
              {clinic.name}
            </p>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-neutral-500)",
                margin: "6px 0 0",
              }}
            >
              Practice management
            </p>
          </div>
        </div>
        <div>
          <h1
            style={{
              fontSize: "clamp(32px,3.6vw,50px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              margin: "0 0 16px",
              color: "#ffffff",
              maxWidth: "16ch",
            }}
          >
            Appointments, availability and the health library.
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-accent-100)", margin: 0, maxWidth: "40ch" }}>
            Staff access only. Patient information handled here is confidential.
          </p>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-neutral-600)", margin: 0 }}>
          Electronic City Phase-1, Bengaluru
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
