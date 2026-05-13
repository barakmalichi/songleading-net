"use client";

import { useEffect, useState } from "react";
import { Check, Cloud, LogIn, LogOut, RefreshCcw, UploadCloud, UserPlus, X } from "lucide-react";
import {
  getStoredSession,
  loadCloudWorkspaceOntoDevice,
  requestPasswordRecovery,
  saveCurrentDeviceToCloud,
  setStoredSession,
  signInToCloud,
  signUpForCloud,
  type SignupProfile,
  type CloudSession
} from "@/lib/cloudClient";

type Mode = "closed" | "sign-in" | "sign-up" | "recover" | "signed-in";

const useCases = [
  "Summer camp",
  "Temple / synagogue",
  "Community singalong",
  "School / educational program",
  "Other"
];

export function AuthButton() {
  const [mode, setMode] = useState<Mode>("closed");
  const [session, setSession] = useState<CloudSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [useCase, setUseCase] = useState("Summer camp");
  const [campName, setCampName] = useState("");
  const [synagogueName, setSynagogueName] = useState("");
  const [otherUseCase, setOtherUseCase] = useState("");
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
      const profile: SignupProfile = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        useCase,
        campName: campName.trim(),
        synagogueName: synagogueName.trim(),
        otherUseCase: otherUseCase.trim()
      };
      const nextSession = action === "sign-in"
        ? await signInToCloud(email.trim(), password)
        : await signUpForCloud(email.trim(), password, profile);
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

  async function recoverPassword() {
    setBusy(true);
    setMessage("");
    try {
      await requestPasswordRecovery(email.trim(), phone.trim());
      setMessage("Password recovery email sent. SMS recovery depends on the phone provider connected to the account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send recovery email.");
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
      <span className="inline-flex items-center gap-2">
        {!session ? (
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus size={16} />
            Sign Up
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMode(session ? "signed-in" : "sign-in")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          {session ? <Cloud size={16} /> : <LogIn size={16} />}
          {session ? "Account" : "Sign in"}
        </button>
      </span>

      {mode !== "closed" ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <section className="max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Account</p>
                <h2 className="mt-1 text-2xl font-black">
                  {session ? "Sync" : mode === "sign-up" ? "Sign Up" : mode === "recover" ? "Recover password" : "Sign in"}
                </h2>
              </div>
              <button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X size={20} />
              </button>
            </header>

            {!session ? (
              <div className="mt-5 grid gap-3">
                {mode === "sign-up" ? (
                  <>
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Full name
                      <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="name" />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Phone number
                        <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="tel" />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Country
                        <input value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="country-name" />
                      </label>
                    </div>
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Main use case
                      <select value={useCase} onChange={(event) => setUseCase(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400">
                        {useCases.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                    {useCase === "Summer camp" ? (
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Which camp?
                        <input value={campName} onChange={(event) => setCampName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                      </label>
                    ) : null}
                    {useCase === "Temple / synagogue" ? (
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Which temple / synagogue?
                        <input value={synagogueName} onChange={(event) => setSynagogueName(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                      </label>
                    ) : null}
                    {useCase === "Other" ? (
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Tell us briefly
                        <input value={otherUseCase} onChange={(event) => setOtherUseCase(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                      </label>
                    ) : null}
                  </>
                ) : null}
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
                {mode !== "recover" ? (
                  <label className="grid gap-1 text-sm font-bold text-slate-600">
                    Password
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400"
                      type="password"
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    />
                  </label>
                ) : null}
                {mode !== "sign-up" ? (
                  <button type="button" onClick={() => setMode("recover")} className="justify-self-start text-sm font-black text-blue-700 hover:text-blue-900">
                    Forgot password?
                  </button>
                ) : null}
                {mode === "recover" ? (
                  <button
                    type="button"
                    disabled={busy || !email.trim()}
                    onClick={recoverPassword}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    Send recovery email
                  </button>
                ) : (
                <div className="grid gap-2 pt-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submit("sign-in")}
                    className={`rounded-xl px-4 py-3 text-sm font-black disabled:opacity-60 ${mode === "sign-up" ? "border border-slate-200 text-slate-900" : "bg-blue-600 text-white"}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submit("sign-up")}
                    className={`rounded-xl px-4 py-3 text-sm font-black disabled:opacity-60 ${mode === "sign-up" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-900"}`}
                  >
                    Sign Up
                  </button>
                </div>
                )}
                {mode !== "sign-in" ? (
                  <button type="button" onClick={() => setMode("sign-in")} className="justify-self-start text-sm font-black text-slate-500 hover:text-slate-900">
                    Back to sign in
                  </button>
                ) : null}
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
