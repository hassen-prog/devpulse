
'use client';

import { useState, type FormEvent } from 'react';
import { analyzeRepository } from '@/app/lib/repositories';
import type { AnalyzedRepository } from '@/app/types/repository';
import { RepositoryHealth } from '@/components/repository-health';
import { RepositoryInsights } from '@/components/repository-insights';
const numberFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatDate(value: string | null): string {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-violet-400/30">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function Home() {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [repository, setRepository] =
    useState<AnalyzedRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!repositoryUrl.trim()) {
      setError('Enter a GitHub repository URL first.');
      return;
    }

    setLoading(true);
    setError(null);
    setRepository(null);

    try {
      const result = await analyzeRepository(repositoryUrl.trim());
      setRepository(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while analyzing the repository.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090910] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between border-b border-white/5 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 font-bold text-violet-200">
            DP
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight">DevPulse</p>
            <p className="text-[10px] tracking-[0.2em] text-slate-500">
              REPOSITORY INTELLIGENCE
            </p>
          </div>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          Developer tools
        </span>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-20">
        <p className="mb-4 text-xs font-medium tracking-[0.25em] text-violet-300">
          YOUR REPOSITORY, AT A GLANCE
        </p>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Get to know your codebase.
          <span className="block bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
            Beyond the commits.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl leading-7 text-slate-400">
          Explore repository activity, project metadata, and engineering
          signals in one place. Start with any public GitHub repository.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-7">
          <form
            onSubmit={handleAnalyze}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="flex-1">
              <label
                htmlFor="repository-url"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                GitHub repository URL
              </label>

              <input
                id="repository-url"
                type="url"
                value={repositoryUrl}
                onChange={(event) => setRepositoryUrl(event.target.value)}
                placeholder="https://github.com/facebook/react"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
              />
            </div>

            <div className="sm:self-end">
              <button
                type="submit"
                disabled={loading || !repositoryUrl.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? 'Analyzing...' : 'Analyze repository'}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Try an example:</span>
            <button
              type="button"
              onClick={() =>
                setRepositoryUrl('https://github.com/facebook/react')
              }
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-violet-400/40 hover:text-violet-200"
            >
              facebook/react
            </button>
            <button
              type="button"
              onClick={() =>
                setRepositoryUrl('https://github.com/nestjs/nest')
              }
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-violet-400/40 hover:text-violet-200"
            >
              nestjs/nest
            </button>
          </div>
        </div>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-300" />
              <div>
                <p className="font-medium text-violet-100">
                  Analyzing repository
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Fetching repository information from GitHub...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-500/5 p-5"
          >
            <p className="font-medium text-rose-200">
              We couldn&apos;t analyze this repository.
            </p>
            <p className="mt-2 text-sm leading-6 text-rose-200/70">
              {error}
            </p>
          </div>
        )}

        {!repository && !loading && !error && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl text-violet-200">
              ↗
            </div>
            <h2 className="mt-5 text-lg font-semibold">
              Your next repository starts here
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Enter a repository URL above to explore real project
              statistics and metadata.
            </p>
          </div>
        )}

        {repository && !loading && (
          <section className="mt-10 space-y-6" aria-label="Repository results">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-xl font-semibold text-violet-200">
                    {repository.owner.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm text-slate-500">
                      {repository.owner.username} / repository
                    </p>
                    <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                      {repository.fullName}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                      {repository.description ||
                        'No description has been provided for this repository.'}
                    </p>
                  </div>
                </div>

                <a
                  href={repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium transition hover:border-violet-400/40 hover:bg-violet-500/10"
                >
                  View on GitHub ↗
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  {repository.visibility}
                </span>

                {repository.isFork && (
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-200">
                    Fork
                  </span>
                )}

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {repository.language ?? 'Language not specified'}
                </span>

                {repository.license && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {repository.license}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Stars"
                value={numberFormatter.format(repository.stats.stars)}
                description="Community interest"
              />

              <MetricCard
                label="Forks"
                value={numberFormatter.format(repository.stats.forks)}
                description="Repository forks"
              />

              <MetricCard
                label="Open issues"
                value={numberFormatter.format(repository.stats.openIssues)}
                description="Open issues and pull requests"
              />

              <MetricCard
                label="Watchers"
                value={numberFormatter.format(repository.stats.watchers)}
                description="GitHub watchers"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <h3 className="text-lg font-semibold">
                  Repository details
                </h3>

                <div className="mt-5 divide-y divide-white/5">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-400">
                      Primary language
                    </span>
                    <span className="text-right text-sm font-medium">
                      {repository.language ?? 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-400">
                      Default branch
                    </span>
                    <span className="break-all text-right font-mono text-sm text-violet-200">
                      {repository.defaultBranch}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-400">
                      License
                    </span>
                    <span className="text-right text-sm font-medium">
                      {repository.license ?? 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-400">
                      Repository size
                    </span>
                    <span className="text-right text-sm font-medium">
                      {numberFormatter.format(repository.stats.sizeKb)} KB
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-400">
                      Created
                    </span>
                    <span className="text-right text-sm font-medium">
                      {formatDate(repository.dates.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <h3 className="text-lg font-semibold">
                  Activity and topics
                </h3>

                <div className="mt-5 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-xs tracking-wide text-slate-500">
                    LAST UPDATED
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    {formatDate(repository.dates.updatedAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest repository metadata update
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-xs tracking-wide text-slate-500">
                    LAST PUSHED
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    {formatDate(repository.dates.pushedAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest recorded push to the repository
                  </p>
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-slate-300">
                    Repository topics
                  </p>

                  {repository.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {repository.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-lg border border-violet-400/15 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      This repository has no topics configured.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <RepositoryHealth health={repository.health} />
            <RepositoryInsights
              contributors={repository.contributors}
              activity={repository.activity}
            />
            <p className="px-1 text-xs leading-5 text-slate-600">
              Statistics are supplied by GitHub. Repository metadata can
              change at any time. This view does not yet represent a
              DevPulse engineering health score.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
