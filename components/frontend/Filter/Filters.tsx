import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";

interface FiltersProps {
  slug?: string;
  isSearch?: boolean;
  brands?: string[];
  selectedBrands?: string[];
  onBrandChange?: (brands: string[]) => void;
}

export default function Filters({
  slug,
  isSearch = false,
  brands = [],
  selectedBrands = [],
  onBrandChange,
}: FiltersProps) {
  return (
    <aside className="neumorphic-card sticky top-24 space-y-6 p-5">
      <PriceFilter slug={slug} isSearch={isSearch} />

      {brands.length > 0 && onBrandChange && (
        <BrandFilter
          brands={brands}
          selectedBrands={selectedBrands}
          onChange={onBrandChange}
        />
      )}
    </aside>
  );
}
