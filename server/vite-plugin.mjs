/**
 * Vite 插件：为开发服务器添加 /api/* 路由。
 * 复用 server/api.mjs 中的 handleApiRequest 逻辑。
 */
import { handleApiRequest } from './api.mjs';

export function todoApiPlugin() {
  return {
    name: 'todo-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/')) {
          try {
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error('API plugin error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
            return;
          }
        }
        next();
      });
    },
  };
}
