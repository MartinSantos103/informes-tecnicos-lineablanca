import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, getRequestContext } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const sql = getSql();
    const { user, companyId } = await getRequestContext(req, sql);

    if (req.method === 'GET') {
      const rows = companyId
        ? await sql`
            SELECT id, company_id, full_name, role, avatar_url, email
            FROM public.profiles
            WHERE company_id = ${companyId}
            ORDER BY created_at ASC
          `
        : await sql`
            SELECT id, company_id, full_name, role, avatar_url, email
            FROM public.profiles
            ORDER BY created_at ASC
          `;
      const normalizedRows = rows.map(r => ({ ...r, role: (r.role || 'technician').toLowerCase() }));
      return res.status(200).json(normalizedRows);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { email, password, role } = body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      if (!companyId) {
        return res.status(400).json({ error: 'No se identificó la empresa asociada.' });
      }

      // Check max limit (10 users per company)
      const countRes = await sql`SELECT count(*) as count FROM public.profiles WHERE company_id = ${companyId}`;
      const count = parseInt(countRes[0].count, 10);
      if (count >= 10) {
        return res.status(400).json({ error: 'Se ha alcanzado el límite de 10 usuarios por empresa.' });
      }

      // Check unique email
      const existingEmail = await sql`SELECT id FROM public.profiles WHERE lower(email) = lower(${email})`;
      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
      }

      // Insert new user assigned to companyId
      const inserted = await sql`
        INSERT INTO public.profiles (email, full_name, role, password_hash, company_id)
        VALUES (
          ${email.toLowerCase()}, 
          ${email.split('@')[0]}, 
          ${role === 'lead_technician' ? 'lead_technician' : 'technician'},
          crypt(${password}, gen_salt('bf', 10)),
          ${companyId}
        )
        RETURNING id, company_id, full_name, role, avatar_url, email
      `;

      return res.status(201).json(inserted[0]);
    }

    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, requestorId } = body || {};
      const activeReqId = requestorId || user?.id;
      
      if (!id || !activeReqId) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
      }
      
      if (id === activeReqId) {
         return res.status(400).json({ error: 'No puedes borrar tu propia cuenta.' });
      }

      // Get requestor and target details
      const requestorRes = await sql`SELECT role, company_id FROM public.profiles WHERE id = ${activeReqId}`;
      const targetRes = await sql`SELECT role, company_id FROM public.profiles WHERE id = ${id}`;

      if (requestorRes.length === 0 || targetRes.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const activeComp = companyId || requestorRes[0].company_id;
      if (activeComp && targetRes[0].company_id !== activeComp) {
        return res.status(403).json({ error: 'No puedes eliminar usuarios de otra empresa.' });
      }

      const requestorRole = (requestorRes[0].role || 'technician').toLowerCase();
      const targetRole = (targetRes[0].role || 'technician').toLowerCase();

      if (requestorRole !== 'admin' && requestorRole !== 'lead_technician') {
        return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
      }

      if (targetRole === 'admin') {
        return res.status(403).json({ error: 'No se puede eliminar a un administrador.' });
      }

      await sql`DELETE FROM public.profiles WHERE id = ${id} AND company_id = ${activeComp}`;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: `Método ${req.method} no permitido.` });
  } catch (err: any) {
    console.error('[api/staff] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
