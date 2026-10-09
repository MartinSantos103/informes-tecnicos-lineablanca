-- ====================================================================
-- CARGA ATÓMICA DE DATOS Y ACTIVACIÓN DE SEGURIDAD (NEON)
-- ====================================================================
-- Este script realiza en una única transacción:
-- 1. Inserción de la Empresa (Service Santos)
-- 2. Inserción del Técnico / Perfil
-- 3. Inserción de los 7 Informes Técnicos históricos (000001 a 000007)
-- 4. Sección 11: Sincronización del Contador Correlativo (fija el valor en 7)
-- 5. Sección 10: Activación de Row Level Security (RLS) y Políticas
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- PASO 1: INSERTAR EMPRESA (public.companies)
-- --------------------------------------------------------------------
INSERT INTO public.companies (
    id,
    name,
    logo_url,
    address,
    phone,
    email,
    website,
    legal_notice,
    created_at,
    updated_at
) VALUES (
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    'Service Santos',
    'data:image/jpeg;base64,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',
    'Salta',
    '+54 387 4885711',
    'javiersantostecnico@hotmail.com',
    '',
    'Esta estimación no es un contrato o factura. Es nuestra mejor conjetura en el precio total para realizar el trabajo en base a una inspección inicial, la cual esta sujeta a cambios, según requieran piezas o trabajos adicionales, los cuales se comunican oportunamente.',
    '2026-08-11 20:12:20.666224+00',
    '2026-08-28 13:39:49.31082+00'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    legal_notice = EXCLUDED.legal_notice,
    updated_at = EXCLUDED.updated_at;

-- --------------------------------------------------------------------
-- PASO 2: INSERTAR TÉCNICO / PERFIL (public.profiles)
-- --------------------------------------------------------------------
INSERT INTO public.profiles (
    id,
    company_id,
    full_name,
    role,
    avatar_url,
    email,
    created_at,
    updated_at
) VALUES (
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    'javiersantostecnico@hotmail.com',
    'technician',
    NULL,
    'javiersantostecnico@hotmail.com',
    '2026-08-12 13:47:34.384046+00',
    '2026-08-12 13:47:34.384046+00'
)
ON CONFLICT (id) DO UPDATE
SET company_id = EXCLUDED.company_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

-- --------------------------------------------------------------------
-- PASO 3: INSERTAR INFORMES TÉCNICOS (public.reports) - 7 REGISTROS
-- --------------------------------------------------------------------
INSERT INTO public.reports (
    id,
    report_number,
    company_id,
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
    estimated_cost,
    created_at,
    updated_at,
    created_by
) VALUES 
(
    '07170e80-6daf-465f-a24b-62b1c3aff20c',
    '000001',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-08-12',
    'Luis Basualdo',
    'B Parque de La Vega cuadra 1 depto',
    '+54 387 4885711',
    '',
    'Drean',
    '608',
    'Lavarropas',
    '-',
    'Placa electrónica dañada.',
    'Desgaste por uso.',
    'Sustituir placa electrónica drean next fase 3.',
    120000.00,
    '2026-08-12 13:56:01.184898+00',
    '2026-08-12 13:56:01.184898+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    '7bdfeb84-146c-4a3f-907b-774efcc276e0',
    '000002',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-08-28',
    'Julieta Santos ',
    'Ayacucho 489',
    '387-4885713',
    'javiersantostecnico@hotmail.com',
    'Whirlpool',
    'Wlf12ai ',
    'Lavarropas',
    'Hhh',
    'Nsndndnddnd',
    'Dndnjdjdjdjdjdjw',
    'Bdbdnndndnsnnsnw',
    200000.00,
    '2026-08-28 11:37:56.884829+00',
    '2026-08-28 11:37:56.884829+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    '8af51946-4a7f-4a13-8330-e43c8c4bad77',
    '000003',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-08-28',
    'Bernardo Costa ',
    'Ruta 28 km 8, Complejo Terrazas de san lorenzo depto 1, San lorenzo ,Salta.',
    '3876830155',
    '',
    'Samsung',
    'S488w-g-etfg',
    'Heladera',
    '401942fcb00168',
    'Heladera no enfria, Motocompresor ML90GOY, estado: descompuesto.',
    'Suministro eléctrico fuera de los parámetros normales de operatividad. ',
    'Sustitución de motocompresor, limpieza de cañerías,cambio filtro molecular, válvulas de servicio, vacio presurizacion,carga de refrigerante con sistemas electrónicos.',
    560000.00,
    '2026-08-28 14:50:29.004949+00',
    '2026-08-28 14:50:29.004949+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    'dea5627c-e070-4698-977a-58ba07239b21',
    '000004',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-09-21',
    'Pablo Ivetich',
    'Mz555bcasa8 barrio universidad católica ',
    '3874074673',
    '',
    'Home leader',
    'Hlse30ci',
    'Aire Acondicionado',
    '-',
    'Motocompresor y placa electrónica dañadas.',
    E'Suministro eléctrico fuera de los parámetros normales de operatividad.\n',
    'Sustitución de toda la unidad AA.',
    100.00,
    '2026-09-21 11:04:08.610189+00',
    '2026-09-21 11:04:08.610189+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    'c9128d73-7808-4d3e-81e7-68de278510c5',
    '000005',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-09-21',
    'Pablo Ivetich',
    'Mz555bcasa8 barrio universidad católica ',
    '3874074673',
    '',
    'Home leader',
    'Hlse30ci',
    'Aire Acondicionado',
    '-',
    'Motocompresor y placa electrónica dañadas',
    'Suministro eléctrico fuera de los parámetros normales de operatividad ',
    'Sustitución de toda la unidad de aire acondicionado ',
    900000.00,
    '2026-09-21 11:42:09.685465+00',
    '2026-09-21 11:42:09.685465+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    'f1dd4c1e-1fcf-4f3d-907e-92e6b3a4f75a',
    '000006',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-09-21',
    'Pablo Ivetich',
    'Mz555bcasa8 barrio universidad católica ',
    '3874074673',
    '',
    'Drean',
    'Excellent blue 6.08',
    'Lavarropas',
    '-',
    'Motor, bomba,sensores y placa electrónica dañadas.',
    'Suministro eléctrico fuera de los parámetros normales de operatividad ',
    'No se recomienda su reparación.Sustitución de la unidad.',
    1100000.00,
    '2026-09-21 11:58:52.039012+00',
    '2026-09-21 11:58:52.039012+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
),
(
    '807c77bb-e40d-476f-b230-342d30161ec3',
    '000007',
    '0cacb583-a692-45a3-b649-f817b291a9ea',
    '2026-10-01',
    'Ines suarez ',
    'Colon 10 san lorenzo salta',
    '3874826418',
    '',
    'Home leader',
    'Hlse30ci',
    'Aire Acondicionado',
    '-',
    'Reubicacion de aire acondicionado ',
    'Reubicacion ',
    E'Desinstalacion,reubicacion física, service de limpieza e instalación de aire acondicionado tipo split,con materiales nuevos varios y terminación estética con cubrecanal.\nPrueba de estanqueidad, vacio y funcionamiento.\n',
    560000.00,
    '2026-10-01 12:59:35.221845+00',
    '2026-10-01 12:59:35.221845+00',
    'ae26eae8-971f-48d3-a0ee-1480ab1e9f7c'
)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- PASO 4: SECCIÓN 11 - SINCRONIZACIÓN DE CONTADORES ATÓMICOS
-- --------------------------------------------------------------------
-- Inicializa el contador en 7 para que el siguiente informe sea '000008'
INSERT INTO public.company_report_counters (company_id, last_number, updated_at)
SELECT 
    r.company_id,
    COALESCE(MAX(NULLIF(regexp_replace(r.report_number, '\D', '', 'g'), '')::INTEGER), 0) AS last_number,
    timezone('utc'::text, now())
FROM public.reports r
WHERE r.company_id IS NOT NULL
GROUP BY r.company_id
ON CONFLICT (company_id) DO UPDATE
SET last_number = EXCLUDED.last_number,
    updated_at = EXCLUDED.updated_at;

-- --------------------------------------------------------------------
-- PASO 5: SECCIÓN 10 - ACTIVACIÓN Y FORZADO DE ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.company_report_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_report_counters FORCE ROW LEVEL SECURITY;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

-- Políticas para public.companies
DROP POLICY IF EXISTS "companies_select_tenant" ON public.companies;
CREATE POLICY "companies_select_tenant" ON public.companies
    FOR SELECT
    USING (id = app.current_company_id());

DROP POLICY IF EXISTS "companies_update_tenant_admin" ON public.companies;
CREATE POLICY "companies_update_tenant_admin" ON public.companies
    FOR UPDATE
    USING (id = app.current_company_id() AND app.current_role() = 'admin')
    WITH CHECK (id = app.current_company_id() AND app.current_role() = 'admin');

DROP POLICY IF EXISTS "companies_insert_registration" ON public.companies;
CREATE POLICY "companies_insert_registration" ON public.companies
    FOR INSERT
    WITH CHECK (app.current_company_id() IS NULL OR app.current_role() = 'admin');

DROP POLICY IF EXISTS "companies_delete_tenant_admin" ON public.companies;
CREATE POLICY "companies_delete_tenant_admin" ON public.companies
    FOR DELETE
    USING (id = app.current_company_id() AND app.current_role() = 'admin');

-- Políticas para public.profiles
DROP POLICY IF EXISTS "profiles_select_tenant" ON public.profiles;
CREATE POLICY "profiles_select_tenant" ON public.profiles
    FOR SELECT
    USING (
        company_id = app.current_company_id() 
        OR id = app.current_user_id()
    );

DROP POLICY IF EXISTS "profiles_insert_tenant_admin" ON public.profiles;
CREATE POLICY "profiles_insert_tenant_admin" ON public.profiles
    FOR INSERT
    WITH CHECK (
        company_id = app.current_company_id() 
        OR app.current_company_id() IS NULL
    );

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
    FOR UPDATE
    USING (
        company_id = app.current_company_id() 
        AND (id = app.current_user_id() OR app.current_role() = 'admin')
    )
    WITH CHECK (
        company_id = app.current_company_id()
    );

DROP POLICY IF EXISTS "profiles_delete_tenant_admin" ON public.profiles;
CREATE POLICY "profiles_delete_tenant_admin" ON public.profiles
    FOR DELETE
    USING (
        company_id = app.current_company_id() 
        AND app.current_role() = 'admin' 
        AND id <> app.current_user_id()
    );

-- Políticas para public.company_report_counters
DROP POLICY IF EXISTS "counters_select_tenant" ON public.company_report_counters;
CREATE POLICY "counters_select_tenant" ON public.company_report_counters
    FOR SELECT
    USING (company_id = app.current_company_id());

DROP POLICY IF EXISTS "counters_insert_tenant" ON public.company_report_counters;
CREATE POLICY "counters_insert_tenant" ON public.company_report_counters
    FOR INSERT
    WITH CHECK (company_id = app.current_company_id());

DROP POLICY IF EXISTS "counters_update_tenant" ON public.company_report_counters;
CREATE POLICY "counters_update_tenant" ON public.company_report_counters
    FOR UPDATE
    USING (company_id = app.current_company_id())
    WITH CHECK (company_id = app.current_company_id());

DROP POLICY IF EXISTS "counters_delete_tenant_admin" ON public.company_report_counters;
CREATE POLICY "counters_delete_tenant_admin" ON public.company_report_counters
    FOR DELETE
    USING (company_id = app.current_company_id() AND app.current_role() = 'admin');

-- Políticas para public.reports
DROP POLICY IF EXISTS "reports_select_tenant" ON public.reports;
CREATE POLICY "reports_select_tenant" ON public.reports
    FOR SELECT
    USING (company_id = app.current_company_id());

DROP POLICY IF EXISTS "reports_insert_tenant" ON public.reports;
CREATE POLICY "reports_insert_tenant" ON public.reports
    FOR INSERT
    WITH CHECK (company_id = app.current_company_id());

DROP POLICY IF EXISTS "reports_update_tenant" ON public.reports;
CREATE POLICY "reports_update_tenant" ON public.reports
    FOR UPDATE
    USING (company_id = app.current_company_id())
    WITH CHECK (company_id = app.current_company_id());

DROP POLICY IF EXISTS "reports_delete_tenant_admin" ON public.reports;
CREATE POLICY "reports_delete_tenant_admin" ON public.reports
    FOR DELETE
    USING (company_id = app.current_company_id() AND app.current_role() = 'admin');

COMMIT;
