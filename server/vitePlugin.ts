import type { Plugin } from 'vite';
import express from 'express';
import { apiRouter } from './apiRouter.js';

export function expressApiPlugin(): Plugin {
  return {
    name: 'vite-express-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(apiRouter);

      server.middlewares.use('/api', app);
      console.log('[Vite] Express API middleware mounted at /api');
    }
  };
}
