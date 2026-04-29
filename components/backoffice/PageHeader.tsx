import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import GlassCard from "@/components/GlassCard"; 

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
    <GlassCard className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-white">
          {heading}
        </h1>

        {subHeading && (
          <p className="text-sm text-gray-300">
            {subHeading}
          </p>
        )}
      </div>

      {href && linkTitle && (
        <Link href={href}>
          <Button className="rounded-full flex items-center gap-3 px-6 bg-orange-500/80 hover:bg-white/30 border border-white/30 backdrop-blur-md">
            <Plus className="w-4 h-4" />
            {linkTitle}
          </Button>
        </Link>
      )}
    </GlassCard>
  );
}