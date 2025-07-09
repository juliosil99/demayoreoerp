-- Corregir las políticas RLS problemáticas en user_invitations que causan el error "column reference 'company_id' is ambiguous"

-- Eliminar las políticas problemáticas existentes
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "Admins can view company invitations" ON public.user_invitations;

-- Recrear las políticas con referencias explícitas y correctas
CREATE POLICY "Admins can delete invitations" ON public.user_invitations
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.role = 'admin' 
    AND cu.company_id = user_invitations.company_id
  )
  OR EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.user_id = auth.uid() 
    AND c.id = user_invitations.company_id
  )
);

CREATE POLICY "Admins can update invitations" ON public.user_invitations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.role = 'admin' 
    AND cu.company_id = user_invitations.company_id
  )
  OR EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.user_id = auth.uid() 
    AND c.id = user_invitations.company_id
  )
);

CREATE POLICY "Admins can view company invitations" ON public.user_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.role = 'admin' 
    AND cu.company_id = user_invitations.company_id
  )
  OR EXISTS (
    SELECT 1 FROM companies c 
    WHERE c.user_id = auth.uid() 
    AND c.id = user_invitations.company_id
  )
);