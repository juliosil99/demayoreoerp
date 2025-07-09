-- Migración completa para corregir permisos de usuarios admin/propietarios de empresa
-- Dividida en pasos para evitar problemas con CTEs

-- 1. Actualizar permisos existentes para propietarios de empresa
UPDATE user_permissions 
SET can_access = true
WHERE user_id IN (
  SELECT DISTINCT user_id FROM companies
  UNION
  SELECT DISTINCT user_id FROM company_users WHERE role = 'admin'
);

-- 2. Insertar permisos faltantes para propietarios de empresa - Dashboard
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_dashboard', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_dashboard'
);

-- 3. Insertar permisos faltantes para propietarios de empresa - Sales
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_sales', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_sales'
);

-- 4. Insertar permisos faltantes para propietarios de empresa - Expenses
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_expenses', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_expenses'
);

-- 5. Insertar permisos faltantes para propietarios de empresa - Invoices
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_invoices', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_invoices'
);

-- 6. Insertar permisos faltantes para propietarios de empresa - Banking
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_banking', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_banking'
);

-- 7. Insertar permisos faltantes para propietarios de empresa - Manage Banking
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_manage_banking', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_manage_banking'
);

-- 8. Insertar permisos faltantes para propietarios de empresa - Receivables
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_receivables', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_receivables'
);

-- 9. Insertar permisos faltantes para propietarios de empresa - Users
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_users', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_users'
);

-- 10. Insertar permisos faltantes para propietarios de empresa - Reports
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_reports', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_reports'
);

-- 11. Insertar permisos faltantes para propietarios de empresa - CRM
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_crm', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_crm'
);

-- 12. Insertar permisos faltantes para propietarios de empresa - Forecasting
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_forecasting', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_forecasting'
);

-- 13. Insertar permisos faltantes para propietarios de empresa - Accounting
INSERT INTO user_permissions (user_id, permission_name, can_access)
SELECT DISTINCT u.user_id, 'can_view_accounting', true
FROM (
  SELECT user_id FROM companies
  UNION
  SELECT user_id FROM company_users WHERE role = 'admin'
) u
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions up 
  WHERE up.user_id = u.user_id 
  AND up.permission_name = 'can_view_accounting'
);

-- 14. Agregar user_id a tabla Sales si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Sales' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "Sales" ADD COLUMN user_id uuid;
    
    -- Crear índice para mejor rendimiento
    CREATE INDEX IF NOT EXISTS idx_sales_user_id ON "Sales"(user_id);
  END IF;
END $$;