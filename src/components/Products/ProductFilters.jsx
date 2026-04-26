const ProductFilters = ({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
}) => {
  return (
    <section className="mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:grid-cols-5">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-primary focus:ring-2 dark:border-gray-600 dark:bg-gray-800"
      />

      <select
        value={filters.category}
        onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={filters.minPrice}
        onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
        min="0"
        placeholder="Min price"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      />

      <input
        type="number"
        value={filters.maxPrice}
        onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
        min="0"
        placeholder="Max price"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={filters.minRating}
          onChange={(e) => onFiltersChange({ ...filters, minRating: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="0">Any rating</option>
          <option value="3">3+ rating</option>
          <option value="4">4+ rating</option>
          <option value="4.5">4.5+ rating</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="newest">Newest</option>
          <option value="priceLowHigh">Price low to high</option>
          <option value="priceHighLow">Price high to low</option>
          <option value="highestRated">Highest rated</option>
        </select>
      </div>
    </section>
  );
};

export default ProductFilters;
