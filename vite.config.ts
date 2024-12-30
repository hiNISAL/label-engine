import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@leafer-ui/node': process.env.RUNTIME === 'WEB' ? 'leafer-ui' : '@leafer-ui/node',
    },
  },
});
