"use client";

import { useEffect, useState } from "react";

type Coordinates = {
  lat: number;
  lng: number;
};

export const useGeoLocation = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);

  return coords;
};
