import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenChat={() => setChatOpen(true)} />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating chat trigger (mobile-friendly) */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:bg-brand-600 sm:hidden"
        aria-label="Open AI chat assistant"
      >
        <MessageCircle size={22} />
      </button>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
