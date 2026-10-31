import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail loudly instead of silently moving to 5174, which the backend's
    // CORS setting (CLIENT_ORIGIN) would then block.
    strictPort: true
  }
});
