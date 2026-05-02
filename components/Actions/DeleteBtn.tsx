"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface DeleteBtnProps {
  id: string;
  title: string;
  endpoint: string;
  onDelete?: (id: string) => void; // 🔥 optimistic
}

export default function DeleteBtn({
  id,
  title,
  endpoint,
  onDelete,
}: DeleteBtnProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete this ${title}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api${endpoint}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      onDelete?.(id);
      toast.success(`${title} deleted successfully`);

      // 🔁 server sync (safe)
      router.refresh();

    } catch (error) {
      console.error(error);

      toast.error("Delete failed");

      // ❗ rollback (data वापस लाओ)
      router.refresh();

    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="font-medium text-red-600 flex items-center space-x-1 disabled:opacity-50"
    >
      {loading ? (
        <span>Deleting...</span>
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          <span>Delete {title}</span>
        </>
      )}
    </button>
  );
}
