import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, getRequestContext } from '../db.js';
import { companySettingsSchema } from '../../src/shared/schemas.js';

const DEFAULT_COMPANY = {
  name: 'Mi Empresa',
  address: '',
  phone: '',
  email: '',
  website: '',
  legal_notice:
    'Esta estimación no es un contrato o factura. Es nuestra mejor conjetura en el precio total para realizar el trabajo en base a una inspección inicial, la cual esta sujeta a cambios, según requieran piezas o trabajos adicionales, los cuales se comunican oportunamente.',
};

export default async function companyHandler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const sql = getSql();
    const { user, companyId } = await getRequestContext(req, sql);

    if (req.method === 'GET') {
      let rows: any[] = [];
      if (companyId) {
        rows = await sql`
          SELECT id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
          FROM public.companies
          WHERE id = ${companyId}
          LIMIT 1
        `;
      }

      if (rows.length === 0) {
        rows = await sql`
          SELECT id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
          FROM public.companies
          ORDER BY created_at ASC
          LIMIT 1
        `;
      }

      if (rows.length === 0) {
        return res.status(200).json(DEFAULT_COMPANY);
      }

      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const rawBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'No se identificó la empresa asociada al usuario.' });
      }

      // Seguridad: sólo rol admin puede editar datos de la empresa
      if (user && user.role && user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos de administrador para modificar los datos de la empresa.' });
      }

      const parsed = companySettingsSchema.safeParse(rawBody);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Datos de empresa inválidos.',
          details: parsed.error.flatten().fieldErrors,
        });
      }

      const { name, logo_url, address, phone, email, website, legal_notice } = parsed.data;

      const updated = await sql`
        UPDATE public.companies
        SET name = ${name},
            logo_url = ${logo_url || null},
            address = ${address},
            phone = ${phone},
            email = ${email},
            website = ${website || ''},
            legal_notice = ${legal_notice || DEFAULT_COMPANY.legal_notice},
            updated_at = timezone('utc'::text, now())
        WHERE id = ${companyId}
        RETURNING id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
      `;

      if (updated.length > 0) {
        return res.status(200).json(updated[0]);
      } else {
        const inserted = await sql`
          INSERT INTO public.companies (id, name, logo_url, address, phone, email, website, legal_notice)
          VALUES (${companyId}, ${name}, ${logo_url || null}, ${address}, ${phone}, ${email}, ${website || ''}, ${legal_notice || DEFAULT_COMPANY.legal_notice})
          RETURNING id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
        `;
        return res.status(200).json(inserted[0]);
      }
    }

    return res.status(405).json({ error: `Método ${req.method} no permitido.` });
  } catch (err: any) {
    console.error('[server/company] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor en Neon' });
  }
}
