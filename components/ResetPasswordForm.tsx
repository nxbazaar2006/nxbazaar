"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/lib/zod/auth";
import { useResetPassword } from "@/hooks/useAuth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("token") ?? "";

  const { mutateAsync, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      id,
      token,
      password: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    if (!id || !token) {
      toast.error("Invalid reset link");
      return;
    }

    const res = await mutateAsync({ ...data, id, token });

    if (res?.success) {
      toast.success("Password Updated Successfully");
      router.push("/login");
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id")} value={id} />
      <input type="hidden" {...register("token")} value={token} />

      <div>
        <label className="block mb-2 text-sm font-medium">
          New Password
        </label>

        <input
          {...register("password")}
          type="password"
          placeholder="New Password"
          className="input"
        />

        {errors.password && (
          <small className="text-red-600 text-sm">
            {errors.password.message}
          </small>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {isPending ? "Updating..." : "Reset Password"}
      </button>
    </form>
  );
}
