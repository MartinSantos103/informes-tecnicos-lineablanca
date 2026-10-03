import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { apiMiddleware } from './api/router.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.DATABASE_URL) {
    process.env.DATABASE_URL = env.DATABASE_URL;
  }
  if (env.DATABASE_URL_UNPOOLED) {
    process.env.DATABASE_URL_UNPOOLED = env.DATABASE_URL_UNPOOLED;
  }

  return {
    plugins: [
      react(),
      {
        name: 'neon-api-dev-server',
        configureServer(server) {
          server.middlewares.use(apiMiddleware);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      port: 5174,
    },
  };
});
