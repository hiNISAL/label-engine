import { defineConfig } from 'vite';
import path from 'path';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '@leafer-ui/node': process.env.RUNTIME === 'WEB' ? 'leafer-ui' : '@leafer-ui/node',
    },
  },
});
