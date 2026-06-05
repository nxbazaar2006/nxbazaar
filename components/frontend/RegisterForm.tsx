"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validators/registerSchema";
import { useRegister } from "@/hooks/useRegister";
import toast from "react-hot-toast";
import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmitButton";

type Props = {
  role?: "USER" | "SELLER" | "ADMIN";
};

export default function RegisterForm({ role = "USER" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const { mutateAsync, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      data.plan = plan ?? undefined;

      const response = await mutateAsync(data);

      toast.success("User created successfully");

      reset();

      if (role === "USER") {
        router.push("/");
      } else {
        router.push(`/verify-email?userId=${response.data.id}`);
      }
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Something went wrong";

      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6">
      <input type="hidden" {...register("role")} value={role} />

      <TextInput
        label="Your Full Name"
        name="name"
        register={register}
        errors={errors}
        type="text"
        className="mb-3"
      />

      <TextInput
        label="Email Address"
        name="email"
        register={register}
        errors={errors}
        type="email"
        className="mb-3"
      />

      <TextInput
        label="Password"
        name="password"
        register={register}
        errors={errors}
        type="password"
      />

      <SubmitButton
        isLoading={isPending}
        buttonTitle="Register"
        loadingButtonTitle="Creating..."
      />

      <div className="flex justify-between gap-4 py-4 text-sm">
        <p>
          Already have an account?
          <Link href="/login" className="text-primary ml-1">
            Login
          </Link>
        </p>

        {role === "USER" ? (
          <p>
            Are you a Seller?
            <Link href="/seller-pricing" className="text-primary ml-1">
              Register here
            </Link>
          </p>
        ) : (
          <p>
            Are you a Seller/Vendor?
            <Link href="/register" className="text-primary ml-1">
              Seller Register here
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
