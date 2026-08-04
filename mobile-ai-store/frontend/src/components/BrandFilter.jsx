export default function BrandFilter({ brands, activeBrand, onSelect }) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('')}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
          !activeBrand
            ? 'bg-brand-500 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        All Brands
      </button>
      {brands.map((brand) => (
        <button
          key={brand}
          onClick={() => onSelect(brand)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            activeBrand === brand
              ? 'bg-brand-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {brand}
        </button>
      ))}
    </div>
  );
}
