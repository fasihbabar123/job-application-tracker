"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected";
type JobPriority = "Low" | "Medium" | "High";

type JobApplication = {
  id: number;
  company: string;
  title: string;
  status: JobStatus;
  priority: JobPriority;
  date: string;
  link: string;
  notes: string;
  user_id?: string;
  created_at?: string;
};

const statusStyles: Record<JobStatus, string> = {
  Applied: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  Interview: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  Offer: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Rejected: "border-red-400/40 bg-red-400/10 text-red-300",
};

const priorityStyles: Record<JobPriority, string> = {
  Low: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Medium: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  High: "border-purple-400/40 bg-purple-400/10 text-purple-300",
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [jobs, setJobs] = useState<JobApplication[]>([]);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [priority, setPriority] = useState<JobPriority>("Medium");
  const [date, setDate] = useState(getTodayDate());
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const [filter, setFilter] = useState<JobStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();

      setUser(data.session?.user ?? null);
      setIsAuthChecking(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthChecking) return;

    if (!user) {
      setJobs([]);
      setIsLoading(false);
      return;
    }

    loadJobs(user.id);
  }, [user, isAuthChecking]);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage("Email and password are required.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthMessage("Password should be at least 6 characters.");
      return;
    }

    setIsAuthLoading(true);
    setAuthMessage("");

    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setAuthMessage(error.message);
      setIsAuthLoading(false);
      return;
    }

    setAuthMessage(
      "Account created. If email confirmation is enabled, please check your email. Otherwise you can log in now."
    );
    setAuthMode("login");
    setAuthPassword("");
    setIsAuthLoading(false);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage("Email and password are required.");
      return;
    }

    setIsAuthLoading(true);
    setAuthMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    if (error) {
      setAuthMessage(error.message);
      setIsAuthLoading(false);
      return;
    }

    setAuthEmail("");
    setAuthPassword("");
    setAuthMessage("");
    setIsAuthLoading(false);
  }

  async function handleLogout() {
    setMessage("");
    setAuthMessage("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthMode("login");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      return;
    }

    resetForm();
    setJobs([]);
  }

  async function loadJobs(userId: string) {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load jobs from Supabase.");
      setIsLoading(false);
      return;
    }

    setJobs((data || []) as JobApplication[]);
    setIsLoading(false);
  }

  const appliedCount = jobs.filter((job) => job.status === "Applied").length;
  const interviewCount = jobs.filter((job) => job.status === "Interview").length;
  const offerCount = jobs.filter((job) => job.status === "Offer").length;
  const rejectedCount = jobs.filter((job) => job.status === "Rejected").length;

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === "All" || job.status === filter;

    const searchText = search.toLowerCase();
    const matchesSearch =
      job.company.toLowerCase().includes(searchText) ||
      job.title.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  function resetForm() {
    setCompany("");
    setTitle("");
    setStatus("Applied");
    setPriority("Medium");
    setDate(getTodayDate());
    setLink("");
    setNotes("");
    setEditingJobId(null);
  }

  async function handleAddOrUpdateJob(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setMessage("Please log in before adding job applications.");
      return;
    }

    if (!company.trim() || !title.trim()) {
      setMessage("Company name and job title are required.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    if (editingJobId) {
      const { error } = await supabase
        .from("jobs")
        .update({
          company,
          title,
          status,
          priority,
          date,
          link,
          notes,
        })
        .eq("id", editingJobId)
        .eq("user_id", user.id);

      if (error) {
        setMessage("Could not update job application.");
        setIsSaving(false);
        return;
      }

      setMessage("Job application updated successfully.");
      resetForm();
      await loadJobs(user.id);
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      company,
      title,
      status,
      priority,
      date,
      link,
      notes,
      user_id: user.id,
    });

    if (error) {
      setMessage("Could not add job application.");
      setIsSaving(false);
      return;
    }

    setMessage("Job application added successfully.");
    resetForm();
    await loadJobs(user.id);
    setIsSaving(false);
  }

  function handleEditJob(job: JobApplication) {
    setEditingJobId(job.id);
    setCompany(job.company);
    setTitle(job.title);
    setStatus(job.status);
    setPriority(job.priority);
    setDate(job.date || getTodayDate());
    setLink(job.link);
    setNotes(job.notes);
    setMessage("Editing selected job application.");
  }

  function handleCancelEdit() {
    resetForm();
    setMessage("Edit cancelled.");
  }

  async function handleDeleteJob(id: number) {
    if (!user) {
      setMessage("Please log in before deleting job applications.");
      return;
    }

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setMessage("Could not delete job application.");
      return;
    }

    if (editingJobId === id) {
      resetForm();
    }

    setMessage("Job application deleted.");
    await loadJobs(user.id);
  }

  async function handleLoadStarterJob() {
    if (!user) {
      setMessage("Please log in before loading starter job.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    const { error } = await supabase.from("jobs").insert({
      company: "Example Tech",
      title: "Frontend Developer",
      status: "Applied",
      priority: "Medium",
      date: getTodayDate(),
      link: "https://example.com",
      notes: "Applied through company website.",
      user_id: user.id,
    });

    if (error) {
      console.error(error);
      setMessage(`Could not load starter job: ${error.message}`);
      setIsSaving(false);
      return;
    }

    setMessage("Starter job loaded.");
    resetForm();
    await loadJobs(user.id);
    setIsSaving(false);
  }

  if (isAuthChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-lg font-semibold text-cyan-300">
            Checking login status...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <section className="mx-auto max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            Project 3
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight">
            Job Application Tracker
          </h1>

          <p className="mt-4 leading-7 text-slate-300">
            Sign up or log in to track your job applications, statuses,
            priorities, dates, links, and notes.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthMessage("");
                  setAuthPassword("");
                }}
                type="button"
                className={`rounded-xl px-4 py-3 font-semibold transition ${
                  authMode === "login"
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthMessage("");
                  setAuthPassword("");
                }}
                type="button"
                className={`rounded-xl px-4 py-3 font-semibold transition ${
                  authMode === "signup"
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form
              onSubmit={authMode === "login" ? handleLogin : handleSignUp}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <button
                disabled={isAuthLoading}
                type="submit"
                className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAuthLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>

              {authMessage && (
                <p className="text-sm leading-6 text-cyan-300">
                  {authMessage}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Project 3
        </p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Job Application Tracker
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Track job applications, statuses, priorities, dates, links, and
              notes in one simple dashboard.
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Logged in as <span className="text-cyan-300">{user.email}</span>.
              Your applications are saved in Supabase with your user account.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-xl border border-red-400/40 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
            >
              Logout
            </button>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                <p className="text-sm text-slate-400">Total</p>
                <p className="mt-1 text-3xl font-bold text-cyan-400">
                  {jobs.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                <p className="text-sm text-slate-400">Applied</p>
                <p className="mt-1 text-3xl font-bold text-cyan-400">
                  {appliedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                <p className="text-sm text-slate-400">Interview</p>
                <p className="mt-1 text-3xl font-bold text-yellow-300">
                  {interviewCount}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                <p className="text-sm text-slate-400">Offer</p>
                <p className="mt-1 text-3xl font-bold text-emerald-300">
                  {offerCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleAddOrUpdateJob}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold">
              {editingJobId ? "Edit Application" : "Add Application"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Company Name
                </label>
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Example: Google"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">
                  Job Title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Frontend Developer"
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-200">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as JobStatus)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-200">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as JobPriority)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">
                  Application Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">
                  Job Link
                </label>
                <input
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-200">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              <button
                disabled={isSaving}
                type="submit"
                className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingJobId
                    ? "Update Job Application"
                    : "Add Job Application"}
              </button>

              {editingJobId && (
                <button
                  onClick={handleCancelEdit}
                  type="button"
                  className="w-full rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-red-400 hover:text-red-300"
                >
                  Cancel Edit
                </button>
              )}

              {message && <p className="text-sm text-cyan-300">{message}</p>}
            </div>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Applications</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Showing {filteredJobs.length} of {jobs.length} applications
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as JobStatus | "All")
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option>All</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by company or job title..."
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />

            {jobs.length === 0 && !isLoading && (
              <button
                onClick={handleLoadStarterJob}
                type="button"
                className="mt-4 rounded-full border border-cyan-400/40 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                Load Starter Job
              </button>
            )}

            <div className="mt-6 space-y-4">
              {isLoading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">
                  Loading your jobs from Supabase...
                </div>
              )}

              {!isLoading &&
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        <p className="mt-1 text-slate-300">{job.company}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}
                        >
                          {job.status}
                        </span>

                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[job.priority]}`}
                        >
                          {job.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                      <p>
                        <span className="text-slate-500">Date:</span>{" "}
                        {job.date || "Not added"}
                      </p>

                      <p>
                        <span className="text-slate-500">Link:</span>{" "}
                        {job.link ? (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-300 hover:underline"
                          >
                            View Job
                          </a>
                        ) : (
                          "Not added"
                        )}
                      </p>
                    </div>

                    {job.notes && (
                      <p className="mt-4 rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
                        {job.notes}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleEditJob(job)}
                        type="button"
                        className="rounded-full border border-cyan-400/40 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        type="button"
                        className="rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

              {!isLoading && filteredJobs.length === 0 && jobs.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">
                  No applications match your search or selected filter.
                </div>
              )}

              {!isLoading && jobs.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm leading-7 text-slate-300">
                  No job applications yet. Add your first job using the form, or
                  load the starter job.
                </div>
              )}

              <p className="text-xs text-slate-500">
                Rejected applications: {rejectedCount}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}