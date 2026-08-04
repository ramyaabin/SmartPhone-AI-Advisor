import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.resolve(__dirname, '../../../data/products.json');

let cache = null;

function loadProducts() {
  if (cache) return cache;
  const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

export function getAllProducts(req, res, next) {
  try {
    const { brand, search, minPrice, maxPrice } = req.query;
    let products = loadProducts();

    if (brand) {
      products = products.filter(
        (p) => p.brand.toLowerCase() === String(brand).toLowerCase()
      );
    }
    if (search) {
      const q = String(search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));

    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
}

export function getProductById(req, res, next) {
  try {
    const products = loadProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export function getBrands(req, res, next) {
  try {
    const products = loadProducts();
    const brands = [...new Set(products.map((p) => p.brand))];
    res.json({ brands });
  } catch (err) {
    next(err);
  }
}

export function getFeatured(req, res, next) {
  try {
    const products = loadProducts();
    // Deterministic "featured" pick: newest flagship-ish phone per brand
    const featuredIds = [
      'apple-iphone-17-pro',
      'samsung-galaxy-s24-ultra',
      'google-pixel-9-pro',
      'oneplus-13',
      'xiaomi-14-ultra'
    ];
    const featured = products.filter((p) => featuredIds.includes(p.id));
    res.json({ products: featured });
  } catch (err) {
    next(err);
  }
}
