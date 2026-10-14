-- =================================================================================
-- Seed: Empresa y Técnico de Prueba Independientes (Neon Serverless Postgres)
-- Credenciales de acceso resultantes:
-- Email: tecnico@neotech.com
-- Contraseña: NeoTech2026!
-- =================================================================================

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    new_company_id UUID := gen_random_uuid();
BEGIN
    -- 1. Habilitar extensión pgcrypto para el hash de contraseñas
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 2. Crear la nueva empresa independiente con datos ficticios de prueba
    INSERT INTO public.companies (
        id, name, address, phone, email, website, legal_notice
    ) VALUES (
        new_company_id,
        'NeoTech Solutions',
        'Av. Innovación 1024, Ciudad Tecnológica',
        '+54 9 11 9876-5432',
        'soporte@neotech.com',
        'https://neotechsolutions.example.com',
        'Aviso legal de NeoTech: Esta estimación es válida por 30 días, sujeta a verificación.'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insertar el técnico de prueba directamente en public.profiles (Modelo Neon nativo)
    INSERT INTO public.profiles (
        id,
        company_id,
        email,
        full_name,
        role,
        password_hash,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        new_user_id,
        new_company_id,
        'tecnico@neotech.com',
        'Ing. Roberto Martínez',
        'admin',
        crypt('NeoTech2026!', gen_salt('bf', 10)),
        NULL,
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;

END $$;