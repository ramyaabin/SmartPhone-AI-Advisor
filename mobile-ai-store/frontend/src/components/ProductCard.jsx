import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, BatteryFull, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const brandGradients = {
  Apple: 'from-slate-700 to-slate-900',
  Samsung: 'from-blue-600 to-indigo-700',
  Google: 'from-emerald-500 to-teal-600',
  OnePlus: 'from-red-500 to-rose-600',
  Xiaomi: 'from-orange-500 to-amber-600'
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const gradient = brandGradients[product.brand] || 'from-brand-500 to-indigo-600';

  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <button
        onClick={() => toggleWishlist(product)}
        aria-label="Toggle wishlist"
        className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur transition ${
          wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-500 hover:text-red-500 dark:bg-slate-900/70'
        }`}
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/product/${product.id}`}>
        <div className={`flex h-44 items-center justify-center bg-gradient-to-br ${gradient} text-white`}>
          <span className="text-center text-sm font-semibold px-4 opacity-90">
            {product.brand}
            <br />
            <span className="text-lg font-bold">{product.name}</span>
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
          {product.brand}
        </span>
        <Link to={`/product/${product.id}`} className="font-semibold leading-snug hover:text-brand-500">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {product.description}
        </p>

        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <BatteryFull size={14} /> {product.battery.split(',')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Camera size={14} /> {product.camera.split('+')[0].trim()}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">€{product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
