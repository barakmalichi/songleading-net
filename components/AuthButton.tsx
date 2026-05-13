"use client";

import { useEffect, useState } from "react";
import { Check, Cloud, LogIn, LogOut, RefreshCcw, UploadCloud, X } from "lucide-react";
import {
  getStoredSession,
  loadCloudWorkspaceOntoDevice,
  saveCurrentDeviceToCloud,
  setStoredSession,
  signInToCloud,
  signUpForCloud,
  type CloudSession
} from "@/lib/cloudClient";

type Mode = "closed" | "sign-in" | "signed-in";

export function AuthButton() {
  const [mode, setMode] = useState<Mode>("closed");
  const [session, setSession] = useState<CloudSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
    if (stored?.user?.email) setEmail(stored.user.email);
  }, []);

  const close = () => {
    setMode("closed");
    setPassword("");
    setMessage("");
  };

  async function submit(action: "sign-in" | "sign-up") {
    setBusy(true);
    setMessage("");
    try {
      const nextSession =
        action === "sign-in" ? await signInToCloud(email.trim(), password) : await signUpForCloud(email.trim(), password);
      if (!nextSession.access_token) {
        setSession(null);
        setStoredSession(null);
        setMessage("Account created. Check your email, then sign in.");
        return;
      }
      setSession(nextSession);
      await saveCurrentDeviceToCloud();
      setMode("signed-in");
      setPassword("");
      setMessage("Signed in. This device is now saved to your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDevice() {
    setBusy(true);
    setMessage("");
    try {
      await saveCurrentDeviceToCloud();
      setMessage("Saved this device to your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sync.");
    } finally {
      setBusy(false);
    }
  }

  async function loadCloud() {
    setBusy(true);
    setMessage("");
    try {
      await loadCloudWorkspaceOntoDevice();
      setMessage("Cloud workspace loaded. Refreshing...");
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load cloud workspace.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setStoredSession(null);
    setSession(null);
    setMode("closed");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMode(session ? "signed-in" : "sign-in")}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
      >
        {session ? <Cloud size={16} /> : <LogIn size={16} />}
        {session ? "Account" : "Sign in"}
      </button>

      {mode !== "closed" ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Account</p>
                <h2 className="mt-1 text-2xl font-black">{session ? "Sync" : "Sign in"}</h2>
              </div>
              <button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X size={20} />
              </button>
            </header>

            {!session ? (
              <div className="mt-5 grid gap-3">
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400"
                    type="email"
                    autoComplete="email"
                  />
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-600">
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400"
                    type="password"
                    autoComplete="current-password"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submit("sign-in")}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submit("sign-up")}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-60"
                  >
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-sm font-black text-blue-800">
                  <Check size={17} />
                  {session.user?.email || email || "Signed in"}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={saveDevice}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-60"
                >
                  <UploadCloud size={17} />
                  Save this device to cloud
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={loadCloud}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 disabled:opacity-60"
                >
                  <RefreshCcw size={17} />
                  Load cloud on this device
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-slate-500 hover:bg-slate-100"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            )}

            {message ? <p className="mt-4 text-sm font-bold leading-6 text-slate-500">{message}</p> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
