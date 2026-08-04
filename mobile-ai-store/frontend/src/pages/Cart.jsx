import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag size={40} className="text-slate-300" />
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-slate-500">Browse our phones and add something you like.</p>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-[10px] font-bold text-white text-center px-1">
              {item.name}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-500">{item.brand} · €{item.price}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1 dark:border-slate-700">
              <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 text-slate-500 hover:text-brand-500">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 text-slate-500 hover:text-brand-500">
                <Plus size={14} />
              </button>
            </div>
            <p className="w-20 text-right font-semibold">€{item.qty * item.price}</p>
            <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-3">
        <div className="text-lg">
          Total: <span className="font-bold">€{totalPrice}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart} className="btn-secondary">Clear Cart</button>
          <button className="btn-primary">Checkout (Demo)</button>
        </div>
      </div>
    </div>
  );
}
