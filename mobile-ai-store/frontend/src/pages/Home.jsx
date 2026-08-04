import { useEffect, useMemo, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import BrandFilter from '../components/BrandFilter';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { fetchProducts, fetchBrands, fetchFeatured } from '../api/products';

export default function Home({ onOpenChat }) {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [productsRes, brandsRes, featuredRes] = await Promise.all([
        fetchProducts(),
        fetchBrands(),
        fetchFeatured()
      ]);
      setProducts(productsRes.products);
      setBrands(brandsRes.brands);
      setFeatured(featuredRes.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = activeBrand ? p.brand === activeBrand : true;
      const q = search.toLowerCase();
      const matchesSearch = q
        ? p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
        : true;
      return matchesBrand && matchesSearch;
    });
  }, [products, activeBrand, search]);

  if (loading) return <Loader label="Loading phones..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 pb-20 pt-8 sm:px-6">
      <HeroBanner onOpenChat={onOpenChat} />

      {featured.length > 0 && (
        <section id="featured">
          <h2 className="mb-4 text-2xl font-bold">Featured Phones</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">All Phones</h2>
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        <div className="mb-6">
          <BrandFilter brands={brands} activeBrand={activeBrand} onSelect={setActiveBrand} />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-slate-500">No phones match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
