"use client";

import { clearCart } from "@/redux/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  paymentMethod: "COD",
};

export default function StepForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const cartItems = useAppSelector((state) => state.cart);
  const [formData, setFormData] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.salePrice || 0) * Number(item.qty || 0),
        0
      ),
    [cartItems]
  );
  const shippingCost = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + shippingCost;

  function updateField(name: keyof FormState, value: string) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutFormData: {
            ...formData,
            shippingCost,
            userId: session?.user?.id,
          },
          orderItems: cartItems,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Order create failed");
      }

      dispatch(clearCart());
      toast.success("Order created successfully");
      router.push(`/order-confirmation/${result.data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order create failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" value={formData.firstName} onChange={(value) => updateField("firstName", value)} />
        <Input label="Last name" value={formData.lastName} onChange={(value) => updateField("lastName", value)} />
        <Input label="Email" type="email" value={formData.email} onChange={(value) => updateField("email", value)} />
        <Input label="Phone" value={formData.phone} onChange={(value) => updateField("phone", value)} />
        <Input label="Street address" value={formData.streetAddress} onChange={(value) => updateField("streetAddress", value)} className="sm:col-span-2" />
        <Input label="City" value={formData.city} onChange={(value) => updateField("city", value)} />
        <Input label="State" value={formData.state} onChange={(value) => updateField("state", value)} />
        <Input label="ZIP" value={formData.zip} onChange={(value) => updateField("zip", value)} />
        <Input label="Country" value={formData.country} onChange={(value) => updateField("country", value)} />
      </div>

      <div className="rounded-md border p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Payment method
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(event) => updateField("paymentMethod", event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-gray-900"
        >
          <option value="COD">Cash on delivery</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </select>
      </div>

      <div className="rounded-md border p-4 text-sm">
        <div className="flex justify-between py-1">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Shipping</span>
          <span>₹{shippingCost.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || cartItems.length === 0}
        className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating order..." : "Create order"}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-gray-900"
      />
    </label>
  );
}
