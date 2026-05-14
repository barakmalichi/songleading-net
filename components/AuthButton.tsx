"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Cloud, LogIn, LogOut, UserPlus, X } from "lucide-react";
import {
  fetchCloudProfile,
  getStoredSession,
  loadCloudWorkspaceOntoDevice,
  normalizeCloudProfile,
  requestPasswordRecovery,
  saveCloudProfile,
  saveCurrentDeviceToCloud,
  setStoredSession,
  signInToCloud,
  signUpForCloud,
  type SignupProfile,
  type CloudSession
} from "@/lib/cloudClient";

export type AuthMode = "closed" | "sign-in" | "sign-up" | "recover" | "signed-in";

const useCases = [
  "Summer camp",
  "Temple / synagogue",
  "Community singalong",
  "School / educational program",
  "Other"
];

const ADMIN_EMAIL = "barakmalichi@gmail.com";

function hasCloudWorkspaceData(workspace: unknown) {
  if (!workspace || typeof workspace !== "object") return false;
  const data = workspace as { lineupState?: unknown; studioData?: unknown };
  return Boolean(data.lineupState || data.studioData);
}

type AuthButtonProps = {
  initialMode?: AuthMode;
};

export function AuthButton({ initialMode = "closed" }: AuthButtonProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
  const [instrument, setInstrument] = useState("");
  const [communityInstitution, setCommunityInstitution] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const openMode = useCallback((nextMode: Exclude<AuthMode, "closed">) => {
    setMessage("");
    setMode(nextMode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("account", nextMode);
      window.history.replaceState(null, "", url);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
    if (stored?.user?.email) setEmail(stored.user.email);
    hydrateProfile(stored);
  }, []);

  useEffect(() => {
    if (initialMode !== "closed") openMode(initialMode);
  }, [initialMode, openMode]);

  function hydrateProfile(source?: CloudSession | null) {
    const profile = normalizeCloudProfile(source?.user?.user_metadata || null);
    setFullName(profile.fullName);
    setPhone(profile.phone);
    setCountry(profile.country);
    setUseCase(profile.useCase || "Summer camp");
    setCampName(profile.campName || "");
    setSynagogueName(profile.synagogueName || "");
    setOtherUseCase(profile.otherUseCase || "");
    setInstrument(profile.instrument || "");
    setCommunityInstitution(profile.communityInstitution || "");
  }

  async function refreshProfile() {
    if (!getStoredSession()) return;
    try {
      const data = await fetchCloudProfile();
      const profile = normalizeCloudProfile(data.profile || data.user?.user_metadata || {});
      setFullName(profile.fullName);
      setPhone(profile.phone);
      setCountry(profile.country);
      setUseCase(profile.useCase || "Summer camp");
      setCampName(profile.campName || "");
      setSynagogueName(profile.synagogueName || "");
      setOtherUseCase(profile.otherUseCase || "");
      setInstrument(profile.instrument || "");
      setCommunityInstitution(profile.communityInstitution || "");
    } catch {
      hydrateProfile(getStoredSession());
    }
  }

  const close = () => {
    setMode("closed");
    setPassword("");
    setMessage("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("account");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
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
        otherUseCase: otherUseCase.trim(),
        instrument: instrument.trim(),
        communityInstitution: communityInstitution.trim()
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
      if (action === "sign-in") {
        const workspace = await loadCloudWorkspaceOntoDevice();
        if (!hasCloudWorkspaceData(workspace)) {
          await saveCurrentDeviceToCloud();
        }
      } else {
        await saveCurrentDeviceToCloud();
      }
      setMode("signed-in");
      hydrateProfile(nextSession);
      setPassword("");
      setMessage("Your cloud workspace is active. Changes save automatically.");
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

  function signOut() {
    setStoredSession(null);
    setSession(null);
    setMode("closed");
  }

  async function saveProfile() {
    setBusy(true);
    setMessage("");
    try {
      await saveCloudProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        useCase,
        campName: campName.trim(),
        synagogueName: synagogueName.trim(),
        otherUseCase: otherUseCase.trim(),
        instrument: instrument.trim(),
        communityInstitution: communityInstitution.trim()
      });
      setSession(getStoredSession());
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span className="auth-actions inline-flex items-center gap-2">
        {!session ? (
          <a
            href="/?account=sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus size={16} />
            Sign Up
          </a>
        ) : null}
        <a
          href={`/?account=${session ? "signed-in" : "sign-in"}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          {session ? <Cloud size={16} /> : <LogIn size={16} />}
          {session ? "Account" : "Sign in"}
        </a>
        {session?.user?.email?.toLowerCase() === ADMIN_EMAIL ? (
          <a
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
          >
            Admin
          </a>
        ) : null}
      </span>

      {mode !== "closed" ? (
        <div className="fixed inset-0 z-[9999] isolate grid place-items-center overflow-y-auto bg-slate-950/55 px-3 py-5 backdrop-blur-md sm:px-4 sm:py-6">
          <section className="relative z-[10000] max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl ring-1 ring-slate-950/10">
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        My instrument
                        <input value={instrument} onChange={(event) => setInstrument(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Guitar, piano..." />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-slate-600">
                        Community / institution
                        <input value={communityInstitution} onChange={(event) => setCommunityInstitution(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Camp, temple, school..." />
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
                <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm">Personal information</strong>
                    <button type="button" onClick={refreshProfile} className="text-xs font-black text-blue-700 hover:text-blue-900">
                      Refresh
                    </button>
                  </div>
                  <label className="grid gap-1 text-sm font-bold text-slate-600">
                    Full name
                    <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="name" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Phone number
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="tel" />
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Country
                      <input value={country} onChange={(event) => setCountry(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="country-name" />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      My instrument
                      <input value={instrument} onChange={(event) => setInstrument(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Guitar, piano..." />
                    </label>
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Community / institution
                      <input value={communityInstitution} onChange={(event) => setCommunityInstitution(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" placeholder="Camp, temple, school..." />
                    </label>
                  </div>
                  <label className="grid gap-1 text-sm font-bold text-slate-600">
                    Main use case
                    <select value={useCase} onChange={(event) => setUseCase(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400">
                      {useCases.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  {useCase === "Summer camp" ? (
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Which camp?
                      <input value={campName} onChange={(event) => setCampName(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                    </label>
                  ) : null}
                  {useCase === "Temple / synagogue" ? (
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Which temple / synagogue?
                      <input value={synagogueName} onChange={(event) => setSynagogueName(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                    </label>
                  ) : null}
                  {useCase === "Other" ? (
                    <label className="grid gap-1 text-sm font-bold text-slate-600">
                      Tell us briefly
                      <input value={otherUseCase} onChange={(event) => setOtherUseCase(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={busy}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    Save profile
                  </button>
                </div>
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
