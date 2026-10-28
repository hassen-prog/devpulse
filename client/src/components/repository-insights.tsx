
import Image from 'next/image';
import type { AnalyzedRepository } from '@/app/types/repository';

type InsightsProps = Pick<
  AnalyzedRepository,
  'contributors' | 'activity'
>;

function formatWeek(value: string) {
  return new Date(value).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

export function RepositoryInsights({
  contributors,
  activity,
}: InsightsProps) {
  const recentWeeks = activity.weeks.slice(-12);

  const maximumCommits = Math.max(
    1,
    ...recentWeeks.map((week) => week.commits),
  );

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Weekly commit activity */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-violet-300">
              REPOSITORY MOMENTUM
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Commit activity
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Weekly activity reported by GitHub.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs text-slate-500">LAST YEAR</p>
            <p className="mt-1 text-xl font-semibold">
              {activity.available
                ? activity.totalCommits.toLocaleString()
                : '—'}
            </p>
            <p className="text-xs text-slate-500">reported commits</p>
          </div>
        </div>

        {activity.available && recentWeeks.length > 0 ? (
          <div className="mt-8">
            <div className="flex h-44 items-end gap-1.5 sm:gap-2">
              {recentWeeks.map((week) => {
                const height =
                  week.commits === 0
                    ? 0
                    : Math.max(
                        5,
                        (week.commits / maximumCommits) * 100,
                      );

                return (
                  <div
                    key={week.weekStart}
                    className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    title={`${formatWeek(week.weekStart)}: ${week.commits} commits`}
                  >
                    <div className="flex h-full w-full items-end justify-center rounded-t-md bg-white/[0.025]">
                      <div
                        className="w-full max-w-7 rounded-t-md bg-gradient-to-t from-violet-600 to-blue-400 transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-6 gap-2 text-xs text-slate-500 sm:grid-cols-12">
              {recentWeeks.map((week, index) => (
                <span
                  key={week.weekStart}
                  className={`text-center ${
                    index % 2 === 1 ? 'hidden sm:block' : ''
                  }`}
                >
                  {formatWeek(week.weekStart)}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />
              Weekly commits · Last 12 available weeks
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
            <p className="text-sm text-slate-300">
              Activity data is temporarily unavailable.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {activity.note ??
                'GitHub has not returned weekly commit statistics.'}
            </p>
          </div>
        )}
      </div>

      {/* Top contributors */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-8">
        <p className="text-xs font-medium tracking-[0.2em] text-blue-300">
          PEOPLE BEHIND THE CODE
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Top contributors
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Contributors ranked by GitHub&apos;s reported contribution count.
        </p>

        {contributors.items.length > 0 ? (
          <div className="mt-6 space-y-4">
            {contributors.items.map((contributor) => (
              <a
                key={contributor.username}
                href={contributor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-white/10 hover:bg-white/[0.03]"
              >
                <Image
                  src={contributor.avatarUrl}
                  alt={`${contributor.username}'s GitHub avatar`}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {contributor.username}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    GitHub contributor
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-violet-200">
                    {contributor.contributions.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    contributions
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-5">
            <p className="text-sm text-slate-300">
              Contributor information is unavailable.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {contributors.note ??
                'GitHub did not return named contributors.'}
            </p>
          </div>
        )}

        {contributors.available && contributors.items.length > 0 && (
          <p className="mt-5 text-xs leading-5 text-slate-600">
            Showing up to eight named contributors. GitHub may cache
            contribution statistics.
          </p>
        )}
      </div>
    </section>
  );
}
