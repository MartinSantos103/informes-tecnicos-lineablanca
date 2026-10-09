import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, getRequestContext } from './db.js';

function padReportNumber(num: number): string {
  return String(num).padStart(6, '0');
}

function normalizeReportRow(r: any) {
  if (!r) return null;
  let dateStr = r.date;
  if (r.date instanceof Date) {
    dateStr = r.date.toISOString().split('T')[0];
  } else if (typeof r.date === 'string') {
    dateStr = r.date.split('T')[0];
  }

  return {
    ...r,
    date: dateStr,
    estimated_cost: Number(r.estimated_cost) || 0,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const sql = getSql();
    const { user, companyId } = await getRequestContext(req, sql);

    if (req.method === 'GET') {
      const { id, action, nextNumber, all, page, pageSize, searchQuery, equipment, sortBy } = req.query;

      // 1. Obtener informe por ID
      if (id && typeof id === 'string') {
        const rows = await sql`SELECT * FROM public.reports WHERE id = ${id} LIMIT 1`;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Informe no encontrado' });
        }
        // Verificar aislamiento de empresa si el usuario está autenticado en una empresa
        if (companyId && rows[0].company_id && rows[0].company_id !== companyId) {
          return res.status(403).json({ error: 'No tienes acceso al informe de otra empresa.' });
        }
        return res.status(200).json(normalizeReportRow(rows[0]));
      }

      // 2. Estimación del siguiente número correlativo (sin avanzar el contador) para la empresa actual
      if (action === 'next-number' || nextNumber === 'true') {
        let nextVal = 1;
        if (companyId) {
          const counterRows = await sql`
            SELECT last_number FROM public.company_report_counters WHERE company_id = ${companyId} LIMIT 1
          `;
          if (counterRows.length > 0 && counterRows[0].last_number) {
            nextVal = Number(counterRows[0].last_number) + 1;
          } else {
            const maxRows = await sql`
              SELECT COALESCE(MAX(NULLIF(regexp_replace(report_number, '\\D', '', 'g'), '')::INTEGER), 0) AS max_num
              FROM public.reports
              WHERE company_id = ${companyId}
            `;
            nextVal = Number(maxRows[0]?.max_num || 0) + 1;
          }
        }
        return res.status(200).json({ nextReportNumber: padReportNumber(nextVal) });
      }

      // 3. Obtener todos los informes de la empresa (sin paginar)
      if (all === 'true') {
        const rows = companyId
          ? await sql`
              SELECT * FROM public.reports 
              WHERE company_id = ${companyId}
              ORDER BY date DESC, created_at DESC
            `
          : await sql`
              SELECT * FROM public.reports 
              ORDER BY date DESC, created_at DESC
            `;
        return res.status(200).json(rows.map(normalizeReportRow));
      }

      // 4. Consulta Paginada con Filtros
      const validPage = Math.max(1, parseInt(page as string, 10) || 1);
      const validPageSize = Math.max(1, parseInt(pageSize as string, 10) || 8);
      const offset = (validPage - 1) * validPageSize;

      const q = typeof searchQuery === 'string' && searchQuery.trim() ? `%${searchQuery.trim().toLowerCase()}%` : null;
      const eq = typeof equipment === 'string' && equipment !== 'ALL' && equipment.trim() ? equipment.trim() : null;

      // Para soportar ordenamiento dinámico seguro en Neon SQL
      let orderClause = 'ORDER BY date DESC, created_at DESC';
      if (sortBy === 'date_asc') {
        orderClause = 'ORDER BY date ASC, created_at ASC';
      } else if (sortBy === 'cost_desc') {
        orderClause = 'ORDER BY estimated_cost DESC';
      } else if (sortBy === 'cost_asc') {
        orderClause = 'ORDER BY estimated_cost ASC';
      } else if (sortBy === 'number_desc') {
        orderClause = 'ORDER BY report_number DESC';
      }

      // Usar sql.query para composición con WHERE dinámico
      const conditions: string[] = ['1=1'];
      const params: any[] = [];
      let pIdx = 1;

      if (companyId) {
        conditions.push(`company_id = $${pIdx++}`);
        params.push(companyId);
      }

      if (eq) {
        conditions.push(`equipment = $${pIdx++}`);
        params.push(eq);
      }

      if (q) {
        conditions.push(`(
          LOWER(report_number) LIKE $${pIdx} OR
          LOWER(client_name) LIKE $${pIdx} OR
          LOWER(phone) LIKE $${pIdx} OR
          LOWER(equipment) LIKE $${pIdx} OR
          LOWER(brand) LIKE $${pIdx} OR
          LOWER(model) LIKE $${pIdx} OR
          LOWER(COALESCE(serial_number, '')) LIKE $${pIdx} OR
          LOWER(diagnosis) LIKE $${pIdx} OR
          LOWER(address) LIKE $${pIdx}
        )`);
        params.push(q);
        pIdx++;
      }

      const whereClause = conditions.join(' AND ');

      // Total count
      const countResult = await sql.query(
        `SELECT COUNT(*) AS total FROM public.reports WHERE ${whereClause}`,
        params
      );
      const totalCount = parseInt(countResult[0]?.total || '0', 10);

      // Data con offset y limit
      params.push(validPageSize);
      const limitParamIdx = pIdx++;
      params.push(offset);
      const offsetParamIdx = pIdx++;

      const dataResult = await sql.query(
        `SELECT * FROM public.reports WHERE ${whereClause} ${orderClause} LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}`,
        params
      );

      const totalPages = Math.max(1, Math.ceil(totalCount / validPageSize));

      return res.status(200).json({
        data: dataResult.map(normalizeReportRow),
        totalCount,
        totalPages,
        currentPage: Math.min(validPage, totalPages),
        pageSize: validPageSize,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Obtener company_id y user_id de la sesión o del cuerpo
      let targetCompanyId = body.company_id || companyId;
      if (!targetCompanyId) {
        const compRows = await sql`SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1`;
        targetCompanyId = compRows[0]?.id;
      }

      let createdBy = body.created_by || user?.id;
      if (!createdBy) {
        const profRows = await sql`SELECT id FROM public.profiles WHERE company_id = ${targetCompanyId} LIMIT 1`;
        createdBy = profRows[0]?.id;
      }

      const date = body.date || new Date().toISOString().split('T')[0];
      const clientName = body.client_name || '';
      const address = body.address || '';
      const phone = body.phone || '';
      const email = body.email || '';
      const brand = body.brand || '';
      const model = body.model || '';
      const equipment = body.equipment || '';
      const serialNumber = body.serial_number || '-';
      const diagnosis = body.diagnosis || '';
      const cause = body.cause || '';
      const workDescription = body.work_description || '';
      const estimatedCost = Number(body.estimated_cost) || 0;

      // Inserción en public.reports
      // El trigger handle_report_insert() generará automáticamente el correlativo y actualizará el contador por empresa
      const inserted = await sql`
        INSERT INTO public.reports (
          company_id,
          created_by,
          date,
          client_name,
          address,
          phone,
          email,
          brand,
          model,
          equipment,
          serial_number,
          diagnosis,
          cause,
          work_description,
          estimated_cost
        ) VALUES (
          ${targetCompanyId},
          ${createdBy},
          ${date},
          ${clientName},
          ${address},
          ${phone},
          ${email},
          ${brand},
          ${model},
          ${equipment},
          ${serialNumber},
          ${diagnosis},
          ${cause},
          ${workDescription},
          ${estimatedCost}
        )
        RETURNING *
      `;

      return res.status(201).json(normalizeReportRow(inserted[0]));
    }

    if (req.method === 'DELETE') {
      const { id, requestorId } = req.query;
      const activeUserId = (requestorId as string) || user?.id;

      if (!id || !activeUserId) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
      }

      // Check requestor role
      const requestorRes = await sql`SELECT role, company_id FROM public.profiles WHERE id = ${activeUserId}`;
      if (requestorRes.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const requestorRole = (requestorRes[0].role || 'technician').toLowerCase();
      if (requestorRole !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para eliminar informes.' });
      }

      const userComp = companyId || requestorRes[0].company_id;
      if (userComp) {
        await sql`DELETE FROM public.reports WHERE id = ${id} AND company_id = ${userComp}`;
      } else {
        await sql`DELETE FROM public.reports WHERE id = ${id}`;
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: `Método ${req.method} no permitido.` });
  } catch (err: any) {
    console.error('[api/reports] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor en Neon' });
  }
}
