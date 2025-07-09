-- Migración completa para corregir permisos de usuarios admin/propietarios de empresa

-- 1. Limpiar permisos inconsistentes para propietarios de empresa
-- Identificar usuarios que son propietarios de empresa
WITH company_owners AS (
  SELECT DISTINCT user_id 
  FROM companies
  UNION
  SELECT DISTINCT user_id 
  FROM company_users 
  WHERE role = 'admin'
)
-- Actualizar todos los permisos para propietarios de empresa
UPDATE user_permissions 
SET can_access = true
WHERE user_id IN (SELECT user_id FROM company_owners);

-- 2. Insertar permisos faltantes para propietarios de empresa
WITH company_owners AS (
  SELECT DISTINCT user_id 
  FROM companies
  UNION
  SELECT DISTINCT user_id 
  FROM company_users 
  WHERE role = 'admin'
),
all_permissions AS (
  SELECT unnest(ARRAY[
    'can_view_dashboard',
    'can_view_sales', 
    'can_view_expenses',
    'can_view_invoices',
    'can_view_banking',
    'can_manage_banking',
    'can_view_receivables',
    'can_view_users',
    'can_view_reports',
    'can_view_crm',
    'can_view_forecasting',
    'can_view_accounting'
  ]) AS permission_name
)
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT co.user_id, ap.permission_name, true
FROM company_owners co
CROSS JOIN all_permissions ap
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = co.user_id 
  AND up.permission_name = ap.permission_name
);

-- 3. Actualizar page_permissions para propietarios de empresa
WITH company_owners AS (
  SELECT DISTINCT user_id 
  FROM companies
  UNION
  SELECT DISTINCT user_id 
  FROM company_users 
  WHERE role = 'admin'
),
all_pages AS (
  SELECT unnest(ARRAY[
    '/',
    '/sales',
    '/expenses', 
    '/invoices',
    '/accounting/banking',
    '/accounting/receivables',
    '/users',
    '/reports',
    '/crm',
    '/forecasting',
    '/accounting'
  ]) AS page_path
)
-- Actualizar permisos de página existentes
UPDATE page_permissions 
SET can_access = true
WHERE user_id IN (SELECT user_id FROM company_owners);

-- Insertar page_permissions faltantes
INSERT INTO page_permissions (user_id, page_path, can_access)
SELECT co.user_id, ap.page_path, true
FROM company_owners co
CROSS JOIN all_pages ap
WHERE NOT EXISTS (
  SELECT 1 FROM page_permissions pp 
  WHERE pp.user_id = co.user_id 
  AND pp.page_path = ap.page_path
);

-- 4. Crear función para auto-asignar permisos a nuevos propietarios de empresa
CREATE OR REPLACE FUNCTION auto_assign_admin_permissions()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Determinar el user_id según el contexto
  IF TG_TABLE_NAME = 'companies' THEN
    target_user_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'company_users' AND NEW.role = 'admin' THEN
    target_user_id := NEW.user_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Asignar todos los permisos de usuario
  INSERT INTO user_permissions (user_id, permission_name, can_access)
  SELECT target_user_id, unnest(ARRAY[
    'can_view_dashboard',
    'can_view_sales', 
    'can_view_expenses',
    'can_view_invoices',
    'can_view_banking',
    'can_manage_banking',
    'can_view_receivables',
    'can_view_users',
    'can_view_reports',
    'can_view_crm',
    'can_view_forecasting',
    'can_view_accounting'
  ]), true
  ON CONFLICT (user_id, permission_name) 
  DO UPDATE SET can_access = true;

  -- Asignar todos los permisos de página
  INSERT INTO page_permissions (user_id, page_path, can_access)
  SELECT target_user_id, unnest(ARRAY[
    '/',
    '/sales',
    '/expenses', 
    '/invoices',
    '/accounting/banking',
    '/accounting/receivables',
    '/users',
    '/reports',
    '/crm',
    '/forecasting',
    '/accounting'
  ]), true
  ON CONFLICT (user_id, page_path) 
  DO UPDATE SET can_access = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear triggers para auto-asignar permisos
DROP TRIGGER IF EXISTS auto_assign_permissions_on_company_create ON companies;
CREATE TRIGGER auto_assign_permissions_on_company_create
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_permissions();

DROP TRIGGER IF EXISTS auto_assign_permissions_on_admin_role ON company_users;
CREATE TRIGGER auto_assign_permissions_on_admin_role
  AFTER INSERT OR UPDATE ON company_users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_permissions();

-- 6. Agregar user_id a las tablas que no lo tienen si es necesario
-- Verificar si la tabla Sales necesita user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Sales' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "Sales" ADD COLUMN user_id uuid;
    
    -- Asignar user_id basado en la empresa del usuario
    UPDATE "Sales" SET user_id = auth.uid() WHERE user_id IS NULL;
  END IF;
END $$;

-- 7. Verificar consistencia de datos
-- Log de usuarios que ahora tienen permisos completos
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO admin_count
  FROM user_permissions 
  WHERE permission_name = 'can_view_users' 
  AND can_access = true;
  
  RAISE NOTICE 'Migración completada. % usuarios con permisos de admin.', admin_count;
END $$;