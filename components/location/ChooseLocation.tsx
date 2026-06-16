"use client";

import { useEffect, useState } from "react";
import { getCountries, getStates, getCities } from "@/lib/location";
import { saveLocation } from "@/lib/storage";

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

export default function ChooseLocation() {
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);

  useEffect(() => {
    setCountries(getCountries());
  }, []);

  useEffect(() => {
    setStates(getStates(country));
  }, [country]);

  useEffect(() => {
    if (state) setCities(getCities(country, state));
    else setCities([]);
  }, [country, state]);

  const handleSave = () => {
    const countryName =
      countries.find((item) => item.isoCode === country)?.name ?? country;
    const stateName = states.find((item) => item.isoCode === state)?.name ?? state;

    saveLocation({ country: countryName, state: stateName, city });
  };

  return (
    <div>
      <h2 className="py-2 text-slate-700 dark:text-slate-300">
        Choose Location
      </h2>

      <div className="space-y-3">
        <select
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setState("");
            setCity("");
          }}
          className="w-full rounded-2xl border border-input bg-background px-3 py-2"
        >
          {countries.map((item) => (
            <option key={item.isoCode} value={item.isoCode}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={state}
          onChange={(event) => {
            setState(event.target.value);
            setCity("");
          }}
          className="w-full rounded-2xl border border-input bg-background px-3 py-2"
        >
          <option value="">Select state</option>
          {states.map((item) => (
            <option key={item.isoCode} value={item.isoCode}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="w-full rounded-2xl border border-input bg-background px-3 py-2"
        >
          <option value="">Select city</option>
          {cities.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-2 rounded-2xl"
        >
          Save Location
        </button>
      </div>
    </div>
  );
}
