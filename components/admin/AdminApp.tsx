"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  countEnrollmentMetrics,
  DEFAULT_ENROLLMENT_STATUS,
  ENROLLMENT_STATUSES,
  normalizeEnrollmentStatus,
  type EnrollmentStatus,
} from "@/lib/enrollment";
import { createClient, type LeadRow } from "@/lib/supabase/client";

type SessionState = "loading" | "anon" | "authed" | "denied" | "misconfigured";

function formatIstDisplay(iso: string | null, fallbackIst: string | null) {
  if (fallbackIst) return fallbackIst;
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function enrollmentBadgeClass(status: EnrollmentStatus) {
  switch (status) {
    case "Enrolled":
      return "bg-[#e8f3ea] text-[#1f5c2e] ring-[#1f5c2e]/15";
    case "Pending Enrollment":
      return "bg-[#fff4df] text-[#8a5a00] ring-[#8a5a00]/15";
    case "Contacted":
      return "bg-[#eef3f8] text-[#2f4f6b] ring-[#2f4f6b]/15";
    case "Not Interested":
      return "bg-[#f7eaea] text-[#7a2424] ring-[#7a2424]/15";
    default:
      return "bg-[#f3efe6] text-[#510f11] ring-[#510f11]/12";
  }
}

function sheetBadge(lead: LeadRow) {
  if (lead.sheet_sync_error) {
    return {
      label: "Error",
      className: "bg-[#f7eaea] text-[#7a2424] ring-[#7a2424]/15",
      title: lead.sheet_sync_error,
    };
  }
  if (lead.sheet_synced_at) {
    return {
      label: "Synced",
      className: "bg-[#e8f3ea] text-[#1f5c2e] ring-[#1f5c2e]/15",
      title: `Synced ${lead.sheet_synced_at}`,
    };
  }
  return {
    label: "Pending",
    className: "bg-[#fff4df] text-[#8a5a00] ring-[#8a5a00]/15",
    title: "Waiting for Sheets sync",
  };
}

async function syncEnrollmentSecure(
  lead: LeadRow,
  enrollmentStatus: string,
  accessToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${baseUrl}/functions/v1/sync-enrollment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      leadId: lead.id,
      enrollmentStatus,
    }),
  });

  let result: { ok?: boolean; error?: string; sheetSynced?: boolean } = {
    ok: response.ok,
  };
  try {
    result = await response.json();
  } catch {
    // ignore
  }

  if (!response.ok || result.ok === false) {
    throw new Error(result.error || "Failed to update enrollment status");
  }

  return result;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-[#1a0506]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,168,76,0.18),_transparent_55%),linear-gradient(180deg,#f7f1e4_0%,#f3ebe0_45%,#efe6d8_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23510f11' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function AdminApp() {
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [trackFilter, setTrackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const supabase = useMemo(() => {
    if (!supabaseConfigured) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, [supabaseConfigured]);

  useEffect(() => {
    if (!supabase) {
      setSessionState("misconfigured");
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      const { data } = await supabase!.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setSessionState("anon");
        return;
      }
      await loadLeads();
    }

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSessionState("anon");
        setLeads([]);
        return;
      }
      void loadLeads();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    if (!supabase || sessionState !== "authed") return;

    const channel = supabase
      .channel("admin-leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          void loadLeads(false);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, sessionState]);

  async function loadLeads(showLoading = true) {
    if (!supabase) return;
    if (showLoading) setBusy(true);
    setAuthError("");

    const { data, error } = await supabase
      .from("leads")
      .select(
        "id, full_name, email, phone, country_code, track, current_status, enrollment_status, source, client_submitted_at, created_at, created_at_ist, sheet_synced_at, sheet_sync_error, sheet_extra"
      )
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42501" || /permission|rls|policy/i.test(error.message)) {
        setSessionState("denied");
        setAuthError(
          "Signed in, but this account is not on the admin allowlist. Add your user_id to admin_users."
        );
      } else {
        setAuthError(error.message);
        setSessionState("authed");
      }
      setBusy(false);
      return;
    }

    setLeads((data || []) as LeadRow[]);
    setSessionState("authed");
    setBusy(false);
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setAuthError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError(error.message);
      setBusy(false);
      return;
    }

    await loadLeads();
  }

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSessionState("anon");
    setLeads([]);
  }

  async function onEnrollmentStatusChange(
    lead: LeadRow,
    nextStatus: EnrollmentStatus
  ) {
    if (!supabase) return;
    const previous =
      normalizeEnrollmentStatus(lead.enrollment_status) ||
      DEFAULT_ENROLLMENT_STATUS;
    if (previous === nextStatus) return;

    setUpdatingId(lead.id);
    setAuthError("");
    setLeads((prev) =>
      prev.map((row) =>
        row.id === lead.id ? { ...row, enrollment_status: nextStatus } : row
      )
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Your session expired. Please sign in again.");
      }

      await syncEnrollmentSecure(lead, nextStatus, session.access_token);
    } catch (err) {
      setLeads((prev) =>
        prev.map((row) =>
          row.id === lead.id ? { ...row, enrollment_status: previous } : row
        )
      );
      setAuthError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const trackOk = trackFilter === "all" ? true : lead.track === trackFilter;
    const status =
      normalizeEnrollmentStatus(lead.enrollment_status) ||
      DEFAULT_ENROLLMENT_STATUS;
    const statusOk = statusFilter === "all" ? true : status === statusFilter;
    const q = search.trim().toLowerCase();
    const searchOk =
      !q ||
      lead.full_name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q);
    return trackOk && statusOk && searchOk;
  });

  const metrics = countEnrollmentMetrics(leads);

  if (sessionState === "misconfigured") {
    return (
      <AdminShell>
        <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-16">
          <div className="w-full rounded-2xl border border-[#510f11]/12 bg-white/90 p-8 shadow-[0_20px_50px_rgba(81,15,17,0.08)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a84c]">
              Apex Union
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#1a0506]">
              Admin setup needed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#1a0506]">
              Set <code className="rounded bg-[#f7f1e4] px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and{" "}
              <code className="rounded bg-[#f7f1e4] px-1.5 py-0.5">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              in <code className="rounded bg-[#f7f1e4] px-1.5 py-0.5">.env.local</code>, then
              restart the dev server.
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (sessionState === "loading") {
    return (
      <AdminShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="rounded-2xl border border-[#510f11]/10 bg-white/85 px-8 py-6 text-sm font-medium text-[#1a0506] shadow-sm backdrop-blur">
            Loading admin workspace…
          </div>
        </div>
      </AdminShell>
    );
  }

  if (sessionState === "anon" || sessionState === "denied") {
    return (
      <AdminShell>
        <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
          <div className="w-full overflow-hidden rounded-2xl border border-[#510f11]/12 bg-white/95 shadow-[0_24px_60px_rgba(81,15,17,0.12)] backdrop-blur">
            <div className="border-b border-[#510f11]/08 bg-[#510f11] px-8 py-7 text-[#fdfad4]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                Apex Union
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                Admin Console
              </h1>
              <p className="mt-2 text-sm text-[#fdfad4]">
                Sign in to manage leads and enrollment.
              </p>
            </div>
            <form onSubmit={onLogin} className="space-y-4 px-8 py-7">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#1a0506]">
                  Email
                </label>
                <input
                  className="w-full rounded-xl border border-[#510f11]/15 bg-[#fbf7ef] px-3.5 py-2.5 text-[#1a0506] outline-none transition focus:border-[#510f11]/35 focus:bg-white focus:ring-2 focus:ring-[#c9a84c]/35"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#1a0506]">
                  Password
                </label>
                <input
                  className="w-full rounded-xl border border-[#510f11]/15 bg-[#fbf7ef] px-3.5 py-2.5 text-[#1a0506] outline-none transition focus:border-[#510f11]/35 focus:bg-white focus:ring-2 focus:ring-[#c9a84c]/35"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {authError ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {authError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#510f11] px-4 py-3 text-sm font-semibold text-[#fdfad4] transition hover:bg-[#3d0b0d] disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              {sessionState === "denied" ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full text-sm text-[#1a0506] underline underline-offset-2"
                >
                  Sign out
                </button>
              ) : null}
            </form>
          </div>
        </div>
      </AdminShell>
    );
  }

  const metricCards = [
    {
      label: "Total Leads",
      value: String(metrics.total),
      hint: "All registrations",
      accent: "from-[#510f11] to-[#6b1e20]",
    },
    {
      label: "Pending Enrollment",
      value: String(metrics.pending),
      hint: "Awaiting confirmation",
      accent: "from-[#8a5a00] to-[#a8741a]",
    },
    {
      label: "Enrolled",
      value: String(metrics.enrolled),
      hint: "Successfully enrolled",
      accent: "from-[#1f5c2e] to-[#2d7a3f]",
    },
    {
      label: "Conversion",
      value: `${metrics.conversionPct}%`,
      hint: `New ${metrics.new} · Contacted ${metrics.contacted}`,
      accent: "from-[#c9a84c] to-[#a88a35]",
    },
  ];

  return (
    <AdminShell>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-[#510f11]/10 bg-[#510f11] px-5 py-5 text-[#fdfad4] shadow-[0_18px_40px_rgba(81,15,17,0.18)] sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a84c]">
              Apex Union
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Leads & Enrollment
            </h1>
            <p className="mt-1.5 text-sm text-[#fdfad4]">
              Live feed · IST · showing {filteredLeads.length} of {leads.length}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void loadLeads()}
              className="rounded-xl border border-[#fdfad4]/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[#fdfad4] transition hover:bg-white/10"
            >
              {busy ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl bg-[#c9a84c] px-4 py-2.5 text-sm font-semibold text-[#1a0506] transition hover:bg-[#d4b65d]"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {metricCards.map((card) => (
            <div
              key={card.label}
              className="flex min-h-[118px] flex-col overflow-hidden rounded-2xl border border-[#510f11]/10 bg-white shadow-[0_10px_30px_rgba(81,15,17,0.06)]"
            >
              <div className={`h-1.5 bg-gradient-to-r ${card.accent}`} />
              <div className="flex flex-1 flex-col justify-between px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a0506]">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#1a0506] sm:text-3xl">
                  {card.value}
                </p>
                <p className="mt-1 text-xs leading-snug text-[#32090a]">
                  {card.hint}
                </p>
              </div>
            </div>
          ))}
        </section>

        {authError ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {authError}
          </p>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#510f11]/10 bg-white shadow-[0_14px_40px_rgba(81,15,17,0.07)]">
          <div className="border-b border-[#510f11]/08 bg-[#fbf7ef] px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#1a0506]">Lead directory</h2>
              <p className="text-xs font-medium text-[#32090a]">
                Filter and update enrollment
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <label className="block md:col-span-5">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#1a0506]">
                  Search
                </span>
                <input
                  className="h-10 w-full rounded-xl border border-[#510f11]/15 bg-white px-3 text-sm text-[#1a0506] outline-none transition focus:border-[#510f11]/35 focus:ring-2 focus:ring-[#c9a84c]/30"
                  placeholder="Name, email, or phone"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="block md:col-span-3">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#1a0506]">
                  Track
                </span>
                <select
                  className="h-10 w-full rounded-xl border border-[#510f11]/15 bg-white px-3 text-sm text-[#1a0506] outline-none transition focus:border-[#510f11]/35 focus:ring-2 focus:ring-[#c9a84c]/30"
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                >
                  <option value="all">All tracks</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </label>
              <label className="block md:col-span-4">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#1a0506]">
                  Enrollment
                </span>
                <select
                  className="h-10 w-full rounded-xl border border-[#510f11]/15 bg-white px-3 text-sm text-[#1a0506] outline-none transition focus:border-[#510f11]/35 focus:ring-2 focus:ring-[#c9a84c]/30"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {ENROLLMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="-mx-px overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-gutter:stable]">
            <table className="w-max min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#510f11]/10 bg-[#f3ebe0] text-[11px] uppercase tracking-[0.1em] text-[#1a0506]">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    S.No
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Created
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Lead
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Track
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Applicant
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Enrollment
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Source
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">
                    Sheets
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-16 text-center text-[#32090a]"
                      colSpan={9}
                    >
                      {busy ? "Loading leads…" : "No leads match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, index) => {
                    const enrollment =
                      normalizeEnrollmentStatus(lead.enrollment_status) ||
                      DEFAULT_ENROLLMENT_STATUS;
                    const sheet = sheetBadge(lead);

                    return (
                      <tr
                        key={lead.id}
                        className="border-t border-[#510f11]/08 align-top transition hover:bg-[#fbf7ef]"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#1a0506]">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#1a0506]">
                          {formatIstDisplay(
                            lead.created_at,
                            lead.created_at_ist
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#1a0506]">
                          {lead.full_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <p className="text-[#1a0506]">{lead.email}</p>
                          <p className="mt-0.5 text-xs text-[#32090a]">
                            {lead.phone}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="inline-flex rounded-lg bg-[#f3efe6] px-2.5 py-1 text-xs font-semibold text-[#1a0506] ring-1 ring-[#510f11]/10">
                            {lead.track}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#1a0506]">
                          {lead.current_status}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <select
                            className={`h-9 min-w-[11.5rem] rounded-lg border-0 px-2.5 text-xs font-semibold outline-none ring-1 focus:ring-2 focus:ring-[#c9a84c]/40 disabled:opacity-50 ${enrollmentBadgeClass(enrollment)}`}
                            value={enrollment}
                            disabled={updatingId === lead.id}
                            onChange={(e) => {
                              const next = normalizeEnrollmentStatus(
                                e.target.value
                              );
                              if (!next) return;
                              void onEnrollmentStatusChange(lead, next);
                            }}
                          >
                            {ENROLLMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#1a0506]">
                          {lead.source || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span
                            title={sheet.title}
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${sheet.className}`}
                          >
                            {sheet.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[#510f11]/08 bg-[#fbf7ef] px-4 py-2 text-xs text-[#32090a] sm:px-5">
            Scroll left or right to view all columns when needed.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
