"use client";

import { useAutoPincode } from "@/hooks/useAutoPincode";
import { useEffect } from "react";

export default function DeliverWrapper({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data, loading } = useAutoPincode();

  useEffect(() => {
    if (data?.pincode) {
      localStorage.setItem("pincode", data.pincode);
      localStorage.setItem("city", data.city || "");
    }
  }, [data]);

  return <>{children}</>;
}
