"use client";

import { useState } from "react";
import { checkDelivery } from "@/lib/pincode";

type DeliveryResult = ReturnType<typeof checkDelivery>;

export default function PincodeChecker() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<DeliveryResult | null>(null);

  const handleCheck = () => {
    const res = checkDelivery(pin);
    setResult(res);
  };

  return (
    <div className="space-y-2">
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="Enter Indian pincode"
        className="input"
      />

      <button
        onClick={handleCheck}
        className="inline-flex h-10 min-w-40 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition hover:from-orange-400 hover:via-fuchsia-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 focus:ring-offset-2 active:scale-[0.98] dark:shadow-sky-950/40 dark:focus:ring-sky-400 dark:focus:ring-offset-slate-950"
      >
        Check
      </button>

      {result && (
        <p
          className={
            result.success ? "text-green-600" : "text-red-500"
          }
        >
          {result.message}
          {result.eta && ` (${result.eta})`}
        </p>
      )}
    </div>
  );
}
