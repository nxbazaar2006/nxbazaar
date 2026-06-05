"use client";

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  onChange: (brands: string[]) => void;
}

export default function BrandFilter({
  brands,
  selectedBrands,
  onChange,
}: BrandFilterProps) {
  const toggleBrand = (brand: string) => {
    onChange(
      selectedBrands.includes(brand)
        ? selectedBrands.filter((item) => item !== brand)
        : [...selectedBrands, brand]
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Brand</h2>

      <div className="space-y-2">
        {brands.map((brand) => (
          <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleBrand(brand)}
              className="h-4 w-4"
            />
            {brand}
          </label>
        ))}
      </div>
    </div>
  );
}