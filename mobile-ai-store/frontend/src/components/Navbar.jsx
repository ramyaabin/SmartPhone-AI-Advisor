import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Heart, Moon, Sun, Smartphone, MessageCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar({ onOpenChat }) {
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const { items: wishItems } = useWishlist();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-brand-500 ${
      isActive ? 'text-brand-500' : 'text-slate-600 dark:text-slate-300'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Smartphone size={18} />
          </span>
          Mobile<span className="text-brand-500">AI</span>Store
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/wishlist" className={linkClass}>
            Wishlist
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 sm:flex"
          >
            <MessageCircle size={16} className="text-brand-500" />
            Ask AI
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/wishlist"
            className="relative rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Heart size={18} />
            {wishItems.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {wishItems.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="relative rounded-xl border border-slate-200 p-2.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
