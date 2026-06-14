"use client";

import { useState } from "react";

type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected";

type JobApplication = {
  id: number;
  company: string;
  title: string;
  status: JobStatus;
  date: string;
  link: string;
  notes: string;
};

const statusStyles: Record<JobStatus, string> = {
  Applied: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  Interview: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  Offer: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Rejected: "border-red-400/40 bg-red-400/10 text-red-300",
};

export default function Home() {
  const [jobs, setJobs] = useState<JobApplication[]>([
    {
      id: 1,
      company: "Example Tech",
      title: "Frontend Developer",
      status: "Applied",
      date: "2026-06-13",
      link: "https://example.com",
      notes: "Applied through company website.",
    },
  ]);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<JobStatus | "All">("All");

  const appliedCount = jobs.filter((job) => job.status === "Applied").length;
  const interviewCount = jobs.filter((job) => job.status === "Interview").length;
  const offerCount = jobs.filter((job) => job.status === "Offer").length;
  const rejectedCount = jobs.filter((job) => job.status === "Rejected").length;

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

  function handleAddJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company.trim() || !title.trim()) {
      setMessage("Company name and job title are required.");
      return;
    }

    const newJob: JobApplication = {
      id: Date.now(),
      company,
      title,
      status,
      date,
      link,
      notes,
    };

    setJobs([newJob, ...jobs]);

    setCompany("");
    setTitle("");
    setStatus("Applied");
    setDate("");
    setLink("");
    setNotes("");
    setMessage("Job application added successfully.");
  }

  function handleDeleteJob(id: number) {
    setJobs(jobs.filter((job) => job.id !== id));
    setMessage("Job application deleted.");
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
              Track job applications, statuses, dates, links, and notes in one
              simple dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-sm text-slate-400">Total</p>
              <p className="mt-1 text-3xl font-bold text-cyan-400">{jobs.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-sm text-slate-400">Applied</p>
              <p className="mt-1 text-3xl font-bold text-cyan-400">{appliedCount}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-sm text-slate-400">Interview</p>
              <p className="mt-1 text-3xl font-bold text-yellow-300">{interviewCount}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
              <p className="text-sm text-slate-400">Offer</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">{offerCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleAddJob}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-2xl font-bold">Add Application</h2>

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
                type="submit"
                className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Add Job Application
              </button>

              {message && (
                <p className="text-sm text-cyan-300">
                  {message}
                </p>
              )}
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
                onChange={(event) => setFilter(event.target.value as JobStatus | "All")}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              >
                <option>All</option>
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className="mt-6 space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <p className="mt-1 text-slate-300">{job.company}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}
                      >
                        {job.status}
                      </span>

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        type="button"
                        className="rounded-full border border-red-400/40 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
                      >
                        Delete
                      </button>
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
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">
                  No applications found for this status.
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}