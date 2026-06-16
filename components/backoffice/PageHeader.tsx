import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  heading: string;
  subHeading?: string;
  href?: string;
  linkTitle?: string;
}

export default function PageHeader({
  heading,
  subHeading,
  href,
  linkTitle,
}: Props) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          {heading}
        </h1>

        {subHeading && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subHeading}
          </p>
        )}
      </div>

      {href && linkTitle && (
        <Link href={href} prefetch={false}>
          <Button
            variant="dashboard"
            className="flex items-center gap-3 px-6"
          >
            <Plus className="h-4 w-4" />
            {linkTitle}
          </Button>
        </Link>
      )}
    </div>
  );
}
