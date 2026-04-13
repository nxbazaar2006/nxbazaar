interface Props {
  title: string;
  description?: string;
}

export default function Heading({ title, description }: Props) {
  return (
    <div className="space-y-1">

      <h1 className="
        text-lg md:text-xl lg:text-2xl
        font-semibold tracking-tight
        text-slate-900 dark:text-white
      ">
        {title}
      </h1>

      {description && (
        <p className="
          text-sm md:text-base
          text-slate-500 dark:text-slate-400
          max-w-xl
        ">
          {description}
        </p>
      )}

    </div>
  );
}