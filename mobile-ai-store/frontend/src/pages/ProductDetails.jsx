import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, BatteryFull, Camera, Cpu, MemoryStick, HardDrive, MonitorSmartphone, Palette } from 'lucide-react';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { fetchProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const specIcons = {
  RAM: MemoryStick,
  Storage: HardDrive,
  Display: MonitorSmartphone,
  Processor: Cpu,
  Battery: BatteryFull,
  Camera: Camera,
  Color: Palette
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetchProductById(id);
      setProduct(res.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Loader label="Loading phone details..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!product) return null;

  const specs = [
    { label: 'RAM', value: product.ram },
    { label: 'Storage', value: product.storage },
    { label: 'Display', value: product.display },
    { label: 'Processor', value: product.processor },
    { label: 'Battery', value: product.battery },
    { label: 'Camera', value: product.camera },
    { label: 'Color', value: product.color }
  ];

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-500">
        <ArrowLeft size={16} /> Back to store
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white sm:h-[26rem]">
          <div className="text-center">
            <p className="text-sm font-medium opacity-80">{product.brand}</p>
            <p className="text-3xl font-extrabold">{product.name}</p>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-500">
            {product.brand}
          </span>
          <h1 className="mt-1 text-3xl font-extrabold">{product.name}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{product.description}</p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold">€{product.price}</span>
            <span className="text-sm text-slate-400">{product.os}</span>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => addToCart(product)} className="btn-primary flex-1">
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`btn-secondary ${wishlisted ? 'border-red-300 text-red-500' : ''}`}
            >
              <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map((s) => {
              const Icon = specIcons[s.label] || Cpu;
              return (
                <div key={s.label} className="card flex items-start gap-3 p-4">
                  <span className="mt-0.5 text-brand-500">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {s.label}
                    </p>
                    <p className="text-sm font-medium">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
