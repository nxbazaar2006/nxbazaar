"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  async function onSubmit(data: LoginFormInputs) {
    try {
      setLoading(true);

      const loginData = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (loginData?.error) {
        toast.error("Invalid email or password");
        setLoading(false);
        return;
      }

      toast.success("Login successful");
      reset();

      router.push("/"); // redirect after login
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Network error occurred");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      
      {/* Email */}
      <div>
        <label className="block mb-2 text-sm font-medium">
          Your email
        </label>

        <input
          type="email"
          placeholder="name@company.com"
          {...register("email", { required: "Email is required" })}
          className="border bg-background text-foreground shadow-xs w-full rounded-full p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
        />

        {errors.email && (
          <p className="text-red-500 text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block mb-2 text-sm font-medium">
          Password
        </label>

        <input
          type="password"
          placeholder="••••••••"
          {...register("password", { required: "Password is required" })}
          className="border bg-background text-foreground shadow-xs w-full rounded-full p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
        />

        {errors.password && (
          <p className="text-red-500 text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex gap-4 items-center">
        <Link
          href="/forgot-password"
          className="text-primary hover:underline text-sm"
        >
          Forgot Password
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-slate-950 px-5 py-3 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </div>

      {/* Register */}
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}
