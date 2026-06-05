"use client";

import { useEffect, useState } from "react";
import { useUserLocation } from "./useUserLocation";
import { getPincodeFromCoords } from "@/lib/getPincodeFromCoords";
import { getLocationFromIP } from "@/lib/getLocationFromIP";

type AutoPincodeData =
  | Awaited<ReturnType<typeof getPincodeFromCoords>>
  | Awaited<ReturnType<typeof getLocationFromIP>>;

export const useAutoPincode = () => {
  const { location, error } = useUserLocation();
  const [data, setData] = useState<AutoPincodeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      try {
        if (location) {
          // ✅ GPS success
          const res = await getPincodeFromCoords(
            location.lat,
            location.lng
          );
          setData(res);
        } else {
          // ⚠️ fallback IP
          const res = await getLocationFromIP();
          setData(res);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, [location]);

  return { data, loading, error };
};
