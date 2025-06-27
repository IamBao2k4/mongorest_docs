import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-trailing-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('/') && req.url !== '/') {
            res.writeHead(301, { Location: req.url.slice(0, -1) });
            res.end();
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  css: {
    devSourcemap: false,
  },
  define: {
    'process.env': {},
  },
});
