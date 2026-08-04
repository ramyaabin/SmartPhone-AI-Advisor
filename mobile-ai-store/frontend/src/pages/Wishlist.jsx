import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <Heart size={40} className="text-slate-300" />
        <h1 className="text-xl font-bold">Your wishlist is empty</h1>
        <p className="text-slate-500">Tap the heart icon on any phone to save it here.</p>
        <Link to="/" className="btn-primary">Browse Phones</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Your Wishlist</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
