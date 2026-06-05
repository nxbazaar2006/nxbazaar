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
    <aside className="sticky top-24 space-y-6 rounded-3xl border border-white/10 bg-card/80 p-5 shadow-sm backdrop-blur-xl">
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