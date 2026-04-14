"use client";

import { Info } from "lucide-react";
import { Alert } from "flowbite-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/lib/zod/auth";
import { useForgotPassword } from "@/hooks/useAuth";

export default function ForgotPasswordForm() {
  const [showNotification, setShowNotification] = useState(false);

  const { mutateAsync, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    const res = await mutateAsync(data);

    if (res?.success) {
      setShowNotification(true);
      reset();
      toast.success("Password reset link sent Successfully");
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {showNotification && (
        <Alert color="failure" icon={Info}>
          <span className="font-medium">Please Check your Email!</span>
        </Alert>
      )}

      <div>
        <label className="block mb-2 text-sm font-medium">
          Enter Your email
        </label>

        <input
          {...register("email")}
          type="email"
          placeholder="name@company.com"
          className="input"
        />

        {errors.email && (
          <small className="text-red-600 text-sm">
            {errors.email.message}
          </small>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {isPending ? "Sending..." : "Send Password Reset Email"}
      </button>

      <div className="my-6">
        <p className="text-sm text-gray-500">
          Do remember your Password?{" "}
          <Link href="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}
