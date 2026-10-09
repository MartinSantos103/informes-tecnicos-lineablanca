import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  
  if (!url) {
    // Fallback: leer directamente de .env.local si aún no se inyectó en process.env
    try {
      const envLocalPath = path.resolve(process.cwd(), '.env.local');
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('DATABASE_URL=')) {
            url = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '').trim();
            process.env.DATABASE_URL = url;
            break;
          }
        }
      }
    } catch {
      // Ignorar errores de fs en entornos de solo lectura
    }
  }

  if (!url) {
    throw new Error('DATABASE_URL no está configurada en las variables de entorno ni en .env.local.');
  }
  return url;
}

export function getSql() {
  const url = getDatabaseUrl();
  return neon(url);
}

export async function getRequestContext(req: any, sql: any) {
  const rawUserId = req.headers?.['x-user-id'] || req.query?.requestorId || (typeof req.body === 'object' && req.body !== null ? req.body.requestorId : null);
  const userId = typeof rawUserId === 'string' ? rawUserId.trim() : null;
  
  let user: any = null;
  let companyId: string | null = null;

  if (userId) {
    try {
      const rows = await sql`
        SELECT id, company_id, role, full_name, email 
        FROM public.profiles 
        WHERE id = ${userId}
        LIMIT 1
      `;
      if (rows.length > 0) {
        user = rows[0];
        companyId = user.company_id;
      }
    } catch (err) {
      console.warn('[getRequestContext] Error verificando usuario:', err);
    }
  }

  // Si no se encontró usuario o no tiene company_id asociado en profile, buscar por cabecera/query
  if (!companyId) {
    const rawComp = req.headers?.['x-company-id'] || req.query?.company_id || (typeof req.body === 'object' && req.body !== null ? req.body.company_id : null);
    if (typeof rawComp === 'string' && rawComp.trim()) {
      companyId = rawComp.trim();
    }
  }

  // Fallback seguro: primera empresa si es que no hay ninguna indicada
  if (!companyId) {
    try {
      const compRows = await sql`SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1`;
      companyId = compRows[0]?.id || null;
    } catch {}
  }

  return { user, companyId };
}
