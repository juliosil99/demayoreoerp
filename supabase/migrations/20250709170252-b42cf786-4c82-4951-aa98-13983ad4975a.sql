-- Modificar initialize_user_permissions para usar SECURITY DEFINER y bypasear RLS temporalmente
CREATE OR REPLACE FUNCTION public.initialize_user_permissions(target_user_id uuid, role_name text DEFAULT 'user'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  original_role text;
BEGIN
  -- Guardar el rol actual de sesión
  SELECT current_setting('session_replication_role') INTO original_role;
  
  -- Desactivar RLS temporalmente
  PERFORM set_config('session_replication_role', 'replica', true);
  
  BEGIN
    -- Permisos básicos para todos los usuarios
    INSERT INTO user_permissions (user_id, permission_name, can_access) VALUES
      (target_user_id, 'can_view_dashboard', true),
      (target_user_id, 'can_view_sales', true),
      (target_user_id, 'can_view_expenses', true),
      (target_user_id, 'can_view_reports', false),
      (target_user_id, 'can_manage_sales', false),
      (target_user_id, 'can_manage_expenses', false),
      (target_user_id, 'can_manage_users', false),
      (target_user_id, 'can_manage_contacts', false),
      (target_user_id, 'can_view_banking', false),
      (target_user_id, 'can_manage_banking', false),
      (target_user_id, 'can_view_invoices', true),
      (target_user_id, 'can_manage_invoices', false),
      (target_user_id, 'can_view_reconciliation', false),
      (target_user_id, 'can_manage_reconciliation', false)
    ON CONFLICT (user_id, permission_name) DO NOTHING;

    -- Si es admin, darle todos los permisos
    IF role_name = 'admin' THEN
      UPDATE user_permissions 
      SET can_access = true 
      WHERE user_id = target_user_id;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Restaurar el rol original en caso de error
      PERFORM set_config('session_replication_role', original_role, true);
      RAISE;
  END;
  
  -- Restaurar el rol original
  PERFORM set_config('session_replication_role', original_role, true);
END;
$function$;