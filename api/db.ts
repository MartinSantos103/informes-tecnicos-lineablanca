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
