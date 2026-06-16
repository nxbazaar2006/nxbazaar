"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import LocationModal from "./LocationModal";
import { getLocation, type StoredLocation } from "@/lib/storage";

function getLocationLabel(location: StoredLocation | null) {
  if (!location) return "Select Location";
  return location.pincode || location.city || "Select Location";
}

type DeliverToButtonProps = {
  iconOnly?: boolean;
};

export default function DeliverToButton({ iconOnly = false }: DeliverToButtonProps) {
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [open, setOpen] = useState(false);
  const label = `Deliver to ${getLocationLabel(location)}`;

  useEffect(() => {
    const syncLocation = () => setLocation(getLocation());

    syncLocation();
    window.addEventListener("locationchange", syncLocation);
    window.addEventListener("storage", syncLocation);

    return () => {
      window.removeEventListener("locationchange", syncLocation);
      window.removeEventListener("storage", syncLocation);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          iconOnly
            ? "soft-button soft-icon-btn"
            : "soft-button max-w-[180px] gap-1.5 rounded-full px-3 py-2 text-sm"
        }
        aria-label={label}
        title={label}
      >
        <MapPin className="h-4 w-4 shrink-0" />
        {!iconOnly && <span className="truncate">{label}</span>}
      </button>

      <LocationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
