import type { ClientRequest } from 'node:http';
import type { ProxyOptions } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const starOfficeTarget = (env.STAR_OFFICE_API_BASE || 'http://127.0.0.1:19000').replace(/\/$/, '');
  const conwayBase = (env.CONWAY_API_BASE || '').replace(/\/$/, '');
  const conwayKey = (env.CONWAY_API_KEY || '').trim();

  const proxy: Record<string, ProxyOptions> = {
    '/api/star-office': {
      target: starOfficeTarget,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/star-office/, ''),
    },
  };

  if (conwayBase && conwayKey) {
    proxy['/api/conway'] = {
      target: conwayBase,
      changeOrigin: true,
      secure: true,
      rewrite: (pathStr: string) => pathStr.replace(/^\/api\/conway/, '') || '/',
      configure: (proxyServer) => {
        proxyServer.on('proxyReq', (proxyReq: ClientRequest) => {
          proxyReq.setHeader('Authorization', `Bearer ${conwayKey}`);
          proxyReq.setHeader('Accept', 'application/json');
        });
      },
    };
  }

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  }
})
