"use client";

import { useEffect, useState } from "react";
import { saveLocation, getLocation, type StoredLocation } from "@/lib/storage";
import { LocateFixed, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LocationModal({ open, onClose }: Props) {
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const saved = getLocation();
    if (saved) setLocation(saved);
  }, []);

  const detectLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          if (!res.ok) throw new Error("Unable to detect location");

          const data = (await res.json()) as StoredLocation;
          const loc = {
            city: data.city ?? "",
            state: data.state ?? "",
            country: data.country ?? "",
            pincode: data.pincode ?? "",
          };

          setLocation(loc);
          saveLocation(loc);
          onClose();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to detect location");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setError(err.message || "Location permission denied");
        setDetecting(false);
      }
    );
  };

  const handleManual = () => {
    const value = input.trim();
    if (!value) return;

    const isPincode = /^\d{6}$/.test(value);
    const loc: StoredLocation = isPincode
      ? { pincode: value, country: "India" }
      : { city: value, country: "India" };

    setLocation(loc);
    saveLocation(loc);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 text-foreground shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Location</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-muted"
            aria-label="Close location selector"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocateFixed className="h-4 w-4" />
          {detecting ? "Detecting..." : "Detect My Location"}
        </button>

        <div className="mt-4 space-y-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter city or pincode"
            className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />

          <button
            type="button"
            onClick={handleManual}
            className="w-full rounded-2xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Save Location
          </button>
        </div>

        {error ? (
          <p className="mt-3 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {location && (
          <div className="mt-4 rounded-2xl border border-border p-3 text-sm">
            <p className="font-semibold">Selected:</p>
            <p>{[location.pincode, location.city, location.state, location.country].filter(Boolean).join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
