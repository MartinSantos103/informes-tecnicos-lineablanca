-- =================================================================================
-- Seed: Empresa y Técnico de Prueba Independientes
-- Credenciales de acceso resultantes:
-- Email: tecnico@neotech.com
-- Contraseña: NeoTech2026!
-- =================================================================================

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    new_company_id UUID := gen_random_uuid();
BEGIN
    -- 1. Habilitar extensión pgcrypto para el hash de contraseñas (necesario para auth.users)
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 2. Crear la nueva empresa independiente con datos inventados
    INSERT INTO public.companies (
        id, name, address, phone, email, website, legal_notice
    ) VALUES (
        new_company_id,
        'NeoTech Solutions',
        'Av. Innovación 1024, Ciudad Tecnológica',
        '+54 9 11 9876-5432',
        'soporte@neotech.com',
        'www.neotechsolutions.com',
        'Aviso legal de NeoTech: Esta estimación es válida por 30 días, sujeta a verificación.'
    );

    -- 3. Insertar el técnico en auth.users
    -- NOTA: Al insertar aquí, el trigger 'on_auth_user_created' se disparará 
    -- y le creará automáticamente un perfil en 'public.profiles' vinculado a la primera empresa.
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', 
        new_user_id, 
        'authenticated', 
        'authenticated', 
        'tecnico@neotech.com', 
        crypt('NeoTech2026!', gen_salt('bf')), 
        now(), 
        '{"provider": "email", "providers": ["email"]}', 
        '{"full_name": "Ing. Roberto Martínez"}', 
        now(), now(), 
        '', '', '', ''
    );

    -- 4. Actualizar el perfil recién creado por el trigger para aislarlo 
    -- asignándolo a la empresa independiente (NeoTech) y actualizando sus datos reales.
    UPDATE public.profiles
    SET 
        company_id = new_company_id,
        full_name = 'Ing. Roberto Martínez',
        role = 'admin'
    WHERE id = new_user_id;

END $$;