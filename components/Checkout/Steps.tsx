type Step = {
  number: number;
  title: string;
};

type StepsProps = {
  steps: Step[];
};

export default function Steps({ steps }: StepsProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.number}
          className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm dark:bg-gray-900"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-600 text-xs font-semibold text-white">
            {step.number}
          </span>
          <span className="truncate font-medium text-slate-700 dark:text-slate-200">
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
}
