import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/ui/EmptyState";
import SkeletonCard from "../components/ui/SkeletonCard";
import ProductCard from "../components/Products/ProductCard";
import ProductFilters from "../components/Products/ProductFilters";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { listProducts } from "../services/productService";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "0",
  });

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await listProducts({
          search: debouncedSearch,
          filters,
          sortBy,
        });
        if (isMounted) {
          setProducts(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, filters, sortBy]);

  const categories = useMemo(() => {
    const unique = new Set();
    products.forEach((item) => {
      if (item.category) {
        unique.add(item.category);
      }
    });
    return [...unique].sort();
  }, [products]);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Discover Products</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Search, filter, and sort by category, price, rating, and freshness.
        </p>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try changing your search, filters, or sorting criteria."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomePage;
