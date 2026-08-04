import axiosClient from './axiosClient';

export async function fetchProducts(params = {}) {
  const { data } = await axiosClient.get('/products', { params });
  return data;
}

export async function fetchProductById(id) {
  const { data } = await axiosClient.get(`/products/${id}`);
  return data;
}

export async function fetchBrands() {
  const { data } = await axiosClient.get('/products/brands');
  return data;
}

export async function fetchFeatured() {
  const { data } = await axiosClient.get('/products/featured');
  return data;
}
