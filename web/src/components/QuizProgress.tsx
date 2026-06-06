interface QuizProgressProps {
  step: number;
  total: number;
}

export function QuizProgress({ step, total }: QuizProgressProps) {
  const pct = Math.round(((step + 1) / total) * 100);

  return (
    <div className="border-b border-gm-100 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <div className="hidden items-center sm:flex">
          {Array.from({ length: total }, (_, i) => (
            <QuizProgressSegment key={i} index={i} current={step} />
          ))}
        </div>
        <div className="sm:hidden">
          <div className="mb-2 flex justify-between">
            <span className="text-xs font-semibold text-gm-700">
              Step {step + 1} of {total}
            </span>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gm-100">
            <div
              className="h-1.5 rounded-full bg-gm-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizProgressSegment({
  index,
  current,
}: {
  index: number;
  current: number;
}) {
  return (
    <>
      {index > 0 && (
        <div className={`step-line ${index <= current ? "done" : ""}`} />
      )}
      {index < current ? (
        <div className="step-dot completed" title={`Step ${index + 1}`}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : index === current ? (
        <div className="step-dot active">{index + 1}</div>
      ) : (
        <div className="step-dot upcoming">{index + 1}</div>
      )}
    </>
  );
}
