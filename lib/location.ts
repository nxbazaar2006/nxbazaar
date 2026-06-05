type CountryOption = {
  name: string;
  isoCode: string;
};

type StateOption = {
  name: string;
  isoCode: string;
};

type CityOption = {
  name: string;
};

const countries: CountryOption[] = [{ name: "India", isoCode: "IN" }];

const statesByCountry: Record<string, StateOption[]> = {
  IN: [
    { name: "Andhra Pradesh", isoCode: "AP" },
    { name: "Delhi", isoCode: "DL" },
    { name: "Gujarat", isoCode: "GJ" },
    { name: "Karnataka", isoCode: "KA" },
    { name: "Madhya Pradesh", isoCode: "MP" },
    { name: "Maharashtra", isoCode: "MH" },
    { name: "Rajasthan", isoCode: "RJ" },
    { name: "Tamil Nadu", isoCode: "TN" },
    { name: "Telangana", isoCode: "TS" },
    { name: "Uttar Pradesh", isoCode: "UP" },
    { name: "West Bengal", isoCode: "WB" },
  ],
};

const citiesByState: Record<string, CityOption[]> = {
  AP: [{ name: "Vijayawada" }, { name: "Visakhapatnam" }],
  DL: [{ name: "New Delhi" }],
  GJ: [{ name: "Ahmedabad" }, { name: "Surat" }],
  KA: [{ name: "Bengaluru" }, { name: "Mysuru" }],
  MP: [{ name: "Bhopal" }, { name: "Indore" }],
  MH: [{ name: "Mumbai" }, { name: "Nagpur" }, { name: "Pune" }],
  RJ: [{ name: "Jaipur" }, { name: "Udaipur" }],
  TN: [{ name: "Chennai" }, { name: "Coimbatore" }],
  TS: [{ name: "Hyderabad" }],
  UP: [{ name: "Lucknow" }, { name: "Noida" }],
  WB: [{ name: "Kolkata" }],
};

export const getCountries = () => countries;

export const getStates = (country: string) => statesByCountry[country] ?? [];

export const getCities = (_country: string, state: string) =>
  citiesByState[state] ?? [];
