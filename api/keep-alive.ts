import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from './db.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  console.log(`[keep-alive] [${timestamp}] Starting Neon keep-alive ping...`);

  try {
    const sql = getSql();

    // Consulta de salud y actividad a Neon
    const data = await sql`
      SELECT id, name, updated_at
      FROM public.companies
      LIMIT 1
    `;

    const durationMs = Date.now() - startTime;
    console.log(`[keep-alive] [${timestamp}] Neon ping successful (${durationMs}ms). Company: ${data[0]?.name}`);

    return res.status(200).json({
      success: true,
      message: 'Neon keep-alive ejecutado con éxito',
      timestamp,
      durationMs,
      company: data[0]?.name,
    });
  } catch (err: any) {
    const errorMessage = err?.message || 'Error inesperado al ejecutar Neon keep-alive';
    console.error(`[keep-alive] [${timestamp}] EXCEPTION:`, errorMessage);
    return res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp,
      durationMs: Date.now() - startTime,
    });
  }
}
