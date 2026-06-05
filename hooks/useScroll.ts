"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useScroll(threshold = 10) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("scroll", onStoreChange, { passive: true });

    return () => window.removeEventListener("scroll", onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
