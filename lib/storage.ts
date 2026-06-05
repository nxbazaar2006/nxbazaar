export type StoredLocation = {
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

export const saveLocation = (loc: StoredLocation) => {
  if (typeof window === "undefined") return;

  localStorage.setItem("user_location", JSON.stringify(loc));
  if (loc.pincode) localStorage.setItem("pincode", loc.pincode);
  if (loc.city) localStorage.setItem("city", loc.city);
  window.dispatchEvent(new Event("locationchange"));
};

export const getLocation = (): StoredLocation | null => {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem("user_location");
  if (!data) return null;

  try {
    return JSON.parse(data) as StoredLocation;
  } catch {
    return null;
  }
};
