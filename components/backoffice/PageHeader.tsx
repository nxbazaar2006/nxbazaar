"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Card from "@/components/ui/card";

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
    <Card className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          {heading}
        </h1>

        {subHeading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subHeading}
          </p>
        )}
      </div>

      {href && linkTitle && (
        <Link href={href}>
          <Button
            variant="gradient"
            size="lg"
            className="rounded-full flex items-center gap-3 px-20"
          >
            <Plus className="w-4 h-4" />
            {linkTitle}
          </Button>
        </Link>
      )}
    </Card>
  );
}