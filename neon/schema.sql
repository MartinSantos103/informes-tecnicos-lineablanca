-- ====================================================================
-- ESQUEMA DE BASE DE DATOS PARA NEON (POSTGRESQL SERVERLESS)
-- Arquitectura Multi-Tenant (v2) con Aislamiento Estricto y RLS Forzado
-- Compatible con importación manual de datos legados vía CSV
-- ====================================================================

-- ====================================================================
-- 1. ESQUEMA DE CONTEXTO DE SESIÓN (app)
-- ====================================================================
-- Funciones helper seguras para leer el contexto de la transacción/sesión
-- establecido por el backend serverless mediante:
--   SET LOCAL app.current_company_id = '...';
--   SET LOCAL app.current_user_id    = '...';
--   SET LOCAL app.current_role       = '...';
--
-- Uso del segundo parámetro `true` en current_setting para que retorne NULL
-- si el parámetro no fue configurado (evita excepciones en scripts de migración).

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_company_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_val TEXT;
BEGIN
    v_val := current_setting('app.current_company_id', true);
    IF v_val IS NULL OR v_val = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_val::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_val TEXT;
BEGIN
    v_val := current_setting('app.current_user_id', true);
    IF v_val IS NULL OR v_val = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_val::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION app.current_role()
RETURNS VARCHAR
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_val TEXT;
BEGIN
    v_val := current_setting('app.current_role', true);
    IF v_val IS NULL OR v_val = '' THEN
        RETURN NULL;
    END IF;
    RETURN v_val::VARCHAR;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- ====================================================================
-- 2. FUNCIÓN DE ACTUALIZACIÓN DE TIMESTAMPS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. TABLA: EMPRESAS (Entidad Raíz del Multi-Tenant)
-- ====================================================================
-- Se preservan intactos nombres y tipos de columnas de la versión previa.
-- Utiliza exclusivamente la función nativa gen_random_uuid().

CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Nombre de Empresa',
    logo_url TEXT,
    address VARCHAR(255) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    legal_notice TEXT DEFAULT 'Esta estimación no es un contrato o factura. Es nuestra mejor conjetura en el precio total para realizar el trabajo en base a una inspección inicial, la cual esta sujeta a cambios, según requieran piezas o trabajos adicionales, los cuales se comunican oportunamente.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER set_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 4. TABLA: USUARIOS / PERFILES (profiles)
-- ====================================================================
-- Desacoplada de auth.users de Supabase.
-- Se preservan las columnas existentes con sus tipos idénticos.
-- Nuevas columnas (email, password_hash, updated_at) se configuran
-- compatibles con CSV (nullable inicialmente con default).
-- Restricción estricta UNIQUE a nivel de tabla sobre email.
-- FK a companies con eliminación en cascada ON DELETE CASCADE.

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'technician',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email VARCHAR(255),
    password_hash TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_profiles_email UNIQUE (email)
);

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. TABLA: CONTADORES ATÓMICOS POR EMPRESA (company_report_counters)
-- ====================================================================
-- Sustituye a la secuencia global single-tenant de Supabase.
-- Garantiza numeración independiente por cada empresa_id.

CREATE TABLE IF NOT EXISTS public.company_report_counters (
    company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    last_number INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER set_company_counters_updated_at
    BEFORE UPDATE ON public.company_report_counters
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 6. FUNCIÓN ATÓMICA DE NUMERACIÓN (INSERT ON CONFLICT DO UPDATE RETURNING)
-- ====================================================================
-- Implementación atómica exclusiva mediante INSERT ... ON CONFLICT DO UPDATE.
-- Retorna el siguiente número correlativo formateado a 6 dígitos (ej. '000001').

CREATE OR REPLACE FUNCTION public.get_next_report_number(p_company_id UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
    v_next_val INTEGER;
BEGIN
    IF p_company_id IS NULL THEN
        RAISE EXCEPTION 'company_id no puede ser nulo para generar el número correlativo de informe';
    END IF;

    INSERT INTO public.company_report_counters (company_id, last_number, updated_at)
    VALUES (p_company_id, 1, timezone('utc'::text, now()))
    ON CONFLICT (company_id) DO UPDATE
    SET last_number = public.company_report_counters.last_number + 1,
        updated_at = timezone('utc'::text, now())
    RETURNING last_number INTO v_next_val;

    RETURN LPAD(v_next_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 7. TABLA: INFORMES TÉCNICOS (reports)
-- ====================================================================
-- Preserva todos los nombres y tipos de columnas originales.
-- FK company_id con ON DELETE CASCADE.
-- FK created_by apunta a public.profiles(id) con ON DELETE SET NULL.
-- Restricción UNIQUE de numeración restringida a nivel de empresa (company_id, report_number).

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(10) NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    client_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) DEFAULT '-',
    diagnosis TEXT NOT NULL,
    cause TEXT NOT NULL,
    work_description TEXT NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT uq_reports_company_report_number UNIQUE (company_id, report_number)
);

CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 8. TRIGGER DE INTEGRIDAD Y NUMERACIÓN EN INFORMES
-- ====================================================================
-- En caso de migración CSV con datos existentes, si report_number ya viene
-- provisto, se respeta tal como está y NO se sobreescribe.
-- Si report_number viene NULL o vacío, se invoca a get_next_report_number.

CREATE OR REPLACE FUNCTION public.handle_report_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Fallback de contexto para inserciones operacionales si no se especifican explícitamente
    IF NEW.company_id IS NULL THEN
        NEW.company_id := app.current_company_id();
    END IF;

    IF NEW.created_by IS NULL THEN
        NEW.created_by := app.current_user_id();
    END IF;

    -- Generación de numeración automática sólo si report_number no está definido
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        NEW.report_number := public.get_next_report_number(NEW.company_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_report_integrity
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_report_insert();

-- ====================================================================
-- 9. ÍNDICES DE RENDIMIENTO
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);

CREATE INDEX IF NOT EXISTS idx_reports_company_id ON public.reports(company_id);
CREATE INDEX IF NOT EXISTS idx_reports_company_report_number ON public.reports(company_id, report_number);
CREATE INDEX IF NOT EXISTS idx_reports_client_name ON public.reports(client_name);
CREATE INDEX IF NOT EXISTS idx_reports_serial_number ON public.reports(serial_number);
CREATE INDEX IF NOT EXISTS idx_reports_date ON public.reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports(created_by);

-- ====================================================================
-- 10. SEGURIDAD: ROW LEVEL SECURITY (RLS) FORZADO
-- ====================================================================
-- Aislamiento estricto: ENABLE + FORCE ROW LEVEL SECURITY en todas las tablas.
-- FORCE asegura que las políticas apliquen incluso para el table owner.

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.company_report_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_report_counters FORCE ROW LEVEL SECURITY;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Políticas para public.companies
-- --------------------------------------------------------------------
CREATE POLICY "companies_select_tenant" ON public.companies
    FOR SELECT
    USING (id = app.current_company_id());

CREATE POLICY "companies_update_tenant_admin" ON public.companies
    FOR UPDATE
    USING (id = app.current_company_id() AND app.current_role() = 'admin')
    WITH CHECK (id = app.current_company_id() AND app.current_role() = 'admin');

CREATE POLICY "companies_insert_registration" ON public.companies
    FOR INSERT
    WITH CHECK (app.current_company_id() IS NULL OR app.current_role() = 'admin');

CREATE POLICY "companies_delete_tenant_admin" ON public.companies
    FOR DELETE
    USING (id = app.current_company_id() AND app.current_role() = 'admin');

-- --------------------------------------------------------------------
-- Políticas para public.profiles
-- --------------------------------------------------------------------
CREATE POLICY "profiles_select_tenant" ON public.profiles
    FOR SELECT
    USING (
        company_id = app.current_company_id() 
        OR id = app.current_user_id()
    );

CREATE POLICY "profiles_insert_tenant_admin" ON public.profiles
    FOR INSERT
    WITH CHECK (
        company_id = app.current_company_id() 
        OR app.current_company_id() IS NULL
    );

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
    FOR UPDATE
    USING (
        company_id = app.current_company_id() 
        AND (id = app.current_user_id() OR app.current_role() = 'admin')
    )
    WITH CHECK (
        company_id = app.current_company_id()
    );

CREATE POLICY "profiles_delete_tenant_admin" ON public.profiles
    FOR DELETE
    USING (
        company_id = app.current_company_id() 
        AND app.current_role() = 'admin' 
        AND id <> app.current_user_id()
    );

-- --------------------------------------------------------------------
-- Políticas para public.company_report_counters
-- --------------------------------------------------------------------
CREATE POLICY "counters_select_tenant" ON public.company_report_counters
    FOR SELECT
    USING (company_id = app.current_company_id());

CREATE POLICY "counters_insert_tenant" ON public.company_report_counters
    FOR INSERT
    WITH CHECK (company_id = app.current_company_id());

CREATE POLICY "counters_update_tenant" ON public.company_report_counters
    FOR UPDATE
    USING (company_id = app.current_company_id())
    WITH CHECK (company_id = app.current_company_id());

CREATE POLICY "counters_delete_tenant_admin" ON public.company_report_counters
    FOR DELETE
    USING (company_id = app.current_company_id() AND app.current_role() = 'admin');

-- --------------------------------------------------------------------
-- Políticas para public.reports
-- --------------------------------------------------------------------
CREATE POLICY "reports_select_tenant" ON public.reports
    FOR SELECT
    USING (company_id = app.current_company_id());

CREATE POLICY "reports_insert_tenant" ON public.reports
    FOR INSERT
    WITH CHECK (company_id = app.current_company_id());

CREATE POLICY "reports_update_tenant" ON public.reports
    FOR UPDATE
    USING (company_id = app.current_company_id())
    WITH CHECK (company_id = app.current_company_id());

CREATE POLICY "reports_delete_tenant_admin" ON public.reports
    FOR DELETE
    USING (company_id = app.current_company_id() AND app.current_role() = 'admin');

-- ====================================================================
-- 11. INSTRUCCIONES Y QUERY DE SINCRONIZACIÓN POST-MIGRACIÓN CSV
-- ====================================================================
/*
-- NOTA PARA LA IMPORTACIÓN MANUAL CSV:
-- 1. Importar en orden estricto:
--    a. public.companies.csv
--    b. public.profiles.csv
--    c. public.reports.csv
--
-- 2. Tras importar los CSVs de informes con sus números correlativos existentes,
--    ejecutar la siguiente consulta para inicializar el contador de cada empresa
--    con su valor máximo real, evitando colisiones en la creación de nuevos informes:

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
*/
