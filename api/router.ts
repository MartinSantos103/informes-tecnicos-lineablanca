import type { IncomingMessage, ServerResponse } from 'http';
import companyHandler from './company.js';
import reportsHandler from './reports.js';
import authHandler from './auth.js';
import keepAliveHandler from './keep-alive.js';
import staffHandler from './staff.js';

export async function apiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
) {
  if (!req.url || !req.url.startsWith('/api/')) {
    return next();
  }

  // Extraer URL y parámetros de consulta
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const query: Record<string, string> = {};
  parsedUrl.searchParams.forEach((val, key) => {
    query[key] = val;
  });

  // Enriquecer request
  (req as any).query = query;

  // Enriquecer response con helpers estándar de Vercel/Express
  (res as any).status = function (statusCode: number) {
    res.statusCode = statusCode;
    return res;
  };
  (res as any).json = function (data: any) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  (res as any).send = function (data: any) {
    res.end(data);
  };

  // Leer cuerpo si es POST/PUT/PATCH/DELETE
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    let bodyData = '';
    req.on('data', (chunk) => {
      bodyData += chunk;
    });
    req.on('end', async () => {
      try {
        (req as any).body = bodyData ? JSON.parse(bodyData) : {};
      } catch {
        (req as any).body = bodyData;
      }
      await dispatchRoute(pathname, req, res);
    });
  } else {
    (req as any).body = {};
    await dispatchRoute(pathname, req, res);
  }
}

async function dispatchRoute(pathname: string, req: any, res: any) {
  try {
    if (pathname.startsWith('/api/company')) {
      await companyHandler(req, res);
    } else if (pathname.startsWith('/api/reports')) {
      await reportsHandler(req, res);
    } else if (pathname.startsWith('/api/auth')) {
      await authHandler(req, res);
    } else if (pathname.startsWith('/api/keep-alive')) {
      await keepAliveHandler(req, res);
    } else if (pathname.startsWith('/api/staff')) {
      await staffHandler(req, res);
    } else {
      res.status(404).json({ error: `Ruta no encontrada: ${pathname}` });
    }
  } catch (err: any) {
    console.error(`[API Dev Error ${pathname}]:`, err);
    res.status(500).json({ error: err.message || 'Error interno en API' });
  }
}
