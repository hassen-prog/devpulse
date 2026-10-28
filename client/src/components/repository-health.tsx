
import type { AnalyzedRepository } from '@/app/types/repository';

type RepositoryHealthData = AnalyzedRepository['health'];

export function RepositoryHealth({
  health,
}: {
  health: RepositoryHealthData;
}) {
  const ringColor =
    health.score >= 90
      ? '#6ee7b7'
      : health.score >= 75
        ? '#a78bfa'
        : health.score >= 50
          ? '#fbbf24'
          : '#fb7185';

  const gradeColor =
    health.score >= 90
      ? 'text-emerald-300'
      : health.score >= 75
        ? 'text-violet-300'
        : health.score >= 50
          ? 'text-amber-300'
          : 'text-rose-300';

  return (
    <section
      className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl sm:p-8"
      aria-labelledby="health-heading"
    >
      <div>
        <p className="text-xs font-medium tracking-[0.2em] text-violet-300">
          ENGINEERING BASELINE
        </p>

        <h2
          id="health-heading"
          className="mt-2 text-2xl font-semibold tracking-tight"
        >
          Repository health
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          A transparent checklist of documentation, testing, CI/CD,
          and development configuration.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/20 p-6">
          <div
            role="img"
            aria-label={`Health score: ${health.score} out of 100`}
            className="grid h-36 w-36 place-items-center rounded-full p-2"
            style={{
              background: `conic-gradient(${ringColor} ${health.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#10101b]">
              <span className="text-4xl font-semibold tracking-tight">
                {health.score}
              </span>
              <span className="mt-1 text-xs text-slate-500">
                / 100 points
              </span>
            </div>
          </div>

          <p className={`mt-5 text-lg font-semibold ${gradeColor}`}>
            {health.grade}
          </p>

          <p className="mt-2 text-center text-xs leading-5 text-slate-500">
            Based on detected repository files, not a full code audit.
          </p>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-semibold">Engineering checks</h3>
            <span className="text-xs text-slate-500">
              {health.checks.filter((check) => check.passed).length}
              {' / '}
              {health.checks.length} passed
            </span>
          </div>

          <div className="space-y-3">
            {health.checks.map((check) => (
              <div
                key={check.id}
                className="rounded-xl border border-white/5 bg-black/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                      check.passed
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : 'bg-amber-400/10 text-amber-300'
                    }`}
                    aria-label={check.passed ? 'Passed' : 'Not detected'}
                  >
                    {check.passed ? '✓' : '!'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200">
                        {check.label}
                      </p>

                      <span className="text-xs text-slate-500">
                        {check.passed
                          ? `+${check.weight} points`
                          : `0 / ${check.weight} points`}
                      </span>
                    </div>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      {check.details}
                    </p>

                    {check.recommendation && (
                      <p className="mt-2 text-xs leading-5 text-violet-200/80">
                        Recommendation: {check.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
        <p className="text-xs text-slate-500">
          {health.analyzedFiles.toLocaleString()} file entries analyzed
        </p>

        {health.treeTruncated && (
          <p className="text-xs text-amber-300">
            GitHub returned a truncated file tree. The score may be incomplete.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-600">
        {health.note}
      </p>
    </section>
  );
}
