import type { IncomingMessage, ServerResponse } from 'http';
import authHandler from './handlers/auth.js';
import companyHandler from './handlers/company.js';
import reportsHandler from './handlers/reports.js';
import staffHandler from './handlers/staff.js';

/**
 * Manejador principal para despachar peticiones tanto en Vercel (Serverless)
 * como en Vite (servidor de desarrollo local).
 */
export async function handleApiRequest(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const parsedUrl = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Asegurar que req.query siempre contenga los parámetros de la URL
  const query: Record<string, string> = { ...(req.query || {}) };
  parsedUrl.searchParams.forEach((val, key) => {
    if (query[key] === undefined) {
      query[key] = val;
    }
  });
  req.query = query;

  // Enriquecer response con helpers si faltan (entornos HTTP estándar de Node)
  if (!res.status) {
    res.status = function (statusCode: number) {
      res.statusCode = statusCode;
      return res;
    };
  }
  if (!res.json) {
    res.json = function (data: any) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }
  if (!res.send) {
    res.send = function (data: any) {
      res.end(data);
      return res;
    };
  }

  try {
    if (pathname.startsWith('/api/company')) {
      return await companyHandler(req, res);
    } else if (pathname.startsWith('/api/reports')) {
      return await reportsHandler(req, res);
    } else if (pathname.startsWith('/api/auth')) {
      return await authHandler(req, res);
    } else if (pathname.startsWith('/api/staff')) {
      return await staffHandler(req, res);
    } else {
      return res.status(404).json({ error: `Ruta de API no encontrada: ${pathname}` });
    }
  } catch (err: any) {
    console.error(`[API Router Error] ${pathname}:`, err);
    return res.status(500).json({ error: err.message || 'Error interno en API' });
  }
}

/**
 * Middleware para el servidor de desarrollo de Vite
 */
export async function apiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
) {
  if (!req.url || !req.url.startsWith('/api/')) {
    return next();
  }

  const method = req.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
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
      await handleApiRequest(req, res);
    });
  } else {
    (req as any).body = {};
    await handleApiRequest(req, res);
  }
}
