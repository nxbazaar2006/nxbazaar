"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"

interface EditBtnProps {
  editEndpoint: string
  title: string
}

export default function EditBtn({
  editEndpoint,
  title
}: EditBtnProps) {
  return (
    <Link
      href={`/dashboard/${editEndpoint}`}
      prefetch={false}
      className="flex items-center text-lime-600 hover:text-lime-700"
    >
      <Pencil className="mr-2 h-4 w-4" />
      <span>Edit {title}</span>
    </Link>
  )
}
