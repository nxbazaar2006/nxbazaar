"use client";

export default function LanguageSwitcher({
  locale,
  setLocale,
}: {
  locale: string;
  setLocale: (val: string) => void;
}) {
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="en">English</option>
      <option value="hi">Hindi</option>
      <option value="mr">Marathi</option>
    </select>
  );
}