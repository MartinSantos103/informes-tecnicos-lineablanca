import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const sql = getSql();

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const email = body?.email?.trim()?.toLowerCase();
      const password = body?.password;

      if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido.' });
      }

      // Buscar perfil en Neon por email o full_name, evaluando contraseña con pgcrypto si está en formato bcrypt
      const rows = await sql`
        SELECT 
          id, company_id, full_name, role, avatar_url, email, password_hash,
          CASE 
            WHEN password_hash IS NULL THEN true
            WHEN password_hash LIKE '$2%' THEN (password_hash = crypt(${password || ''}, password_hash))
            ELSE (password_hash = ${password || ''})
          END AS is_password_valid
        FROM public.profiles
        WHERE LOWER(email) = ${email} OR LOWER(full_name) = ${email}
        LIMIT 1
      `;

      if (rows.length === 0) {
        return res.status(401).json({
          error: 'Credenciales inválidas. Usuario no registrado en la base de datos.',
        });
      }

      const userRow = rows[0];

      // Verificación de contraseña: Si el perfil tiene contraseña configurada, se exige y valida
      if (userRow.password_hash) {
        if (!password || !userRow.is_password_valid) {
          return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // Si la contraseña estaba guardada en texto plano, la migramos automáticamente a Bcrypt hash
        if (!userRow.password_hash.startsWith('$2')) {
          try {
            await sql`
              UPDATE public.profiles
              SET password_hash = crypt(${password}, gen_salt('bf', 10))
              WHERE id = ${userRow.id}
            `;
          } catch (migrateErr) {
            console.warn('[api/auth] No se pudo rehashear contraseña:', migrateErr);
          }
        }
      }

      return res.status(200).json({
        user: {
          id: userRow.id,
          company_id: userRow.company_id,
          full_name: userRow.full_name || userRow.email,
          email: userRow.email,
          role: (userRow.role || 'technician').toLowerCase(),
          avatar_url: userRow.avatar_url,
        },
      });
    }

    if (req.method === 'GET') {
      const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : null;
      if (email) {
        const rows = await sql`
          SELECT id, company_id, full_name, role, avatar_url, email
          FROM public.profiles
          WHERE LOWER(email) = ${email}
          LIMIT 1
        `;
        if (rows.length > 0) {
          const qUser = rows[0];
          qUser.role = (qUser.role || 'technician').toLowerCase();
          return res.status(200).json({ user: qUser });
        }
      }

      // Devolver primer técnico registrado
      const fallback = await sql`
        SELECT id, company_id, full_name, role, avatar_url, email
        FROM public.profiles
        LIMIT 1
      `;
      if (fallback.length > 0) {
        const fbUser = fallback[0];
        fbUser.role = (fbUser.role || 'technician').toLowerCase();
        return res.status(200).json({ user: fbUser });
      }

      return res.status(404).json({ error: 'No se encontraron perfiles' });
    }

    return res.status(405).json({ error: `Método ${req.method} no permitido.` });
  } catch (err: any) {
    console.error('[api/auth] Error:', err);
    return res.status(500).json({ error: err.message || 'Error al autenticar en Neon' });
  }
}
