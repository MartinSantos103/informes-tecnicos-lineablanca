import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, getRequestContext } from './db.js';

const DEFAULT_COMPANY = {
  name: 'Mi Empresa',
  address: '',
  phone: '',
  email: '',
  website: '',
  legal_notice:
    'Esta estimación no es un contrato o factura. Es nuestra mejor conjetura en el precio total para realizar el trabajo en base a una inspección inicial, la cual esta sujeta a cambios, según requieran piezas o trabajos adicionales, los cuales se comunican oportunamente.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!companyId) {
        return res.status(400).json({ error: 'No se identificó la empresa asociada al usuario.' });
      }

      // Seguridad: sólo rol admin puede editar datos de la empresa
      if (user && user.role && user.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos de administrador para modificar los datos de la empresa.' });
      }

      // Actualización de campos
      const name = body.name ?? DEFAULT_COMPANY.name;
      const logo_url = body.logo_url ?? null;
      const address = body.address ?? DEFAULT_COMPANY.address;
      const phone = body.phone ?? DEFAULT_COMPANY.phone;
      const email = body.email ?? DEFAULT_COMPANY.email;
      const website = body.website ?? '';
      const legal_notice = body.legal_notice ?? DEFAULT_COMPANY.legal_notice;

      const updated = await sql`
        UPDATE public.companies
        SET name = ${name},
            logo_url = ${logo_url},
            address = ${address},
            phone = ${phone},
            email = ${email},
            website = ${website},
            legal_notice = ${legal_notice},
            updated_at = timezone('utc'::text, now())
        WHERE id = ${companyId}
        RETURNING id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
      `;

      if (updated.length > 0) {
        return res.status(200).json(updated[0]);
      } else {
        const inserted = await sql`
          INSERT INTO public.companies (id, name, logo_url, address, phone, email, website, legal_notice)
          VALUES (${companyId}, ${name}, ${logo_url}, ${address}, ${phone}, ${email}, ${website}, ${legal_notice})
          RETURNING id, name, logo_url, address, phone, email, website, legal_notice, created_at, updated_at
        `;
        return res.status(200).json(inserted[0]);
      }
    }

    return res.status(405).json({ error: `Método ${req.method} no permitido.` });
  } catch (err: any) {
    console.error('[api/company] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor en Neon' });
  }
}
