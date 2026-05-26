"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Cloud, Eye, EyeOff, LogIn, LogOut, ShieldCheck, X } from "lucide-react";
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

const countryOptions = [
  "United States",
  "Israel",
  "Canada",
  "United Kingdom",
  "Australia",
  "France",
  "Germany",
  "Netherlands",
  "South Africa",
  "Mexico",
  "Argentina",
  "Brazil",
  "Other"
];

const phonePrefixes = [
  { label: "US +1", value: "+1" },
  { label: "IL +972", value: "+972" },
  { label: "CA +1", value: "+1" },
  { label: "UK +44", value: "+44" },
  { label: "AU +61", value: "+61" },
  { label: "FR +33", value: "+33" },
  { label: "DE +49", value: "+49" },
  { label: "NL +31", value: "+31" },
  { label: "ZA +27", value: "+27" },
  { label: "MX +52", value: "+52" },
  { label: "AR +54", value: "+54" },
  { label: "BR +55", value: "+55" }
];

function splitPhoneNumber(value: string) {
  const clean = String(value || "").trim();
  const match = phonePrefixes.find((prefix) => clean.startsWith(`${prefix.value} `) || clean === prefix.value);
  if (!match) return { prefix: "+1", number: clean };
  return { prefix: match.value, number: clean.replace(match.value, "").trim() };
}

function formatPhoneNumber(prefix: string, number: string) {
  const clean = number.trim();
  if (!clean) return "";
  return `${prefix} ${clean}`;
}

function hasCloudWorkspaceData(workspace: unknown) {
  if (!workspace || typeof workspace !== "object") return false;
  const data = workspace as { lineupState?: unknown; studioData?: unknown };
  return Boolean(data.lineupState || data.studioData);
}

type AuthButtonProps = {
  initialMode?: AuthMode;
};

function getAccountModeFromUrl(): Exclude<AuthMode, "closed"> | null {
  if (typeof window === "undefined") return null;
  const account = new URL(window.location.href).searchParams.get("account");
  if (account === "sign-up" || account === "sign-in" || account === "recover" || account === "signed-in") return account;
  return null;
}

export function AuthButton({ initialMode = "closed" }: AuthButtonProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [session, setSession] = useState<CloudSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+1");
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
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setMounted(true);
    const stored = getStoredSession();
    setSession(stored);
    if (stored?.user?.email) setEmail(stored.user.email);
    hydrateProfile(stored);

    const queryMode = getAccountModeFromUrl();
    if (queryMode) openMode(queryMode);
  }, []);

  useEffect(() => {
    if (initialMode !== "closed") openMode(initialMode);
  }, [initialMode, openMode]);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : null;
      const requestedMode = detail?.mode === "sign-up" ? "sign-up" : detail?.mode === "signed-in" ? "signed-in" : "sign-in";
      openMode(session ? "signed-in" : requestedMode);
    }
    window.addEventListener("songleading-auth-open", handleOpen);
    return () => window.removeEventListener("songleading-auth-open", handleOpen);
  }, [openMode, session]);

  useEffect(() => {
    if (mode === "closed" || typeof document === "undefined") return;
    document.body.classList.add("account-dialog-open");
    return () => document.body.classList.remove("account-dialog-open");
  }, [mode]);

  function hydrateProfile(source?: CloudSession | null) {
    const profile = normalizeCloudProfile(source?.user?.user_metadata || null);
    const phoneParts = splitPhoneNumber(profile.phone);
    setFullName(profile.fullName);
    setPhonePrefix(phoneParts.prefix);
    setPhone(phoneParts.number);
    setCountry(countryOptions.includes(profile.country) ? profile.country : "");
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
      const phoneParts = splitPhoneNumber(profile.phone);
      setFullName(profile.fullName);
      setPhonePrefix(phoneParts.prefix);
      setPhone(phoneParts.number);
      setCountry(countryOptions.includes(profile.country) ? profile.country : "");
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
    setShowPassword(false);
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
        phone: formatPhoneNumber(phonePrefix, phone),
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
      window.dispatchEvent(new CustomEvent("songleading-auth-signed-in", { detail: nextSession }));
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
      await requestPasswordRecovery(email.trim(), formatPhoneNumber(phonePrefix, phone));
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
        phone: formatPhoneNumber(phonePrefix, phone),
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
        <a
          href={`/?account=${session ? "signed-in" : "sign-in"}`}
          className="top-symbol-button account-nav-link"
          aria-label={session ? "Open account" : "Sign in"}
          title={session ? "Account" : "Sign in"}
          onClick={(event) => {
            event.preventDefault();
            openMode(session ? "signed-in" : "sign-in");
          }}
        >
          {session ? <Cloud size={16} /> : <LogIn size={16} />}
          <span>{session ? "Account" : "Sign in"}</span>
        </a>
        {session?.user?.email?.toLowerCase() === ADMIN_EMAIL ? (
          <a
            href="/admin"
            className="top-symbol-button account-nav-link"
            aria-label="Admin"
            title="Admin"
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </a>
        ) : null}
      </span>

      {mode !== "closed" && mounted && typeof document !== "undefined" ? createPortal(
        <div className="account-dialog-backdrop fixed inset-0 isolate grid place-items-center overflow-y-auto bg-slate-950/55 px-3 py-5 backdrop-blur-md sm:px-4 sm:py-6">
          <section className="account-dialog-card relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl ring-1 ring-slate-950/10 sm:max-w-[34rem]">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Account</p>
                <h2 className="mt-1 text-2xl font-black">
                  {session ? "Sync" : mode === "sign-up" ? "Create account" : mode === "recover" ? "Recover password" : "Sign in"}
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="grid min-w-0 gap-1 text-sm font-bold text-slate-600">
                        Phone number
                        <span className="grid min-w-0 grid-cols-[minmax(5.75rem,6.7rem)_minmax(0,1fr)] gap-2">
                          <select value={phonePrefix} onChange={(event) => setPhonePrefix(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 px-2 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" aria-label="Phone prefix">
                            {phonePrefixes.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
                          </select>
                          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="tel" />
                        </span>
                      </label>
                      <label className="grid min-w-0 gap-1 text-sm font-bold text-slate-600">
                        Country
                        <select value={country} onChange={(event) => setCountry(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="country-name">
                          <option value="">Select country</option>
                          {countryOptions.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
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
                    <span className="account-password-field grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="min-w-0 rounded-xl border-0 px-3 py-3 text-base font-semibold text-slate-950 outline-none"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </span>
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
                <div className="grid gap-2 pt-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => submit(mode === "sign-up" ? "sign-up" : "sign-in")}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    {mode === "sign-up" ? "Create account" : "Sign in"}
                  </button>
                  {mode === "sign-in" ? (
                    <button
                      type="button"
                      onClick={() => setMode("sign-up")}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-300 hover:text-blue-700"
                    >
                      Create account
                    </button>
                  ) : null}
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
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="grid min-w-0 gap-1 text-sm font-bold text-slate-600">
                      Phone number
                      <span className="grid min-w-0 grid-cols-[minmax(5.75rem,6.7rem)_minmax(0,1fr)] gap-2">
                        <select value={phonePrefix} onChange={(event) => setPhonePrefix(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" aria-label="Phone prefix">
                          {phonePrefixes.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
                        </select>
                        <input value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="tel" />
                      </span>
                    </label>
                    <label className="grid min-w-0 gap-1 text-sm font-bold text-slate-600">
                      Country
                      <select value={country} onChange={(event) => setCountry(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none focus:border-blue-400" autoComplete="country-name">
                        <option value="">Select country</option>
                        {countryOptions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
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
        </div>,
        document.body
      ) : null}
    </>
  );
}
